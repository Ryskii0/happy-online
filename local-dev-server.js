const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;
const ARK_API_KEY = process.env.ARK_API_KEY || "";
const ARK_TEXT_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const ARK_IMAGE_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function proxyArkText(req, res) {
  if (!ARK_API_KEY) {
    return sendJson(res, 500, { error: "Missing ARK_API_KEY" });
  }

  const body = await readBody(req);
  if (!body.prompt) {
    return sendJson(res, 400, { error: "Missing prompt" });
  }

  const response = await fetch(ARK_TEXT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ARK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "doubao-seed-character-260628",
      messages: [
        {
          role: "system",
          content: "你是人工智能助手，也是旅行纪念册文案编辑。请严格按用户要求返回。",
        },
        {
          role: "user",
          content: body.prompt,
        },
      ],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    return sendJson(res, response.status, {
      error: payload?.error?.message || payload?.message || "Ark text request failed",
      raw: payload,
    });
  }

  return sendJson(res, 200, {
    text: payload?.choices?.[0]?.message?.content || "",
    raw: payload,
  });
}

async function proxyArkImage(req, res) {
  if (!ARK_API_KEY) {
    return sendJson(res, 500, { error: "Missing ARK_API_KEY" });
  }

  const body = await readBody(req);
  if (!body.prompt || !body.image) {
    return sendJson(res, 400, { error: "Missing prompt or image" });
  }

  const response = await fetch(ARK_IMAGE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ARK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "doubao-seedream-5-0-260128",
      prompt: body.prompt,
      image: body.image,
      sequential_image_generation: "disabled",
      response_format: "b64_json",
      size: "2K",
      stream: false,
      watermark: false,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    return sendJson(res, response.status, {
      error: payload?.error?.message || payload?.message || "Ark image request failed",
      raw: payload,
    });
  }

  const imageData = payload?.data?.[0]?.b64_json || payload?.data?.[0]?.image?.b64_json || "";
  if (!imageData) {
    return sendJson(res, 502, {
      error: "Ark image response missing b64_json",
      raw: payload,
    });
  }

  return sendJson(res, 200, {
    imageDataUrl: `data:image/png;base64,${imageData}`,
    raw: payload,
  });
}

function serveStatic(req, res) {
  const requestPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const safePath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
      return;
    }

    if (req.method === "POST" && req.url === "/api/ark-text") {
      await proxyArkText(req, res);
      return;
    }

    if (req.method === "POST" && req.url === "/api/ark-image") {
      await proxyArkImage(req, res);
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(req, res);
      return;
    }

    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Local server failed",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Happy Online local server running at http://${HOST}:${PORT}`);
});

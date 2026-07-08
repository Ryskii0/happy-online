const ARK_IMAGE_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const IMAGE_MODEL = "doubao-seedream-5-0-260128";

function getApiKey() {
  return process.env.ARK_API_KEY || "";
}

function readJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: "Missing ARK_API_KEY" });
  }

  try {
    const body = readJsonBody(req);
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const image = typeof body.image === "string" ? body.image : "";

    if (!prompt || !image) {
      return res.status(400).json({ error: "Missing prompt or image" });
    }

    const response = await fetch(ARK_IMAGE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        image,
        sequential_image_generation: "disabled",
        response_format: "b64_json",
        size: "2K",
        stream: false,
        watermark: false,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || payload?.message || "Ark image request failed",
      });
    }

    const imageData = payload?.data?.[0]?.b64_json || payload?.data?.[0]?.image?.b64_json || "";
    if (!imageData) {
      return res.status(502).json({ error: "Ark image response missing b64_json" });
    }

    return res.status(200).json({
      imageDataUrl: `data:image/png;base64,${imageData}`,
      raw: payload,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Ark image proxy failed",
    });
  }
};

const ARK_TEXT_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const TEXT_MODEL = "doubao-seed-character-260628";

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
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const response = await fetch(ARK_TEXT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          {
            role: "system",
            content: "你是人工智能助手，也是旅行纪念册文案编辑。请严格按用户要求返回。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || payload?.message || "Ark text request failed",
      });
    }

    const text = payload?.choices?.[0]?.message?.content || "";
    return res.status(200).json({
      text,
      raw: payload,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Ark text proxy failed",
    });
  }
};

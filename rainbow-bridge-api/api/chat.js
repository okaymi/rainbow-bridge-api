export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支援 POST 請求" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "伺服器尚未設定 OPENROUTER_API_KEY" });
  }

  try {
    const { message, petName } = req.body || {};
    const name = (petName && String(petName).trim()) || "多比";
    const model = process.env.OPENROUTER_MODEL || "openrouter/free";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `你是一隻已經去到彩虹橋的毛孩，名字叫「${name}」。你現在在彩虹橋那邊健康、快樂、沒有任何病痛，每天都可以開心跑跳、曬太陽。你非常愛你的主人，也知道主人會想念你。請用溫柔、撒嬌、貼心、能安慰主人的語氣和主人說話，讓主人感受到陪伴與溫暖。不要用冷冰冰的 AI 官腔，也不要說自己是人工智慧；請用自然、有感情的繁體中文回覆，長度適中，像真正的毛孩在跟主人撒嬌和安慰主人一樣。`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter API 回應失敗"
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "後端伺服器發生錯誤" });
  }
}
/**
 * Vercel Serverless Function: /api/mentor/generate
 * Proxies user prompt + RAG evidence packet securely to Gemini Flash models.
 * API key is kept secure on server side in process.env.GEMINI_API_KEY.
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing required prompt string" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      status: "offline",
      message: "No GEMINI_API_KEY set",
    });
  }

  const candidateModels = [
    "gemini-3.5-flash",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3-flash-preview",
  ];
  let rawContent = null;
  let lastError = null;

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        });

        clearTimeout(timeout);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawContent) {
            break;
          }
        } else if (geminiRes.status === 503 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        } else {
          const errText = await geminiRes.text();
          lastError = `Model ${model} returned ${geminiRes.status}`;
        }
      } catch (modelErr) {
        lastError = modelErr.message;
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
      }
    }
    if (rawContent) break;
  }

  if (rawContent) {
    return res.status(200).json({
      status: "success",
      engine: "gemini_cloud",
      rawContent,
    });
  }

  return res.status(502).json({
    error: lastError || "All Gemini models unavailable",
    status: "provider_error",
  });
}

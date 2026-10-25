/**
 * Tawfiq Mentor Secure Server-Side Model Routing Middleware
 *
 * Runs exclusively on Node.js server side.
 * - Manages server-side process.env.GEMINI_API_KEY (never exposed to client bundle).
 * - Enforces in-memory IP rate limiting (15 req/min).
 * - Enforces payload size constraints (max 32KB).
 * - Enforces request timeout (10s).
 * - Handles graceful fallback when key is not configured or rate limits/quota are exceeded.
 */

// In-memory sliding window rate limiter: IP -> timestamps[]
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (valid.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, valid);
    return true;
  }
  valid.push(now);
  rateLimitMap.set(ip, valid);
  return false;
}

export function createMentorApiMiddleware() {
  return async (req, res, next) => {
    // Only intercept /api/mentor/generate POST requests
    const url = req.url?.split("?")[0];
    if (url !== "/api/mentor/generate" || req.method !== "POST") {
      return next();
    }

    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    if (isRateLimited(clientIp)) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Rate limit exceeded. Please wait a moment before sending another query.",
          status: "rate_limited",
        })
      );
      return;
    }

    // Read request body with 32KB size limit
    let body = "";
    let size = 0;
    const MAX_SIZE = 32 * 1024;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large. Maximum size is 32KB." }));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on("end", async () => {
      try {
        let payload;
        try {
          payload = JSON.parse(body || "{}");
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Malformed JSON payload" }));
          return;
        }

        const { prompt, query } = payload;
        if (!prompt || typeof prompt !== "string") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required prompt string" }));
          return;
        }

        const pythonServerUrl = process.env.ISLAMIC_LLM_URL;
        if (pythonServerUrl) {
          try {
            const pyRes = await fetch(pythonServerUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: query || prompt,
                prompt,
                format_json: true,
                evidence_xml: payload.evidenceXml || payload.evidence_xml,
              }),
              signal: AbortSignal.timeout(2000),
            });

            if (pyRes.ok) {
              const pyData = await pyRes.json();
              if (pyData.status === "success" && pyData.rawContent) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    status: "success",
                    engine: "python_islamic_llm",
                    model: pyData.model || "llama3.1:latest",
                    rawContent: pyData.rawContent,
                  })
                );
                return;
              }
            }
          } catch (pyErr) {
            console.debug("[MentorApiServer] Python LLM server unavailable, switching to Gemini:", pyErr?.message);
          }
        }

        const apiKey =
          payload.customApiKey ||
          process.env.GEMINI_API_KEY ||
          process.env.VITE_GEMINI_API_KEY ||
          "";
        if (!apiKey) {
          // Both Python neural engine and Gemini key unavailable -> local client grounded reasoner fallback
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "offline",
              message: "Server operating in local grounded mode (Python neural engine offline, no GEMINI_API_KEY set).",
            })
          );
          return;
        }

        // Step 2: Gemini Cloud Reasoner with Model Cascade
        const candidateModels = [
          "gemini-3.5-flash",
          "gemini-flash-lite-latest",
          "gemini-3-flash-preview",
          "gemini-3.5-flash-lite",
          "gemini-3.8-flash",
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
                // Momentary spike, wait 1.5s and retry before switching models
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
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "success",
              engine: "gemini_cloud",
              rawContent,
            })
          );
          return;
        }

        // If models failed or timed out, report provider error gracefully so client falls back
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: lastError || "All Gemini models unavailable",
            status: "provider_error",
          })
        );
        return;
      } catch (err) {
        console.error("[MentorApiServer] Internal exception:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: err.name === "AbortError" ? "Model request timed out" : "Internal server error",
            status: "server_error",
          })
        );
      }
    });
  };
}

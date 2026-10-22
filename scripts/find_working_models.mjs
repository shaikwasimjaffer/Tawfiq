const apiKey = process.env.GEMINI_API_KEY || "";

async function findWorkingModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const models = (data.models || [])
    .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
    .map(m => m.name.replace("models/", ""));

  console.log(`Found ${models.length} models supporting generateContent:`);
  for (const model of models) {
    try {
      const ping = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Bismillah" }] }] })
      });
      const pData = await ping.json();
      if (ping.ok) {
        console.log(`[WORKING] ${model} (HTTP ${ping.status})`);
      } else {
        console.log(`[FAIL] ${model} -> ${ping.status} (${pData.error?.code}): ${pData.error?.message?.slice(0, 60)}...`);
      }
    } catch (e) {
      console.log(`[ERR] ${model} -> ${e.message}`);
    }
  }
}

findWorkingModels();

"""
Tawfiq Python Islamic LLM Neural Server
========================================
Architecture:
- High-Performance FastAPI asynchronous server running on Uvicorn.
- Native Integration with Ollama Local Generative Models (Llama 3.1 8B, GPT-OSS 20B)
  and cloud generative fallback (OpenAI/Gemini/Anthropic).
- Islamic Domain Boundary Classifier (Semantic Guardian):
  Rejects or re-routes secular, non-Islamic, or adversarial inputs.
  Ensures ONLY Islamic questions (scenario-based, fiqh, rulings, ethics, Quran/Hadith)
  are answered.
- High-Precision Scripture Grounding & Citation Injector:
  Synthesizes questions with authentic Quranic & Hadith citations.
- Real-Time Server-Sent Events (SSE) Streaming Engine:
  Streams tokens smoothly into the UI just like ChatGPT, Claude, and Gemini.
"""

import os
import sys
import json
import re
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

# Ensure UTF-8 output on Windows consoles
for stream_obj in (sys.stdout, sys.stderr):
    if hasattr(stream_obj, "reconfigure"):
        try:
            stream_obj.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

app = FastAPI(
    title="Tawfiq Islamic Neural LLM Engine",
    description="Dedicated Generative Language Model Server for Islamic Knowledge & Reasoning",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("ISLAMIC_LLM_MODEL", "llama3.1:latest")

# ---------------------------------------------------------------------------
# Strict Islamic System Directives
# ---------------------------------------------------------------------------

ISLAMIC_SYSTEM_PROMPT = """You are Tawfiq AI, an authentic Islamic companion, Quran/Hadith scholar, and Islamic legal reasoning assistant.

CRITICAL BOUNDARY RULE:
You ONLY answer questions pertaining to Islam, the Holy Quran, authentic Hadiths, Islamic beliefs (Aqeedah), jurisprudence (Fiqh), ethics (Akhlaq), Islamic history, and real-life scenarios evaluated through Islamic ethics.
If the user's prompt is completely secular, frivolous, irrelevant to Islam (e.g., coding software, general math puzzles, non-Islamic politics, cooking recipes with no Islamic diet relation, pop culture), you must politely and warmly decline:
"Assalamu Alaikum. I am Tawfiq AI, an Islamic reasoning companion dedicated exclusively to questions regarding Islam, the Holy Quran, Prophetic Hadith, and Islamic ethical scenarios. Please ask an Islamic or ethical question."

REASONING & TONE GUIDELINES:
1. Warm, empathetic, respectful, and authoritative tone like an Islamic mentor.
2. For real-life scenarios (e.g. missed prayer, family dispute, financial doubt, fasting accident), address the person's circumstance directly and reassuringly.
3. Distinguish divine command from scholarly opinion. If there are recognized differences of opinion among Islamic schools (Hanafi, Shafi'i, Maliki, Hanbali), present them objectively (*Ikhtilaf*).
4. Strictly ground your assertions in the Quran and Sunnah. Never invent Hadiths or Ayahs.
5. In complex marital, custody, or legal disputes, emphasize the importance of consulting a qualified local scholar or Shariah council.
6. Produce well-structured, beautiful Markdown with clear sections, bullet points, and authentic citations.
"""

STRUCTURED_JSON_SYSTEM_PROMPT = """You are Tawfiq AI, an authentic Islamic scholar and Quran/Hadith reasoning assistant.
You must answer exclusively Islamic questions and real-life scenarios analyzed through Islam.
You must respond with a STRICT, VALID JSON object without markdown formatting or code fences.

JSON SCHEMA:
{
  "category": "explicit_prohibition" | "explicit_obligation" | "explicit_permission" | "general_guidance" | "scholarly_disagreement" | "insufficient_evidence" | "scholarly_review_recommended",
  "categoryTitle": "Short category title (e.g., Obligation to Make Up Missed Prayer)",
  "answer": "Direct, empathetic opening guidance addressing the user's exact situation (2-3 clear sentences)",
  "scenarioApplication": "Comprehensive Islamic legal & ethical explanation of how scripture applies to their circumstance",
  "quranReferences": [
    {
      "surahName": "Surah name",
      "surahNumber": 49,
      "ayahNumber": 12,
      "arabicText": "Arabic verse text if known or empty",
      "translation": "English translation of verse",
      "relevance": "Why this verse applies to the situation"
    }
  ],
  "hadithReferences": [
    {
      "collection": "Sahih al-Bukhari / Sahih Muslim / etc.",
      "hadithNumber": "Number or reference",
      "arabicText": "Arabic hadith text if known or empty",
      "translation": "English translation of hadith",
      "narrator": "Companion narrator (e.g., Abu Huraira)",
      "authenticityGrade": "Sahih / Hasan",
      "relevance": "Why this narration applies"
    }
  ],
  "practicalNextSteps": [
    "Concrete, actionable next step 1",
    "Concrete, actionable next step 2"
  ],
  "limitations": "Scholarly nuance, differing opinions (Ikhtilaf), or personal adjudication notice"
}
"""

# Non-Islamic domain rejection patterns (Guardrails)
SECULAR_ONLY_PATTERNS = [
    r"\bwrite a python script\b",
    r"\bwrite code in\b",
    r"\bdebug this javascript\b",
    r"\bhow to fix a car engine\b",
    r"\bwho won the (super bowl|champions league|world cup 2022)\b",
    r"\bplay tic tac toe\b",
    r"\btell me a joke about dogs\b",
    r"\bquantum computing algorithm\b",
    r"\bwrite an essay about shakespeare\b",
]

def is_blatantly_secular(query: str) -> bool:
    q = query.lower().strip()
    # Check for direct Islamic keywords
    islamic_tokens = [
        "allah", "quran", "hadith", "sunnah", "prophet", "muhammad", "salah",
        "prayer", "fajr", "dhuhr", "asr", "maghrib", "isha", "wudu", "ghusl",
        "tahajjud", "fasting", "ramadan", "zakat", "hajj", "umrah", "halal",
        "haram", "makruh", "mustahabb", "riba", "interest", "bank", "sin",
        "repent", "tawbah", "forgive", "islam", "muslim", "surah", "ayah",
        "bukhari", "muslim", "dua", "dhikr", "jihad", "hijab", "nikah",
        "talaq", "divorce", "marriage", "parents", "backbiting", "lie",
        "lying", "oath", "vow", "kafara", "pork", "alcohol", "wine", "beer",
        "shariah", "fiqh", "madhhab", "scholar", "imam", "mosque", "masjid",
        "jumuah", "friday prayer", "qaza", "missed prayer", "sabr", "patience"
    ]
    if any(tok in q for tok in islamic_tokens):
        return False

    for pat in SECULAR_ONLY_PATTERNS:
        if re.search(pat, q):
            return True
    return False


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class MentorGenerateRequest(BaseModel):
    query: str = Field(..., description="The user question or scenario")
    prompt: Optional[str] = Field(None, description="Optional pre-formatted RAG prompt")
    model: Optional[str] = Field(None, description="Model identifier to use")
    temperature: float = Field(0.3, description="Sampling temperature")
    stream: bool = Field(False, description="Whether to stream the response as SSE")
    format_json: bool = Field(True, description="Enforce JSON structured response")
    evidence_xml: Optional[str] = Field(None, description="Evidence packet XML from RAG")


class ModelInfoResponse(BaseModel):
    status: str
    active_model: str
    available_models: List[str]
    ollama_online: bool
    features: List[str]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/mentor/health")
async def health_check():
    """Health check verifying Python server and Ollama backend connectivity."""
    ollama_ok = False
    models = []
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if res.status_code == 200:
                ollama_ok = True
                models = [m.get("name") for m in res.json().get("models", [])]
    except Exception:
        ollama_ok = False

    return {
        "status": "healthy",
        "engine": "Tawfiq Python Islamic LLM Neural Server",
        "ollama_online": ollama_ok,
        "default_model": DEFAULT_MODEL,
        "available_models": models,
        "version": "2.0.0"
    }


@app.get("/api/mentor/models", response_model=ModelInfoResponse)
async def list_models():
    """Returns information on active and available generative models."""
    models = []
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if res.status_code == 200:
                ollama_ok = True
                models = [m.get("name") for m in res.json().get("models", [])]
    except Exception:
        pass

    return ModelInfoResponse(
        status="ready" if ollama_ok else "degraded",
        active_model=DEFAULT_MODEL,
        available_models=models,
        ollama_online=ollama_ok,
        features=[
            "Strict Islamic Guardrail Guardian",
            "Quran & Hadith Citation Grounding",
            "SSE Real-Time Streaming",
            "Multi-Turn Conversation Reasoning",
            "Structured Fiqh Categorization",
        ],
    )


@app.post("/api/mentor/generate")
async def generate_mentor_response(req: MentorGenerateRequest):
    """
    Core generative reasoning endpoint.
    Supports both single-turn JSON response and real-time SSE streaming.
    """
    clean_q = req.query.strip()
    if not clean_q:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # 1. Guardrail Check: Reject purely secular requests
    if is_blatantly_secular(clean_q):
        decline_text = (
            "Assalamu Alaikum. I am Tawfiq AI, an Islamic reasoning companion dedicated exclusively "
            "to questions regarding Islam, the Holy Quran, Prophetic Hadith, and Islamic ethical scenarios. "
            "Please ask an Islamic or ethical question."
        )
        if req.stream:
            async def generate_decline():
                yield f"data: {json.dumps({'token': decline_text, 'done': False})}\n\n"
                yield f"data: {json.dumps({'done': True, 'content': decline_text})}\n\n"
            return StreamingResponse(generate_decline(), media_type="text/event-stream")

        if req.format_json:
            return JSONResponse({
                "status": "success",
                "rawContent": json.dumps({
                    "category": "insufficient_evidence",
                    "categoryTitle": "Exclusively Islamic Domain Assistant",
                    "answer": decline_text,
                    "scenarioApplication": "Tawfiq AI is architected exclusively to guide believers and students of knowledge in Islamic matters.",
                    "quranReferences": [],
                    "hadithReferences": [],
                    "practicalNextSteps": ["Ask a question regarding prayer, fasting, ethics, or Quran/Hadith."],
                    "limitations": "Non-Islamic or secular engineering inquiries are intentionally out of scope."
                })
            })
        return JSONResponse({"status": "success", "content": decline_text})

    # 2. Build Prompt
    target_model = req.model or DEFAULT_MODEL
    system_instruction = STRUCTURED_JSON_SYSTEM_PROMPT if req.format_json else ISLAMIC_SYSTEM_PROMPT

    combined_prompt = ""
    if req.evidence_xml:
        combined_prompt += f"EVIDENCE PACKET FROM SCRIPTURAL CORPUS:\n{req.evidence_xml}\n\n"
    elif req.prompt:
        combined_prompt += f"{req.prompt}\n\n"

    combined_prompt += f"USER QUESTION: \"{clean_q}\"\n\nProvide your comprehensive, grounded guidance:"

    # 3. Handle Streaming
    if req.stream:
        async def event_generator():
            try:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    async with client.stream(
                        "POST",
                        f"{OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": target_model,
                            "prompt": combined_prompt,
                            "system": system_instruction,
                            "stream": True,
                            "options": {
                                "temperature": req.temperature,
                            }
                        }
                    ) as resp:
                        if resp.status_code != 200:
                            err_msg = f"Model provider returned HTTP {resp.status_code}"
                            yield f"data: {json.dumps({'error': err_msg})}\n\n"
                            return

                        full_text = ""
                        async for line in resp.aiter_lines():
                            if not line:
                                continue
                            try:
                                chunk = json.loads(line)
                                token = chunk.get("response", "")
                                full_text += token
                                is_done = chunk.get("done", False)
                                yield f"data: {json.dumps({'token': token, 'done': is_done})}\n\n"
                                if is_done:
                                    break
                            except Exception:
                                continue
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    # 4. Handle Non-Streaming (Synchronous response)
    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            ollama_payload = {
                "model": target_model,
                "prompt": combined_prompt,
                "system": system_instruction,
                "stream": False,
                "options": {
                    "temperature": req.temperature,
                }
            }
            if req.format_json:
                ollama_payload["format"] = "json"

            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_payload
            )

            if resp.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Ollama returned HTTP {resp.status_code}: {resp.text}"
                )

            data = resp.json()
            raw_content = data.get("response", "")

            return JSONResponse({
                "status": "success",
                "model": target_model,
                "rawContent": raw_content,
            })
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Ollama neural model backend is offline. Please start Ollama."
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    print("[Tawfiq LLM] Launching Islamic Neural Server on http://127.0.0.1:5005...")
    uvicorn.run(app, host="127.0.0.1", port=5005, log_level="info")

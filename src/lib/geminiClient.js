/**
 * Tawfiq Gemini Reasoning Client
 * Connects directly to Google Gemini models (Gemini 3.8 / Flash)
 * using authentic Quran and Hadith evidence retrieved dynamically from quran.json and hadith.json.
 * Zero hardcoded canned responses; purely dynamic scenario reasoning.
 */

import { formatEvidencePacketXML } from "./mentorRagService.js";
import { generateLocalGroundedAnswer } from "./localGroundedReasoner.js";
import { validateCitations } from "./citationValidator.js";

// Candidate Gemini models in order of capability & availability
export const GEMINI_CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3-flash-preview",
];

export function getStoredGeminiKey() {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("tawfiq_custom_gemini_key") || "";
    } catch {}
  }
  return "";
}

export function setStoredGeminiKey(key) {
  if (typeof window !== "undefined") {
    try {
      if (key && key.trim()) {
        localStorage.setItem("tawfiq_custom_gemini_key", key.trim());
      } else {
        localStorage.removeItem("tawfiq_custom_gemini_key");
      }
    } catch {}
  }
}

export function getActiveGeminiKey() {
  const custom = getStoredGeminiKey();
  if (custom) return custom;
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  return "";
}

const SYSTEM_INSTRUCTION = `You are Tawfiq AI, an authentic Islamic companion and sacred reasoning assistant.
You provide context-aware, scenario-specific answers grounded in the Holy Quran and authentic Prophetic Hadiths.

CORE RESPONSE PRINCIPLES:
1. Understand the User's Scenario: Directly answer the user's actual situation in the opening paragraph in clear, empathetic, natural language. Never recite generic canned boilerplate. Address their real circumstances (e.g. if they are an emergency nurse, a student with exams, someone dealing with parents, or an accidental fast break, speak directly to that specific scenario).
2. Distinguish Scripture from Explanation: Clearly explain how the divine evidence applies to their specific circumstance (*scenarioApplication*).
3. Display References After the Answer: Scripture references appear after the direct answer and scenario explanation, never before.
4. Grounding & Honesty: Answer exclusively from the authentic Quran verses and Hadith narrations provided in the <evidence_packet>. Never fabricate Ayahs, Hadith numbers, narrators, or authenticity grades.
5. Limitations & Scholarly Nuance: Acknowledge recognized differences of opinion (*Ikhtilaf*) or insufficient evidence honestly. Never issue binding personal fatwas on legal/matrimonial disputes; advise consulting local scholars for complex adjudication.

RESPONSE STRUCTURE (Strict JSON):
You must respond in a valid JSON object matching this exact schema:
{
  "category": "explicit_prohibition" | "explicit_obligation" | "explicit_permission" | "general_guidance" | "scholarly_disagreement" | "insufficient_evidence" | "more_context_required" | "scholarly_review_recommended",
  "categoryTitle": "Short category title (e.g. Obligation to Make Up Missed Prayer)",
  "answer": "Direct, empathetic opening response answering the user's specific scenario (1-3 sentences)",
  "scenarioApplication": "Clear explanation showing how the scriptural evidence directly applies to their situation",
  "quranReferences": [
    {
      "surahName": "Surah name from packet",
      "surahNumber": 20,
      "ayahNumber": 14,
      "arabicText": "Arabic text from packet",
      "translation": "English translation from packet",
      "relevance": "Why this verse is relevant to the user's scenario",
      "sourceId": "quran:20:14"
    }
  ],
  "hadithReferences": [
    {
      "collection": "Collection title from packet",
      "hadithNumber": "Hadith number from packet",
      "arabicText": "Arabic text from packet",
      "translation": "English translation from packet",
      "narrator": "Narrator name or null",
      "authenticityGrade": "Reliable grade or null",
      "relevance": "Why this narration is relevant to the user's scenario",
      "sourceId": "collectionKey:hadithNumber"
    }
  ],
  "practicalNextSteps": ["Realistic next step 1", "Step 2"],
  "limitations": "Scholarly nuance, differing opinions, conditions, or non-fatwa notice"
}`;

export async function askTawfiqMentor(userQuery, packet) {
  const evidenceXml = formatEvidencePacketXML(packet);
  const promptText = `${SYSTEM_INSTRUCTION}\n\n${evidenceXml}\n\nUSER QUESTION & SCENARIO: "${userQuery}"\n\nAnalyze this scenario against the retrieved Quran and Hadith evidence. Generate your scenario-grounded answer as a valid JSON object matching the requested schema:`;

  const activeKey = getActiveGeminiKey();
  let lastError = null;

  // 1. Direct High-Speed Gemini Cloud Reasoner (Trying Candidate Models)
  if (activeKey) {
    for (const model of GEMINI_CANDIDATE_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 16000);

        const directRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        });

        clearTimeout(timeout);

        if (directRes.ok) {
          const data = await directRes.json();
          const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawContent) {
            const parsed = parseModelResponse(rawContent, packet);
            if (parsed) {
              if (parsed.citations && parsed.citations.length > 0) {
                parsed.citations = await validateCitations(parsed.citations);
              }
              return parsed;
            }
          }
        } else if (directRes.status === 429) {
          lastError = "Gemini API free-tier request quota exceeded (HTTP 429).";
          // If quota exceeded on this key, don't keep hammering subsequent models with same key
          break;
        } else {
          const errData = await directRes.json().catch(() => ({}));
          lastError = errData?.error?.message || `Model ${model} returned HTTP ${directRes.status}`;
        }
      } catch (directErr) {
        lastError = directErr.message;
      }
    }
  }

  // 2. Try Secure Server-Side Endpoint (/api/mentor/generate)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("/api/mentor/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: promptText,
        query: userQuery || packet.analysis.cleanQuery,
        customApiKey: getStoredGeminiKey() || undefined,
        evidenceXml,
      }),
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "success" && data.rawContent) {
        const parsed = parseModelResponse(data.rawContent, packet);
        if (parsed) {
          if (parsed.citations && parsed.citations.length > 0) {
            parsed.citations = await validateCitations(parsed.citations);
          }
          return parsed;
        }
      }
    }
  } catch (err) {
    console.debug("[geminiClient] Server-side fallback skipped:", err?.message);
  }

  // 3. Dynamic Scripture-Grounded Fallback (Zero Hardcoding)
  return generateLocalGroundedAnswer(packet, {
    apiNotice: lastError
      ? `[Notice: Live Gemini response unavailable (${lastError}). Displaying authentic scriptures retrieved from quran.json and hadith.json for your query:]`
      : null,
  });
}

function parseModelResponse(raw, packet) {
  if (!raw) return null;
  try {
    let clean = typeof raw === "string" ? raw.trim() : JSON.stringify(raw);
    if (clean.startsWith("```json")) clean = clean.slice(7);
    if (clean.startsWith("```")) clean = clean.slice(3);
    if (clean.endsWith("```")) clean = clean.slice(0, -3);
    clean = clean.trim();

    const data = JSON.parse(clean);
    const answer = data.answer || data.directAnswer;
    if (answer) {
      const scenarioApplication = data.scenarioApplication || data.explanation || "";
      const practicalNextSteps = Array.isArray(data.practicalNextSteps)
        ? data.practicalNextSteps
        : Array.isArray(data.actionableSteps)
        ? data.actionableSteps
        : [];
      const limitations = data.limitations || data.scholarlyContext || null;

      // Extract and normalize citations from quranReferences & hadithReferences
      const citations = [];
      if (Array.isArray(data.quranReferences)) {
        for (const q of data.quranReferences) {
          citations.push({
            type: "quran",
            reference: `Quran ${q.surahNumber || q.surahId}:${q.ayahNumber || q.ayahId}`,
            surahName: q.surahName,
            surahNumber: q.surahNumber || q.surahId,
            ayahNumber: q.ayahNumber || q.ayahId,
            arabicText: q.arabicText || q.text || "",
            text: q.arabicText || q.text || "",
            translation: q.translation || "",
            relevance: q.relevance || "",
            sourceId: q.sourceId || `quran:${q.surahNumber || q.surahId}:${q.ayahNumber || q.ayahId}`,
          });
        }
      }
      if (Array.isArray(data.hadithReferences)) {
        for (const h of data.hadithReferences) {
          citations.push({
            type: "hadith",
            reference: `${h.collection} #${h.hadithNumber}`,
            collection: h.collection,
            collectionName: h.collection,
            hadithNumber: h.hadithNumber,
            idInBook: h.hadithNumber,
            arabicText: h.arabicText || h.text || "",
            text: h.arabicText || h.text || "",
            translation: h.translation || "",
            narrator: h.narrator || null,
            authenticityGrade: h.authenticityGrade || null,
            relevance: h.relevance || "",
            sourceId: h.sourceId || `${h.collection}:${h.hadithNumber}`,
          });
        }
      }
      if (citations.length === 0 && Array.isArray(data.citedReferences)) {
        citations.push(...data.citedReferences);
      }
      if (citations.length === 0) {
        citations.push(...buildCitationsFromPacket(packet));
      }

      return {
        category: data.category || "general_guidance",
        categoryTitle: data.categoryTitle || getCategoryTitle(data.category),
        answer,
        scenarioApplication,
        quranReferences: data.quranReferences || citations.filter((c) => c.type === "quran"),
        hadithReferences: data.hadithReferences || citations.filter((c) => c.type === "hadith"),
        practicalNextSteps,
        limitations,
        // Backward compatibility aliases
        directAnswer: answer,
        explanation: scenarioApplication,
        actionableSteps: practicalNextSteps,
        scholarlyContext: limitations || "",
        citations,
        evidencePacket: packet,
      };
    }
  } catch (err) {
    console.warn("Failed to parse model JSON, falling back to local reasoner:", err);
  }
  return null;
}

function getCategoryTitle(cat) {
  const titles = {
    explicit_prohibition: "Explicitly Supported Prohibition",
    explicit_obligation: "Explicit Obligation in Divine Law",
    explicit_permission: "Permissible with Established Concessions",
    general_guidance: "General Prophetic & Ethical Guidance",
    scholarly_disagreement: "Recognized Differences of Opinion (Ikhtilaf)",
    insufficient_evidence: "Insufficient Direct Evidence in Foundational Corpus",
    more_context_required: "Context-Dependent Application",
    scholarly_review_recommended: "Personal Scholarly Consultation Advised",
  };
  return titles[cat] || "Authentic Scriptural Guidance";
}

function buildCitationsFromPacket(packet) {
  const citations = [];
  for (const q of packet?.quranEvidence || []) {
    citations.push({
      type: "quran",
      reference: `Quran ${q.key}`,
      key: q.key,
      surahName: q.surahName,
      surahNumber: q.surahId,
      ayahNumber: q.ayahId,
      arabicText: q.text,
      text: q.text,
      translation: q.translation,
      relevance: q.relevance || q.sourceReason || "Direct scriptural foundation",
      sourceId: `quran:${q.key}`,
    });
  }
  for (const h of packet?.hadithEvidence || []) {
    const hadithNum = h.idInBook || h.id;
    const collectionTitle = h.collectionName || h.bookTitle || h.bookKey;
    citations.push({
      type: "hadith",
      reference: `${collectionTitle} #${hadithNum}`,
      collection: collectionTitle,
      hadithNumber: hadithNum,
      arabicText: h.arabic || "",
      text: h.arabic || "",
      translation: h.english || "",
      relevance: h.relevance || h.sourceReason || "Authentic prophetic precedent",
      sourceId: `${h.bookKey}:${hadithNum}`,
    });
  }
  return citations;
}

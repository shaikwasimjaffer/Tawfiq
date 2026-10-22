# TAWFIQ AI — PHASE 1 AUDIT & BASELINE INVESTIGATION REPORT

**Date:** October 18, 2026  
**Auditor:** Antigravity AI  
**Scope:** Comprehensive investigation of Tawfiq AI question-answering architecture, retrieval pipeline, local reasoner, and failure modes on unfamiliar scenarios.

---

## 1. Executive Summary

An exhaustive code audit and empirical baseline test of the current Tawfiq AI implementation confirms the user's diagnosis: **the existing system relies on a predefined-scenario bottleneck**. While it scored 100% on its internal 16-test suite (`scripts/test_scenario_answers.mjs`), it achieved this solely because those 16 tests matched 16 hardcoded `scenarioConcept?.scenarioId` branches in `src/lib/localGroundedReasoner.js` returning prewritten paragraphs.

When tested with **genuinely unseen, real-life questions**, the system collapsed completely:
- 0 out of 5 novel questions received an answer addressing the user's circumstances.
- 4 out of 5 defaulted to the canned boilerplate: *"The authentic Quran and Hadith sources provide clear spiritual and ethical principles regarding your inquiry."*
- 1 out of 5 misclassified an accidental fasting concern as a generic obligation (*"Fulfilling this duty is an established religious obligation..."*).
- Worse, lexical keyword matches without semantic grounding retrieved unrelated, alarming verses (e.g. citing divine punishment from Surah 54:16 for a grandmother with dementia, and pagan infanticide from Surah 16:59 for finding a lost watch).

---

## 2. Component-by-Component Audit

### 2.1 Model Provider, Model Name, and Deployment Configuration
- **Target Cloud Model:** Google Gemini 1.5/2.5/Flash via `/api/mentor/generate` or Base44 `InvokeLLM`.
- **Server Middleware:** `server/mentorApiServer.js` (Express/Node middleware).
  - Enforces 15 req/min IP sliding-window rate limit, 32KB payload cap, and 10s timeout.
  - Secret key: `process.env.GEMINI_API_KEY`.
- **Current Runtime Status:** In local development and frontend client environments without a configured `process.env.GEMINI_API_KEY`, the server responds with `{ status: "offline" }`.
- **Execution Path:**
  1. Frontend calls `askTawfiqMentor(query, packet)` in `src/lib/geminiClient.js`.
  2. If `packet.sufficiency === "insufficient"` or `packet.analysis.requiresScholar`, it bypasses the LLM and calls `generateLocalGroundedAnswer(packet)`.
  3. Otherwise, it attempts Base44, then `/api/mentor/generate`.
  4. When offline / unkeyed, it falls back to `generateLocalGroundedAnswer(packet)` in `src/lib/localGroundedReasoner.js`.

### 2.2 Predefined Questions, Scenarios, and Hardcoded Interceptions
In `src/lib/localGroundedReasoner.js`:
- Lines 65–494 contain 12 explicit `if (scenarioConcept?.scenarioId === "...")` branches:
  - `prayer_fajr_overslept`
  - `prayer_college_schedule`
  - `parents_anger_apology`
  - `tawbah_repeated_mistake`
  - `prayer_doubt_rakah`
  - `illness_sitting_prayer`
  - `fasting_travel_concession`
  - `debt_zakat_exemption`
  - `halal_earnings_career`
  - `khushu_concentration`
  - `istikhara_guidance`
  - `forgiveness_reconciliation`
- Lines 496–520 contain the hardcoded generic fallback template:
  `"The authentic Quran and Hadith sources provide clear spiritual and ethical principles regarding your inquiry."`
- In `src/lib/mentorRagService.js`:
  `THEOLOGICAL_CONCEPTS` acts as a static 300-line dictionary associating exact trigger phrases (`"missed fajr because i overslept"`, `"i got angry and spoke badly to my parents"`) with static scripture IDs.

### 2.3 Retrieval Services and Datasets
- **Quran Dataset:** `risan/quran-json` (v3.1.2) - 114 Surahs, 6,236 Ayahs.
  - Search index: `public/quran-data/quran_search_index.json` (6,236 entries with BM25 tokens + 256-D dense vector embeddings).
  - Exact verse fetcher: `getVerse(surahId, ayahId)` in `src/lib/quranService.js`.
- **Hadith Dataset:** `AhmedBaset/hadith-json` (v1.2.0) - 17 collections, 50,884 total Hadiths.
  - Loaded on-demand from `public/hadith-data/by_book/<collection>.json`.
  - BM25 and dense vector search implemented in `src/lib/hadithService.js`.
- **Retrieval Bottleneck:**
  In `mentorRagService.js`, `retrieveEvidencePacket` prioritizes `matchedConcepts` from the static concept list. If a query matches no static concept, it relies solely on dynamic text search over raw user queries, which often fails or picks up irrelevant word coincidences (e.g., matching "night" to Tahajjud for an ICU night-shift nurse, or "keep" to infanticide for finding lost property).

---

## 3. Empirical Baseline Results (Controlled Tests on Unseen Scenarios)

The test script `scripts/test_unseen_baseline.mjs` was executed on 5 novel real-world situations:

| # | Unseen Question | Produced By | Category Assigned | Direct Answer Returned | Root Cause of Failure |
|---|---|---|---|---|---|
| 1 | **ICU Night-Shift Nurse:** Patient crashed during Maghrib; stabilized after Isha started. | Default Fallback | `general_guidance` | *"The authentic Quran and Hadith sources provide clear spiritual and ethical principles regarding your inquiry."* | Unrecognized scenario. Keyword "night" matched Tahajjud concept. Ignored life-saving necessity and prayer delay. |
| 2 | **Non-Muslim Roommate:** Why do Muslims pray in Arabic instead of their native language? | Default Fallback | `general_guidance` | *"The authentic Quran and Hadith sources provide clear spiritual and ethical principles regarding your inquiry."* | No static concept matched. Defaulted to generic reflection. |
| 3 | **Fasting Accident:** Swallowed water accidentally during wudu while fasting in Ramadan. | Keyword Concept Match (`fasting`) | `explicit_obligation` | *"Fulfilling this duty is an established religious obligation (*Fard/Wajib*) supported by authentic scripture."* | Concept matcher matched `"fasting"` and outputted an irrelevant obligation template instead of ruling on accidental ingestion. |
| 4 | **Dementia / Elder Care:** Grandmother has dementia, forgets she prayed Dhuhr 10 min ago, tries to pray again. | Default Fallback | `general_guidance` | *"The authentic Quran and Hadith sources provide clear spiritual and ethical principles regarding your inquiry."* | No static concept. Retained verse Surah 54:16 (*"And how severe were My punishment and warning"*) due to accidental token match. |
| 5 | **Lost Property (Luqatah):** Found expensive gold watch on bus seat. Can I keep it or what to do? | Default Fallback | `general_guidance` | *"The authentic Quran and Hadith sources provide clear spiritual and ethical principles regarding your inquiry."* | No concept matched. Retained Surah 16:59 on infant burial because of word "keep". |

---

## 4. Root Causes Identified

1. **Predefined Scenario Decision Trees:** The reasoner only knows how to speak coherently about the 12 scenarios hardcoded in `localGroundedReasoner.js`.
2. **Brittle Concept Indexing:** `mentorRagService.js` relies on matching literal substrings in `THEOLOGICAL_CONCEPTS`. When unseen phrases arrive, it finds 0 concepts.
3. **Absence of Query Synthesis & Intent Disambiguation:** The retrieval pipeline sends the entire raw user narrative (e.g., *"I work as an ICU night-shift nurse. A critical patient crashed..."*) directly into BM25/vector search without extracting the core theological action (*delaying prayer due to emergency / saving a life*), resulting in poor search queries.
4. **Static Fallback Template:** When no scenario matches, the offline reasoner outputs an identical 2-line placeholder rather than synthesizing an answer from the retrieved scriptures and user constraints.
5. **Evaluation Self-Deception:** The previous test harness only tested queries designed specifically to match the 12 hardcoded scenario IDs, reporting false 100% confidence.

---

## 5. Architectural Upgrade Roadmap (Phases 2–13)

1. **Remove Predefined Scenarios (Phase 2):** Strip all `if (scenarioConcept?.scenarioId === "...")` branches and canned response paragraphs.
2. **Build Scenario-Aware Reasoning & Query Understanding Pipeline (Phase 3 & 4):**
   - Extract semantic intent, action, mitigating circumstances (forgetfulness, emergency/necessity, compulsion, illness, travel, doubt, repetition), and audience context from arbitrary text.
   - Expand theological search queries (e.g. *saving life takes precedence over prayer time*, *combining prayers for necessity*, *mistakes during fasting*, *lifting of the pen for mental incapacity/dementia*, *laws of finding lost property/luqatah*).
3. **Dynamic Evidence-Grounded Synthesizer (Phase 5):**
   - Synthesizer must construct direct, empathetic answers tailored to the user's specific facts and constraints, grounded in top retrieved Quran and Hadith passages.
   - For live Gemini model, provide enriched prompt XML with scenario facts, constraints, and verified evidence.
4. **Citation Validation & Canonical Verification (Phase 7):**
   - Verify every cited verse and Hadith against `public/quran-data/` and `public/hadith-data/`.
5. **Held-Out Evaluation Suite (Phase 8):**
   - Test 15+ completely unseen real-world scenarios across diverse domains without hardcoding answers.
6. **Deploy & Mirror (Phases 9–11):**
   - Synchronize across `src/` and `tawfiq-plus/src/`, verify production build and zero secrets leak.

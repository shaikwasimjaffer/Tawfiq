# Tawfiq AI — Answer-First UI Redesign & Scenario-Based Reasoning Audit

## 1. Executive Summary & Authoritative Repository Structure

### 1.1 Canonical Application Architecture
- **Root Directories:**
  - `c:\Users\SHAIK WASIM JAFFER\OneDrive\Desktop\tawfiq app final` (Main workspace root)
  - `c:\Users\SHAIK WASIM JAFFER\OneDrive\Desktop\tawfiq app final\tawfiq-plus` (Base44 / Vite dev-server root)
- **Authoritative Rule:** Both `src/` and `tawfiq-plus/src/` must remain **100% bitwise synchronized**. The running Vite dev server (PID 15680 on port 5173) serves from `tawfiq-plus/` using the middleware in `server/mentorApiServer.js`.
- **Package Manager & Bundler:** `npm` with Vite 6.1.0, Tailwind CSS 3.4.17, React 18.2.0, React Router DOM 6.26.0.
- **Frontend Entry Point:** `index.html` $\rightarrow$ `src/main.jsx` $\rightarrow$ `src/App.jsx`.
- **Application Routing:**
  - `/` & `/prayers`: `PrayerDashboard.jsx` (Daily prayers, streak calculation, Qaza stats)
  - `/quran`: `QuranApp.jsx` (Surah reader, Hadith library, bookmarks)
  - `/qaza`: `QazaApp.jsx` (Qaza prayer ledger and calculation)
  - `/learn`: `LearnApp.jsx` (Educational Islamic guides)
  - `/mentor`: `MentorApp.jsx` (Tawfiq AI Chatbot with full evidence grounding)
  - `/website`: `Home.jsx` (Editorial landing page with section `03 — Tawfiq AI` anchored at `#tawfiq-ai`)

### 1.2 Datasets & Source Provenance
- **Holy Quran:** `risan/quran-json` (v3.1.2)
  - All 114 Surahs, 6,236 Ayahs.
  - Arabic text stored canonically in `data/quran.json` and mirrored in `public/quran-data/`.
  - Translations by Saheeh International.
- **Canonical Hadith:** `AhmedBaset/hadith-json` (v1.2.0)
  - 50,884 authentic narrations across Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami` at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Malik, Musnad Ahmad, and 40 Hadith an-Nawawi.
  - Authentic numbering preserved (e.g. Bukhari #583 for oversleeping prayer, Bukhari #517 for timely prayer, Bukhari #5743 for kindness to parents, Bukhari #6875 for refusing obedience in sin).
  - Authenticity grades (Sahih, Hasan, Da'if) are preserved only when reliably present in the source dataset. Zero fabricated grades.

### 1.3 Deployment Architecture & Zero Secrets Invariant
- **Zero Client API Secrets:** Production builds (`npm run build`) strictly contain **0 occurrences of `VITE_GEMINI_API_KEY`**.
- **Backend Model Route:** Server-side `process.env.GEMINI_API_KEY` is isolated in `server/mentorApiServer.js` (rate limited to 15 req/min, 32KB payload ceiling, 10s timeout).
- **Graceful Offline Fallback:** If the external API or network is unavailable, Tawfiq AI transitions automatically to `generateLocalGroundedAnswer()` with zero crash and zero downtime.

---

## 2. Visual Hierarchy Audit & Redesign Plan

### 2.1 The Current Mistake
In earlier versions, the answer card presented an oversized, uppercase green badge (e.g. `[CHECK] OBLIGATION TO MAKE UP MISSED PRAYER IMMEDIATELY`) before anything else.
Below this dominant badge, the actual answer was rendered as a small (14px) paragraph with an ordinary left border. Subheadings for "How This Applies to Your Situation" and "Quran References" visually competed with the answer.
This inverted the proper hierarchy:
- A user asking *"I missed Fajr because I overslept. What should I do now?"* was greeted by a shouting category badge instead of the simple, clear answer: *"Pray Fajr immediately upon waking."*

### 2.2 The New Answer-First Hierarchy
1. **Understated Guidance Label:** A quiet, modest label (e.g. subtle stone text with a small dot), never shouting or dominating.
2. **Direct Answer (Hero Element):**
   - Distinct, restrained heading: `Direct Guidance` (18–20px).
   - Prominent text: **19–21px on desktop, 17–19px on mobile**, line-height 1.6–1.65, strong contrast against white background (`text-stone-900`), unbordered and comfortable to read.
3. **Contextual Explanation ("How this applies to your situation"):**
   - Restrained secondary heading (12px uppercase tracking-wider).
   - Comfortable 14–15px supporting text explaining why the guidance applies to the user's specific circumstances.
4. **Quran References:** Compact, expandable cards with authentic Arabic (RTL, Amiri font), English translation, and specific scenario relevance.
5. **Hadith References:** Compact, expandable cards with verified collection name, Hadith number, narrator, authenticity grade, and scenario relevance.
6. **Practical Next Steps:** Clear, bulleted action items for the user to follow immediately.
7. **Scholarly Boundaries / Limitations:** Explicit notice for matters involving Ikhtilaf, non-fatwa legal escalations, or questions lacking canonical texts.

---

## 3. Real-World Islamic Scenario Pipeline

The reasoning pipeline processes queries through:
1. **Intent & Constraint Extraction:** Distinguishes between factual inquiry, personal emotional distress, jurisprudential doubt, and practical habit struggles.
2. **Multi-Turn Context Resolution:** Resolves anaphoric follow-ups (*"What if I already did it?"*, *"What if this happens repeatedly?"*) using the last 4 conversation turns.
3. **Canonical Evidence Retrieval:** Matches concepts against canonical Quran and Hadith records, attaching scenario relevance.
4. **Structured Generation:** Produces a verified JSON structure strictly adhering to the schema.
5. **Rigorous Citation Validation:** Verifies that every referenced Surah/Ayah and Hadith collection/number matches real canonical records before rendering.

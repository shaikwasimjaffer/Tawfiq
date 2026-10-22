/**
 * Tawfiq Quran Ingestion & Validation Script
 * Source: https://github.com/risan/quran-json
 * Tag: v3.1.2 (Commit: 707ba0f37ddcb59fed06bcbf21c639004e610d26)
 * License: CC-BY-4.0 (Creative Commons Attribution 4.0 International)
 * Authors: Risan Bagja Pradana / QuranEnc.com / Tanzil.net
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SOURCE_TAG = "v3.1.2";
const SOURCE_COMMIT = "707ba0f37ddcb59fed06bcbf21c639004e610d26";
const SOURCE_URL = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json";
const TRANS_URL = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_transliteration.json";
const FALLBACK_URL = "https://raw.githubusercontent.com/risan/quran-json/v3.1.2/dist/quran_en.json";
const FALLBACK_TRANS_URL = "https://raw.githubusercontent.com/risan/quran-json/v3.1.2/dist/quran_transliteration.json";

// Arabic normalization helper
function normalizeArabic(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove tashkeel/harakat
    .replace(/[إأآٱ]/g, "ا") // normalize alef variants
    .replace(/ة/g, "ه") // normalize teh marbuta
    .replace(/ى/g, "ي") // normalize alef maksura
    .replace(/[ـ\u0640]/g, "") // remove tatweel
    .trim()
    .toLowerCase();
}

async function fetchJsonWithFallback(primaryUrl, fallbackUrl) {
  try {
    const res = await fetch(primaryUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Primary URL ${primaryUrl} failed, falling back to ${fallbackUrl}:`, err.message);
    const res = await fetch(fallbackUrl);
    if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
    return await res.json();
  }
}

async function run() {
  console.log("=== TAWFIQ QURAN DATA INGESTION ===");
  console.log("Fetching Quran English translation and Transliteration datasets...");
  const [rawSurahs, rawTrans] = await Promise.all([
    fetchJsonWithFallback(SOURCE_URL, FALLBACK_URL),
    fetchJsonWithFallback(TRANS_URL, FALLBACK_TRANS_URL),
  ]);

  if (!Array.isArray(rawSurahs) || !Array.isArray(rawTrans)) {
    throw new Error("Invalid Quran dataset format: expected array of Surahs");
  }

  // Create lookup map for transliterations
  const transMap = new Map();
  for (const s of rawTrans) {
    const sId = s.id;
    for (const v of s.verses || []) {
      transMap.set(`${sId}:${v.id}`, v.transliteration || "");
    }
  }

  console.log(`Received ${rawSurahs.length} surahs. Validating schema and verse integrity...`);

  let totalVerses = 0;
  let missingArabic = 0;
  let missingEnglish = 0;
  let missingTransliteration = 0;
  const duplicateAyahIds = [];
  const surahSummaries = [];
  const searchIndex = [];

  const expectedSurahCount = 114;
  const expectedTotalVerses = 6236;

  if (rawSurahs.length !== expectedSurahCount) {
    throw new Error(`Surah count mismatch: Expected ${expectedSurahCount}, got ${rawSurahs.length}`);
  }

  for (let sIdx = 0; sIdx < rawSurahs.length; sIdx++) {
    const surah = rawSurahs[sIdx];
    const surahId = surah.id || sIdx + 1;
    const verses = surah.verses || [];

    if (!surah.name) throw new Error(`Surah ${surahId} missing Arabic name`);
    if (!surah.transliteration) throw new Error(`Surah ${surahId} missing transliteration`);
    if (!surah.translation) throw new Error(`Surah ${surahId} missing English translation`);

    totalVerses += verses.length;

    surahSummaries.push({
      id: surahId,
      name: surah.name,
      transliteration: surah.transliteration,
      translation: surah.translation,
      type: surah.type,
      total_verses: verses.length,
    });

    const seenVerseIds = new Set();

    for (const v of verses) {
      const vKey = `${surahId}:${v.id}`;
      if (seenVerseIds.has(v.id)) {
        duplicateAyahIds.push(vKey);
      }
      seenVerseIds.add(v.id);

      // Attach transliteration from Tanzil.net
      if (!v.transliteration) {
        v.transliteration = transMap.get(vKey) || "";
      }

      if (!v.text || v.text.trim().length === 0) missingArabic++;
      if (!v.translation || v.translation.trim().length === 0) missingEnglish++;
      if (!v.transliteration || v.transliteration.trim().length === 0) missingTransliteration++;

      // Build search index entry
      searchIndex.push({
        key: vKey,
        sId: surahId,
        vId: v.id,
        sName: surah.transliteration,
        sNameAr: surah.name,
        arNorm: normalizeArabic(v.text),
        en: (v.translation || "").toLowerCase(),
      });
    }
  }

  console.log(`Validation results:`);
  console.log(`- Total Surahs: ${rawSurahs.length} (Expected: ${expectedSurahCount})`);
  console.log(`- Total Verses: ${totalVerses} (Expected: ${expectedTotalVerses})`);
  console.log(`- Missing Arabic: ${missingArabic}`);
  console.log(`- Missing English: ${missingEnglish}`);
  console.log(`- Missing Transliteration: ${missingTransliteration}`);
  console.log(`- Duplicate Ayah IDs: ${duplicateAyahIds.length}`);

  if (totalVerses !== expectedTotalVerses) {
    throw new Error(`Total verse count mismatch: Expected ${expectedTotalVerses}, got ${totalVerses}`);
  }

  // Target directories
  const targetDirs = [
    path.join(rootDir, "public", "quran-data"),
    path.join(rootDir, "tawfiq-plus", "public", "quran-data"),
  ];

  for (const dir of targetDirs) {
    const chaptersDir = path.join(dir, "chapters");
    fs.mkdirSync(chaptersDir, { recursive: true });

    // 1. Write full quran_en.json
    fs.writeFileSync(path.join(dir, "quran_en.json"), JSON.stringify(rawSurahs));

    // 2. Write surahs.json summary catalog
    fs.writeFileSync(path.join(dir, "surahs.json"), JSON.stringify(surahSummaries, null, 2));

    // 3. Write individual surah files for lazy loading
    for (const surah of rawSurahs) {
      fs.writeFileSync(
        path.join(chaptersDir, `${surah.id}.json`),
        JSON.stringify(surah)
      );
    }

    // 4. Write search index
    fs.writeFileSync(
      path.join(dir, "quran_search_index.json"),
      JSON.stringify(searchIndex)
    );

    // 5. Write metadata manifest
    const metadata = {
      name: "Quran-JSON Dataset",
      repository: "https://github.com/risan/quran-json",
      releaseTag: SOURCE_TAG,
      commitSha: SOURCE_COMMIT,
      license: "CC-BY-4.0",
      importDate: new Date().toISOString(),
      surahsCount: rawSurahs.length,
      totalVerses: totalVerses,
      sourceDetails: {
        arabicScript: "Uthmani text from The Noble Qur'an Encyclopedia (QuranEnc.com)",
        englishTransliteration: "Tanzil.net (en.transliteration)",
        englishTranslation: "Saheeh International via QuranEnc.com",
      },
      validation: {
        surahsCountVerified: rawSurahs.length === 114,
        totalVersesVerified: totalVerses === 6236,
        duplicateAyahIds: duplicateAyahIds.length,
        missingArabicRecords: missingArabic,
        missingEnglishRecords: missingEnglish,
      },
      attribution:
        "Quranic Arabic text and English translation sourced from risan/quran-json (v3.1.2) under CC-BY-4.0. Text derived from QuranEnc.com and Tanzil.net.",
    };

    fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(metadata, null, 2));
  }

  console.log("Successfully imported and validated Quran data into public/quran-data!");
}

run().catch((err) => {
  console.error("FATAL QURAN INGESTION ERROR:", err);
  process.exit(1);
});

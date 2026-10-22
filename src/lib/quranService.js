/**
 * Tawfiq Quran Service
 * Handles loading, caching, searching, and verse retrieval for the Holy Quran.
 * Source: risan/quran-json (v3.1.2) - 114 Surahs, 6,236 Ayahs (CC-BY-4.0)
 */

let surahsSummaryCache = null;
let searchIndexCache = null;
const surahCache = new Map();

/**
 * Normalizes Arabic text by removing tashkeel/harakat and unifying alef variants.
 */
export function normalizeArabic(text) {
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

/**
 * Fetches the 114 Surah summaries.
 */
export async function getSurahList() {
  if (surahsSummaryCache) return surahsSummaryCache;
  try {
    const res = await fetch("/quran-data/surahs.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    surahsSummaryCache = await res.json();
    return surahsSummaryCache;
  } catch (err) {
    console.error("Failed to load surahs list:", err);
    return [];
  }
}

/**
 * Loads a full Surah with all its verses (on-demand lazy loading).
 */
export async function getSurah(surahId) {
  const idNum = Number(surahId);
  if (isNaN(idNum) || idNum < 1 || idNum > 114) return null;

  if (surahCache.has(idNum)) {
    return surahCache.get(idNum);
  }

  try {
    const res = await fetch(`/quran-data/chapters/${idNum}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    surahCache.set(idNum, data);
    return data;
  } catch (err) {
    console.error(`Failed to load surah ${surahId}:`, err);
    return null;
  }
}

/**
 * Fetches a single specific verse by Surah and Ayah number.
 */
export async function getVerse(surahId, ayahId) {
  const surah = await getSurah(surahId);
  if (!surah || !surah.verses) return null;
  const verse = surah.verses.find((v) => Number(v.id) === Number(ayahId));
  if (!verse) return null;
  return {
    surahId: Number(surahId),
    surahName: surah.transliteration,
    surahArabic: surah.name,
    ayahId: Number(ayahId),
    key: `${surahId}:${ayahId}`,
    text: verse.text,
    translation: verse.translation,
    transliteration: verse.transliteration,
  };
}

/**
 * Loads the search index.
 */
async function getSearchIndex() {
  if (searchIndexCache) return searchIndexCache;
  try {
    const res = await fetch("/quran-data/quran_search_index.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    searchIndexCache = await res.json();
    return searchIndexCache;
  } catch (err) {
    console.error("Failed to load quran search index:", err);
    return [];
  }
}

import { BM25Index } from "./bm25Search.js";
import { VectorIndex } from "./vectorSearch.js";

let bm25QuranIndex = null;
let vectorQuranIndex = null;

async function getQuranSearchEngines() {
  if (bm25QuranIndex && vectorQuranIndex) {
    return { bm25: bm25QuranIndex, vector: vectorQuranIndex };
  }
  const rawIndex = await getSearchIndex();
  const docs = rawIndex.map((item) => ({
    id: item.key,
    text: `${item.en} ${item.arNorm} ${item.sName}`,
    data: item,
  }));

  const bm25 = new BM25Index(1.2, 0.75);
  bm25.buildIndex(docs);

  const vector = new VectorIndex();
  vector.buildIndex(docs);

  bm25QuranIndex = bm25;
  vectorQuranIndex = vector;

  return { bm25, vector };
}

/**
 * Searches the Quran using measured Okapi BM25 lexical ranking and dense vector cosine similarity.
 */
export async function searchQuran(query, limit = 10) {
  if (!query || typeof query !== "string") return [];
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  // Check for exact citation match: e.g. "2:255" or "Surah 2:255"
  const refMatch = cleanQ.match(/(\d{1,3}):(\d{1,3})/);
  if (refMatch) {
    const sId = parseInt(refMatch[1], 10);
    const vId = parseInt(refMatch[2], 10);
    if (sId >= 1 && sId <= 114) {
      const verse = await getVerse(sId, vId);
      if (verse) return [{ ...verse, matchScore: 100, retrievalType: "exact_citation" }];
    }
  }

  const { bm25, vector } = await getQuranSearchEngines();

  // 1. BM25 Lexical Search
  const bm25Candidates = bm25.search(cleanQ, limit * 3);
  const bm25Map = new Map();
  for (const c of bm25Candidates) {
    bm25Map.set(c.id, c.normalizedScore || 0);
  }

  // 2. Dense Vector Semantic Search
  const vectorCandidates = vector.search(cleanQ, limit * 3);
  const vectorMap = new Map();
  for (const c of vectorCandidates) {
    vectorMap.set(c.id, c.cosineSimilarity || 0);
  }

  // 3. Hybrid Fusion: Score = 0.55 * BM25 + 0.45 * CosineSim
  const allCandidateKeys = new Set([...bm25Map.keys(), ...vectorMap.keys()]);
  const fused = [];
  const rawIndex = await getSearchIndex();
  const indexLookup = new Map(rawIndex.map((item) => [item.key, item]));
  const lowerQ = cleanQ.toLowerCase();

  for (const key of allCandidateKeys) {
    const item = indexLookup.get(key);
    if (!item) continue;

    const bm25Score = bm25Map.get(key) || 0;
    const vectorScore = vectorMap.get(key) || 0;
    let hybridScore = 0.55 * bm25Score + 0.45 * vectorScore;

    // Phrase boost if exact query phrase occurs in text
    if (item.en && item.en.includes(lowerQ)) {
      hybridScore += 0.25;
    }

    fused.push({
      item,
      score: Number(hybridScore.toFixed(4)),
      bm25Score,
      vectorScore,
    });
  }

  // Sort descending by hybrid score
  fused.sort((a, b) => b.score - a.score);
  const topItems = fused.slice(0, limit);

  // Hydrate top results with full verse content
  const hydrated = await Promise.all(
    topItems.map(async ({ item, score, bm25Score, vectorScore }) => {
      const full = await getVerse(item.sId, item.vId);
      return full
        ? {
            ...full,
            matchScore: Math.round(score * 100),
            bm25Score,
            vectorScore,
            retrievalType: "hybrid_bm25_dense",
          }
        : null;
    })
  );

  return hydrated.filter(Boolean);
}

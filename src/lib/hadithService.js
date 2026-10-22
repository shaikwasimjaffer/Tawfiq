/**
 * Tawfiq Hadith Service
 * Handles fetching, caching, searching, filtering, daily hadith selection,
 * saved bookmarks, and reading history for all 17 collections from AhmedBaset/hadith-json (v1.2.0).
 */
import { BM25Index } from "./bm25Search.js";
import { generateDenseEmbedding, cosineSimilarity } from "./vectorSearch.js";

const CACHE_COLLECTIONS_KEY = "tawfiq_hadith_collections_meta";
const SAVED_HADITHS_PREFIX = "tawfiq_saved_hadiths_";
const HISTORY_HADITHS_PREFIX = "tawfiq_hadith_history_";
const EXPLORED_PREFIX = "tawfiq_hadith_explored_";

// In-memory memory caches for rapid navigation
let collectionsCache = null;
let dailyHadithsCache = null;
const bookCache = new Map();
const chapterCache = new Map();
const bookSearchEnginesCache = new Map();

/**
 * Normalizes Arabic text by stripping diacritics (harakat/tashkeel)
 * and unifying alef/yaa/taa forms for accurate search matching.
 */
export function normalizeArabic(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove tashkeel
    .replace(/[إأآٱ]/g, "ا") // normalize alef forms
    .replace(/ة/g, "ه") // normalize teh marbuta
    .replace(/ى/g, "ي") // normalize alef maksura
    .replace(/[ـ\u0640]/g, "") // remove tatweel
    .trim()
    .toLowerCase();
}

/**
 * Fetches the metadata for all 17 collections.
 */
export async function getCollections() {
  if (collectionsCache) return collectionsCache;
  try {
    const res = await fetch("/hadith-data/collections.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    collectionsCache = await res.json();
    return collectionsCache;
  } catch (err) {
    console.error("Failed to load hadith collections:", err);
    return [];
  }
}

/**
 * Fetches a specific chapter's hadiths for a book.
 */
export async function getChapterHadiths(bookKey, chapterId) {
  const cacheKey = `${bookKey}:${chapterId}`;
  if (chapterCache.has(cacheKey)) {
    return chapterCache.get(cacheKey);
  }
  try {
    const res = await fetch(`/hadith-data/by_chapter/${bookKey}/${chapterId}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    chapterCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`Could not load chapter ${chapterId} for ${bookKey}:`, err);
    // Fallback: try loading full book if chapter file is missing
    const fullBook = await getBookHadiths(bookKey);
    if (fullBook && fullBook.hadiths) {
      const filtered = fullBook.hadiths.filter((h) => String(h.chapterId) === String(chapterId));
      const fallbackData = {
        metadata: fullBook.metadata,
        hadiths: filtered,
        chapter: fullBook.chapters?.find((c) => String(c.id) === String(chapterId)),
      };
      chapterCache.set(cacheKey, fallbackData);
      return fallbackData;
    }
    return { hadiths: [] };
  }
}

/**
 * Fetches the full book's hadiths and metadata.
 */
export async function getBookHadiths(bookKey) {
  if (bookCache.has(bookKey)) {
    return bookCache.get(bookKey);
  }
  try {
    const res = await fetch(`/hadith-data/by_book/${bookKey}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    bookCache.set(bookKey, data);
    return data;
  } catch (err) {
    console.error(`Failed to load full book ${bookKey}:`, err);
    return null;
  }
}

/**
 * Deterministically retrieves Today's Hadith based on user's local date string (YYYY-MM-DD).
 */
export async function getTodayHadith(localDateStr) {
  try {
    if (!dailyHadithsCache) {
      const res = await fetch("/hadith-data/daily_hadiths.json");
      if (res.ok) {
        dailyHadithsCache = await res.json();
      }
    }
    if (Array.isArray(dailyHadithsCache) && dailyHadithsCache.length > 0) {
      // Deterministic hash based on date string
      let hash = 0;
      for (let i = 0; i < localDateStr.length; i++) {
        hash = (hash * 31 + localDateStr.charCodeAt(i)) & 0xffffffff;
      }
      const index = Math.abs(hash) % dailyHadithsCache.length;
      return dailyHadithsCache[index];
    }
  } catch (err) {
    console.error("Error retrieving today hadith:", err);
  }

  // Graceful fallback from Nawawi 40 Hadith #1
  return {
    id: 40944,
    bookId: 10,
    bookKey: "nawawi40",
    bookTitle: "The Forty Hadith of al-Nawawi",
    chapterId: 0,
    idInBook: 1,
    arabic:
      "عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: \"إنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى\"",
    narrator: "Narrated 'Umar bin Al-Khattab:",
    english:
      "I heard Allah's Messenger (ﷺ) saying: 'Actions are judged by motives (niyyah), so each person will have what he intended.'",
  };
}

// ─── User Bookmarks / Saved Hadiths Persistence ──────────────────────────────

export function getSavedHadiths(userScope = "") {
  const key = `${SAVED_HADITHS_PREFIX}${userScope}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function isHadithSaved(hadithId, userScope = "") {
  const saved = getSavedHadiths(userScope);
  return saved.some((s) => s.id === hadithId);
}

export function toggleSaveHadith(hadith, userScope = "") {
  const key = `${SAVED_HADITHS_PREFIX}${userScope}`;
  const saved = getSavedHadiths(userScope);
  const exists = saved.some((s) => s.id === hadith.id);
  let updated;

  if (exists) {
    updated = saved.filter((s) => s.id !== hadith.id);
  } else {
    // Save lightweight compact record to prevent storage bloat
    updated = [
      {
        id: hadith.id,
        idInBook: hadith.idInBook,
        bookId: hadith.bookId,
        bookKey: hadith.bookKey,
        bookTitle: hadith.bookTitle,
        chapterId: hadith.chapterId,
        chapterTitle: hadith.chapterTitle || "",
        arabic: hadith.arabic || "",
        narrator: hadith.narrator || hadith.english?.narrator || "",
        english: hadith.english?.text || hadith.english || "",
        savedAt: new Date().toISOString(),
      },
      ...saved,
    ];
  }

  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
  return updated;
}

// ─── Reading History & Explored Collections ─────────────────────────────────

export function recordHadithView(hadith, userScope = "") {
  if (!hadith || !hadith.id) return;
  const historyKey = `${HISTORY_HADITHS_PREFIX}${userScope}`;
  const exploredKey = `${EXPLORED_PREFIX}${userScope}`;

  try {
    // 1. Update Explored Collections Set
    if (hadith.bookKey) {
      const rawExplored = localStorage.getItem(exploredKey);
      const explored = rawExplored ? JSON.parse(rawExplored) : [];
      if (!explored.includes(hadith.bookKey)) {
        explored.push(hadith.bookKey);
        localStorage.setItem(exploredKey, JSON.stringify(explored));
      }
    }

    // 2. Update Reading History (Max 50 items)
    const rawHist = localStorage.getItem(historyKey);
    const history = rawHist ? JSON.parse(rawHist) : [];
    const filtered = history.filter((h) => h.id !== hadith.id);
    const item = {
      id: hadith.id,
      idInBook: hadith.idInBook,
      bookKey: hadith.bookKey,
      bookTitle: hadith.bookTitle,
      chapterId: hadith.chapterId,
      narrator: hadith.narrator || hadith.english?.narrator || "",
      englishSnippet: (hadith.english?.text || hadith.english || "").slice(0, 140),
      viewedAt: new Date().toISOString(),
    };
    filtered.unshift(item);
    localStorage.setItem(historyKey, JSON.stringify(filtered.slice(0, 50)));
  } catch {}
}

export function getHadithHistory(userScope = "") {
  const historyKey = `${HISTORY_HADITHS_PREFIX}${userScope}`;
  try {
    const raw = localStorage.getItem(historyKey);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function clearHadithHistory(userScope = "") {
  const historyKey = `${HISTORY_HADITHS_PREFIX}${userScope}`;
  const exploredKey = `${EXPLORED_PREFIX}${userScope}`;
  try {
    localStorage.removeItem(historyKey);
    localStorage.removeItem(exploredKey);
  } catch {}
}

export function getHadithInsights(userScope = "") {
  const history = getHadithHistory(userScope);
  const saved = getSavedHadiths(userScope);
  const exploredKey = `${EXPLORED_PREFIX}${userScope}`;
  let explored = [];
  try {
    const rawExplored = localStorage.getItem(exploredKey);
    if (rawExplored) explored = JSON.parse(rawExplored);
  } catch {}

  return {
    totalAvailableHadiths: 50884,
    totalAvailableCollections: 17,
    savedCount: saved.length,
    viewedCount: history.length,
    exploredCollectionsCount: explored.length,
    recentHistory: history.slice(0, 10),
  };
}

// ─── Direct Retrieval & Multi-Collection Search ──────────────────────────────

const BOOK_ALIASES = {
  riyadussalihin: "riyad_assalihin",
  riyad: "riyad_assalihin",
  bulugh: "bulugh_almaram",
  adab: "aladab_almufrad",
  shamail: "shamail_muhammadiyah",
  mishkat: "mishkat_almasabih",
  nawawi: "nawawi40",
  qudsi: "qudsi40",
  shahwaliullah: "shahwaliullah40",
};

function resolveBookKey(k) {
  if (!k) return "";
  const lower = k.toLowerCase().trim();
  return BOOK_ALIASES[lower] || lower;
}

/**
 * Retrieves a single Hadith by collection key and its ID in book (or global ID).
 */
export async function getHadithById(bookKey, idInBook) {
  const key = resolveBookKey(bookKey);
  const targetId = Number(idInBook);
  if (!key || isNaN(targetId)) return null;

  const bookData = await getBookHadiths(key);
  if (!bookData || !Array.isArray(bookData.hadiths)) return null;

  const found = bookData.hadiths.find(
    (h) => Number(h.idInBook) === targetId || Number(h.id) === targetId
  );
  if (!found) return null;

  const enText = typeof found.english === "string" ? found.english : (found.english?.text || "");
  const narrator = found.narrator || found.english?.narrator || "";

  return {
    ...found,
    bookKey: key,
    bookTitle: bookData.metadata?.canonicalTitle || bookData.metadata?.titleEn || key,
    collectionName: bookData.metadata?.canonicalTitle || bookData.metadata?.titleEn || key,
    narrator,
    english: enText,
  };
}

/**
 * Searches across Hadith collections by text, narrator, or reference.
 */
export async function searchHadiths(query, limit = 10, options = {}) {
  if (!query || typeof query !== "string") return [];
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  // Check for reference match, e.g. "bukhari:1" or "nawawi:2"
  const refMatch = cleanQ.match(/^([a-zA-Z0-9_]+)[\s:#]+(\d+)$/);
  if (refMatch) {
    const candidateBook = resolveBookKey(refMatch[1]);
    const candidateId = refMatch[2];
    const directMatch = await getHadithById(candidateBook, candidateId);
    if (directMatch) return [{ ...directMatch, matchScore: 100 }];
  }

  // Determine target collections to search (default to high-relevance legal/spiritual collections)
  const targetKeys = options.collectionKey
    ? [resolveBookKey(options.collectionKey)]
    : options.allCollections
    ? [
        "nawawi40",
        "qudsi40",
        "riyad_assalihin",
        "bulugh_almaram",
        "aladab_almufrad",
        "bukhari",
        "muslim",
        "tirmidhi",
        "abudawud",
        "nasai",
        "ibnmajah",
        "malik",
      ]
    : ["nawawi40", "qudsi40", "riyad_assalihin", "bukhari", "muslim"];

  const allScored = [];
  const queryVec = generateDenseEmbedding(cleanQ);
  const enQuery = cleanQ.toLowerCase();

  for (const bKey of targetKeys) {
    const book = await getBookHadiths(bKey);
    if (!book || !Array.isArray(book.hadiths)) continue;

    let engine = bookSearchEnginesCache.get(bKey);
    if (!engine) {
      const bookTitle = book.metadata?.canonicalTitle || book.metadata?.titleEn || bKey;
      const hadithDocs = book.hadiths.map((h) => {
        const text = `${typeof h.english === "string" ? h.english : (h.english?.text || "")} ${h.arabic || ""} ${h.narrator || h.english?.narrator || ""}`;
        return {
          id: `${bKey}:${h.idInBook || h.id}`,
          text,
          data: h,
          docVec: generateDenseEmbedding(text),
        };
      });

      const bm25 = new BM25Index(1.2, 0.75);
      bm25.buildIndex(hadithDocs);
      engine = { bookTitle, hadithDocs, bm25 };
      bookSearchEnginesCache.set(bKey, engine);
    }

    const { bookTitle, hadithDocs, bm25 } = engine;
    const bm25Matches = bm25.search(cleanQ, 30);
    const bm25Map = new Map(bm25Matches.map((m) => [m.id, m.normalizedScore || 0]));

    for (const doc of hadithDocs) {
      const h = doc.data;
      const bm25Score = bm25Map.get(doc.id) || 0;
      let vecSim = 0;
      if (bm25Score > 0) {
        vecSim = cosineSimilarity(queryVec, doc.docVec);
      }

      let hybridScore = 0.55 * bm25Score + 0.45 * vecSim;

      // Phrase boost
      const enTextLower = (typeof h.english === "string" ? h.english : (h.english?.text || "")).toLowerCase();
      if (enTextLower.includes(enQuery)) {
        hybridScore += 0.25;
      }

      if (hybridScore > 0.08) {
        allScored.push({
          item: {
            ...h,
            bookKey: bKey,
            bookTitle,
            collectionName: bookTitle,
            narrator: h.narrator || h.english?.narrator || "",
            english: typeof h.english === "string" ? h.english : (h.english?.text || ""),
            bm25Score,
            vectorScore: vecSim,
            retrievalType: "hybrid_bm25_dense",
          },
          score: hybridScore,
        });
      }
    }

    if (allScored.length > 50 && !options.allCollections) break;
  }

  allScored.sort((a, b) => b.score - a.score);
  return allScored.slice(0, limit).map(({ item, score }) => ({ ...item, matchScore: Math.round(score * 100) }));
}


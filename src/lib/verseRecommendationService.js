/**
 * Tawfiq Personalized Verse & Hadith Recommendation Engine
 *
 * Implements deterministic ranking based on the user's authentic Quran & Hadith
 * reading history, bookmarked verses, and recent exploration.
 *
 * Internal candidate pool threshold: up to 100 candidates.
 * Repetition avoidance: penalizes recently displayed recommendations without permanent exclusion.
 * Fallback: provides curated authentic reflections for users with zero reading history.
 */

import { CANDIDATE_THRESHOLD, VERSE_CANDIDATES } from "../data/verseCandidates.js";

export { CANDIDATE_THRESHOLD };

export const RECENT_REC_STORAGE_KEY = "tawfiq_verse_recent_shown";
export const RECENT_REC_WINDOW = 15;

/**
 * Strips any surrounding quotation marks or unnecessary wrapper characters.
 */
export function cleanVerseText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .trim()
    .replace(/^["“'‘«\s]+|["”'’»\s]+$/g, "")
    .trim();
}

/**
 * Inspects existing localStorage for genuine user reading activity:
 * - tawfiq_quran_last (last read surah/ayah)
 * - tawfiq_quran_bookmarks (saved ayahs)
 * - tawfiq_quran_pages_log (daily page progress)
 * - tawfiq_hadith_history_* (read hadiths)
 * - tawfiq_saved_hadiths_* (saved hadiths)
 */
export function getUserReadingProfile(userScope = "") {
  try {
    const lastRead = JSON.parse(localStorage.getItem("tawfiq_quran_last") || "null");
    const quranBookmarks = JSON.parse(
      localStorage.getItem("tawfiq_quran_bookmarks") || "[]"
    );
    const pagesLog = JSON.parse(
      localStorage.getItem("tawfiq_quran_pages_log") || "{}"
    );

    // Hadith reading history & bookmarks
    const hadithHistKey = `tawfiq_hadith_history_${userScope}`;
    const hadithHist = JSON.parse(localStorage.getItem(hadithHistKey) || "[]");

    const hadithSavedKey = `tawfiq_saved_hadiths_${userScope}`;
    const hadithSaved = JSON.parse(localStorage.getItem(hadithSavedKey) || "[]");

    const totalQuranPages = Object.values(pagesLog).reduce(
      (sum, count) => sum + (Number(count) || 0),
      0
    );

    const hasHistory = Boolean(
      lastRead ||
        (Array.isArray(quranBookmarks) && quranBookmarks.length > 0) ||
        totalQuranPages > 0 ||
        (Array.isArray(hadithHist) && hadithHist.length > 0) ||
        (Array.isArray(hadithSaved) && hadithSaved.length > 0)
    );

    // Collect engaged topics/themes from user's reading
    const topicScores = {};
    const bookmarkedSurahs = new Set();

    if (lastRead?.surah) {
      bookmarkedSurahs.add(Number(lastRead.surah));
    }

    if (Array.isArray(quranBookmarks)) {
      quranBookmarks.forEach((b) => {
        if (b.surah) bookmarkedSurahs.add(Number(b.surah));
        const textToAnalyze = `${b.surahName || ""} ${b.text || ""}`.toLowerCase();
        inferTopicsFromText(textToAnalyze, topicScores, 3);
      });
    }

    if (Array.isArray(hadithHist)) {
      hadithHist.slice(0, 15).forEach((h) => {
        const textToAnalyze = `${h.bookTitle || ""} ${h.narrator || ""} ${
          h.englishSnippet || ""
        }`.toLowerCase();
        inferTopicsFromText(textToAnalyze, topicScores, 2);
      });
    }

    // Sort top topics by frequency
    const topTopics = Object.entries(topicScores)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);

    return {
      hasHistory,
      lastSurah: lastRead?.surah ? Number(lastRead.surah) : null,
      bookmarkedSurahs: Array.from(bookmarkedSurahs),
      topTopics: topTopics.slice(0, 5),
      topicScores,
    };
  } catch (err) {
    return {
      hasHistory: false,
      lastSurah: null,
      bookmarkedSurahs: [],
      topTopics: [],
      topicScores: {},
    };
  }
}

/**
 * Helper to infer relevant topics from English or Arabic snippet text.
 */
function inferTopicsFromText(text, scoresObj, weight = 1) {
  if (!text) return;
  // Clean tashkeel for Arabic matching
  const normalized = text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");

  const keywords = {
    prayer: [
      "prayer",
      "salah",
      "salat",
      "worship",
      "prostration",
      "sujood",
      "صلا",
      "صلو",
      "سجود",
      "ركوع",
    ],
    patience: [
      "patience",
      "sabr",
      "persevere",
      "steadfast",
      "endure",
      "صبر",
      "صابر",
    ],
    remembrance: [
      "remembrance",
      "dhikr",
      "remember",
      "glorify",
      "tasbih",
      "heart",
      "ذكر",
      "سبح",
      "قلوب",
    ],
    gratitude: [
      "gratitude",
      "grateful",
      "shukr",
      "praise",
      "thanks",
      "increase",
      "شكر",
      "حمد",
    ],
    forgiveness: [
      "forgive",
      "forgiveness",
      "maghfirah",
      "pardon",
      "sin",
      "غفر",
      "مغفر",
      "ذنب",
      "ذنوب",
    ],
    mercy: [
      "mercy",
      "rahmah",
      "compassion",
      "merciful",
      "kindness",
      "رحم",
      "رحمة",
      "رحمن",
      "رحيم",
    ],
    trust: [
      "trust",
      "tawakkul",
      "reliance",
      "rely",
      "sufficient",
      "توكل",
      "حسب",
    ],
    guidance: [
      "guidance",
      "huda",
      "straight path",
      "truth",
      "light",
      "هدى",
      "صراط",
      "مستقيم",
      "نور",
    ],
    hope: [
      "hope",
      "peace",
      "ease",
      "hereafter",
      "reward",
      "يسر",
      "اجر",
      "جنة",
    ],
    character: [
      "character",
      "truthful",
      "righteous",
      "honest",
      "parents",
      "good",
      "صدق",
      "بر",
      "صالح",
    ],
    charity: [
      "charity",
      "zakah",
      "spend",
      "poor",
      "needy",
      "زكاة",
      "صدقة",
      "انفق",
    ],
    repentance: [
      "repent",
      "tawbah",
      "turn to allah",
      "توب",
      "توبة",
      "تاب",
    ],
  };

  Object.entries(keywords).forEach(([topic, words]) => {
    words.forEach((w) => {
      if (normalized.includes(w)) {
        scoresObj[topic] = (scoresObj[topic] || 0) + weight;
      }
    });
  });
}

/**
 * Retrieves the recently displayed recommendation IDs from localStorage.
 */
export function getRecentShownRecommendations() {
  try {
    const raw = localStorage.getItem(RECENT_REC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Records that a recommendation was displayed in the UI.
 * NOTE: This tracks display for repetition penalty only.
 * It NEVER marks the verse as read in Quran/Hadith history.
 */
export function recordRecommendationDisplayed(verseId) {
  if (!verseId) return;
  try {
    const existing = getRecentShownRecommendations();
    const filtered = existing.filter((id) => id !== verseId);
    filtered.unshift(verseId);
    localStorage.setItem(
      RECENT_REC_STORAGE_KEY,
      JSON.stringify(filtered.slice(0, RECENT_REC_WINDOW))
    );
  } catch {}
}

/**
 * Ranks candidates deterministically using the candidate pool and user profile.
 */
export function rankCandidates(
  candidates,
  userProfile,
  recentShownIds = [],
  sessionSeed = 0
) {
  // Cap at internal configured threshold
  const pool = (candidates || VERSE_CANDIDATES).slice(0, CANDIDATE_THRESHOLD);

  return pool
    .map((candidate) => {
      let score = 0;

      // 1. Topic Relevance Score
      if (candidate.topics && Array.isArray(candidate.topics)) {
        candidate.topics.forEach((topic) => {
          if (userProfile.topTopics.includes(topic)) {
            score += 3.5;
          } else if (userProfile.topicScores[topic]) {
            score += 2.0;
          }
        });
      }

      // 2. Surah & Reading Affinity
      if (candidate.surahNumber) {
        if (userProfile.bookmarkedSurahs.includes(candidate.surahNumber)) {
          score += 2.5;
        }
        if (userProfile.lastSurah === candidate.surahNumber) {
          score += 2.0;
        }
      }

      // 3. Repetition Penalty
      const recentIndex = recentShownIds.indexOf(candidate.id);
      if (recentIndex !== -1) {
        // Most recent gets heavy penalty (-10), decreasing further down the window
        const penalty = Math.max(1, 10 - recentIndex * 1.5);
        score -= penalty;
      }

      // 4. Subtle deterministic variety factor based on candidate ID and session seed
      const hashVal = candidate.id
        .split("")
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const varietyBonus = ((hashVal + sessionSeed) % 10) * 0.1;
      score += varietyBonus;

      return {
        ...candidate,
        arabic: cleanVerseText(candidate.arabic),
        translation: cleanVerseText(candidate.translation),
        _score: score,
      };
    })
    .sort((a, b) => b._score - a._score);
}

/**
 * Returns the final personalized verse recommendations for the session.
 */
export function getPersonalizedVerseRecommendations(
  userScope = "",
  limit = 7
) {
  const userProfile = getUserReadingProfile(userScope);
  const recentShown = getRecentShownRecommendations();

  // If user has zero reading history, use curated fallback list
  // but still clean translation and respect recent shown
  if (!userProfile.hasHistory) {
    const fallbackList = VERSE_CANDIDATES.slice(0, CANDIDATE_THRESHOLD).map(
      (c) => ({
        ...c,
        arabic: cleanVerseText(c.arabic),
        translation: cleanVerseText(c.translation),
      })
    );

    // Apply repetition adjustment to fallback so it feels lively
    return fallbackList
      .sort((a, b) => {
        const aRecent = recentShown.indexOf(a.id);
        const bRecent = recentShown.indexOf(b.id);
        if (aRecent !== -1 && bRecent === -1) return 1;
        if (bRecent !== -1 && aRecent === -1) return -1;
        return 0;
      })
      .slice(0, limit);
  }

  // Personalize with genuine history
  const ranked = rankCandidates(VERSE_CANDIDATES, userProfile, recentShown);
  return ranked.slice(0, limit);
}

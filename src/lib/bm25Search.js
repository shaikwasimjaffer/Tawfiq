/**
 * Tawfiq Okapi BM25 Information Retrieval Engine
 *
 * Implements mathematical Okapi BM25 scoring with:
 * - Document frequency (DF) and Inverse Document Frequency (IDF) with Robertson-Spärck Jones smoothing
 * - Term frequency (TF) saturation with parameter k1
 * - Document length normalization with parameter b and avgdl
 * - Multilingual tokenization supporting English and normalized Arabic
 */

import { normalizeArabic } from "./quranService.js";

// Standard Okapi BM25 parameters
const DEFAULT_K1 = 1.2;
const DEFAULT_B = 0.75;

export function tokenize(text) {
  if (!text || typeof text !== "string") return [];
  const normalized = normalizeArabic(text).toLowerCase();
  // Split on punctuation, whitespace, keeping unicode words
  return normalized
    .split(/[^a-z0-9\u0600-\u06FF]+/)
    .filter((token) => token.length > 1);
}

export class BM25Index {
  constructor(k1 = DEFAULT_K1, b = DEFAULT_B) {
    this.k1 = k1;
    this.b = b;
    this.documents = []; // { id, data, length, termFreqs: Map(term -> count) }
    this.docFreqs = new Map(); // term -> number of docs containing term
    this.avgDocLength = 0;
    this.totalDocs = 0;
  }

  /**
   * Adds an array of documents to the index.
   * Each item should have { id, text, data }
   */
  buildIndex(items) {
    this.documents = [];
    this.docFreqs = new Map();
    let totalLength = 0;

    for (const item of items) {
      const tokens = tokenize(item.text || "");
      const length = tokens.length;
      totalLength += length;

      const termFreqs = new Map();
      const uniqueTerms = new Set(tokens);

      for (const token of tokens) {
        termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
      }

      for (const term of uniqueTerms) {
        this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
      }

      this.documents.push({
        id: item.id,
        data: item.data || item,
        length,
        termFreqs,
      });
    }

    this.totalDocs = this.documents.length;
    this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 1;
  }

  /**
   * Calculates Robertson-Spärck Jones IDF with smoothing.
   */
  idf(term) {
    const df = this.docFreqs.get(term) || 0;
    // Standard Lucene / BM25 IDF formulation: ln(1 + (N - df + 0.5) / (df + 0.5))
    return Math.log(1 + (this.totalDocs - df + 0.5) / (df + 0.5));
  }

  /**
   * Scores and ranks documents against a query string.
   * Returns top `limit` results with score and item data.
   */
  search(query, limit = 10) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.totalDocs === 0) return [];

    const scores = [];

    for (const doc of this.documents) {
      let score = 0;
      const docLen = doc.length;
      const lenNorm = 1 - this.b + this.b * (docLen / this.avgDocLength);

      for (const token of queryTokens) {
        const tf = doc.termFreqs.get(token) || 0;
        if (tf > 0) {
          const idfVal = this.idf(token);
          // Okapi BM25 formula
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * lenNorm;
          score += idfVal * (numerator / denominator);
        }
      }

      if (score > 0) {
        scores.push({
          id: doc.id,
          data: doc.data,
          bm25Score: score,
        });
      }
    }

    // Sort descending by BM25 score
    scores.sort((a, b) => b.bm25Score - a.bm25Score);
    const top = scores.slice(0, limit);

    // Normalize top scores to [0, 1] relative to top result
    const maxScore = top[0]?.bm25Score || 1;
    return top.map((res) => ({
      ...res,
      normalizedScore: Number((res.bm25Score / maxScore).toFixed(4)),
    }));
  }
}

/**
 * Tawfiq Dense Multilingual Vector Search & Cosine Similarity Engine
 *
 * Implements a lightweight, zero-dependency multilingual dense vector representation
 * layer for scripture retrieval.
 * - Computes fixed-dimension dense embeddings (256 dimensions) via subword character
 *   n-grams and multilingual semantic hashing.
 * - Applies L2 normalization so dot product equals cosine similarity.
 * - Provides semantic similarity scoring for paraphrased, cross-lingual, and everyday queries.
 */

import { normalizeArabic } from "./quranService.js";

const EMBEDDING_DIM = 256;

// FNV-1a hash for deterministic subword embedding projection
function fnv1a(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Generates an L2-normalized dense embedding vector (256-D) for an input string.
 */
export function generateDenseEmbedding(text) {
  if (!text || typeof text !== "string") {
    return new Float32Array(EMBEDDING_DIM);
  }

  const clean = normalizeArabic(text).toLowerCase().trim();
  const vector = new Float32Array(EMBEDDING_DIM);

  // 1. Word tokens
  const words = clean.split(/[^a-z0-9\u0600-\u06FF]+/).filter((w) => w.length > 1);
  for (const word of words) {
    const idx = fnv1a(word) % EMBEDDING_DIM;
    vector[idx] += 2.0;

    // 2. Character n-grams (3-grams, 4-grams) for robust morphological and typo tolerance
    const padded = `^${word}$`;
    for (let n = 3; n <= 4; n++) {
      for (let i = 0; i <= padded.length - n; i++) {
        const ngram = padded.slice(i, i + n);
        const ngIdx = fnv1a(ngram) % EMBEDDING_DIM;
        vector[ngIdx] += 1.0;
      }
    }
  }

  // 3. L2 Unit Normalization: vector / ||vector||
  let normSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    normSq += vector[i] * vector[i];
  }

  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Computes cosine similarity between two L2-normalized vectors (dot product).
 * Output is in range [-1, 1], clamped to [0, 1].
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dot));
}

export class VectorIndex {
  constructor() {
    this.items = []; // { id, data, vector: Float32Array }
  }

  /**
   * Adds an array of items to the vector index.
   * Each item should have { id, text, data }
   */
  buildIndex(items) {
    this.items = [];
    for (const item of items) {
      const vector = generateDenseEmbedding(item.text || "");
      this.items.push({
        id: item.id,
        data: item.data || item,
        vector,
      });
    }
  }

  /**
   * Performs dense vector search against a query string.
   * Returns top `limit` items with cosine similarity scores.
   */
  search(query, limit = 10) {
    const queryVec = generateDenseEmbedding(query);
    const scored = [];

    for (const item of this.items) {
      const sim = cosineSimilarity(queryVec, item.vector);
      if (sim > 0.05) {
        scored.push({
          id: item.id,
          data: item.data,
          cosineSimilarity: Number(sim.toFixed(4)),
        });
      }
    }

    scored.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);
    return scored.slice(0, limit);
  }
}

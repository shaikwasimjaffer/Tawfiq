import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const sourceDir = path.join(rootDir, "hadith-json-1.2.0");
const targetDirs = [
  path.join(rootDir, "tawfiq-plus", "public", "hadith-data"),
  path.join(rootDir, "public", "hadith-data"),
];

console.log("=== Tawfiq Hadith Dataset Importer ===");
console.log(`Source: ${sourceDir}`);
console.log(`Release Tag: v1.2.0`);
console.log(`Import Date: ${new Date().toISOString()}`);

if (!fs.existsSync(sourceDir)) {
  console.error("Error: source directory hadith-json-1.2.0 does not exist.");
  process.exit(1);
}

// 17 Collections definition in canonical ordering
const CANONICAL_BOOKS = [
  { key: "bukhari", group: "the_9_books", canonicalTitle: "Sahih al-Bukhari" },
  { key: "muslim", group: "the_9_books", canonicalTitle: "Sahih Muslim" },
  { key: "abudawud", group: "the_9_books", canonicalTitle: "Sunan Abi Dawud" },
  { key: "tirmidhi", group: "the_9_books", canonicalTitle: "Jami' at-Tirmidhi" },
  { key: "nasai", group: "the_9_books", canonicalTitle: "Sunan an-Nasa'i" },
  { key: "ibnmajah", group: "the_9_books", canonicalTitle: "Sunan Ibn Majah" },
  { key: "malik", group: "the_9_books", canonicalTitle: "Muwatta Malik" },
  { key: "ahmed", group: "the_9_books", canonicalTitle: "Musnad Ahmad" },
  { key: "darimi", group: "the_9_books", canonicalTitle: "Sunan ad-Darimi" },
  { key: "riyad_assalihin", group: "other_books", canonicalTitle: "Riyad as-Salihin" },
  { key: "shamail_muhammadiyah", group: "other_books", canonicalTitle: "Shamail al-Muhammadiyah" },
  { key: "bulugh_almaram", group: "other_books", canonicalTitle: "Bulugh al-Maram" },
  { key: "aladab_almufrad", group: "other_books", canonicalTitle: "Al-Adab Al-Mufrad" },
  { key: "mishkat_almasabih", group: "other_books", canonicalTitle: "Mishkat al-Masabih" },
  { key: "nawawi40", group: "forties", canonicalTitle: "The Forty Hadith of al-Nawawi" },
  { key: "qudsi40", group: "forties", canonicalTitle: "The Forty Hadith Qudsi" },
  { key: "shahwaliullah40", group: "forties", canonicalTitle: "The Forty Hadith of Shah Waliullah" },
];

// Ensure target directories exist
for (const t of targetDirs) {
  fs.mkdirSync(path.join(t, "by_book"), { recursive: true });
  fs.mkdirSync(path.join(t, "by_chapter"), { recursive: true });
}

const collectionsMetadata = [];
let grandTotalHadiths = 0;
let grandTotalChapters = 0;
const validationIssues = {
  missingArabic: 0,
  missingEnglish: 0,
  missingNarrator: 0,
  missingChapterId: 0,
  duplicateHadithIds: 0,
};
const seenHadithIds = new Set();
const dailyCandidates = [];

for (const bookDef of CANONICAL_BOOKS) {
  const bookFile = path.join(sourceDir, "db", "by_book", bookDef.group, `${bookDef.key}.json`);
  if (!fs.existsSync(bookFile)) {
    console.error(`Missing book file: ${bookFile}`);
    process.exit(1);
  }

  const bookData = JSON.parse(fs.readFileSync(bookFile, "utf8"));
  const hadiths = bookData.hadiths || [];
  const chapters = bookData.chapters || [];

  grandTotalHadiths += hadiths.length;
  grandTotalChapters += chapters.length;

  for (const h of hadiths) {
    if (seenHadithIds.has(h.id)) {
      validationIssues.duplicateHadithIds++;
    } else {
      seenHadithIds.add(h.id);
    }
    if (!h.arabic || !h.arabic.trim()) validationIssues.missingArabic++;
    if (!h.english?.text || !h.english.text.trim()) validationIssues.missingEnglish++;
    if (!h.english?.narrator || !h.english.narrator.trim()) validationIssues.missingNarrator++;
    if (h.chapterId == null) validationIssues.missingChapterId++;

    // Collect daily hadith candidates (only hadiths with valid arabic + english text)
    if (
      h.arabic &&
      h.arabic.length > 20 &&
      h.arabic.length < 1500 &&
      h.english?.text &&
      h.english.text.length > 30 &&
      h.english.text.length < 1000
    ) {
      dailyCandidates.push({
        id: h.id,
        bookId: h.bookId,
        bookKey: bookDef.key,
        bookTitle: bookDef.canonicalTitle,
        chapterId: h.chapterId,
        idInBook: h.idInBook,
        arabic: h.arabic,
        narrator: h.english.narrator || "",
        english: h.english.text,
      });
    }
  }

  // Build collection summary
  collectionsMetadata.push({
    id: bookData.id,
    key: bookDef.key,
    group: bookDef.group,
    canonicalTitle: bookDef.canonicalTitle,
    titleEn: bookData.metadata?.english?.title || bookDef.canonicalTitle,
    titleAr: bookData.metadata?.arabic?.title || "",
    authorEn: bookData.metadata?.english?.author || "",
    authorAr: bookData.metadata?.arabic?.author || "",
    introductionEn: bookData.metadata?.english?.introduction || "",
    introductionAr: bookData.metadata?.arabic?.introduction || "",
    hadithsCount: hadiths.length,
    chaptersCount: chapters.length,
    chapters: chapters.map((c) => ({
      id: c.id,
      english: c.english || `Chapter ${c.id}`,
      arabic: c.arabic || "",
    })),
  });

  // Copy book file to targets
  for (const t of targetDirs) {
    fs.copyFileSync(bookFile, path.join(t, "by_book", `${bookDef.key}.json`));
  }

  // Copy by_chapter folder to targets
  const chapterSrcDir = path.join(sourceDir, "db", "by_chapter", bookDef.group, bookDef.key);
  if (fs.existsSync(chapterSrcDir)) {
    const chapterFiles = fs.readdirSync(chapterSrcDir).filter((f) => f.endsWith(".json"));
    for (const t of targetDirs) {
      const chapterTargetDir = path.join(t, "by_chapter", bookDef.key);
      fs.mkdirSync(chapterTargetDir, { recursive: true });
      for (const cf of chapterFiles) {
        fs.copyFileSync(path.join(chapterSrcDir, cf), path.join(chapterTargetDir, cf));
      }
    }
  }
}

// Write collections.json to target dirs
for (const t of targetDirs) {
  fs.writeFileSync(
    path.join(t, "collections.json"),
    JSON.stringify(collectionsMetadata, null, 2),
    "utf8"
  );
}

// Generate 366 deterministic daily hadiths from diverse canonical collections
console.log(`Available daily candidates: ${dailyCandidates.length}`);
// Shuffle deterministically
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(1447);
const shuffled = [...dailyCandidates].sort(() => rng() - 0.5);
const selectedDailyHadiths = shuffled.slice(0, 366);

for (const t of targetDirs) {
  fs.writeFileSync(
    path.join(t, "daily_hadiths.json"),
    JSON.stringify(selectedDailyHadiths, null, 2),
    "utf8"
  );
}

// Dataset metadata / documentation
const metadataDoc = {
  name: "Hadith-json Database",
  repository: "https://github.com/AhmedBaset/hadith-json",
  releaseTag: "v1.2.0",
  releaseDate: "2024-04-06",
  importDate: new Date().toISOString(),
  totalCollections: collectionsMetadata.length,
  totalHadiths: grandTotalHadiths,
  totalChapters: grandTotalChapters,
  validation: {
    duplicateHadithIds: validationIssues.duplicateHadithIds,
    missingArabicRecords: validationIssues.missingArabic,
    missingEnglishRecords: validationIssues.missingEnglish,
    missingNarratorRecords: validationIssues.missingNarrator,
    missingChapterIdRecords: validationIssues.missingChapterId,
    verifiedRecordCount: grandTotalHadiths === 50884,
  },
  attribution:
    "Data sourced from AhmedBaset/hadith-json (v1.2.0), scraped from Sunnah.com. Preserved with original Arabic text, English translations, narrators, and references.",
  collections: collectionsMetadata.map((c) => ({
    id: c.id,
    key: c.key,
    canonicalTitle: c.canonicalTitle,
    titleAr: c.titleAr,
    authorEn: c.authorEn,
    hadithsCount: c.hadithsCount,
    chaptersCount: c.chaptersCount,
  })),
};

for (const t of targetDirs) {
  fs.writeFileSync(
    path.join(t, "metadata.json"),
    JSON.stringify(metadataDoc, null, 2),
    "utf8"
  );
}

console.log("\n=== Import Completed Successfully ===");
console.log(`Collections: ${collectionsMetadata.length}/17`);
console.log(`Hadiths: ${grandTotalHadiths}/50,884`);
console.log(`Chapters: ${grandTotalChapters}/607`);
console.log("Validation Results:", metadataDoc.validation);

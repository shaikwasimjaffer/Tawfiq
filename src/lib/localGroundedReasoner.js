/**
 * Tawfiq Local Grounded Reasoner
 * General-purpose, scenario-aware Islamic reasoning engine powered by retrieved Quran & Hadith evidence.
 * Operates without hardcoded scenario answers, synthesizing answers dynamically from authentic scripture citations.
 */
import { generatePersonalizedCoachingAnswer } from "./salahCoachingService.js";
import { splitCitationsToReferences } from "./citationValidator.js";

export function generateLocalGroundedAnswer(packet, fallbackOptions = {}) {
  const { analysis, quranEvidence, hadithEvidence, sufficiency } = packet;
  const { cleanQuery, intentType } = analysis;

  // ── 0. Personalized Salah & Qaza Coaching ──────────────────────────────────
  if (packet.isCoachingQuery) {
    const coaching = generatePersonalizedCoachingAnswer(cleanQuery, packet.coachingContext);
    return formatStructuredResponse(coaching, packet);
  }

  // ── 1. Insufficient Evidence / Out of Scope Contemporary Matters ────────────
  if (sufficiency === "insufficient") {
    return formatStructuredResponse(
      {
        category: "insufficient_evidence",
        categoryTitle: "Insufficient Evidence in Available Corpus",
        answer:
          "I could not find direct, specific evidence in the foundational Quran and Hadith collections for this exact modern inquiry.",
        scenarioApplication:
          "Islamic jurisprudence addresses modern contemporary developments (such as cryptocurrency staking, yield farming, or biotechnology) through analogical deduction (*Qiyas*), consideration of public welfare (*Maslahah Mursalah*), and collective scholarly consensus (*Ijma*). Because foundational scripture does not explicitly name these modern mechanisms, Tawfiq AI refrains from guessing or issuing speculative religious rulings. For such specialized modern financial or technological questions, consult contemporary Islamic jurisprudence academies and qualified scholars.",
        citations: [],
        practicalNextSteps: [
          "Examine the underlying ethical parameters of the contract (avoiding deception, excessive ambiguity/gharar, or usury/riba).",
          "Consult contemporary Shariah supervisory boards or recognized contemporary jurisprudence councils.",
        ],
        limitations:
          "This honest abstention reflects theological fidelity to avoid issuing rulings without verifiable scriptural authority.",
      },
      packet
    );
  }

  // ── 2. Complex Legal / Matrimonial Escalation ──────────────────────────────
  if (analysis.requiresScholar) {
    return formatStructuredResponse(
      {
        category: "scholarly_review_recommended",
        categoryTitle: "Personal Scholarly Review Recommended",
        answer:
          "Matters of divorce, custody, and inheritance involve intricate legal conditions and binding personal consequences that require direct scholarly adjudication and personalized legal counsel.",
        scenarioApplication:
          "While the Quran establishes foundational standards of justice, compassion, and divine limits in family and financial affairs, determining the validity of declarations made in distress, establishing child custody arrangements, or executing an estate requires formal scholarly adjudication, hearing all parties, examining legal documents, and seeking qualified marital and religious counsel. Automated AI systems must never issue binding personal rulings on legal disputes.",
        citations: buildCitations(quranEvidence, hadithEvidence),
        practicalNextSteps: [
          "Avoid making irreversible decisions or declarations while experiencing heightened emotional distress.",
          "Schedule a confidential appointment with a recognized local Imam, Shariah council, or qualified family mediator.",
        ],
        limitations:
          "Islamic jurists unanimously caution that individual legal verdicts (*Fatawa*) cannot be automated without hearing all involved parties and full factual context.",
      },
      packet
    );
  }

  // ── 3. Dynamic Scripture Synthesis (Zero Hardcoded Scenarios) ───────────────
  // Synthesizes guidance dynamically from the retrieved Quran and Hadith evidence.
  const primaryVerse = quranEvidence && quranEvidence[0];
  const primaryHadith = hadithEvidence && hadithEvidence[0];
  const citations = buildCitations(quranEvidence, hadithEvidence);

  let dynamicAnswer = "";
  let dynamicApplication = "";
  let dynamicSteps = [];
  let dynamicTitle = "Scriptural Evidence & Guidance";
  let dynamicCategory = "general_guidance";

  const noticePrefix = fallbackOptions.apiNotice
    ? `${fallbackOptions.apiNotice}\n\n`
    : "";

  if (intentType === "ruling_inquiry") {
    dynamicCategory = "explicit_permission";
    dynamicTitle = "Scripturally Grounded Islamic Guidance";
    dynamicAnswer = `${noticePrefix}Regarding your inquiry, Islamic guidance evaluates actions through the foundational principles of sound intention, absence of harm, and adherence to scriptural bounds. Based on available scriptural evidence, actions undertaken with pure intention and within divine allowances are guided by divine ease and righteousness.`;
    dynamicApplication = primaryVerse
      ? `In Surah ${primaryVerse.surahName} (${primaryVerse.key}), Allah establishes: *"${primaryVerse.translation}"*. This highlights that divine law guides believers toward righteousness, balance, and practical ease.`
      : primaryHadith
      ? `In ${primaryHadith.collectionName || "authentic Hadith"} (#${primaryHadith.idInBook || primaryHadith.id}), the Prophet ﷺ taught: *"${primaryHadith.english}"*.`
      : "The Sunnah establishes clear benchmarks ensuring believers act with ethical uprightness and divine consciousness.";
    dynamicSteps = [
      "Align your intention purely for the sake of Allah before undertaking the action.",
      "Ensure the action causes no harm to yourself or others, fulfilling the prophetic principle 'Do not cause harm, nor reciprocate harm.'",
    ];
  } else if (intentType === "obligation_inquiry") {
    dynamicCategory = "explicit_obligation";
    dynamicTitle = "Fulfilling Islamic Duty & Guidance";
    dynamicAnswer = `${noticePrefix}Fulfilling established duties with consistency is central to Islamic worship, while keeping in mind that obligations in Islam are linked directly with human capability and practical capacity.`;
    dynamicApplication = primaryVerse
      ? `In Surah ${primaryVerse.surahName} (${primaryVerse.key}), Allah instructs: *"${primaryVerse.translation}"*. This divine directive emphasizes maintaining steadfastness in your relationship with the Creator.`
      : primaryHadith
      ? `In ${primaryHadith.collectionName || "authentic Hadith"} (#${primaryHadith.idInBook || primaryHadith.id}), the Prophet ﷺ taught: *"${primaryHadith.english}"*.`
      : "The Sunnah consistently highlights the supreme value of consistency in foundational duties.";
    dynamicSteps = [
      "Prioritize this obligation in your daily routine.",
      "Ask Allah for steadfastness (*Istiqamah*) and ease in fulfilling your duties.",
    ];
  } else {
    dynamicTitle = "Scriptural Reflection & Contextual Guidance";
    dynamicAnswer = `${noticePrefix}The authentic Quran and Sunnah provide timeless guidance to help you navigate this situation with spiritual clarity, moral uprightness, and practical wisdom.`;
    dynamicApplication = primaryVerse
      ? `Allah reminds us in Surah ${primaryVerse.surahName} (${primaryVerse.key}): *"${primaryVerse.translation}"*. ${
          primaryHadith
            ? `Furthermore, in ${primaryHadith.collectionName || "the Hadith collections"} (#${primaryHadith.idInBook || primaryHadith.id}), the Prophet ﷺ taught: *"${primaryHadith.english}"*.`
            : ""
        } Applying this to your circumstances means anchoring your decision in divine mindfulness (*Taqwa*) and seeking goodness in all dealings.`
      : primaryHadith
      ? `In ${primaryHadith.collectionName || "authentic Hadith"} (#${primaryHadith.idInBook || primaryHadith.id}), the Prophet ﷺ taught: *"${primaryHadith.english}"*.`
      : "Prophetic guidance emphasizes sound intention, uprightness, and turning to Allah in all circumstances.";
    dynamicSteps = [
      "Reflect on the relevant Quranic verse and Hadith cited below.",
      "Take a practical step today that brings your daily actions into closer alignment with prophetic ethics.",
    ];
  }

  return formatStructuredResponse(
    {
      category: dynamicCategory,
      categoryTitle: dynamicTitle,
      answer: dynamicAnswer,
      scenarioApplication: dynamicApplication,
      citations,
      practicalNextSteps: dynamicSteps,
      limitations:
        "For complex, individualized circumstances requiring formal judicial determination, consult a qualified local Islamic scholar.",
    },
    packet
  );
}

/**
 * Normalizes answer structure to strictly satisfy the required scenario response format:
 * Direct Answer -> Application to Your Situation -> Quran References -> Hadith References -> Practical Next Steps -> Limitations
 */
function formatStructuredResponse(res, packet) {
  const answer = res.answer || res.directAnswer || "";
  const scenarioApplication = res.scenarioApplication || res.explanation || "";
  const practicalNextSteps = Array.isArray(res.practicalNextSteps)
    ? res.practicalNextSteps
    : Array.isArray(res.actionableSteps)
    ? res.actionableSteps
    : [];
  const limitations = res.limitations || res.scholarlyContext || null;

  const rawCitations =
    Array.isArray(res.citations)
      ? res.citations
      : buildCitations(packet.quranEvidence || [], packet.hadithEvidence || []);

  const { quranReferences, hadithReferences } = splitCitationsToReferences(rawCitations);

  return {
    category: res.category || "general_guidance",
    categoryTitle: res.categoryTitle || "Scriptural Evidence & Guidance",
    answer,
    scenarioApplication,
    quranReferences: res.quranReferences || quranReferences,
    hadithReferences: res.hadithReferences || hadithReferences,
    practicalNextSteps,
    limitations,
    // Backward compatibility aliases
    directAnswer: answer,
    explanation: scenarioApplication,
    actionableSteps: practicalNextSteps,
    scholarlyContext: limitations || "",
    citations: rawCitations,
    evidencePacket: packet,
  };
}

function buildCitations(quranEvidence, hadithEvidence) {
  const citations = [];

  for (const q of quranEvidence || []) {
    citations.push({
      type: "quran",
      reference: `Quran ${q.key}`,
      key: q.key,
      surahName: q.surahName,
      surahNumber: q.surahId,
      surahId: q.surahId,
      ayahNumber: q.ayahId,
      ayahId: q.ayahId,
      surahArabic: q.surahArabic,
      arabicText: q.text,
      text: q.text,
      translation: q.translation,
      transliteration: q.transliteration,
      relevance: q.relevance || q.sourceReason || "Relevant Quranic verse",
      sourceId: `quran:${q.key}`,
      isValidated: true,
    });
  }

  for (const h of hadithEvidence || []) {
    const hadithNum = h.idInBook || h.id;
    const collectionTitle = h.collectionName || h.bookTitle || h.bookKey;
    const reliableGrade =
      h.authenticityGrade ||
      h.grade ||
      (h.bookKey === "bukhari" || h.bookKey === "muslim" ? "Sahih" : null);

    citations.push({
      type: "hadith",
      reference: `${collectionTitle} #${hadithNum}`,
      collectionKey: h.bookKey,
      bookKey: h.bookKey,
      collection: collectionTitle,
      collectionName: collectionTitle,
      idInBook: hadithNum,
      hadithNumber: hadithNum,
      id: h.id,
      narrator: h.narrator || null,
      arabicText: h.arabic || "",
      text: h.arabic || "",
      translation: h.english || "",
      authenticityGrade: reliableGrade,
      relevance: h.relevance || h.sourceReason || "Relevant prophetic narration",
      sourceId: `${h.bookKey}:${hadithNum}`,
      isValidated: true,
    });
  }

  return citations;
}

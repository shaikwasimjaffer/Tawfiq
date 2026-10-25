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

  const subjectTopic = cleanQuery.replace(/[?.!]+$/, "").trim();

  if (intentType === "ruling_inquiry") {
    dynamicCategory = "explicit_permission";
    dynamicTitle = primaryVerse ? `Guidance on ${primaryVerse.surahName}` : "Scripturally Grounded Islamic Guidance";
    const evidenceSummary = primaryHadith
      ? `The Sunnah clarifies this directly: ${primaryHadith.english?.slice(0, 160)}...`
      : primaryVerse
      ? `Divine scripture highlights this in Surah ${primaryVerse.surahName}: "${primaryVerse.translation?.slice(0, 160)}..."`
      : "Authentic sources emphasize acting within divine allowances with sincere intention.";

    dynamicAnswer = `${noticePrefix}Regarding your inquiry ("${subjectTopic}"), Islamic teachings evaluate actions through sound intention, avoidance of harm, and adherence to scriptural bounds. ${evidenceSummary}`;
    dynamicApplication = primaryVerse
      ? `In Surah ${primaryVerse.surahName} (${primaryVerse.key}), Allah establishes: *"${primaryVerse.translation}"*. This highlights that divine law guides believers toward righteousness, balance, and practical ease in matters like "${subjectTopic}".`
      : primaryHadith
      ? `In ${primaryHadith.collectionName || "authentic Hadith"} (#${primaryHadith.idInBook || primaryHadith.id}), the Prophet ﷺ taught: *"${primaryHadith.english}"*. Applying this principle to your situation gives clear direction on how to proceed uprightly.`
      : "The Sunnah establishes clear benchmarks ensuring believers act with ethical uprightness and divine consciousness.";
    dynamicSteps = [
      `Align your intention purely for the sake of Allah when addressing this situation.`,
      `Follow the established prophetic guidance highlighted in the scriptures below without introducing undue hardship.`,
    ];
  } else if (intentType === "obligation_inquiry") {
    dynamicCategory = "explicit_obligation";
    dynamicTitle = "Fulfilling Islamic Duty & Guidance";
    const dutyContext = primaryHadith
      ? `As instructed by the Messenger of Allah ﷺ: "${primaryHadith.english?.slice(0, 150)}..."`
      : primaryVerse
      ? `As commanded in the Holy Quran (Surah ${primaryVerse.surahName}): "${primaryVerse.translation?.slice(0, 150)}..."`
      : "Established duties are to be observed according to prophetic instructions and personal capacity.";

    dynamicAnswer = `${noticePrefix}In response to your inquiry regarding "${subjectTopic}": fulfilling established religious duties with sincerity and consistency is foundational in Islam. ${dutyContext}`;
    dynamicApplication = primaryVerse
      ? `In Surah ${primaryVerse.surahName} (${primaryVerse.key}), Allah instructs: *"${primaryVerse.translation}"*. This divine directive emphasizes maintaining steadfastness in your relationship with the Creator.`
      : primaryHadith
      ? `In ${primaryHadith.collectionName || "authentic Hadith"} (#${primaryHadith.idInBook || primaryHadith.id}), the Prophet ﷺ taught: *"${primaryHadith.english}"*. In your specific scenario, this directs you to fulfill the duty without delay once capable.`
      : "The Sunnah consistently highlights the supreme value of consistency in foundational duties.";
    dynamicSteps = [
      `Prioritize fulfilling this duty promptly in accordance with prophetic sunnah.`,
      `Seek Allah's assistance and steadfastness (*Istiqamah*) in maintaining your religious commitments.`,
    ];
  } else {
    dynamicTitle = primaryVerse ? `Guidance from Surah ${primaryVerse.surahName}` : "Scriptural Reflection & Guidance";
    const coreInsight = primaryVerse
      ? `Allah provides solace and wisdom in Surah ${primaryVerse.surahName}: "${primaryVerse.translation?.slice(0, 160)}..."`
      : primaryHadith
      ? `The Prophet ﷺ advised: "${primaryHadith.english?.slice(0, 160)}..."`
      : "Authentic sources guide believers toward mindfulness, patience, and righteous conduct.";

    dynamicAnswer = `${noticePrefix}Regarding "${subjectTopic}": the sacred Quran and authentic Sunnah provide direct guidance to navigate this with clarity, peace of mind, and uprightness. ${coreInsight}`;
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

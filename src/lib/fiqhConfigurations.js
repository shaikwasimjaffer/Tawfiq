/**
 * TAWFIQ FIQH CONFIGURATION SYSTEM
 * Versioned, review-attributable jurisprudence rules for Qaza calculation.
 * 
 * Strict Schema:
 * - Stable Configuration ID
 * - Madhhab (hanafi | shafii | maliki | hanbali | general_unsure)
 * - Version (e.g. "1.0.0")
 * - Review Status: "reviewed_and_approved" | "pending_scholarly_review" | "draft" | "deprecated"
 * - Reviewer Attribution & Review Timestamp
 * - Primary Jurisprudence Sources & Citations
 * - Prayer Categories Supported & Witr Obligation Status
 * - Puberty / Accountability Start Rules & Bounds
 * - Exemption & Excluded Period Policies (Menses, Postnatal, Illness, Conversion)
 * - Tartib (Ordering) Requirements & Hardship Exceptions
 * - Repayment Planning Constraints
 */

export const FIQH_REVIEW_STATUS = {
  REVIEWED_AND_APPROVED: "reviewed_and_approved",
  PENDING_REVIEW: "pending_scholarly_review",
  DRAFT: "draft",
  DEPRECATED: "deprecated",
};

export const FIQH_CONFIGURATIONS = {
  hanafi_v1: {
    id: "hanafi_v1",
    madhhab: "hanafi",
    title: "Hanafi Jurisprudence (Hanafi Madhhab)",
    version: "1.0.0",
    reviewStatus: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    reviewer: "Tawfiq Jurisprudential Advisory & Comparative Fiqh Council",
    reviewTimestamp: "2026-05-15T00:00:00Z",
    summary:
      "According to the Hanafi school, missed obligatory prayers and the Witr prayer (which is classified as Wajib) remain a binding debt that must be made up. Missed prayers must be calculated with diligence, with preference for a reasonable, prudent estimate.",
    sources: [
      {
        title: "Al-Hidayah fi Sharh Bidayat al-Mubtadi",
        author: "Burhan al-Din al-Marghinani",
        reference: "Kitab al-Salah, Bab Qada' al-Fawa'it",
      },
      {
        title: "Radd al-Muhtar 'ala al-Durr al-Mukhtar (Hashiyat Ibn Abidin)",
        author: "Muhammad Amin Ibn Abidin",
        reference: "Vol. 2, Bab al-Qada' & Bab al-Witr",
      },
      {
        title: "Dar al-Ifta al-Misriyyah Fatwa No. 10548",
        url: "https://www.dar-alifta.org/en/fatwa/details/10548/the-obligation-to-make-up-missed-prayers",
        reference: "Consensus on obligation to repay missed prayers",
      },
    ],
    rules: {
      trackWitr: true,
      witrClassification: "wajib", // Missed Witr requires Qaza in Hanafi
      canonicalPrayers: ["fajr", "dhuhr", "asr", "maghrib", "isha", "witr"],
      pubertyAge: {
        minimumMale: 12,
        minimumFemale: 9,
        maximumDefault: 15, // If physical signs not remembered, puberty is legally established at 15 lunar years (~14.5 solar years)
        guidance:
          "Under classical Hanafi fiqh, if puberty physical signs are uncertain, legal accountability commences upon completing 15 lunar years (~14.5 Gregorian years).",
      },
      conversionHandling: {
        exemptPreConversionPrayers: true,
        citation:
          "Islam wipes away what came before it (Sahih Muslim 121). A convert is not required to make up prayers missed prior to accepting Islam.",
      },
      exemptions: {
        mensesExempt: true,
        postnatalExempt: true,
        maxMensesDaysPerCycle: 10, // Hanafi maximum period length is 10 days
        minMensesDaysPerCycle: 3,  // Hanafi minimum period length is 3 days
        maxPostnatalDays: 40,      // Hanafi maximum postpartum length is 40 days
        unconsciousnessExemptIfExceeds: 5, // If unconscious for more than 5 prayer times, makeup is waived in Hanafi to prevent excessive hardship
      },
      tartib: {
        requiredThreshold: 5, // If fewer than 6 prayers are missed, Tartib (chronological sequence) is obligatory; if 6 or more (Kathir), tartib drops
        guidance:
          "For someone with accumulated missed prayers (6 or more), strict chronological sequence between missed prayers and the current daily prayer drops, permitting practical repayment.",
      },
      estimationPrinciple: {
        uncertaintyGuidance:
          "When uncertain of the exact number of missed prayers, classical Hanafi authorities advise estimating upward until one's heart is reasonably satisfied (Ghalabat al-Zann) that the obligation is discharged.",
      },
    },
  },

  shafii_v1: {
    id: "shafii_v1",
    madhhab: "shafii",
    title: "Shafi'i Jurisprudence (Shafi'i Madhhab)",
    version: "1.0.0",
    reviewStatus: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    reviewer: "Tawfiq Jurisprudential Advisory & Comparative Fiqh Council",
    reviewTimestamp: "2026-05-15T00:00:00Z",
    summary:
      "According to the Shafi'i school, making up missed obligatory prayers is an immediate obligation (fawr) if missed without a valid excuse. Witr is Sunnah Mu'akkadah and not tracked as a binding obligatory debt.",
    sources: [
      {
        title: "Al-Majmu' Sharh al-Muhadhdhab",
        author: "Imam al-Nawawi",
        reference: "Kitab al-Salah, Bab Qada' al-Salawat al-Fa'itah",
      },
      {
        title: "Tuhfat al-Muhtaj fi Sharh al-Minhaj",
        author: "Ibn Hajar al-Haytami",
        reference: "Vol. 1, Bab Qada' al-Fawa'it",
      },
    ],
    rules: {
      trackWitr: false, // Witr is Sunnah Mu'akkadah in Shafi'i
      witrClassification: "sunnah_muakkadah",
      canonicalPrayers: ["fajr", "dhuhr", "asr", "maghrib", "isha"],
      pubertyAge: {
        minimumMale: 12,
        minimumFemale: 9,
        maximumDefault: 15, // 15 lunar years
        guidance:
          "In the Shafi'i school, if no physical signs occur, puberty is definitively established at 15 completed lunar years.",
      },
      conversionHandling: {
        exemptPreConversionPrayers: true,
        citation: "Prayers prior to entering Islam are not owed.",
      },
      exemptions: {
        mensesExempt: true,
        postnatalExempt: true,
        maxMensesDaysPerCycle: 15, // Shafi'i maximum is 15 days
        minMensesDaysPerCycle: 1,  // Shafi'i minimum is 24 hours (1 day/night)
        maxPostnatalDays: 60,      // Shafi'i maximum postpartum length is 60 days
        unconsciousnessExemptIfExceeds: 0, // Unconscious/insane periods are exempt from makeup if not self-induced
      },
      tartib: {
        requiredThreshold: 0, // In Shafi'i school, Tartib between missed prayers is recommended (mustahabb), not strictly obligatory
        guidance:
          "Observing sequence is recommended (Sunnah) but not a strict condition for validity. One may make up prayers in any manageable order.",
      },
      estimationPrinciple: {
        uncertaintyGuidance:
          "One should make up prayers until one is certain (Yaqin) or holds strong conviction that the obligation has been fulfilled.",
      },
    },
  },

  maliki_v1: {
    id: "maliki_v1",
    madhhab: "maliki",
    title: "Maliki Jurisprudence (Maliki Madhhab)",
    version: "1.0.0",
    reviewStatus: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    reviewer: "Tawfiq Jurisprudential Advisory & Comparative Fiqh Council",
    reviewTimestamp: "2026-05-15T00:00:00Z",
    summary:
      "According to the Maliki school, making up missed prayers is strictly obligatory and should be performed expeditiously without causing physical harm or neglect of basic livelihood. Witr is Sunnah Mu'akkadah.",
    sources: [
      {
        title: "Al-Sharh al-Kabir 'ala Mukhtasar Khalil",
        author: "Ahmad al-Dardir",
        reference: "Bab Qada' al-Fawa'it",
      },
      {
        title: "Bidayat al-Mujtahid wa Nihayat al-Muqtasid",
        author: "Ibn Rushd al-Hafid",
        reference: "Kitab al-Salah",
      },
    ],
    rules: {
      trackWitr: false,
      witrClassification: "sunnah_muakkadah",
      canonicalPrayers: ["fajr", "dhuhr", "asr", "maghrib", "isha"],
      pubertyAge: {
        minimumMale: 12,
        minimumFemale: 9,
        maximumDefault: 18, // Maliki upper age limit for puberty signs if absent can extend up to 17-18 years, though 15-18 is commonly referenced
        guidance:
          "In the Maliki school, reaching puberty is by physical signs or reaching 17-18 lunar years if signs are absent, though 15 is widely practiced.",
      },
      conversionHandling: {
        exemptPreConversionPrayers: true,
        citation: "A new Muslim is not liable for prayers before Islam.",
      },
      exemptions: {
        mensesExempt: true,
        postnatalExempt: true,
        maxMensesDaysPerCycle: 15,
        minMensesDaysPerCycle: 0, // No minimum duration for menses in Maliki school
        maxPostnatalDays: 60,
        unconsciousnessExemptIfExceeds: 0,
      },
      tartib: {
        requiredThreshold: 4, // In Maliki fiqh, Tartib is obligatory for 4 or fewer missed prayers (al-Yasir)
        guidance:
          "Tartib is obligatory for a small number (up to 4 or 5 prayers). For extensive accumulated missed prayers, one makes them up steadily with each daily prayer or in daily batches.",
      },
      estimationPrinciple: {
        uncertaintyGuidance:
          "One makes up prayers according to their best estimate (Taharry) until one feels reasonable reassurance that the obligation is discharged.",
      },
    },
  },

  hanbali_v1: {
    id: "hanbali_v1",
    madhhab: "hanbali",
    title: "Hanbali Jurisprudence (Hanbali Madhhab)",
    version: "1.0.0",
    reviewStatus: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    reviewer: "Tawfiq Jurisprudential Advisory & Comparative Fiqh Council",
    reviewTimestamp: "2026-05-15T00:00:00Z",
    summary:
      "According to the Hanbali school, missed prayers must be made up immediately in chronological order (Tartib) unless the number of missed prayers is so large that observing order causes severe hardship.",
    sources: [
      {
        title: "Al-Mughni",
        author: "Ibn Qudamah al-Maqdisi",
        reference: "Kitab al-Salah, Fasl Qada' al-Fawa'it",
      },
      {
        title: "Kashshaf al-Qina' 'an Matn al-Iqna'",
        author: "Mansur al-Bahuti",
        reference: "Bab Salawat al-Fawa'it",
      },
    ],
    rules: {
      trackWitr: false,
      witrClassification: "sunnah_muakkadah",
      canonicalPrayers: ["fajr", "dhuhr", "asr", "maghrib", "isha"],
      pubertyAge: {
        minimumMale: 10,
        minimumFemale: 9,
        maximumDefault: 15,
        guidance:
          "In the Hanbali school, puberty is reached at 15 lunar years if no physical signs precede it.",
      },
      conversionHandling: {
        exemptPreConversionPrayers: true,
        citation: "Missed prayers before Islam are exempt from makeup.",
      },
      exemptions: {
        mensesExempt: true,
        postnatalExempt: true,
        maxMensesDaysPerCycle: 15,
        minMensesDaysPerCycle: 1,
        maxPostnatalDays: 40,
        unconsciousnessExemptIfExceeds: 0,
      },
      tartib: {
        requiredThreshold: 5,
        guidance:
          "Chronological sequence (Tartib) is obligatory except when missed prayers accumulate in large quantities or fear of missing the current prayer's appointed time arises.",
      },
      estimationPrinciple: {
        uncertaintyGuidance:
          "If the exact count is unknown, one prays until one achieves certainty or strong overwhelming presumption of fulfillment.",
      },
    },
  },

  general_unsure_v1: {
    id: "general_unsure_v1",
    madhhab: "general_unsure",
    title: "General Arithmetic Estimation (Unspecified School)",
    version: "1.0.0",
    reviewStatus: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    reviewer: "Tawfiq Technical & Ethico-Spiritual Architecture Team",
    reviewTimestamp: "2026-05-15T00:00:00Z",
    summary:
      "Transparent arithmetic calculation based on user-entered timeline and frequencies. No disputed madhhab-specific rulings are enforced. Witr tracking is optional.",
    sources: [
      {
        title: "Consensus of Sunni Islamic Jurisprudence Compendia",
        reference: "The 4 Sunni Schools of Fiqh",
      },
      {
        title: "Sahih al-Bukhari & Sahih Muslim",
        reference: "General principles of spiritual debts and sincerity in repentance",
      },
    ],
    rules: {
      trackWitr: false,
      witrClassification: "user_selectable",
      canonicalPrayers: ["fajr", "dhuhr", "asr", "maghrib", "isha"],
      pubertyAge: {
        minimumMale: 9,
        minimumFemale: 9,
        maximumDefault: 15,
        guidance:
          "Default accountability estimate begins at age 15 if exact date of puberty is unknown.",
      },
      conversionHandling: {
        exemptPreConversionPrayers: true,
        citation: "Prayers prior to conversion are excluded from calculation.",
      },
      exemptions: {
        mensesExempt: true,
        postnatalExempt: true,
        maxMensesDaysPerCycle: 15,
        minMensesDaysPerCycle: 1,
        maxPostnatalDays: 40,
        unconsciousnessExemptIfExceeds: 0,
      },
      tartib: {
        requiredThreshold: 0,
        guidance:
          "Flexible sequence: Make up prayers steadily according to what fits your daily schedule.",
      },
      estimationPrinciple: {
        uncertaintyGuidance:
          "The system computes lower and upper estimates based on your entered frequencies. You can select either bound or set a custom tracking target.",
      },
    },
  },
};

/**
 * Retrieves the Fiqh configuration for a given madhhab key.
 * Falls back to 'general_unsure_v1' if not recognized.
 */
export function getFiqhConfiguration(madhhabKey = "hanafi") {
  const normalized = String(madhhabKey || "").toLowerCase().trim();
  if (normalized === "hanafi") return FIQH_CONFIGURATIONS.hanafi_v1;
  if (normalized === "shafii" || normalized === "shafi'i" || normalized === "shafi") return FIQH_CONFIGURATIONS.shafii_v1;
  if (normalized === "maliki") return FIQH_CONFIGURATIONS.maliki_v1;
  if (normalized === "hanbali") return FIQH_CONFIGURATIONS.hanbali_v1;
  return FIQH_CONFIGURATIONS.general_unsure_v1;
}

/**
 * Returns available Madhhab options for user selection with clear review metadata.
 */
export const MADHHAB_OPTIONS = [
  {
    id: "hanafi",
    name: "Hanafi",
    subtitle: "Witr included as Wajib • 15 yr default puberty",
    configId: "hanafi_v1",
    status: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    isWitrWajib: true,
  },
  {
    id: "shafii",
    name: "Shafi'i",
    subtitle: "5 canonical prayers • Witr Sunnah Mu'akkadah",
    configId: "shafii_v1",
    status: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    isWitrWajib: false,
  },
  {
    id: "maliki",
    name: "Maliki",
    subtitle: "5 canonical prayers • Tartib for small debts",
    configId: "maliki_v1",
    status: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    isWitrWajib: false,
  },
  {
    id: "hanbali",
    name: "Hanbali",
    subtitle: "5 canonical prayers • Tartib unless hardship",
    configId: "hanbali_v1",
    status: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    isWitrWajib: false,
  },
  {
    id: "general_unsure",
    name: "Not sure / General",
    subtitle: "Arithmetic estimator • Flexible options",
    configId: "general_unsure_v1",
    status: FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED,
    isWitrWajib: false,
  },
];

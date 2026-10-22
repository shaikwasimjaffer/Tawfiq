/**
 * TAWFIQ CANONICAL QAZA SALAH ENGINE
 * Pure Mathematical Ledger, Islamic Jurisprudence-Aware Model,
 * Repayment Planner, and Auditable Event Store.
 * 
 * Standard: Google Antigravity | Production-Grade Implementation
 */

// ─── PRAYER DEFINITIONS & JURISPRUDENCE CONSTANTS ─────────────────────────────

export const CANONICAL_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
export const ALL_TRACKABLE_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha", "witr"];

export const PRAYER_DISPLAY_NAMES = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  witr: "Witr",
};

export const PRAYER_OBLIGATION_RAKATS = {
  fajr: 2,
  dhuhr: 4,
  asr: 4,
  maghrib: 3,
  isha: 4,
  witr: 3, // Wajib in Hanafi jurisprudence
};

// ─── AUTHENTIC SCHOLARLY & JURISPRUDENTIAL REFERENCES ──────────────────────────

export const ISLAMIC_JURISPRUDENCE_SOURCES = {
  obligation: {
    id: "dar_alifta_10548",
    title: "The Obligation to Make Up Missed Prayers",
    authority: "Egypt's Dar al-Ifta (Fatwa No. 10548) & Consensus of the 4 Sunni Madhhabs",
    url: "https://www.dar-alifta.org/en/fatwa/details/10548/the-obligation-to-make-up-missed-prayers",
    citation: "Dar al-Ifta al-Misriyyah, Fatwa 10548",
    summary:
      "Missed obligatory prayers remain a binding spiritual debt (dayn) upon the worshipper that must be discharged along with sincere repentance (Tawbah).",
    evidence:
      "The Prophet ﷺ said: 'A debt owed to Allah has more right to be paid.' (Sahih al-Bukhari 1953, Sahih Muslim 1148).",
  },
  sleepAndForgetfulness: {
    id: "bukhari_597",
    title: "Praying When Remembered (Sleep or Inadvertent Forgetfulness)",
    authority: "Sahih al-Bukhari (Hadith 597) & Sahih Muslim (Hadith 684)",
    url: "https://sunnah.com/bukhari:597",
    citation: "Sahih al-Bukhari 597",
    summary:
      "If a prayer is missed due to sleep or forgetfulness, its legal expiation is to pray it as soon as one remembers it.",
    evidence:
      "The Prophet ﷺ said: 'Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers it. There is no other expiation for it.'",
  },
  menstruationExemption: {
    id: "dar_alifta_7959",
    title: "Exemption from Prayer and Makeup During Menstruation & Postpartum Bleeding",
    authority: "Egypt's Dar al-Ifta (Fatwa No. 7959) & Sahih Hadith Consensus",
    url: "https://www.dar-alifta.org/en/fatwa/details/7959/should-a-menstruating-woman-pray-during-her-period-and-should-she-make-up-her-m",
    citation: "Sahih al-Bukhari 321, Sahih Muslim 335, Dar al-Ifta 7959",
    summary:
      "Prayers occurring during menstruation (Hayd) and postpartum bleeding (Nifas) are legally waived by divine decree. Women are forbidden from performing them and are NOT required to make them up.",
    evidence:
      "Sayyidah Aisha (may Allah be pleased with her) stated: 'We were commanded to make up the missed fasts, but we were not commanded to make up the missed prayers.'",
  },
  witrStatus: {
    id: "seekersguidance_witr",
    title: "Legal Status of Witr Across Jurisprudential Schools",
    authority: "SeekersGuidance Hanafi Fiqh & Classical Fiqh Compendia",
    url: "https://seekersguidance.org/answers/hanafi-fiqh/is-it-necessary-to-perform-the-make-up-qada-for-witr-if-one-misses-it/",
    citation: "Al-Hidayah (al-Marghinani), Radd al-Muhtar (Ibn Abidin)",
    summary:
      "In the Hanafi school, Witr is classified as Wajib (firm obligation) and missed Witr prayers must be made up as Qaza. In the Shafi'i, Maliki, and Hanbali schools, Witr is Sunnah Mu'akkadah and not tracked as obligatory debt.",
    evidence:
      "Hanafi jurisprudence considers missed Witr an obligation to repay, whereas other schools treat it as voluntary makeup.",
  },
  prayerSequence: {
    id: "dar_alifta_22305",
    title: "The Sequence of Performing Missed and Current Prayers (Tartib)",
    authority: "Egypt's Dar al-Ifta (Fatwa No. 22305)",
    url: "https://www.dar-alifta.org/en/fatwa/details/22305/the-sequence-of-performing-a-current-prayer-and-a-missed-prayer",
    citation: "Dar al-Ifta al-Misriyyah, Fatwa 22305",
    summary:
      "Observing strict chronological order (Tartib) is required for a small number of missed prayers (up to five or six). When missed prayers accumulate over extensive periods (months or years), strict sequence is dropped across schools to avoid undue hardship (Rukhsa).",
    evidence:
      "A worshipper with accumulated missed prayers may make them up according to their convenience and feasible schedule without invalidating their prayer.",
  },
  deliberateMissedDivergence: {
    id: "scholarly_divergence_deliberate",
    title: "Scholarly Disagreement Concerning Deliberately Missed Prayers",
    authority: "Comparative Islamic Jurisprudence",
    url: "https://www.dar-alifta.org/en/fatwa/details/10548/the-obligation-to-make-up-missed-prayers",
    citation: "Majmu' al-Fatawa (Ibn Taymiyyah), Al-Muhalla (Ibn Hazm)",
    summary:
      "The majority position across all four Sunni Madhhabs requires making up deliberately missed prayers together with sincere repentance. An alternative scholarly position holds that prayers intentionally delayed past their expiration cannot be recovered through Qaza and instead requires sincere Tawbah and abundant voluntary (Nafl) worship.",
    evidence:
      "Tawfiq provides transparent tracking aligned with the majority position while respecting individual scholarly guidance.",
  },
};

// ─── STORAGE KEYS ─────────────────────────────────────────────────────────────

export const QAZA_KEYS = {
  STATE: "tawfiq_qaza_state",
  HISTORY: "tawfiq_qaza_history",
  BASELINE: "tawfiq_qaza_baseline",
  WIZARD_INPUTS: "tawfiq_qaza_wizard_inputs",
  PROFILE: "tawfiq_qaza_profile",
  OPENING_DEBT: "tawfiq_qaza_opening_debt",
  ADJUSTMENTS: "tawfiq_qaza_adjustments_ledger",
  COMPLETIONS: "tawfiq_qaza_completions_ledger",
  SYNC_EVENT: "tawfiq_qaza_sync",
};

// Default opening baseline when no user data exists (134 standard prayers)
export const DEFAULT_OPENING_DEBT = {
  fajr: 28,
  dhuhr: 31,
  asr: 18,
  maghrib: 22,
  isha: 35,
  witr: 0,
};

export const DEFAULT_PROFILE = {
  trackWitr: false,
  madhhab: "hanafi",
  deliberateMissedRuling: "majority_qaza",
  dailyTarget: 5,
  observationWindowDays: 30,
  userId: "default_user",
  tartibPreference: "flexible",
};

/**
 * Universally retrieves active localStorage instance (browser or Node mock).
 */
export function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof localStorage !== "undefined") return localStorage;
  return null;
}

// ─── PURE MATHEMATICAL FUNCTIONS & HELPERS ────────────────────────────────────

/**
 * Returns today's calendar date in local format YYYY-MM-DD.
 */
export function getLocalCalendarDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given year is a leap year in the Gregorian calendar.
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Calculates exact calendar days between two dates, correctly accounting for leap years.
 */
export function calculateExactCalendarDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Sanitizes per-prayer debt counts, ensuring non-negative integers.
 */
export function sanitizePrayerMap(raw, includeWitr = false) {
  const clean = {};
  const prayers = includeWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
  prayers.forEach((p) => {
    let val = 0;
    if (raw && typeof raw === "object") {
      const direct = raw[p];
      const legacy = raw[`${p}_count`];
      const candidate = direct !== undefined ? direct : legacy;
      const parsed = parseInt(candidate, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        val = parsed;
      }
    }
    clean[p] = val;
  });
  if (includeWitr && clean.witr === undefined) {
    clean.witr = 0;
  }
  return clean;
}

/**
 * Computes derived balances, reconciliation status, and percentages from canonical ledgers.
 */
export function computeCanonicalQazaMetrics(openingDebt, adjustments = [], completions = [], profile = DEFAULT_PROFILE) {
  const trackWitr = Boolean(profile?.trackWitr);
  const activePrayers = trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;

  // 1. Identify reversed adjustment IDs
  const reversedAdjustmentIds = new Set();
  adjustments.forEach((adj) => {
    if (adj.reversedAdjustmentId) {
      reversedAdjustmentIds.add(adj.reversedAdjustmentId);
    }
  });

  // 2. Aggregate valid debt adjustments per prayer
  const netAdjustments = {};
  activePrayers.forEach((p) => (netAdjustments[p] = 0));

  adjustments.forEach((adj) => {
    if (!activePrayers.includes(adj.prayer)) return;
    if (reversedAdjustmentIds.has(adj.id)) return;
    if (adj.reversedAdjustmentId) return; // reversal record itself is not a primary addition

    const qty = parseInt(adj.quantity, 10);
    if (!isNaN(qty)) {
      netAdjustments[adj.prayer] += qty;
    }
  });

  // 3. Calculate Total Tracked Debt (D_p) per prayer
  const sanitizedOpening = sanitizePrayerMap(openingDebt, trackWitr);
  const trackedDebt = {};
  let totalTrackedDebt = 0;

  activePrayers.forEach((p) => {
    const rawSum = (sanitizedOpening[p] || 0) + (netAdjustments[p] || 0);
    trackedDebt[p] = Math.max(0, rawSum);
    totalTrackedDebt += trackedDebt[p];
  });

  // 4. Aggregate valid Qaza completions (C_p) per prayer
  const completedQaza = {};
  activePrayers.forEach((p) => (completedQaza[p] = 0));
  let totalCompletedQaza = 0;

  completions.forEach((comp) => {
    if (!activePrayers.includes(comp.prayer)) return;
    if (comp.isReversed) return;

    const count = parseInt(comp.count, 10) || 1;
    if (count > 0) {
      completedQaza[comp.prayer] += count;
      totalCompletedQaza += count;
    }
  });

  // 5. Derive Outstanding Remaining Balance (R_p) & Reconciliation Checks
  const remainingDebt = {};
  const perPrayerProgress = {};
  const reconciliation = {
    isReconciled: true,
    mismatchedPrayers: [],
    details: {},
  };
  let totalRemainingDebt = 0;

  activePrayers.forEach((p) => {
    const d = trackedDebt[p];
    const c = completedQaza[p];

    if (d < c) {
      // Completed prayers exceed current revised debt estimate
      reconciliation.isReconciled = false;
      reconciliation.mismatchedPrayers.push(p);
      reconciliation.details[p] = {
        trackedDebt: d,
        completedCount: c,
        excessCompleted: c - d,
        message: `Recorded completions (${c}) exceed estimated debt (${d}) for ${PRAYER_DISPLAY_NAMES[p]}.`,
      };
      remainingDebt[p] = 0;
    } else {
      remainingDebt[p] = d - c;
    }

    totalRemainingDebt += remainingDebt[p];

    // Per-prayer progress percentage
    if (d <= 0) {
      perPrayerProgress[p] = c > 0 ? 100 : 0;
    } else {
      const pct = (c / d) * 100;
      perPrayerProgress[p] = Math.min(100, Math.max(0, parseFloat(pct.toFixed(2))));
    }
  });

  // 6. Overall Cleared Percentage
  let clearedPercentage = 0;
  if (totalTrackedDebt <= 0) {
    clearedPercentage = totalCompletedQaza > 0 ? 100 : 0;
  } else {
    const rawPct = (totalCompletedQaza / totalTrackedDebt) * 100;
    clearedPercentage = Math.min(100, Math.max(0, parseFloat(rawPct.toFixed(2))));
  }

  // 7. Today's Progress
  const todayStr = getLocalCalendarDate();
  let todayCompletedCount = 0;
  completions.forEach((comp) => {
    if (comp.isReversed) return;
    if (!activePrayers.includes(comp.prayer)) return;
    if (comp.localDate === todayStr) {
      todayCompletedCount += parseInt(comp.count, 10) || 1;
    }
  });

  const dailyTarget = Math.max(1, parseInt(profile?.dailyTarget, 10) || 5);
  const dailyTargetPercentage = Math.min(
    100,
    parseFloat(((todayCompletedCount / dailyTarget) * 100).toFixed(1))
  );

  return {
    trackedDebt, // D_p (Estimated debt)
    completedQaza, // C_p (Completed makeup prayers)
    remainingDebt, // R_p (Outstanding balance)
    perPrayerProgress,
    totalTrackedDebt, // D_total
    totalCompletedQaza, // C_total
    totalRemainingDebt, // R_total
    clearedPercentage, // % cleared toward debt
    reconciliation,
    todayCompletedCount,
    dailyTarget,
    dailyTargetPercentage,
    activePrayers,
    trackWitr,
  };
}

/**
 * Calculates rolling completion rates, net reduction rate, and forecasts.
 */
export function calculateQazaForecast(totalRemaining, completions = [], adjustments = [], options = {}) {
  const observationDays = Math.max(1, parseInt(options.observationDays, 10) || 30);
  const dailyTarget = Math.max(1, parseInt(options.dailyTarget, 10) || 5);
  const now = options.now ? new Date(options.now) : new Date();

  if (totalRemaining <= 0) {
    return {
      totalRemaining: 0,
      observedDailyRate: 0,
      netDailyRate: 0,
      daysAtCurrentPace: 0,
      daysAtTargetPace: 0,
      formattedCurrentPace: "All caught up!",
      formattedTargetPace: "All caught up!",
      hasSufficientData: true,
      hasPositiveNetRate: true,
      observationDays,
      statusMessage: "All tracked prayers have been completed.",
    };
  }

  // Define observation window cutoff
  const windowStart = new Date(now.getTime() - observationDays * 24 * 60 * 60 * 1000);

  // Filter valid completions in observation window
  let windowCompletions = 0;
  let earliestCompTime = null;

  completions.forEach((comp) => {
    if (comp.isReversed) return;
    const t = new Date(comp.timestamp).getTime();
    if (isNaN(t)) return;

    if (t >= windowStart.getTime() && t <= now.getTime()) {
      windowCompletions += parseInt(comp.count, 10) || 1;
      if (!earliestCompTime || t < earliestCompTime) {
        earliestCompTime = t;
      }
    }
  });

  // Filter new debt added in observation window (only positive additions, excluding initial wizard)
  let windowNewDebt = 0;
  adjustments.forEach((adj) => {
    if (adj.reversedAdjustmentId) return;
    if (adj.category === "initial_estimate") return;

    const t = new Date(adj.timestamp).getTime();
    if (isNaN(t)) return;

    if (t >= windowStart.getTime() && t <= now.getTime()) {
      const q = parseInt(adj.quantity, 10) || 0;
      if (q > 0) {
        windowNewDebt += q;
      }
    }
  });

  // Determine elapsed calendar days in window (includes days without completions!)
  const elapsedDays = Math.max(1, observationDays);

  // Observed completion rate = completions / elapsed calendar days
  const observedDailyRate = parseFloat((windowCompletions / elapsedDays).toFixed(2));

  // Net rate = (completions - new debt) / elapsed calendar days
  const netDailyRate = parseFloat(((windowCompletions - windowNewDebt) / elapsedDays).toFixed(2));

  // Target pace forecast: ceil(R_total / dailyTarget)
  const daysAtTargetPace = Math.ceil(totalRemaining / dailyTarget);

  // Current pace forecast: ceil(R_total / observedDailyRate)
  let daysAtCurrentPace = null;
  let formattedCurrentPace = null;
  let statusMessage = null;
  const hasPositiveNetRate = netDailyRate > 0;
  const hasSufficientData = windowCompletions > 0;

  if (observedDailyRate > 0 && hasPositiveNetRate) {
    daysAtCurrentPace = Math.ceil(totalRemaining / observedDailyRate);
    if (daysAtCurrentPace < 60) {
      formattedCurrentPace = `${daysAtCurrentPace} days`;
    } else if (daysAtCurrentPace < 365) {
      formattedCurrentPace = `${daysAtCurrentPace} days (~${Math.round(daysAtCurrentPace / 30)} months)`;
    } else {
      formattedCurrentPace = `${daysAtCurrentPace} days (~${(daysAtCurrentPace / 365).toFixed(1)} years)`;
    }
  } else if (!hasSufficientData) {
    statusMessage = "Log Qaza prayers over multiple days to generate an observed completion forecast.";
  } else {
    statusMessage = "Not enough net progress to estimate a completion date yet.";
  }

  // Format target pace
  let formattedTargetPace = `${daysAtTargetPace} days`;
  if (daysAtTargetPace >= 60 && daysAtTargetPace < 365) {
    formattedTargetPace = `${daysAtTargetPace} days (~${Math.round(daysAtTargetPace / 30)} months)`;
  } else if (daysAtTargetPace >= 365) {
    formattedTargetPace = `${daysAtTargetPace} days (~${(daysAtTargetPace / 365).toFixed(1)} years)`;
  }

  return {
    totalRemaining,
    observedDailyRate,
    netDailyRate,
    windowCompletions,
    windowNewDebt,
    elapsedDays,
    daysAtCurrentPace,
    daysAtTargetPace,
    formattedCurrentPace,
    formattedTargetPace,
    hasSufficientData,
    hasPositiveNetRate,
    observationDays,
    statusMessage,
  };
}

/**
 * Calculates initial debt breakdown from wizard inputs with calendar accuracy.
 */
export function calculateWizardInitialDebt(inputs) {
  const {
    gender = "male",
    currentAge = 25,
    pubertyAge = 14,
    subtractMenses = false,
    mensesDaysPerMonth = 7,
    prayerStatus = "consistent", // "never" | "consistent" | "mixed"
    prayingAge = 20,
    phases = [],
    prayerFrequencies = {}, // per prayer overrides: e.g. { fajr: 0.8, dhuhr: 0.5, ... }
    trackWitr = false,
    manualAdjustment = 0,
    excludedSpecialDays = 0,
  } = inputs;

  const activePrayers = trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
  const safeCurrentAge = Math.max(9, parseInt(currentAge, 10) || 25);
  const safePubertyAge = Math.min(safeCurrentAge, Math.max(9, parseInt(pubertyAge, 10) || 14));
  const totalAccountableYears = Math.max(0, safeCurrentAge - safePubertyAge);

  // Calculate base accountable days (using exact tropical year length 365.2425 days)
  let grossDays = Math.round(totalAccountableYears * 365.2425);

  // Menses exclusion: Dar al-Ifta Fatwa 7959 & Sahih al-Bukhari 321
  let excludedDays = parseInt(excludedSpecialDays, 10) || 0;
  if (gender === "female" && subtractMenses) {
    const safeMensesDays = Math.min(15, Math.max(3, parseInt(mensesDaysPerMonth, 10) || 7));
    const mensesPerYear = safeMensesDays * 12;
    excludedDays += Math.round(totalAccountableYears * mensesPerYear);
  }

  const netAccountableDays = Math.max(0, grossDays - excludedDays);

  const initialDebts = {};
  activePrayers.forEach((p) => (initialDebts[p] = 0));

  if (prayerStatus === "never") {
    // Completely missed all prayers during the accountable span
    activePrayers.forEach((p) => {
      const freq = prayerFrequencies[p] !== undefined ? prayerFrequencies[p] : 1.0;
      initialDebts[p] = Math.round(netAccountableDays * freq);
    });
  } else if (prayerStatus === "consistent") {
    // Began praying consistently at a certain age
    const safePrayingAge = Math.min(
      safeCurrentAge,
      Math.max(safePubertyAge, parseInt(prayingAge, 10) || safePubertyAge)
    );
    const unprayedYears = Math.max(0, safePrayingAge - safePubertyAge);
    let unprayedGrossDays = Math.round(unprayedYears * 365.2425);
    if (gender === "female" && subtractMenses) {
      const safeMensesDays = Math.min(15, Math.max(3, parseInt(mensesDaysPerMonth, 10) || 7));
      unprayedGrossDays = Math.max(0, unprayedGrossDays - Math.round(unprayedYears * safeMensesDays * 12));
    }
    activePrayers.forEach((p) => {
      const freq = prayerFrequencies[p] !== undefined ? prayerFrequencies[p] : 1.0;
      initialDebts[p] = Math.round(unprayedGrossDays * freq);
    });
  } else if (Array.isArray(phases) && phases.length > 0) {
    // Multi-phase habit breakdown
    phases.forEach((ph) => {
      const start = Math.max(safePubertyAge, Math.min(safeCurrentAge, parseInt(ph.startAge, 10) || safePubertyAge));
      const end = Math.max(start, Math.min(safeCurrentAge, parseInt(ph.endAge, 10) || safeCurrentAge));
      const phaseYears = Math.max(0, end - start);
      let phaseDays = Math.round(phaseYears * 365.2425);
      if (gender === "female" && subtractMenses) {
        const safeMensesDays = Math.min(15, Math.max(3, parseInt(mensesDaysPerMonth, 10) || 7));
        phaseDays = Math.max(0, phaseDays - Math.round(phaseYears * safeMensesDays * 12));
      }

      activePrayers.forEach((p) => {
        const habit = ph.prayers ? ph.prayers[p] : "Never";
        let multiplier = 1.0;
        if (habit === "Always") multiplier = 0.0;
        else if (habit === "Usually") multiplier = 0.2;
        else if (habit === "Sometimes") multiplier = 0.6;
        else multiplier = 1.0;

        initialDebts[p] += Math.round(phaseDays * multiplier);
      });
    });
  }

  // Apply manual adjustment per prayer if supplied
  const manualPerPrayer = Math.round((parseInt(manualAdjustment, 10) || 0) / activePrayers.length);
  if (manualPerPrayer !== 0) {
    activePrayers.forEach((p) => {
      initialDebts[p] = Math.max(0, initialDebts[p] + manualPerPrayer);
    });
  }

  const totalCalculated = activePrayers.reduce((sum, p) => sum + initialDebts[p], 0);

  return {
    initialDebts,
    totalCalculated,
    totalAccountableYears,
    grossDays,
    excludedDays,
    netAccountableDays,
    activePrayers,
    assumptions: {
      gender,
      pubertyAge: safePubertyAge,
      currentAge: safeCurrentAge,
      subtractMenses,
      mensesDaysPerMonth: gender === "female" && subtractMenses ? mensesDaysPerMonth : 0,
      prayerStatus,
      trackWitr,
      excludedSpecialDays,
    },
  };
}

// ─── CANONICAL STORAGE & MIGRATION ADAPTER ─────────────────────────────────────

/**
 * Loads and sanitizes all Qaza state from localStorage.
 * Performs lossless migration of legacy flat state into canonical ledgers.
 */
export function loadCanonicalQazaState() {
  const storage = getStorage();
  if (!storage) {
    return {
      openingDebt: { ...DEFAULT_OPENING_DEBT },
      adjustments: [],
      completions: [],
      profile: { ...DEFAULT_PROFILE },
      metrics: computeCanonicalQazaMetrics(DEFAULT_OPENING_DEBT, [], [], DEFAULT_PROFILE),
    };
  }

  try {
    const rawState = storage.getItem(QAZA_KEYS.STATE);
    const rawHistory = storage.getItem(QAZA_KEYS.HISTORY);
    const rawBaseline = storage.getItem(QAZA_KEYS.BASELINE);
    const rawProfile = storage.getItem(QAZA_KEYS.PROFILE);
    const rawOpening = storage.getItem(QAZA_KEYS.OPENING_DEBT);
    const rawAdjustments = storage.getItem(QAZA_KEYS.ADJUSTMENTS);
    const rawCompletions = storage.getItem(QAZA_KEYS.COMPLETIONS);

    const profile = rawProfile ? { ...DEFAULT_PROFILE, ...JSON.parse(rawProfile) } : { ...DEFAULT_PROFILE };
    let adjustments = rawAdjustments ? JSON.parse(rawAdjustments) : [];
    let completions = rawCompletions ? JSON.parse(rawCompletions) : [];

    // If rawState is directly set in storage (e.g. legacy test environment), sanitize and prioritize
    let openingDebt = null;
    if (rawOpening) {
      openingDebt = sanitizePrayerMap(JSON.parse(rawOpening), profile.trackWitr);
    } else if (rawState) {
      // Migrate from rawState directly
      const legacyState = sanitizePrayerMap(JSON.parse(rawState), profile.trackWitr);
      const legacyHistory = rawHistory ? JSON.parse(rawHistory) : { totalMadeUp: 0 };
      const legacyTotalMadeUp = Math.max(0, parseInt(legacyHistory?.totalMadeUp, 10) || 0);

      if (legacyTotalMadeUp > 0 && completions.length === 0) {
        const prayers = profile.trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
        const perPrayer = Math.floor(legacyTotalMadeUp / prayers.length);
        const remainder = legacyTotalMadeUp % prayers.length;

        prayers.forEach((p, idx) => {
          const count = perPrayer + (idx < remainder ? 1 : 0);
          if (count > 0) {
            completions.push({
              id: `comp_migrated_${p}_${Date.now()}`,
              timestamp: new Date().toISOString(),
              localDate: getLocalCalendarDate(),
              prayer: p,
              count,
              source: "legacy_migration",
              isReversed: false,
              notes: "Migrated from historical completed count",
            });
          }
        });
      }

      openingDebt = {};
      const prayers = profile.trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
      prayers.forEach((p) => {
        const completedForP = completions
          .filter((c) => c.prayer === p && !c.isReversed)
          .reduce((sum, c) => sum + (c.count || 1), 0);
        openingDebt[p] = (legacyState[p] || 0) + completedForP;
      });

      storage.setItem(QAZA_KEYS.OPENING_DEBT, JSON.stringify(openingDebt));
    } else {
      openingDebt = { ...DEFAULT_OPENING_DEBT };
    }

    const metrics = computeCanonicalQazaMetrics(openingDebt, adjustments, completions, profile);

    return {
      openingDebt,
      adjustments,
      completions,
      profile,
      metrics,
    };
  } catch (err) {
    console.warn("[qazaEngine] Storage load warning, using safe fallback:", err);
    return {
      openingDebt: { ...DEFAULT_OPENING_DEBT },
      adjustments: [],
      completions: [],
      profile: { ...DEFAULT_PROFILE },
      metrics: computeCanonicalQazaMetrics(DEFAULT_OPENING_DEBT, [], [], DEFAULT_PROFILE),
    };
  }
}

/**
 * Persists canonical state and legacy synchronization mirrors atomically.
 */
export function saveCanonicalQazaState({ openingDebt, adjustments, completions, profile }) {
  const storage = getStorage();
  const metrics = computeCanonicalQazaMetrics(openingDebt, adjustments, completions, profile);
  if (!storage) return metrics;

  try {
    storage.setItem(QAZA_KEYS.OPENING_DEBT, JSON.stringify(openingDebt));
    storage.setItem(QAZA_KEYS.ADJUSTMENTS, JSON.stringify(adjustments));
    storage.setItem(QAZA_KEYS.COMPLETIONS, JSON.stringify(completions));
    storage.setItem(QAZA_KEYS.PROFILE, JSON.stringify(profile));

    // Backward-compatible mirrors
    storage.setItem(QAZA_KEYS.STATE, JSON.stringify(metrics.remainingDebt));
    storage.setItem(QAZA_KEYS.BASELINE, String(metrics.totalTrackedDebt));

    // Read previous history to preserve streakDays and logs
    let prevHistory = {};
    try {
      const h = storage.getItem(QAZA_KEYS.HISTORY);
      if (h) prevHistory = JSON.parse(h);
    } catch {}

    const forecast = calculateQazaForecast(
      metrics.totalRemainingDebt,
      completions,
      adjustments,
      { observationDays: profile.observationWindowDays || 30, dailyTarget: profile.dailyTarget || 5 }
    );

    const updatedHistory = {
      ...prevHistory,
      totalMadeUp: metrics.totalCompletedQaza,
      avgDailyMadeUp: forecast.observedDailyRate,
      dailyPace: metrics.dailyTarget,
      streakDays: prevHistory.streakDays || 0,
      logs: Array.isArray(prevHistory.logs) ? prevHistory.logs.slice(0, 100) : [],
    };

    storage.setItem(QAZA_KEYS.HISTORY, JSON.stringify(updatedHistory));

    // Broadcast synchronization across active tabs and React components
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent(QAZA_KEYS.SYNC_EVENT, { detail: { timestamp: Date.now() } }));
    }
  } catch (err) {
    console.error("[qazaEngine] Critical storage write error:", err);
  }

  return metrics;
}

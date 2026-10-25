import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PRAYERS } from "./prayerUtils.js";
import {
  CANONICAL_PRAYERS,
  ALL_TRACKABLE_PRAYERS,
  PRAYER_DISPLAY_NAMES,
  PRAYER_OBLIGATION_RAKATS,
  ISLAMIC_JURISPRUDENCE_SOURCES,
  QAZA_KEYS,
  DEFAULT_OPENING_DEBT,
  DEFAULT_PROFILE,
  getStorage,
  getLocalCalendarDate,
  calculateExactCalendarDays,
  sanitizePrayerMap,
  computeCanonicalQazaMetrics,
  calculateQazaForecast,
  calculateWizardInitialDebt,
  loadCanonicalQazaState,
  saveCanonicalQazaState,
  loadQazaTimelineSegments,
  saveQazaTimelineSegments,
  loadQazaExcludedPeriods,
  saveQazaExcludedPeriods,
  loadQazaEstimateVersions,
  saveQazaEstimateVersion,
  loadQazaRepaymentPlan,
  saveQazaRepaymentPlan,
} from "./qazaEngine.js";

import {
  getFiqhConfiguration,
  MADHHAB_OPTIONS,
  FIQH_CONFIGURATIONS,
  FIQH_REVIEW_STATUS,
} from "./fiqhConfigurations.js";

import {
  calculateComprehensiveQaza,
  calculateRepaymentProjections,
  calculateInclusiveCalendarDays,
  mergeDateIntervals,
  calculateEligibleDays,
  ROUNDING_POLICIES,
  ESTIMATION_MODES,
} from "./qazaCalculationEngine.js";

// Re-export constants and calculations for full backward and cross-module compatibility
export {
  getFiqhConfiguration,
  MADHHAB_OPTIONS,
  FIQH_CONFIGURATIONS,
  FIQH_REVIEW_STATUS,
  calculateComprehensiveQaza,
  calculateRepaymentProjections,
  calculateInclusiveCalendarDays,
  mergeDateIntervals,
  calculateEligibleDays,
  ROUNDING_POLICIES,
  ESTIMATION_MODES,
};

export const QAZA_STORAGE_KEY = QAZA_KEYS.STATE;
export const QAZA_HISTORY_KEY = QAZA_KEYS.HISTORY;
export const QAZA_BASELINE_KEY = QAZA_KEYS.BASELINE;
export const QAZA_WIZARD_INPUTS_KEY = QAZA_KEYS.WIZARD_INPUTS;
export const QAZA_SYNC_EVENT = QAZA_KEYS.SYNC_EVENT;

export const DEFAULT_QAZA = {
  fajr: 28,
  dhuhr: 31,
  asr: 18,
  maghrib: 22,
  isha: 35,
};

export const DEFAULT_HISTORY = {
  logs: [],
  totalMadeUp: 0,
  avgDailyMadeUp: 2.4,
  streakDays: 0,
  dailyPace: 5,
};

/**
 * Sanitizes a raw qaza ledger object, ensuring all 5 canonical prayers
 * are non-negative integers. (Backward compatibility export)
 */
export function sanitizeQazaLedger(raw) {
  return sanitizePrayerMap(raw, false);
}

/**
 * Sanitizes history data. (Backward compatibility export)
 */
export function sanitizeHistory(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_HISTORY };
  const totalMadeUp = Math.max(0, parseInt(raw.totalMadeUp, 10) || 0);
  const avgDaily = Math.max(0, parseFloat(raw.avgDailyMadeUp) || 0);
  const streakDays = Math.max(0, parseInt(raw.streakDays, 10) || 0);
  const dailyPace = Math.max(1, parseInt(raw.dailyPace, 10) || 5);
  const logs = Array.isArray(raw.logs) ? raw.logs.slice(0, 100) : [];
  return {
    logs,
    totalMadeUp,
    avgDailyMadeUp: avgDaily,
    streakDays,
    dailyPace,
  };
}

/**
 * Reads canonical Qaza state from localStorage. (Backward compatibility export)
 */
export function getStoredQazaState() {
  const storage = getStorage();
  if (!storage) {
    return {
      qaza: { ...DEFAULT_QAZA },
      history: { ...DEFAULT_HISTORY },
      baseline: 134,
      total: 134,
      totalOwed: 134,
      totalMadeUp: 0,
      clearedPercentage: 0,
    };
  }

  try {
    const rawQaza = storage.getItem(QAZA_STORAGE_KEY);
    const rawHist = storage.getItem(QAZA_HISTORY_KEY);
    const rawBase = storage.getItem(QAZA_BASELINE_KEY);

    const qaza = rawQaza ? sanitizeQazaLedger(JSON.parse(rawQaza)) : { ...DEFAULT_QAZA };
    const history = rawHist ? sanitizeHistory(JSON.parse(rawHist)) : { ...DEFAULT_HISTORY };

    const totalRemaining = PRAYERS.reduce((acc, p) => acc + (qaza[p] || 0), 0);
    let baseline = rawBase ? parseInt(rawBase, 10) : 0;
    if (isNaN(baseline) || baseline <= 0) {
      baseline = Math.max(134, totalRemaining + history.totalMadeUp);
    } else {
      baseline = Math.max(baseline, totalRemaining + history.totalMadeUp);
    }

    const rawOpening = storage.getItem(QAZA_KEYS.OPENING_DEBT);
    const rawAdj = storage.getItem(QAZA_KEYS.ADJUSTMENTS);
    const rawComp = storage.getItem(QAZA_KEYS.COMPLETIONS);
    const rawProf = storage.getItem(QAZA_KEYS.PROFILE);

    const profile = rawProf ? { ...DEFAULT_PROFILE, ...JSON.parse(rawProf) } : { ...DEFAULT_PROFILE };
    const adjustments = rawAdj ? JSON.parse(rawAdj) : [];
    const completions = rawComp ? JSON.parse(rawComp) : [];
    const openingDebt = rawOpening ? sanitizePrayerMap(JSON.parse(rawOpening), profile.trackWitr) : { ...qaza };

    const metrics = computeCanonicalQazaMetrics(openingDebt, adjustments, completions, profile);

    return {
      qaza,
      history,
      baseline,
      total: totalRemaining,
      totalOwed: totalRemaining,
      totalMadeUp: history.totalMadeUp,
      clearedPercentage: baseline > 0 ? Math.min(100, Math.max(0, (history.totalMadeUp / baseline) * 100)) : 0,
      openingDebt,
      adjustments,
      completions,
      profile,
      metrics,
    };
  } catch (err) {
    return {
      qaza: { ...DEFAULT_QAZA },
      history: { ...DEFAULT_HISTORY },
      baseline: 134,
      total: 134,
      totalOwed: 134,
      totalMadeUp: 0,
      clearedPercentage: 0,
    };
  }
}

/**
 * Authoritative Qaza React Hook
 * Integrates canonical event-driven ledger, per-prayer tracking, Witr toggle,
 * reconciliation checks, safe quick actions, and realistic forecasts.
 */
export function useQaza() {
  const [canonicalState, setCanonicalState] = useState(() => loadCanonicalQazaState());
  const [loading, setLoading] = useState(false);
  const lastActionTimeRef = useRef(0);

  // Synchronize state when custom sync event or window storage fires
  const refreshFromStorage = useCallback(() => {
    const latest = loadCanonicalQazaState();
    setCanonicalState((prev) => {
      if (
        prev.metrics.totalRemainingDebt === latest.metrics.totalRemainingDebt &&
        prev.metrics.totalCompletedQaza === latest.metrics.totalCompletedQaza &&
        prev.metrics.totalTrackedDebt === latest.metrics.totalTrackedDebt &&
        prev.adjustments.length === latest.adjustments.length &&
        prev.completions.length === latest.completions.length &&
        prev.profile.trackWitr === latest.profile.trackWitr
      ) {
        return prev;
      }
      return latest;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSync = () => refreshFromStorage();
    const handleStorage = (e) => {
      if (
        e.key === QAZA_KEYS.STATE ||
        e.key === QAZA_KEYS.HISTORY ||
        e.key === QAZA_KEYS.BASELINE ||
        e.key === QAZA_KEYS.OPENING_DEBT ||
        e.key === QAZA_KEYS.ADJUSTMENTS ||
        e.key === QAZA_KEYS.COMPLETIONS ||
        e.key === QAZA_KEYS.PROFILE
      ) {
        refreshFromStorage();
      }
    };

    window.addEventListener(QAZA_KEYS.SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(QAZA_KEYS.SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshFromStorage]);

  const { openingDebt, adjustments, completions, profile, metrics } = canonicalState;

  // Forecast computation
  const forecast = useMemo(() => {
    return calculateQazaForecast(
      metrics.totalRemainingDebt,
      completions,
      adjustments,
      {
        observationDays: profile.observationWindowDays || 30,
        dailyTarget: profile.dailyTarget || 5,
      }
    );
  }, [metrics.totalRemainingDebt, completions, adjustments, profile]);

  /**
   * Helper to commit state mutation safely to localStorage and broadcast sync.
   */
  const commitCanonical = useCallback(
    (nextOpening, nextAdjustments, nextCompletions, nextProfile = profile) => {
      const nextMetrics = saveCanonicalQazaState({
        openingDebt: nextOpening,
        adjustments: nextAdjustments,
        completions: nextCompletions,
        profile: nextProfile,
      });

      setCanonicalState({
        openingDebt: nextOpening,
        adjustments: nextAdjustments,
        completions: nextCompletions,
        profile: nextProfile,
        metrics: nextMetrics,
      });
    },
    [profile]
  );

  /**
   * Double-tap and idempotency guard helper.
   */
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 250) {
      return false; // Suppress accidental duplicate tap within 250ms
    }
    lastActionTimeRef.current = now;
    return true;
  }, []);

  /**
   * Records a user-confirmed completed Qaza prayer (actual makeup prayer performed).
   * Increments C_p by 1, safely decrements R_p by 1.
   */
  const logCompletedQaza = useCallback(
    (prayerKey, count = 1, options = {}) => {
      if (!checkRateLimit()) return;
      const validPrayers = profile.trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
      if (!validPrayers.includes(prayerKey)) return;

      const compCount = Math.max(1, parseInt(count, 10) || 1);
      const completionId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const localDate = options.localDate || getLocalCalendarDate();

      const newRecord = {
        id: completionId,
        timestamp: new Date().toISOString(),
        localDate,
        prayer: prayerKey,
        count: compCount,
        source: options.source || "qaza_screen",
        isReversed: false,
        notes: options.notes || null,
        idempotencyKey: options.idempotencyKey || null,
      };

      const nextCompletions = [newRecord, ...completions];

      commitCanonical(openingDebt, adjustments, nextCompletions, profile);
      return newRecord;
    },
    [checkRateLimit, profile, completions, openingDebt, adjustments, commitCanonical]
  );

  /**
   * Records a debt estimate adjustment.
   * Positive quantity: adds missed prayer to estimated obligations.
   * Negative quantity: corrects estimated debt downward (without falsely logging prayer completions).
   */
  const recordDebtAdjustment = useCallback(
    (prayerKey, quantity, options = {}) => {
      if (!checkRateLimit()) return;
      const validPrayers = profile.trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
      if (!validPrayers.includes(prayerKey)) return;

      const qty = parseInt(quantity, 10);
      if (isNaN(qty) || qty === 0) return;

      // Validation for downward corrections: cannot make tracked debt negative
      if (qty < 0) {
        const currentTracked = metrics.trackedDebt[prayerKey] || 0;
        if (currentTracked + qty < 0) {
          throw new Error(`Correction of ${qty} would cause negative tracked debt for ${PRAYER_DISPLAY_NAMES[prayerKey]}.`);
        }
      }

      const adjId = `adj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newAdj = {
        id: adjId,
        timestamp: new Date().toISOString(),
        prayer: prayerKey,
        quantity: qty,
        category: options.category || "manual_correction",
        groupId: options.groupId || null,
        reason: options.reason || (qty > 0 ? "Missed prayer added" : "Estimate corrected"),
        reversedAdjustmentId: null,
      };

      const nextAdjustments = [newAdj, ...adjustments];
      commitCanonical(openingDebt, nextAdjustments, completions, profile);
      return newAdj;
    },
    [checkRateLimit, profile, metrics.trackedDebt, adjustments, openingDebt, completions, commitCanonical]
  );

  /**
   * Backward-compatible adjust(prayerKey, delta).
   * - If delta < 0: logs completed prayer.
   * - If delta > 0: adds estimated debt unit.
   */
  const adjust = useCallback(
    (prayerKey, delta) => {
      if (!delta || delta === 0) return;
      if (delta < 0) {
        return logCompletedQaza(prayerKey, Math.abs(delta));
      } else {
        return recordDebtAdjustment(prayerKey, delta, { category: "quick_action" });
      }
    },
    [logCompletedQaza, recordDebtAdjustment]
  );

  /**
   * Directly sets the debt amount for a specific prayer.
   */
  const setAmount = useCallback(
    (prayerKey, targetRemaining) => {
      const validPrayers = profile.trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
      if (!validPrayers.includes(prayerKey)) return;

      const parsed = parseInt(targetRemaining, 10);
      const targetR = !isNaN(parsed) && parsed >= 0 ? parsed : 0;
      const currentR = metrics.remainingDebt[prayerKey] || 0;
      if (targetR === currentR) return;

      const delta = targetR - currentR;
      return recordDebtAdjustment(prayerKey, delta, {
        category: "manual_edit",
        reason: `Remaining balance manually set from ${currentR} to ${targetR}`,
      });
    },
    [profile, metrics.remainingDebt, recordDebtAdjustment]
  );

  /**
   * Adds one full day (+1 to each active prayer category = +5 or +6 total debt).
   * Atomic grouped operation with shared groupId.
   */
  const addFullDay = useCallback(() => {
    if (!checkRateLimit()) return;
    const activePrayers = profile.trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
    const groupId = `grp_add_day_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newAdjs = activePrayers.map((p) => ({
      id: `adj_${Date.now()}_${p}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp,
      prayer: p,
      quantity: 1,
      category: "quick_action",
      groupId,
      reason: "+Full Day added",
      reversedAdjustmentId: null,
    }));

    const nextAdjustments = [...newAdjs, ...adjustments];
    commitCanonical(openingDebt, nextAdjustments, completions, profile);
    return activePrayers.length;
  }, [checkRateLimit, profile, adjustments, openingDebt, completions, commitCanonical]);

  /**
   * Subtracts one full day: Corrects estimated debt by removing 1 from each owed prayer category.
   * Guaranteed to be an estimate correction (does NOT fabricate completed prayer records).
   */
  const subtractFullDay = useCallback(() => {
    if (!checkRateLimit()) return 0;
    const activePrayers = profile.trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;
    const groupId = `grp_sub_day_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Check which prayers have remaining debt that can be reduced
    const validDeductions = [];
    activePrayers.forEach((p) => {
      const curRemaining = metrics.remainingDebt[p] || 0;
      if (curRemaining > 0) {
        validDeductions.push(p);
      }
    });

    if (validDeductions.length === 0) return 0;

    const newAdjs = validDeductions.map((p) => ({
      id: `adj_${Date.now()}_${p}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp,
      prayer: p,
      quantity: -1,
      category: "quick_action",
      groupId,
      reason: "-Full Day estimate correction",
      reversedAdjustmentId: null,
    }));

    const nextAdjustments = [...newAdjs, ...adjustments];
    commitCanonical(openingDebt, nextAdjustments, completions, profile);
    return validDeductions.length;
  }, [checkRateLimit, profile, metrics.remainingDebt, adjustments, openingDebt, completions, commitCanonical]);

  /**
   * Undoes the most recent adjustment or completion safely via linked reversal.
   */
  const undoRecentAction = useCallback(() => {
    const latestComp = completions[0];
    const latestAdj = adjustments[0];

    const compTime = latestComp ? new Date(latestComp.timestamp).getTime() : 0;
    const adjTime = latestAdj ? new Date(latestAdj.timestamp).getTime() : 0;

    if (compTime >= adjTime && latestComp && !latestComp.isReversed) {
      const nextCompletions = completions.map((c) =>
        c.id === latestComp.id ? { ...c, isReversed: true, reversedAt: new Date().toISOString() } : c
      );
      commitCanonical(openingDebt, adjustments, nextCompletions, profile);
      return { type: "reversed_completion", target: latestComp };
    } else if (latestAdj && !latestAdj.reversedAdjustmentId) {
      const reversalAdj = {
        id: `rev_${Date.now()}`,
        timestamp: new Date().toISOString(),
        prayer: latestAdj.prayer,
        quantity: -latestAdj.quantity,
        category: "reversal",
        groupId: latestAdj.groupId,
        reason: `Reversal of adjustment ${latestAdj.id}`,
        reversedAdjustmentId: latestAdj.id,
      };
      const nextAdjustments = [reversalAdj, ...adjustments];
      commitCanonical(openingDebt, nextAdjustments, completions, profile);
      return { type: "reversed_adjustment", target: latestAdj };
    }

    return null;
  }, [completions, adjustments, openingDebt, profile, commitCanonical]);

  /**
   * Commits the output of the Calculate Debt Wizard.
   */
  const commitWizard = useCallback(
    (newDebts, wizardInputs = null, dailyPace = 5) => {
      const sanitized = sanitizePrayerMap(newDebts, Boolean(wizardInputs?.trackWitr));

      if (wizardInputs && typeof window !== "undefined") {
        try {
          localStorage.setItem(QAZA_KEYS.WIZARD_INPUTS, JSON.stringify(wizardInputs));
        } catch {}
      }

      const nextProfile = {
        ...profile,
        trackWitr: Boolean(wizardInputs?.trackWitr),
        dailyTarget: Math.max(1, parseInt(dailyPace, 10) || 5),
      };

      const nextOpeningDebt = { ...sanitized };
      commitCanonical(nextOpeningDebt, adjustments, completions, nextProfile);
    },
    [profile, adjustments, completions, commitCanonical]
  );

  /**
   * Resets all Qaza tracking debt safely.
   */
  const resetAllDebt = useCallback(() => {
    const zeroOpening = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
    const resetAdj = {
      id: `adj_reset_${Date.now()}`,
      timestamp: new Date().toISOString(),
      prayer: "all",
      quantity: 0,
      category: "reset",
      reason: "All debts reset to zero by user request",
      reversedAdjustmentId: null,
    };
    commitCanonical(zeroOpening, [resetAdj], [], profile);
  }, [profile, commitCanonical]);

  /**
   * Sets the user's voluntary daily planning pace.
   */
  const setDailyPace = useCallback(
    (pace) => {
      const val = Math.max(1, parseInt(pace, 10) || 5);
      const nextProfile = { ...profile, dailyTarget: val };
      commitCanonical(openingDebt, adjustments, completions, nextProfile);
    },
    [profile, openingDebt, adjustments, completions, commitCanonical]
  );

  /**
   * Toggles Witr tracking on or off.
   */
  const setTrackWitr = useCallback(
    (enabled) => {
      const nextProfile = { ...profile, trackWitr: Boolean(enabled) };
      commitCanonical(openingDebt, adjustments, completions, nextProfile);
    },
    [profile, openingDebt, adjustments, completions, commitCanonical]
  );

  // Extended entities: timeline segments, exclusions, estimate versions, and repayment plan
  const [timelineSegments, setTimelineSegments] = useState(() => loadQazaTimelineSegments());
  const [excludedPeriods, setExcludedPeriods] = useState(() => loadQazaExcludedPeriods());
  const [estimateVersions, setEstimateVersions] = useState(() => loadQazaEstimateVersions());
  const [repaymentPlan, setRepaymentPlanState] = useState(() => loadQazaRepaymentPlan());

  // Active Fiqh Configuration
  const activeFiqhConfig = useMemo(() => {
    return getFiqhConfiguration(profile.madhhab || "hanafi");
  }, [profile.madhhab]);

  // Dynamic Repayment Projections based on current remaining balances and active plan
  const repaymentProjections = useMemo(() => {
    return calculateRepaymentProjections({
      remainingDebt: metrics.remainingDebt,
      dailyTarget: repaymentPlan.dailyTarget || profile.dailyTarget || 5,
      categoryTargets: repaymentPlan.categoryTargets || profile.categoryTargets,
      weeklyTarget: repaymentPlan.weeklyGoal || profile.weeklyGoal,
      startDate: repaymentPlan.startDate || new Date().toISOString().split("T")[0],
      isPaused: Boolean(repaymentPlan.isPaused || profile.isPlanPaused),
    });
  }, [metrics.remainingDebt, repaymentPlan, profile]);

  /**
   * Records a batch of completed Qaza prayers atomically (e.g. multi-prayer or multi-day makeup session).
   */
  const logBatchCompletions = useCallback(
    (batchItems = [], options = {}) => {
      if (!checkRateLimit()) return;
      if (!Array.isArray(batchItems) || batchItems.length === 0) return;

      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const timestamp = new Date().toISOString();
      const localDate = options.localDate || getLocalCalendarDate();
      const validPrayers = profile.trackWitr ? ALL_TRACKABLE_PRAYERS : CANONICAL_PRAYERS;

      const newEntries = [];
      batchItems.forEach((item) => {
        if (!validPrayers.includes(item.prayer)) return;
        const count = Math.max(1, parseInt(item.count, 10) || 1);
        newEntries.push({
          id: `comp_${Date.now()}_${item.prayer}_${Math.random().toString(36).substr(2, 5)}`,
          timestamp,
          localDate,
          prayer: item.prayer,
          count,
          source: options.source || "batch_logging",
          batchId,
          isReversed: false,
          notes: options.notes || `Batch entry (${batchId})`,
          idempotencyKey: options.idempotencyKey || null,
        });
      });

      if (newEntries.length === 0) return;

      const nextCompletions = [...newEntries, ...completions];
      commitCanonical(openingDebt, adjustments, nextCompletions, profile);
      return { batchId, count: newEntries.length, entries: newEntries };
    },
    [checkRateLimit, profile, completions, openingDebt, adjustments, commitCanonical]
  );

  /**
   * Commits output from the 5-Step Guided Adaptive Estimation Wizard.
   * Saves an immutable estimate version snapshot, updates timeline segments & exclusions,
   * establishes new prayer targets, and safely preserves existing completion history.
   */
  const commitComprehensiveEstimate = useCallback(
    ({
      periods = [],
      excludedPeriods: newExcluded = [],
      profileUpdates = {},
      estimateResult = {},
      customTargets = null,
      notes = "",
    }) => {
      const activeTargets = customTargets || estimateResult.roundedTargets || {};
      const trackWitr = Boolean(profileUpdates.trackWitr ?? activeFiqhConfig.rules.trackWitr);
      const sanitizedTargets = sanitizePrayerMap(activeTargets, trackWitr);

      const nextProfile = {
        ...profile,
        ...profileUpdates,
        madhhab: profileUpdates.madhhab || profile.madhhab || "hanafi",
        fiqhConfigurationId: profileUpdates.fiqhConfigurationId || activeFiqhConfig.id,
        trackWitr,
        roundingPolicy: profileUpdates.roundingPolicy || profile.roundingPolicy || "upward",
        accountabilityStartDate: profileUpdates.accountabilityStartDate || profile.accountabilityStartDate,
        accountabilityStartPrecision: profileUpdates.accountabilityStartPrecision || profile.accountabilityStartPrecision,
        historicalEndDate: profileUpdates.historicalEndDate || profile.historicalEndDate,
        historicalEndPrecision: profileUpdates.historicalEndPrecision || profile.historicalEndPrecision,
      };

      // Create immutable version snapshot
      const newVersion = {
        id: `ver_${Date.now()}`,
        timestamp: new Date().toISOString(),
        versionNumber: (estimateVersions[0]?.versionNumber || 0) + 1,
        madhhab: nextProfile.madhhab,
        fiqhConfigurationId: nextProfile.fiqhConfigurationId,
        reviewStatus: activeFiqhConfig.reviewStatus,
        roundingPolicy: nextProfile.roundingPolicy,
        accountabilityStartDate: nextProfile.accountabilityStartDate,
        historicalEndDate: nextProfile.historicalEndDate,
        perPrayerTotals: sanitizedTargets,
        lowerBounds: estimateResult.roundedLowBounds || {},
        upperBounds: estimateResult.roundedHighBounds || {},
        totalTarget: estimateResult.totalCalculatedTarget || Object.values(sanitizedTargets).reduce((a, b) => a + b, 0),
        periodsSnapshot: periods,
        excludedSnapshot: newExcluded,
        notes,
      };

      // Persist modular collections
      saveQazaTimelineSegments(periods);
      saveQazaExcludedPeriods(newExcluded);
      saveQazaEstimateVersion(newVersion);

      setTimelineSegments(periods);
      setExcludedPeriods(newExcluded);
      setEstimateVersions((prev) => [newVersion, ...prev]);

      // Set new opening debt (targets) while strictly preserving all logged completions!
      commitCanonical(sanitizedTargets, adjustments, completions, nextProfile);
      return newVersion;
    },
    [profile, activeFiqhConfig, estimateVersions, adjustments, completions, commitCanonical]
  );

  /**
   * Updates Repayment Plan settings (daily pace, category daily targets, weekly goals, pause state).
   */
  const updateRepaymentPlan = useCallback(
    (updates = {}) => {
      const nextPlan = {
        ...repaymentPlan,
        ...updates,
        dailyTarget: Math.max(1, parseInt(updates.dailyTarget ?? repaymentPlan.dailyTarget, 10) || 5),
        weeklyGoal: Math.max(1, parseInt(updates.weeklyGoal ?? repaymentPlan.weeklyGoal, 10) || 35),
      };

      saveQazaRepaymentPlan(nextPlan);
      setRepaymentPlanState(nextPlan);

      const nextProfile = {
        ...profile,
        dailyTarget: nextPlan.dailyTarget,
        categoryTargets: nextPlan.categoryTargets || profile.categoryTargets,
        weeklyGoal: nextPlan.weeklyGoal,
        isPlanPaused: Boolean(nextPlan.isPaused),
      };
      commitCanonical(openingDebt, adjustments, completions, nextProfile);
    },
    [repaymentPlan, profile, openingDebt, adjustments, completions, commitCanonical]
  );

  /**
   * Pauses the repayment plan.
   */
  const pauseRepaymentPlan = useCallback(() => {
    updateRepaymentPlan({ isPaused: true });
  }, [updateRepaymentPlan]);

  /**
   * Resumes the repayment plan.
   */
  const resumeRepaymentPlan = useCallback(() => {
    updateRepaymentPlan({ isPaused: false });
  }, [updateRepaymentPlan]);

  /**
   * Changes the selected Madhhab.
   * Crucially: Does NOT silently rewrite existing debt numbers or delete completed records.
   */
  const changeMadhhab = useCallback(
    (newMadhhabKey) => {
      const targetConfig = getFiqhConfiguration(newMadhhabKey);
      const nextProfile = {
        ...profile,
        madhhab: targetConfig.madhhab,
        fiqhConfigurationId: targetConfig.id,
        trackWitr: targetConfig.rules.trackWitr,
      };
      commitCanonical(openingDebt, adjustments, completions, nextProfile);
    },
    [profile, openingDebt, adjustments, completions, commitCanonical]
  );

  // Backward-compatible history object mirror
  const history = useMemo(() => {
    let prevStreak = 0;
    try {
      const h = localStorage.getItem(QAZA_KEYS.HISTORY);
      if (h) prevStreak = JSON.parse(h).streakDays || 0;
    } catch {}

    return {
      totalMadeUp: metrics.totalCompletedQaza,
      avgDailyMadeUp: forecast.observedDailyRate,
      streakDays: prevStreak,
      dailyPace: metrics.dailyTarget,
      logs: [
        ...completions.slice(0, 50).map((c) => ({
          id: c.id,
          type: "completed",
          prayer: c.prayer,
          count: c.count,
          timestamp: c.timestamp,
          isReversed: Boolean(c.isReversed),
        })),
        ...adjustments.slice(0, 50).map((a) => ({
          id: a.id,
          type: a.category,
          prayer: a.prayer,
          count: a.quantity,
          timestamp: a.timestamp,
          reversedAdjustmentId: a.reversedAdjustmentId,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };
  }, [metrics.totalCompletedQaza, metrics.dailyTarget, forecast.observedDailyRate, completions, adjustments]);

  return {
    // Primary reactive state
    qaza: metrics.remainingDebt,
    total: metrics.totalRemainingDebt,
    totalOwed: metrics.totalRemainingDebt,
    totalTrackedDebt: metrics.totalTrackedDebt,
    totalMadeUp: metrics.totalCompletedQaza,
    totalCompletedQaza: metrics.totalCompletedQaza,
    baseline: metrics.totalTrackedDebt,
    clearedPercentage: metrics.clearedPercentage,
    perPrayerProgress: metrics.perPrayerProgress,
    reconciliation: metrics.reconciliation,
    todayCompletedCount: metrics.todayCompletedCount,
    dailyTarget: metrics.dailyTarget,
    dailyTargetPercentage: metrics.dailyTargetPercentage,
    trackWitr: metrics.trackWitr,
    activePrayers: metrics.activePrayers,
    forecast,
    history,
    loading,

    // Extended entities & Jurisprudence metadata
    timelineSegments,
    excludedPeriods,
    estimateVersions,
    repaymentPlan,
    repaymentProjections,
    activeFiqhConfig,

    // Ledger records
    openingDebt,
    adjustments,
    completions,
    profile,

    // Operations
    logCompletedQaza,
    logBatchCompletions,
    recordDebtAdjustment,
    adjust,
    setAmount,
    addFullDay,
    subtractFullDay,
    undoRecentAction,
    commitWizard,
    commitComprehensiveEstimate,
    updateRepaymentPlan,
    pauseRepaymentPlan,
    resumeRepaymentPlan,
    changeMadhhab,
    resetAllDebt,
    setDailyPace,
    setTrackWitr,
    refreshFromStorage,
  };
}

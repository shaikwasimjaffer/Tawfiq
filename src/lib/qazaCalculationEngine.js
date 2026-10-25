/**
 * TAWFIQ QAZA CALCULATION ENGINE
 * Pure mathematical, date-accurate, standalone calculation module.
 * 
 * Complies with Section 4 and Section 12 requirements:
 * - Precise inclusive Gregorian date math and leap-year awareness
 * - Non-overlapping timeline aggregation before rounding
 * - Deduplication of overlapping excluded date intervals
 * - Estimation modes: Exact (A), Average Weekly Frequency (B), Uncertain Range (C), Every Eligible Day (D), Custom Target (E)
 * - Explicit rounding policies: 'nearest', 'upward' (precautionary/Ihtiyat), 'custom'
 * - Guard rails against NaN, negative numbers, infinity, and corrupted inputs
 * - Category-specific and uniform repayment plan projections
 */

export const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
export const ALL_PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha", "witr"];

export const ROUNDING_POLICIES = {
  NEAREST: "nearest",
  UPWARD: "upward",
  CUSTOM: "custom",
};

export const ESTIMATION_MODES = {
  EXACT: "exact",                   // Mode A: exact count
  AVERAGE_WEEKLY: "average_weekly", // Mode B: average missed per week (0-7)
  UNCERTAIN_RANGE: "uncertain_range",// Mode C: lower & upper frequency (0-7)
  EVERY_ELIGIBLE_DAY: "every_day",  // Mode D: all eligible days (7/7)
  CUSTOM_TARGET: "custom_target",   // Mode E: manually set target
};

/**
 * Validates whether a year is a leap year in the Gregorian calendar.
 */
export function isLeapYear(year) {
  const y = parseInt(year, 10);
  if (isNaN(y)) return false;
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object set to midnight (00:00:00.000).
 * Prevents UTC timezone drift issues.
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    const d = new Date(dateStr.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const parts = String(dateStr).split("T")[0].split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  const d = new Date(year, month, day, 0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
export function formatLocalDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates inclusive calendar days between two dates.
 * Both start and end dates are included.
 * Example: 2020-01-01 to 2020-01-01 = 1 day.
 * Example: 2020-01-01 to 2020-12-31 (leap year) = 366 days.
 */
export function calculateInclusiveCalendarDays(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  if (!start || !end) return 0;
  if (end.getTime() < start.getTime()) return 0;

  // Use UTC millisecond difference between midnights to prevent DST shift anomalies
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.round((utcEnd - utcStart) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays + 1);
}

/**
 * Merges overlapping or adjacent date intervals into a set of disjoint intervals.
 * Guarantees that no date is double-counted.
 * @param {Array<{ startDate: string, endDate: string }>} intervals
 * @returns {Array<{ startDate: string, endDate: string }>}
 */
export function mergeDateIntervals(intervals = []) {
  if (!Array.isArray(intervals) || intervals.length === 0) return [];

  const parsed = [];
  intervals.forEach((item) => {
    const s = parseLocalDate(item.startDate);
    const e = parseLocalDate(item.endDate || item.startDate);
    if (s && e && e.getTime() >= s.getTime()) {
      parsed.push({ start: s, end: e });
    }
  });

  if (parsed.length === 0) return [];

  // Sort by start date ascending
  parsed.sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged = [parsed[0]];
  for (let i = 1; i < parsed.length; i++) {
    const current = parsed[i];
    const prev = merged[merged.length - 1];

    // If current interval starts before or on the day immediately after previous interval
    const prevEndNextDay = new Date(prev.end.getTime() + 24 * 60 * 60 * 1000);
    if (current.start.getTime() <= prevEndNextDay.getTime()) {
      if (current.end.getTime() > prev.end.getTime()) {
        prev.end = current.end;
      }
    } else {
      merged.push(current);
    }
  }

  return merged.map((m) => ({
    startDate: formatLocalDate(m.start),
    endDate: formatLocalDate(m.end),
  }));
}

/**
 * Calculates total excluded days within a given boundary [periodStart, periodEnd]
 * from a list of excluded intervals, ensuring no overlapping dates are double-subtracted.
 */
export function calculateEligibleExcludedDays(periodStart, periodEnd, excludedIntervals = [], aggregateExcludedDays = 0) {
  const pStart = parseLocalDate(periodStart);
  const pEnd = parseLocalDate(periodEnd);
  if (!pStart || !pEnd || pEnd.getTime() < pStart.getTime()) return 0;

  let totalExcluded = 0;

  if (Array.isArray(excludedIntervals) && excludedIntervals.length > 0) {
    // Clip intervals to period boundaries first
    const clipped = [];
    excludedIntervals.forEach((item) => {
      const s = parseLocalDate(item.startDate);
      const e = parseLocalDate(item.endDate || item.startDate);
      if (!s || !e) return;

      const clippedStart = s.getTime() < pStart.getTime() ? pStart : s;
      const clippedEnd = e.getTime() > pEnd.getTime() ? pEnd : e;

      if (clippedEnd.getTime() >= clippedStart.getTime()) {
        clipped.push({
          startDate: formatLocalDate(clippedStart),
          endDate: formatLocalDate(clippedEnd),
        });
      }
    });

    const merged = mergeDateIntervals(clipped);
    merged.forEach((m) => {
      totalExcluded += calculateInclusiveCalendarDays(m.startDate, m.endDate);
    });
  }

  // Add any lump-sum aggregate excluded days, clamped
  const safeAggregate = Math.max(0, parseInt(aggregateExcludedDays, 10) || 0);
  totalExcluded += safeAggregate;

  const totalPeriodDays = calculateInclusiveCalendarDays(periodStart, periodEnd);
  return Math.min(totalPeriodDays, totalExcluded);
}

/**
 * Computes eligible days for a history period:
 * eligibleDays = inclusiveCalendarDays - eligibleExcludedDays
 */
export function calculateEligibleDays(periodStart, periodEnd, excludedIntervals = [], aggregateExcludedDays = 0) {
  const totalInclusive = calculateInclusiveCalendarDays(periodStart, periodEnd);
  const excluded = calculateEligibleExcludedDays(periodStart, periodEnd, excludedIntervals, aggregateExcludedDays);
  return Math.max(0, totalInclusive - excluded);
}

/**
 * Validates and sanitizes a frequency value between 0 and 7.
 */
export function sanitizeWeeklyFrequency(freq) {
  const parsed = parseFloat(freq);
  if (isNaN(parsed) || !isFinite(parsed)) return 0;
  return Math.min(7, Math.max(0, parsed));
}

/**
 * Computes single prayer estimate within a period.
 * Returns: { nominal: number, low: number, high: number, isExact: boolean, isRange: boolean }
 */
export function calculatePrayerSegmentEstimate(eligibleDays, prayerEstimateConfig) {
  const safeDays = Math.max(0, parseInt(eligibleDays, 10) || 0);
  if (!prayerEstimateConfig || typeof prayerEstimateConfig !== "object") {
    return { nominal: 0, low: 0, high: 0, isExact: false, isRange: false };
  }

  const mode = prayerEstimateConfig.mode || ESTIMATION_MODES.AVERAGE_WEEKLY;

  // Mode A: Exact count known
  if (mode === ESTIMATION_MODES.EXACT) {
    const exact = Math.max(0, parseInt(prayerEstimateConfig.exactCount, 10) || 0);
    return {
      nominal: exact,
      low: exact,
      high: exact,
      isExact: true,
      isRange: false,
    };
  }

  // Mode D: Every eligible day (7 out of 7 days)
  if (mode === ESTIMATION_MODES.EVERY_ELIGIBLE_DAY) {
    return {
      nominal: safeDays,
      low: safeDays,
      high: safeDays,
      isExact: true,
      isRange: false,
    };
  }

  // Mode E: Custom target
  if (mode === ESTIMATION_MODES.CUSTOM_TARGET) {
    const custom = Math.max(0, parseInt(prayerEstimateConfig.customTarget, 10) || 0);
    return {
      nominal: custom,
      low: custom,
      high: custom,
      isExact: true,
      isRange: false,
    };
  }

  // Mode C: Uncertain frequency range (low and high)
  if (mode === ESTIMATION_MODES.UNCERTAIN_RANGE) {
    const lowFreq = sanitizeWeeklyFrequency(prayerEstimateConfig.lowFrequency ?? 0);
    const highFreq = sanitizeWeeklyFrequency(prayerEstimateConfig.highFrequency ?? 7);
    const validLowFreq = Math.min(lowFreq, highFreq);
    const validHighFreq = Math.max(lowFreq, highFreq);

    const lowEst = (safeDays * validLowFreq) / 7;
    const highEst = (safeDays * validHighFreq) / 7;
    const nominalEst = (lowEst + highEst) / 2;

    return {
      nominal: nominalEst,
      low: lowEst,
      high: highEst,
      isExact: validLowFreq === validHighFreq,
      isRange: validLowFreq !== validHighFreq,
    };
  }

  // Mode B: Average missed frequency (m / 7)
  const freq = sanitizeWeeklyFrequency(prayerEstimateConfig.frequency ?? 7);
  const est = (safeDays * freq) / 7;
  return {
    nominal: est,
    low: est,
    high: est,
    isExact: false,
    isRange: false,
  };
}

/**
 * Rounds a floating point prayer estimate according to an explicit policy:
 * - 'nearest': Math.round
 * - 'upward': Math.ceil (standard precaution / Ihtiyat in classical Islamic jurisprudence)
 * - 'custom': integer custom value, clamped >= 0
 */
export function applyRoundingPolicy(val, policy = ROUNDING_POLICIES.UPWARD, customVal = null) {
  if (policy === ROUNDING_POLICIES.CUSTOM && customVal !== null && !isNaN(customVal)) {
    return Math.max(0, parseInt(customVal, 10) || 0);
  }
  const num = parseFloat(val);
  if (isNaN(num) || !isFinite(num)) return 0;
  if (num <= 0) return 0;

  if (policy === ROUNDING_POLICIES.NEAREST) {
    return Math.round(num);
  }
  // Default to UPWARD for conservative spiritual debt estimation
  return Math.ceil(num);
}

/**
 * Checks timeline periods for overlaps or unresolved gaps.
 * @param {Array<{ startDate: string, endDate: string, id: string, label?: string }>} periods
 * @returns {{ hasOverlaps: boolean, overlaps: Array, hasGaps: boolean, gaps: Array }}
 */
export function analyzeTimelineContinuity(periods = []) {
  if (!Array.isArray(periods) || periods.length <= 1) {
    return { hasOverlaps: false, overlaps: [], hasGaps: false, gaps: [] };
  }

  // Sort chronologically by start date
  const sorted = periods
    .map((p, idx) => ({
      index: idx,
      id: p.id || `p_${idx}`,
      label: p.label || `Period ${idx + 1}`,
      start: parseLocalDate(p.startDate),
      end: parseLocalDate(p.endDate),
      rawStart: p.startDate,
      rawEnd: p.endDate,
    }))
    .filter((p) => p.start && p.end && p.end.getTime() >= p.start.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const overlaps = [];
  const gaps = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.end.getTime() >= next.start.getTime()) {
      overlaps.push({
        periodA: current.label,
        periodB: next.label,
        overlapStartDate: next.rawStart,
        overlapEndDate: current.end.getTime() < next.end.getTime() ? current.rawEnd : next.rawEnd,
      });
    } else {
      const nextDayAfterCurrent = new Date(current.end.getTime() + 24 * 60 * 60 * 1000);
      if (nextDayAfterCurrent.getTime() < next.start.getTime()) {
        const gapEnd = new Date(next.start.getTime() - 24 * 60 * 60 * 1000);
        gaps.push({
          between: `${current.label} and ${next.label}`,
          gapStartDate: formatLocalDate(nextDayAfterCurrent),
          gapEndDate: formatLocalDate(gapEnd),
          gapDays: calculateInclusiveCalendarDays(formatLocalDate(nextDayAfterCurrent), formatLocalDate(gapEnd)),
        });
      }
    }
  }

  return {
    hasOverlaps: overlaps.length > 0,
    overlaps,
    hasGaps: gaps.length > 0,
    gaps,
  };
}

/**
 * Standalone Grand Calculation Engine
 * Aggregates all periods, exclusions, and per-prayer configurations.
 * Guarantees aggregation happens across all periods BEFORE rounding is applied.
 * 
 * @param {Object} params
 * @param {Array} params.periods Historical segments
 * @param {Array} params.excludedPeriods Global or segment-specific exclusions
 * @param {boolean} params.trackWitr Whether Witr is included in calculations
 * @param {string} params.roundingPolicy 'upward' | 'nearest' | 'custom'
 * @param {Object} params.customTargets Optional map of user-confirmed target numbers per prayer
 * @returns {Object} Comprehensive calculation report
 */
export function calculateComprehensiveQaza({
  periods = [],
  excludedPeriods = [],
  trackWitr = false,
  roundingPolicy = ROUNDING_POLICIES.UPWARD,
  customTargets = {},
}) {
  const activePrayers = trackWitr ? ALL_PRAYER_KEYS : PRAYER_KEYS;

  // Raw floating aggregations across all non-overlapping segments
  const rawTotals = {};
  const lowTotals = {};
  const highTotals = {};
  const isExactPerPrayer = {};
  const isRangePerPrayer = {};
  const breakdownBySegment = [];

  activePrayers.forEach((p) => {
    rawTotals[p] = 0;
    lowTotals[p] = 0;
    highTotals[p] = 0;
    isExactPerPrayer[p] = true;
    isRangePerPrayer[p] = false;
  });

  let totalAccountableInclusiveDays = 0;
  let totalExcludedDays = 0;
  let totalEligibleDays = 0;

  // Process each timeline segment
  periods.forEach((seg, idx) => {
    const sDate = seg.startDate;
    const eDate = seg.endDate;
    if (!sDate || !eDate) return;

    // Segment-specific exclusions combined with any overlapping global exclusions
    const segExclusions = [
      ...(Array.isArray(seg.excludedIntervals) ? seg.excludedIntervals : []),
      ...excludedPeriods,
    ];
    const segAggregateExcluded = parseInt(seg.aggregateExcludedDays, 10) || 0;

    const inclusiveDays = calculateInclusiveCalendarDays(sDate, eDate);
    const eligibleDays = calculateEligibleDays(sDate, eDate, segExclusions, segAggregateExcluded);
    const excludedDays = Math.max(0, inclusiveDays - eligibleDays);

    totalAccountableInclusiveDays += inclusiveDays;
    totalExcludedDays += excludedDays;
    totalEligibleDays += eligibleDays;

    const segmentReport = {
      segmentId: seg.id || `seg_${idx}`,
      label: seg.label || `Segment ${idx + 1}`,
      startDate: sDate,
      endDate: eDate,
      inclusiveDays,
      excludedDays,
      eligibleDays,
      prayers: {},
    };

    activePrayers.forEach((p) => {
      const prayerCfg = seg.prayers ? seg.prayers[p] : null;
      const prayerResult = calculatePrayerSegmentEstimate(eligibleDays, prayerCfg);

      segmentReport.prayers[p] = prayerResult;

      // Accumulate without intermediate rounding
      rawTotals[p] += prayerResult.nominal;
      lowTotals[p] += prayerResult.low;
      highTotals[p] += prayerResult.high;

      if (!prayerResult.isExact) isExactPerPrayer[p] = false;
      if (prayerResult.isRange) isRangePerPrayer[p] = true;
    });

    breakdownBySegment.push(segmentReport);
  });

  // Apply explicit rounding policy to accumulated totals
  const roundedTargets = {};
  const roundedLowBounds = {};
  const roundedHighBounds = {};
  let totalCalculatedTarget = 0;
  let totalCalculatedLow = 0;
  let totalCalculatedHigh = 0;

  activePrayers.forEach((p) => {
    const low = Math.round(lowTotals[p]);
    const high = Math.round(highTotals[p]);
    roundedLowBounds[p] = low;
    roundedHighBounds[p] = high;

    // User selected target if custom target provided, else apply rounding policy to raw total
    const custom = customTargets && customTargets[p] !== undefined ? customTargets[p] : null;
    const target = applyRoundingPolicy(rawTotals[p], roundingPolicy, custom);
    roundedTargets[p] = target;

    totalCalculatedTarget += target;
    totalCalculatedLow += low;
    totalCalculatedHigh += high;
  });

  const continuity = analyzeTimelineContinuity(periods);

  return {
    activePrayers,
    trackWitr,
    roundingPolicy,
    totalAccountableInclusiveDays,
    totalExcludedDays,
    totalEligibleDays,
    rawTotals,
    lowTotals,
    highTotals,
    roundedTargets,      // Target per prayer (integers)
    roundedLowBounds,    // Lower estimate bound
    roundedHighBounds,   // Upper estimate bound
    isExactPerPrayer,
    isRangePerPrayer,
    totalCalculatedTarget,
    totalCalculatedLow,
    totalCalculatedHigh,
    breakdownBySegment,
    continuity,
  };
}

/**
 * Calculates repayment completion projection.
 * Supports:
 * - Uniform daily target (e.g. 5/day)
 * - Category-specific daily targets (e.g. { fajr: 2, dhuhr: 1, ... })
 * - Weekly targets (e.g. 35/week)
 * - Projected completion date calendar date arithmetic
 */
export function calculateRepaymentProjections({
  remainingDebt = {},
  dailyTarget = 5,
  categoryTargets = null,
  weeklyTarget = null,
  startDate = new Date(),
  isPaused = false,
}) {
  const start = parseLocalDate(startDate) || new Date();
  start.setHours(0, 0, 0, 0);

  const prayers = Object.keys(remainingDebt).filter((p) => remainingDebt[p] > 0);
  const totalRemaining = prayers.reduce((sum, p) => sum + (remainingDebt[p] || 0), 0);

  if (totalRemaining <= 0) {
    return {
      totalRemaining: 0,
      daysToComplete: 0,
      projectedDate: formatLocalDate(start),
      isComplete: true,
      isPaused,
      message: "Your current Qaza tracking estimate is complete.",
    };
  }

  if (isPaused) {
    return {
      totalRemaining,
      daysToComplete: null,
      projectedDate: null,
      isComplete: false,
      isPaused: true,
      message: "Repayment plan is paused. Resume anytime to calculate projected completion date.",
    };
  }

  // Case 1: Category-specific targets
  if (categoryTargets && typeof categoryTargets === "object" && Object.keys(categoryTargets).length > 0) {
    const daysPerCategory = {};
    let maxDays = 0;

    prayers.forEach((p) => {
      const owed = remainingDebt[p] || 0;
      const rate = Math.max(0, parseInt(categoryTargets[p], 10) || 0);
      if (owed > 0 && rate > 0) {
        const d = Math.ceil(owed / rate);
        daysPerCategory[p] = d;
        if (d > maxDays) maxDays = d;
      } else if (owed > 0) {
        daysPerCategory[p] = Infinity;
        maxDays = Infinity;
      }
    });

    if (maxDays === Infinity || maxDays <= 0) {
      return {
        totalRemaining,
        daysToComplete: null,
        projectedDate: null,
        daysPerCategory,
        isComplete: false,
        isPaused: false,
        message: "Some prayers with remaining debt have a 0 daily target. Increase targets to estimate completion.",
      };
    }

    const projected = new Date(start.getTime() + maxDays * 24 * 60 * 60 * 1000);
    return {
      totalRemaining,
      daysToComplete: maxDays,
      projectedDate: formatLocalDate(projected),
      daysPerCategory,
      isComplete: false,
      isPaused: false,
      message: `Projected completion in ${maxDays} days (${formatLocalDate(projected)}).`,
    };
  }

  // Case 2: Weekly target provided
  let effectiveDailyRate = Math.max(1, parseInt(dailyTarget, 10) || 5);
  if (weeklyTarget !== null && weeklyTarget !== undefined) {
    const parsedWeekly = Math.max(1, parseInt(weeklyTarget, 10) || 35);
    effectiveDailyRate = parsedWeekly / 7;
  }

  const days = Math.ceil(totalRemaining / effectiveDailyRate);
  const projected = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

  return {
    totalRemaining,
    daysToComplete: days,
    projectedDate: formatLocalDate(projected),
    effectiveDailyRate: parseFloat(effectiveDailyRate.toFixed(2)),
    isComplete: false,
    isPaused: false,
    message: `Projected completion in ${days} days (${formatLocalDate(projected)}).`,
  };
}

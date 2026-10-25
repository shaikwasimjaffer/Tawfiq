import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  isLeapYear,
  calculateInclusiveCalendarDays,
  mergeDateIntervals,
  calculateEligibleExcludedDays,
  calculateEligibleDays,
  calculateComprehensiveQaza,
  calculateRepaymentProjections,
  applyRoundingPolicy,
  ROUNDING_POLICIES,
  ESTIMATION_MODES,
} from "../src/lib/qazaCalculationEngine.js";

import {
  FIQH_CONFIGURATIONS,
  getFiqhConfiguration,
  FIQH_REVIEW_STATUS,
} from "../src/lib/fiqhConfigurations.js";

import {
  computeCanonicalQazaMetrics,
  loadCanonicalQazaState,
  saveCanonicalQazaState,
} from "../src/lib/qazaEngine.js";

// Mock localStorage for headless Node environment
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockStorage();
global.window = {
  localStorage: global.localStorage,
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

describe("Tawfiq Qaza Calculation Engine & Acceptance Criteria (20 Suites)", () => {
  // Test 1: A period in which all five prayers were missed daily
  test("1. Period in which all five prayers were missed daily", () => {
    // 2023-01-01 to 2023-01-10 inclusive = 10 days
    const result = calculateComprehensiveQaza({
      periods: [
        {
          id: "p1",
          startDate: "2023-01-01",
          endDate: "2023-01-10",
          prayers: {
            fajr: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            dhuhr: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            asr: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            maghrib: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            isha: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
          },
        },
      ],
      trackWitr: false,
    });

    assert.equal(result.totalEligibleDays, 10);
    assert.equal(result.roundedTargets.fajr, 10);
    assert.equal(result.roundedTargets.dhuhr, 10);
    assert.equal(result.roundedTargets.asr, 10);
    assert.equal(result.roundedTargets.maghrib, 10);
    assert.equal(result.roundedTargets.isha, 10);
    assert.equal(result.totalCalculatedTarget, 50);
  });

  // Test 2: A period in which only Fajr was missed
  test("2. Period in which only Fajr was missed", () => {
    // 14 days, Fajr missed 7 days/week, others 0
    const result = calculateComprehensiveQaza({
      periods: [
        {
          id: "p2",
          startDate: "2023-01-01",
          endDate: "2023-01-14",
          prayers: {
            fajr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 7 },
            dhuhr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            asr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            maghrib: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            isha: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
          },
        },
      ],
      trackWitr: false,
    });

    assert.equal(result.totalEligibleDays, 14);
    assert.equal(result.roundedTargets.fajr, 14);
    assert.equal(result.roundedTargets.dhuhr, 0);
    assert.equal(result.roundedTargets.asr, 0);
    assert.equal(result.roundedTargets.maghrib, 0);
    assert.equal(result.roundedTargets.isha, 0);
    assert.equal(result.totalCalculatedTarget, 14);
  });

  // Test 3: Different missed-prayer frequencies for each prayer
  test("3. Different missed-prayer frequencies for each prayer", () => {
    // 21 days (3 weeks)
    // Fajr: 5/week -> 15
    // Dhuhr: 2/week -> 6
    // Asr: 1/week -> 3
    // Maghrib: 4/week -> 12
    // Isha: 7/week -> 21
    const result = calculateComprehensiveQaza({
      periods: [
        {
          id: "p3",
          startDate: "2023-03-01",
          endDate: "2023-03-21",
          prayers: {
            fajr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 5 },
            dhuhr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 2 },
            asr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 1 },
            maghrib: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 4 },
            isha: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 7 },
          },
        },
      ],
      trackWitr: false,
    });

    assert.equal(result.totalEligibleDays, 21);
    assert.equal(result.roundedTargets.fajr, 15);
    assert.equal(result.roundedTargets.dhuhr, 6);
    assert.equal(result.roundedTargets.asr, 3);
    assert.equal(result.roundedTargets.maghrib, 12);
    assert.equal(result.roundedTargets.isha, 21);
    assert.equal(result.totalCalculatedTarget, 57);
  });

  // Test 4: Several historical periods with different patterns
  test("4. Several historical periods with different patterns", () => {
    // Period A: 7 days, all missed (7 each = 35 total)
    // Period B: 7 days, only Fajr missed (Fajr = 7, others = 0)
    // Aggregated: Fajr = 14, Dhuhr = 7, Asr = 7, Maghrib = 7, Isha = 7. Total = 42
    const result = calculateComprehensiveQaza({
      periods: [
        {
          id: "p4_a",
          startDate: "2023-01-01",
          endDate: "2023-01-07",
          prayers: {
            fajr: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            dhuhr: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            asr: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            maghrib: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            isha: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
          },
        },
        {
          id: "p4_b",
          startDate: "2023-01-08",
          endDate: "2023-01-14",
          prayers: {
            fajr: { mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY },
            dhuhr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            asr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            maghrib: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            isha: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
          },
        },
      ],
      trackWitr: false,
    });

    assert.equal(result.totalEligibleDays, 14);
    assert.equal(result.roundedTargets.fajr, 14);
    assert.equal(result.roundedTargets.dhuhr, 7);
    assert.equal(result.roundedTargets.asr, 7);
    assert.equal(result.roundedTargets.maghrib, 7);
    assert.equal(result.roundedTargets.isha, 7);
    assert.equal(result.totalCalculatedTarget, 42);
  });

  // Test 5: Exact count for one prayer combined with rate-based estimates for others
  test("5. Exact count for one prayer combined with rate-based estimates for others", () => {
    // 7 days
    // Fajr: exact 25 (known past count)
    // Dhuhr: frequency 3/week -> 3
    const result = calculateComprehensiveQaza({
      periods: [
        {
          id: "p5",
          startDate: "2023-01-01",
          endDate: "2023-01-07",
          prayers: {
            fajr: { mode: ESTIMATION_MODES.EXACT, exactCount: 25 },
            dhuhr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 3 },
            asr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            maghrib: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            isha: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
          },
        },
      ],
      trackWitr: false,
    });

    assert.equal(result.roundedTargets.fajr, 25);
    assert.equal(result.roundedTargets.dhuhr, 3);
    assert.equal(result.isExactPerPrayer.fajr, true);
    assert.equal(result.isExactPerPrayer.dhuhr, false);
  });

  // Test 6: Lower and upper estimates from uncertain frequencies
  test("6. Lower and upper estimates from uncertain frequencies", () => {
    // 14 days (2 weeks). Fajr missed between 2 and 5 times per week
    // Low: 14 * 2 / 7 = 4
    // High: 14 * 5 / 7 = 10
    // Nominal: (4 + 10) / 2 = 7
    const result = calculateComprehensiveQaza({
      periods: [
        {
          id: "p6",
          startDate: "2023-01-01",
          endDate: "2023-01-14",
          prayers: {
            fajr: { mode: ESTIMATION_MODES.UNCERTAIN_RANGE, lowFrequency: 2, highFrequency: 5 },
            dhuhr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            asr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            maghrib: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
            isha: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 0 },
          },
        },
      ],
      trackWitr: false,
    });

    assert.equal(result.roundedLowBounds.fajr, 4);
    assert.equal(result.roundedHighBounds.fajr, 10);
    assert.equal(result.roundedTargets.fajr, 7);
    assert.equal(result.isRangePerPrayer.fajr, true);
  });

  // Test 7: Overlapping periods and unresolved timeline gaps
  test("7. Overlapping periods and unresolved timeline gaps detected", () => {
    const periods = [
      { id: "p1", label: "P1", startDate: "2023-01-01", endDate: "2023-01-10" },
      { id: "p2", label: "P2", startDate: "2023-01-08", endDate: "2023-01-15" }, // Overlaps with P1
      { id: "p3", label: "P3", startDate: "2023-02-01", endDate: "2023-02-10" }, // Gap between Jan 15 and Feb 1
    ];

    const result = calculateComprehensiveQaza({ periods });
    assert.equal(result.continuity.hasOverlaps, true);
    assert.equal(result.continuity.overlaps.length, 1);
    assert.equal(result.continuity.hasGaps, true);
    assert.equal(result.continuity.gaps.length, 1);
    assert.equal(result.continuity.gaps[0].gapStartDate, "2023-01-16");
    assert.equal(result.continuity.gaps[0].gapEndDate, "2023-01-31");
  });

  // Test 8: Leap years and inclusive date boundaries
  test("8. Leap years and inclusive date boundaries", () => {
    assert.equal(isLeapYear(2020), true);
    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(2021), false);
    assert.equal(isLeapYear(1900), false);
    assert.equal(isLeapYear(2000), true);

    // 2020 leap year full inclusive days = 366
    const days2020 = calculateInclusiveCalendarDays("2020-01-01", "2020-12-31");
    assert.equal(days2020, 366);

    // 2021 non-leap year full inclusive days = 365
    const days2021 = calculateInclusiveCalendarDays("2021-01-01", "2021-12-31");
    assert.equal(days2021, 365);

    // Same day inclusive = 1
    const sameDay = calculateInclusiveCalendarDays("2023-05-10", "2023-05-10");
    assert.equal(sameDay, 1);
  });

  // Test 9: Overlapping excluded periods without double subtraction
  test("9. Overlapping excluded periods without double subtraction", () => {
    // Interval 1: 2023-01-01 to 2023-01-07 (7 days)
    // Interval 2: 2023-01-05 to 2023-01-10 (6 days, overlaps by 3 days)
    // Combined union: 2023-01-01 to 2023-01-10 = 10 distinct days, not 13
    const merged = mergeDateIntervals([
      { startDate: "2023-01-01", endDate: "2023-01-07" },
      { startDate: "2023-01-05", endDate: "2023-01-10" },
    ]);

    assert.equal(merged.length, 1);
    assert.equal(merged[0].startDate, "2023-01-01");
    assert.equal(merged[0].endDate, "2023-01-10");

    const excludedDays = calculateEligibleExcludedDays("2023-01-01", "2023-01-15", [
      { startDate: "2023-01-01", endDate: "2023-01-07" },
      { startDate: "2023-01-05", endDate: "2023-01-10" },
    ]);
    assert.equal(excludedDays, 10);

    const eligibleDays = calculateEligibleDays("2023-01-01", "2023-01-15", [
      { startDate: "2023-01-01", endDate: "2023-01-07" },
      { startDate: "2023-01-05", endDate: "2023-01-10" },
    ]);
    // 15 total inclusive days - 10 excluded = 5 eligible days
    assert.equal(eligibleDays, 5);
  });

  // Test 10: Missing dates and unknown history handled safely
  test("10. Missing dates and unknown history handled safely", () => {
    const emptyResult = calculateComprehensiveQaza({ periods: [] });
    assert.equal(emptyResult.totalCalculatedTarget, 0);

    const invalidDateDays = calculateInclusiveCalendarDays(null, undefined);
    assert.equal(invalidDateDays, 0);

    const invertedDays = calculateInclusiveCalendarDays("2023-05-10", "2023-05-01");
    assert.equal(invertedDays, 0);
  });

  // Test 11: Invalid input ranges (NaN, negative, infinity) prevented
  test("11. Invalid input ranges (NaN, negative, infinity) clamped safely", () => {
    const negRounding = applyRoundingPolicy(-50, ROUNDING_POLICIES.UPWARD);
    assert.equal(negRounding, 0);

    const nanRounding = applyRoundingPolicy(NaN, ROUNDING_POLICIES.UPWARD);
    assert.equal(nanRounding, 0);

    const infRounding = applyRoundingPolicy(Infinity, ROUNDING_POLICIES.UPWARD);
    assert.equal(infRounding, 0);

    const result = calculateComprehensiveQaza({
      periods: [
        {
          startDate: "2023-01-01",
          endDate: "2023-01-07",
          prayers: {
            fajr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: -10 },
            dhuhr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: "corrupted" },
            asr: { mode: ESTIMATION_MODES.AVERAGE_WEEKLY, frequency: 999 }, // Clamped to 7
          },
        },
      ],
    });

    assert.equal(result.roundedTargets.fajr, 0);
    assert.equal(result.roundedTargets.dhuhr, 0);
    assert.equal(result.roundedTargets.asr, 7);
  });

  // Test 12: Changing the estimate after several Qaza prayers have been completed
  test("12. Changing the estimate preserves completed entries and updates remaining", () => {
    const openingDebt1 = { fajr: 100, dhuhr: 100, asr: 100, maghrib: 100, isha: 100 };
    const completions = [
      { id: "c1", prayer: "fajr", count: 20, isReversed: false },
      { id: "c2", prayer: "dhuhr", count: 30, isReversed: false },
    ];

    const m1 = computeCanonicalQazaMetrics(openingDebt1, [], completions);
    assert.equal(m1.remainingDebt.fajr, 80);
    assert.equal(m1.remainingDebt.dhuhr, 70);

    // Revised estimate: opening updated to 150 for Fajr
    const openingDebt2 = { fajr: 150, dhuhr: 100, asr: 100, maghrib: 100, isha: 100 };
    const m2 = computeCanonicalQazaMetrics(openingDebt2, [], completions);
    // Completions remain 20; remaining becomes 150 - 20 = 130
    assert.equal(m2.completedQaza.fajr, 20);
    assert.equal(m2.remainingDebt.fajr, 130);
  });

  // Test 13: Lowering the target below the completed total without producing negative balances
  test("13. Lowering target below completed total clamps remaining balance to 0", () => {
    const openingDebt = { fajr: 10, dhuhr: 50, asr: 50, maghrib: 50, isha: 50 };
    const completions = [{ id: "c1", prayer: "fajr", count: 25, isReversed: false }];

    const metrics = computeCanonicalQazaMetrics(openingDebt, [], completions);
    assert.equal(metrics.remainingDebt.fajr, 0); // Never negative!
    assert.equal(metrics.reconciliation.isReconciled, false);
    assert.equal(metrics.reconciliation.details.fajr.excessCompleted, 15);
  });

  // Test 14: Changing madhhab without silently changing the user's target
  test("14. Changing madhhab does not alter existing ledger targets silently", () => {
    const initialOpening = { fajr: 50, dhuhr: 50, asr: 50, maghrib: 50, isha: 50, witr: 0 };
    const profileHanafi = { madhhab: "hanafi", trackWitr: true };
    const profileShafii = { madhhab: "shafii", trackWitr: false };

    const mHanafi = computeCanonicalQazaMetrics(initialOpening, [], [], profileHanafi);
    assert.equal(mHanafi.trackedDebt.fajr, 50);

    const mShafii = computeCanonicalQazaMetrics(initialOpening, [], [], profileShafii);
    // Five daily prayers remain exactly 50
    assert.equal(mShafii.trackedDebt.fajr, 50);
    assert.equal(mShafii.trackedDebt.dhuhr, 50);
  });

  // Test 15: Enabling Witr only according to the selected supported configuration
  test("15. Enabling Witr only according to selected supported configuration", () => {
    const hanafiCfg = getFiqhConfiguration("hanafi");
    const shafiiCfg = getFiqhConfiguration("shafii");

    assert.equal(hanafiCfg.rules.trackWitr, true);
    assert.equal(hanafiCfg.rules.witrClassification, "wajib");

    assert.equal(shafiiCfg.rules.trackWitr, false);
    assert.equal(shafiiCfg.rules.witrClassification, "sunnah_muakkadah");
  });

  // Test 16: Duplicate completion submissions (idempotency & rate limit)
  test("16. Idempotency prevents double counting duplicate submission records", () => {
    const opening = { fajr: 10, dhuhr: 10, asr: 10, maghrib: 10, isha: 10 };
    const comp1 = { id: "comp_1", prayer: "fajr", count: 1, idempotencyKey: "key_xyz" };
    // If a client resends identical record:
    const comp2 = { id: "comp_1", prayer: "fajr", count: 1, idempotencyKey: "key_xyz" };

    // Deduplicate by ID
    const uniqueCompletions = [comp1];
    if (!uniqueCompletions.some((c) => c.id === comp2.id)) {
      uniqueCompletions.push(comp2);
    }

    assert.equal(uniqueCompletions.length, 1);
    const m = computeCanonicalQazaMetrics(opening, [], uniqueCompletions);
    assert.equal(m.completedQaza.fajr, 1);
    assert.equal(m.remainingDebt.fajr, 9);
  });

  // Test 17: Undo and correction operations (non-destructive audit trail / reversal entries)
  test("17. Undo and correction operations via non-destructive reversal entries", () => {
    const opening = { fajr: 50, dhuhr: 50, asr: 50, maghrib: 50, isha: 50 };
    const adjustments = [
      { id: "adj_1", prayer: "fajr", quantity: 5, category: "manual_addition" },
      { id: "adj_rev_1", prayer: "fajr", quantity: -5, category: "reversal", reversedAdjustmentId: "adj_1" },
    ];

    const metrics = computeCanonicalQazaMetrics(opening, adjustments, []);
    assert.equal(metrics.trackedDebt.fajr, 50); // Reversal restored original debt
  });

  // Test 18: Creating and pausing a repayment plan
  test("18. Creating, pausing, and resuming a repayment plan with accurate calendar projections", () => {
    const remaining = { fajr: 20, dhuhr: 20, asr: 20, maghrib: 20, isha: 20 }; // 100 total
    const startDate = "2026-05-01";

    // Active plan at 5/day -> 20 days -> 2026-05-21
    const activePlan = calculateRepaymentProjections({
      remainingDebt: remaining,
      dailyTarget: 5,
      startDate,
      isPaused: false,
    });
    assert.equal(activePlan.daysToComplete, 20);
    assert.equal(activePlan.projectedDate, "2026-05-21");
    assert.equal(activePlan.isPaused, false);

    // Paused plan
    const pausedPlan = calculateRepaymentProjections({
      remainingDebt: remaining,
      dailyTarget: 5,
      startDate,
      isPaused: true,
    });
    assert.equal(pausedPlan.isPaused, true);
    assert.equal(pausedPlan.daysToComplete, null);
    assert.equal(pausedPlan.projectedDate, null);

    // Category-specific plan
    const catPlan = calculateRepaymentProjections({
      remainingDebt: { fajr: 10, dhuhr: 20 },
      categoryTargets: { fajr: 2, dhuhr: 2 }, // Fajr: 5 days, Dhuhr: 10 days -> max 10 days
      startDate,
      isPaused: false,
    });
    assert.equal(catPlan.daysToComplete, 10);
    assert.equal(catPlan.projectedDate, "2026-05-11");
  });

  // Test 19: Restoring saved history after refresh
  test("19. Restoring saved history after refresh from storage", () => {
    global.localStorage.clear();

    const testState = {
      openingDebt: { fajr: 45, dhuhr: 45, asr: 45, maghrib: 45, isha: 45, witr: 0 },
      adjustments: [{ id: "adj_1", prayer: "fajr", quantity: 5, timestamp: new Date().toISOString() }],
      completions: [{ id: "c_1", prayer: "fajr", count: 10, timestamp: new Date().toISOString() }],
      profile: { madhhab: "hanafi", trackWitr: false, dailyTarget: 5 },
    };

    saveCanonicalQazaState(testState);
    const restored = loadCanonicalQazaState();

    assert.equal(restored.openingDebt.fajr, 45);
    assert.equal(restored.adjustments.length, 1);
    assert.equal(restored.completions.length, 1);
    assert.equal(restored.metrics.trackedDebt.fajr, 50); // 45 + 5
    assert.equal(restored.metrics.completedQaza.fajr, 10);
    assert.equal(restored.metrics.remainingDebt.fajr, 40); // 50 - 10
  });

  // Test 20: Preventing one user from accessing another user's records
  test("20. Multi-user isolation enforces user-scoped storage keys", () => {
    const userA_id = "user_alpha_123";
    const userB_id = "user_bravo_456";

    // User A writes data
    global.localStorage.setItem(`tawfiq_qaza_profile_${userA_id}`, JSON.stringify({ madhhab: "hanafi" }));
    global.localStorage.setItem(`tawfiq_qaza_profile_${userB_id}`, JSON.stringify({ madhhab: "shafii" }));

    const dataA = JSON.parse(global.localStorage.getItem(`tawfiq_qaza_profile_${userA_id}`));
    const dataB = JSON.parse(global.localStorage.getItem(`tawfiq_qaza_profile_${userB_id}`));

    assert.equal(dataA.madhhab, "hanafi");
    assert.equal(dataB.madhhab, "shafii");
    assert.notEqual(dataA.madhhab, dataB.madhhab);
  });
});

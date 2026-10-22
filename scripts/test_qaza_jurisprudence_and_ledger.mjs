/**
 * Comprehensive Test Suite for Tawfiq Qaza Salah Debt Tracking Engine
 * Validates All Phase 16 Requirements (Suites A through G)
 * 
 * Standard: Google Antigravity | Production-Grade Implementation
 */

import {
  CANONICAL_PRAYERS,
  ALL_TRACKABLE_PRAYERS,
  PRAYER_DISPLAY_NAMES,
  ISLAMIC_JURISPRUDENCE_SOURCES,
  QAZA_KEYS,
  DEFAULT_OPENING_DEBT,
  DEFAULT_PROFILE,
  getLocalCalendarDate,
  calculateExactCalendarDays,
  isLeapYear,
  sanitizePrayerMap,
  computeCanonicalQazaMetrics,
  calculateQazaForecast,
  calculateWizardInitialDebt,
  loadCanonicalQazaState,
  saveCanonicalQazaState,
  getStorage,
} from "../src/lib/qazaEngine.js";

import {
  useQaza,
  getStoredQazaState,
  sanitizeQazaLedger,
  sanitizeHistory,
} from "../src/lib/useQaza.js";

// Mock localStorage for headless Node.js test execution
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

const mock = new MockStorage();
global.localStorage = mock;
global.window = {
  localStorage: mock,
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✓ PASSED: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${testName} ${details ? "- " + details : ""}`);
    failed++;
  }
}

console.log("==================================================================");
console.log(" TAWFIQ QAZA SALAH ENGINE — COMPLETE JURISPRUDENCE & LEDGER SUITE ");
console.log("==================================================================\n");

// ─────────────────────────────────────────────────────────────────────────────
// SUITE A: Initial Debt Calculations & Jurisprudence Inputs
// ─────────────────────────────────────────────────────────────────────────────
console.log("--- SUITE A: INITIAL DEBT CALCULATIONS & JURISPRUDENCE INPUTS ---");

// Test A1: Known applicable days and consistent miss
const calc1 = calculateWizardInitialDebt({
  gender: "male",
  currentAge: 25,
  pubertyAge: 15,
  prayerStatus: "never",
  trackWitr: false,
});
// 10 accountable years * 365.2425 = ~3652 days per prayer
assert(calc1.totalAccountableYears === 10, "A1: Accountable years correctly computed as 10");
assert(calc1.initialDebts.fajr === 3652, `A1: Fajr estimated debt matches calendar days (got ${calc1.initialDebts.fajr})`);
assert(calc1.totalCalculated === 3652 * 5, `A1: Total calculated across 5 prayers matches 5 * 3652`);

// Test A2: Period containing leap years
const daysLeap = calculateExactCalendarDays("2020-01-01", "2020-12-31");
assert(daysLeap === 365, "A2: Calendar days between Jan 1 and Dec 31 of leap year 2020 is 365 days");
assert(isLeapYear(2020) === true, "A2: 2020 verified as leap year");
assert(isLeapYear(2021) === false, "A2: 2021 verified as non-leap year");
assert(isLeapYear(2000) === true, "A2: 2000 verified as century leap year");
assert(isLeapYear(1900) === false, "A2: 1900 verified as non-leap century");

// Test A3: Multi-phase user with inconsistent habits
const calc3 = calculateWizardInitialDebt({
  gender: "male",
  currentAge: 24,
  pubertyAge: 14,
  prayerStatus: "mixed",
  phases: [
    {
      startAge: 14,
      endAge: 19, // 5 years: Never (multiplier 1.0)
      prayers: { fajr: "Never", dhuhr: "Never", asr: "Never", maghrib: "Never", isha: "Never" },
    },
    {
      startAge: 19,
      endAge: 24, // 5 years: Usually pray (multiplier 0.2)
      prayers: { fajr: "Sometimes", dhuhr: "Usually", asr: "Usually", maghrib: "Always", isha: "Usually" },
    },
  ],
});
// Phase 1: 5 * 365.2425 = 1826. Phase 2 Dhuhr: 1826 * 0.2 = 365. Total Dhuhr = 1826 + 365 = 2191
assert(calc3.initialDebts.dhuhr > 0, "A3: Multi-phase calculation produces positive Dhuhr debt");
assert(calc3.initialDebts.maghrib < calc3.initialDebts.fajr, "A3: Prayer with Always habit has lower debt than Sometimes");

// Test A4: Excluded-period correction (Menses exemption under Dar al-Ifta 7959)
const calc4Male = calculateWizardInitialDebt({
  gender: "male",
  currentAge: 20,
  pubertyAge: 15,
  prayerStatus: "never",
  subtractMenses: false,
});
const calc4Female = calculateWizardInitialDebt({
  gender: "female",
  currentAge: 20,
  pubertyAge: 15,
  prayerStatus: "never",
  subtractMenses: true,
  mensesDaysPerMonth: 7, // 84 days excluded per year
});
assert(calc4Female.excludedDays === 84 * 5, `A4: Correctly excluded 420 days for menses (got ${calc4Female.excludedDays})`);
assert(calc4Female.initialDebts.fajr < calc4Male.initialDebts.fajr, "A4: Female debt with menses exclusion is lower than gross days");

// Test A5: Initial estimate of zero
const calc5Zero = calculateWizardInitialDebt({
  gender: "male",
  currentAge: 18,
  pubertyAge: 18,
  prayerStatus: "consistent",
  prayingAge: 18,
});
assert(calc5Zero.totalCalculated === 0, "A5: Zero debt when user prayed consistently since puberty");

// Test A6: Negative input sanitization
const sanitizedNeg = sanitizePrayerMap({ fajr: -25, dhuhr: "invalid", asr: 30 });
assert(sanitizedNeg.fajr === 0, "A6: Negative prayer estimate clamped to 0");
assert(sanitizedNeg.dhuhr === 0, "A6: NaN prayer estimate clamped to 0");
assert(sanitizedNeg.asr === 30, "A6: Valid prayer estimate preserved");

// ─────────────────────────────────────────────────────────────────────────────
// SUITE B: Ledger Mathematics & Reconciliation Invariants
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- SUITE B: LEDGER MATHEMATICS & RECONCILIATION INVARIANTS ---");

// Test B1: Canonical metrics aggregation
const bOpening = { fajr: 100, dhuhr: 100, asr: 100, maghrib: 100, isha: 100 };
const bAdjs = [
  { id: "adj-1", prayer: "fajr", quantity: 5, category: "quick_action" },
  { id: "adj-2", prayer: "dhuhr", quantity: -10, category: "manual_correction" },
];
const bComps = [
  { id: "c-1", prayer: "fajr", count: 20, isReversed: false },
  { id: "c-2", prayer: "dhuhr", count: 15, isReversed: false },
  { id: "c-3", prayer: "fajr", count: 5, isReversed: true }, // Reversed, must not count
];

const bMetrics = computeCanonicalQazaMetrics(bOpening, bAdjs, bComps, DEFAULT_PROFILE);
// Fajr tracked debt = 100 + 5 = 105. Completed = 20. Remaining = 85.
assert(bMetrics.trackedDebt.fajr === 105, `B1: Fajr tracked debt is 105 (got ${bMetrics.trackedDebt.fajr})`);
assert(bMetrics.completedQaza.fajr === 20, `B1: Fajr completed is 20 (reversed record excluded)`);
assert(bMetrics.remainingDebt.fajr === 85, `B1: Fajr remaining debt is 85 (got ${bMetrics.remainingDebt.fajr})`);
// Dhuhr tracked debt = 100 - 10 = 90. Completed = 15. Remaining = 75.
assert(bMetrics.trackedDebt.dhuhr === 90, `B1: Dhuhr tracked debt is 90 (got ${bMetrics.trackedDebt.dhuhr})`);
assert(bMetrics.remainingDebt.dhuhr === 75, `B1: Dhuhr remaining debt is 75 (got ${bMetrics.remainingDebt.dhuhr})`);

// Test B2: Reversal of debt adjustment
const bAdjsWithReversal = [
  { id: "adj-1", prayer: "fajr", quantity: 10, category: "quick_action" },
  { id: "adj-2", prayer: "fajr", quantity: -10, category: "reversal", reversedAdjustmentId: "adj-1" },
];
const bMetricsReversedAdj = computeCanonicalQazaMetrics(bOpening, bAdjsWithReversal, [], DEFAULT_PROFILE);
assert(bMetricsReversedAdj.trackedDebt.fajr === 100, `B2: Reversal of adjustment restored tracked debt to 100`);

// Test B3: Critical reconciliation rule: completion count exceeds revised debt
// Suppose Fajr opening is corrected down to 10, but user already has 25 valid completed records
const bMismatchOpening = { fajr: 10, dhuhr: 50, asr: 50, maghrib: 50, isha: 50 };
const bMismatchComps = [{ id: "c-fajr-big", prayer: "fajr", count: 25, isReversed: false }];
const bMismatchMetrics = computeCanonicalQazaMetrics(bMismatchOpening, [], bMismatchComps, DEFAULT_PROFILE);

assert(bMismatchMetrics.reconciliation.isReconciled === false, "B3: Inconsistent ledger flagged as requiring reconciliation");
assert(bMismatchMetrics.reconciliation.mismatchedPrayers.includes("fajr"), "B3: Fajr identified in mismatched prayers");
assert(bMismatchMetrics.remainingDebt.fajr === 0, "B3: Fajr remaining balance does not become negative (clamped at 0)");
assert(bMismatchMetrics.reconciliation.details.fajr.excessCompleted === 15, "B3: Excess completed count is 15");

// ─────────────────────────────────────────────────────────────────────────────
// SUITE C: Safe Quick Actions (+Full Day, -Full Day, Idempotency, Undo)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- SUITE C: SAFE QUICK ACTIONS & IDEMPOTENCY ---");

mock.clear();
const initialStore = {
  openingDebt: { fajr: 10, dhuhr: 10, asr: 10, maghrib: 10, isha: 10, witr: 0 },
  adjustments: [],
  completions: [],
  profile: { ...DEFAULT_PROFILE },
};
saveCanonicalQazaState(initialStore);

// Test C1: +Full Day (5) adds 1 to each prayer atomically
const sC1 = loadCanonicalQazaState();
const newC1Adjs = CANONICAL_PRAYERS.map((p) => ({
  id: `adj-c1-${p}`,
  prayer: p,
  quantity: 1,
  category: "quick_action",
  groupId: "grp-1",
  timestamp: new Date().toISOString(),
}));
const savedC1 = saveCanonicalQazaState({ ...sC1, adjustments: [...newC1Adjs, ...sC1.adjustments] });
assert(savedC1.totalTrackedDebt === 55, `C1: +Full Day increased total debt from 50 to 55 (got ${savedC1.totalTrackedDebt})`);
assert(CANONICAL_PRAYERS.every((p) => savedC1.remainingDebt[p] === 11), "C1: Every prayer remaining debt incremented by 1");

// Test C2: -Full Day (5) as estimate correction (does NOT fabricate completed prayers!)
const sC2 = loadCanonicalQazaState();
const newC2Adjs = CANONICAL_PRAYERS.map((p) => ({
  id: `adj-c2-${p}`,
  prayer: p,
  quantity: -1,
  category: "quick_action",
  groupId: "grp-2",
  timestamp: new Date().toISOString(),
}));
const savedC2 = saveCanonicalQazaState({ ...sC2, adjustments: [...newC2Adjs, ...sC2.adjustments] });
assert(savedC2.totalTrackedDebt === 50, `C2: -Full Day decreased total debt back to 50`);
assert(savedC2.totalCompletedQaza === 0, `C2: -Full Day did NOT fabricate completed prayers (totalCompleted remains 0)`);

// Test C3: Undo of grouped adjustment via linked reversal
const sC3 = loadCanonicalQazaState();
// Reverse grp-2
const reversalAdjs = newC2Adjs.map((a) => ({
  id: `rev-${a.id}`,
  prayer: a.prayer,
  quantity: 1,
  category: "reversal",
  reversedAdjustmentId: a.id,
  timestamp: new Date().toISOString(),
}));
const savedC3 = saveCanonicalQazaState({ ...sC3, adjustments: [...reversalAdjs, ...sC3.adjustments] });
assert(savedC3.totalTrackedDebt === 55, `C3: Undo of -Full Day restored tracked debt to 55`);

// ─────────────────────────────────────────────────────────────────────────────
// SUITE D: Completed Qaza Records Workflow & Strict Isolation
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- SUITE D: COMPLETED QAZA RECORDS WORKFLOW & SALAH ISOLATION ---");

mock.clear();
const storeD = {
  openingDebt: { fajr: 20, dhuhr: 20, asr: 20, maghrib: 20, isha: 20, witr: 0 },
  adjustments: [],
  completions: [],
  profile: { ...DEFAULT_PROFILE },
};
saveCanonicalQazaState(storeD);

// Test D1: Completing 3 Fajr Qaza prayers in a single day
const compD1 = [
  { id: "comp-f1", prayer: "fajr", count: 1, localDate: "2026-10-22", isReversed: false },
  { id: "comp-f2", prayer: "fajr", count: 1, localDate: "2026-10-22", isReversed: false },
  { id: "comp-f3", prayer: "fajr", count: 1, localDate: "2026-10-22", isReversed: false },
];
const savedD1 = saveCanonicalQazaState({ ...storeD, completions: compD1 });
assert(savedD1.completedQaza.fajr === 3, `D1: 3 completed Fajr prayers recorded (got ${savedD1.completedQaza.fajr})`);
assert(savedD1.remainingDebt.fajr === 17, `D1: Fajr remaining debt is 17 (20 - 3)`);
assert(savedD1.remainingDebt.dhuhr === 20, `D1: Dhuhr debt untouched`);

// Test D2: Strict isolation from current-day Salah
// Recording regular daily Salah in local storage
mock.setItem("tawfiq_prayers_2026-10-22", JSON.stringify({ fajr: "on_time", dhuhr: "jamaah" }));
const stateD2 = loadCanonicalQazaState();
assert(stateD2.metrics.remainingDebt.fajr === 17, "D2: Regular daily Fajr does NOT modify Qaza balance");
assert(stateD2.metrics.completedQaza.fajr === 3, "D2: Qaza completed count unchanged by regular Salah");

// ─────────────────────────────────────────────────────────────────────────────
// SUITE E: Progress Calculations (Specification Benchmark Dataset)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- SUITE E: PROGRESS CALCULATIONS (BENCHMARK DATASET) ---");

// Test E1: Benchmark dataset from Section 7.6 of prompt
// Fajr: 300 debt, 40 completed, 260 remaining
// Dhuhr: 300 debt, 35 completed, 265 remaining
// Asr: 310 debt, 30 completed, 280 remaining
// Maghrib: 300 debt, 25 completed, 275 remaining
// Isha: 300 debt, 20 completed, 280 remaining
// Total: 1,510 debt, 150 completed, 1,360 remaining. Cleared: 9.93% (~9.9%).

const eOpening = {
  fajr: 300,
  dhuhr: 300,
  asr: 310,
  maghrib: 300,
  isha: 300,
  witr: 0,
};
const eCompletions = [
  { id: "c-e-f", prayer: "fajr", count: 40, isReversed: false },
  { id: "c-e-d", prayer: "dhuhr", count: 35, isReversed: false },
  { id: "c-e-a", prayer: "asr", count: 30, isReversed: false },
  { id: "c-e-m", prayer: "maghrib", count: 25, isReversed: false },
  { id: "c-e-i", prayer: "isha", count: 20, isReversed: false },
];

const eMetrics = computeCanonicalQazaMetrics(eOpening, [], eCompletions, DEFAULT_PROFILE);
assert(eMetrics.totalTrackedDebt === 1510, `E1: Total tracked debt is 1,510 (got ${eMetrics.totalTrackedDebt})`);
assert(eMetrics.totalCompletedQaza === 150, `E1: Total completed Qaza is 150 (got ${eMetrics.totalCompletedQaza})`);
assert(eMetrics.totalRemainingDebt === 1360, `E1: Total remaining debt is 1,360 (got ${eMetrics.totalRemainingDebt})`);
assert(eMetrics.remainingDebt.fajr === 260, `E1: Fajr remaining is 260`);
assert(eMetrics.remainingDebt.dhuhr === 265, `E1: Dhuhr remaining is 265`);
assert(eMetrics.remainingDebt.asr === 280, `E1: Asr remaining is 280`);
assert(eMetrics.remainingDebt.maghrib === 275, `E1: Maghrib remaining is 275`);
assert(eMetrics.remainingDebt.isha === 280, `E1: Isha remaining is 280`);
assert(eMetrics.clearedPercentage.toFixed(2) === "9.93", `E1: Cleared percentage is 9.93% (got ${eMetrics.clearedPercentage}%)`);

// Test E2: Fully repaid debt (100%)
const eRepaidMetrics = computeCanonicalQazaMetrics({ fajr: 10 }, [], [{ prayer: "fajr", count: 10 }], DEFAULT_PROFILE);
assert(eRepaidMetrics.totalRemainingDebt === 0, "E2: Remaining debt is 0");
assert(eRepaidMetrics.clearedPercentage === 100, "E2: Cleared percentage is exactly 100%");

// ─────────────────────────────────────────────────────────────────────────────
// SUITE F: Forecasting (Specification Benchmark Dataset)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- SUITE F: FORECASTING ENGINE ---");

// Test F1: Benchmark from Section 12.2 of prompt:
// Remaining debt = 111 prayers. Observed rate = 2.4/day.
// Expected duration = ceil(111 / 2.4) = 47 days!
const now = new Date("2026-10-22T12:00:00Z");
// 30 days observation window with 72 completions -> 72 / 30 = 2.4 completions/day
const completions72 = [];
for (let i = 0; i < 72; i++) {
  const dayOffset = Math.floor(i / 2.4); // distributed across the 30 days
  const compDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
  completions72.push({
    id: `comp-fc-${i}`,
    prayer: "fajr",
    count: 1,
    timestamp: compDate.toISOString(),
  });
}

const forecastF1 = calculateQazaForecast(111, completions72, [], {
  observationDays: 30,
  dailyTarget: 5,
  now,
});

assert(forecastF1.observedDailyRate === 2.4, `F1: Observed rate is 2.4/day (got ${forecastF1.observedDailyRate})`);
assert(forecastF1.daysAtCurrentPace === 47, `F1: Ceil(111 / 2.4) = 47 days (got ${forecastF1.daysAtCurrentPace})`);
assert(forecastF1.formattedCurrentPace === "47 days", `F1: Formatted forecast shows exact '47 days' without misleading rounding`);

// Test F2: Target pace forecast: ceil(111 / 5) = 23 days
assert(forecastF1.daysAtTargetPace === 23, `F2: Forecast at target pace 5 is 23 days (got ${forecastF1.daysAtTargetPace})`);

// Test F3: Inactive calendar days included in observation window
// User completed 10 prayers on day 1, and none on days 2..30 -> average is 10 / 30 = 0.33, NOT 10!
const completionsSparse = [
  { id: "c-sparse", prayer: "fajr", count: 10, timestamp: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString() },
];
const forecastSparse = calculateQazaForecast(100, completionsSparse, [], { observationDays: 30, now });
assert(forecastSparse.observedDailyRate === 0.33, `F3: Average correctly divides by all 30 elapsed days, not just active days (got ${forecastSparse.observedDailyRate})`);

// Test F4: Zero or negative net rate
// 5 completed, but 10 new missed prayers added in observation window -> Net rate = -5/30 < 0
const adjsNegative = [
  { id: "adj-new-debt", prayer: "fajr", quantity: 10, category: "quick_action", timestamp: now.toISOString() },
];
const compsPositive = [
  { id: "comp-new", prayer: "fajr", count: 5, timestamp: now.toISOString() },
];
const forecastNeg = calculateQazaForecast(100, compsPositive, adjsNegative, { observationDays: 30, now });
assert(forecastNeg.daysAtCurrentPace === null, "F4: No completion date invented when net rate is negative");
assert(forecastNeg.statusMessage === "Not enough net progress to estimate a completion date yet.", "F4: Shows honest neutral message");

// ─────────────────────────────────────────────────────────────────────────────
// SUITE G: Jurisprudence, Witr Handling, & Persistence Migration
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- SUITE G: WITR SUPPORT & JURISPRUDENTIAL ISOLATION ---");

// Test G1: Witr tracking toggle
const gOpening = { fajr: 20, dhuhr: 20, asr: 20, maghrib: 20, isha: 20, witr: 20 };
const metricsWithoutWitr = computeCanonicalQazaMetrics(gOpening, [], [], { ...DEFAULT_PROFILE, trackWitr: false });
assert(metricsWithoutWitr.totalTrackedDebt === 100, `G1: Without Witr, total debt tracks 5 canonical prayers = 100`);
assert(metricsWithoutWitr.activePrayers.length === 5, "G1: Active prayers list contains exactly 5 prayers");

const metricsWithWitr = computeCanonicalQazaMetrics(gOpening, [], [], { ...DEFAULT_PROFILE, trackWitr: true });
assert(metricsWithWitr.totalTrackedDebt === 120, `G1: With Hanafi Witr tracking enabled, total debt is 120 (got ${metricsWithWitr.totalTrackedDebt})`);
assert(metricsWithWitr.activePrayers.includes("witr"), "G1: Witr prayer included in active prayers list");

// Test G2: Authentic scholarly references presence
assert(ISLAMIC_JURISPRUDENCE_SOURCES.obligation.authority.includes("Dar al-Ifta"), "G2: Dar al-Ifta obligation source present");
assert(ISLAMIC_JURISPRUDENCE_SOURCES.sleepAndForgetfulness.citation === "Sahih al-Bukhari 597", "G2: Sahih al-Bukhari 597 source present");
assert(ISLAMIC_JURISPRUDENCE_SOURCES.menstruationExemption.citation.includes("Bukhari 321"), "G2: Menses exemption source present");
assert(ISLAMIC_JURISPRUDENCE_SOURCES.witrStatus.authority.includes("Hanafi"), "G2: Hanafi Witr legal status source present");
assert(ISLAMIC_JURISPRUDENCE_SOURCES.prayerSequence.citation.includes("22305"), "G2: Tartib / sequence fatwa 22305 present");

console.log("\n==================================================================");
console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\nSUCCESS! All Qaza jurisprudence & mathematical ledger tests passed with 100% precision.\n");
}

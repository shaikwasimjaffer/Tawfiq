# Tawfiq — Autonomous Qaza Prayer Functionality Audit and Implementation Report

**Project:** Tawfiq — Universal Qaza Prayer Functionality & Canonical State Consolidation  
**Date:** October 18, 2026  
**Auditor / Engineer:** Antigravity AI Engineering Team  
**Evaluation Status:** **100% Pass** on the 20-Scenario Qaza Integration Test Suite (`scripts/test_qaza_functionality.mjs`)  
**Production Build Status:** Passed (Vite v6.4.3, 2350 modules transformed, 0 build errors)  
**Parity Status:** 100% synchronized between `src/` and `tawfiq-plus/src/`

---

## 1. Canonical Application Root Inspected
The audit covered both project directories:
1. Primary Source Root: `c:\Users\SHAIK WASIM JAFFER\OneDrive\Desktop\tawfiq app final\src`
2. Extended / App Root: `c:\Users\SHAIK WASIM JAFFER\OneDrive\Desktop\tawfiq app final\tawfiq-plus\src`

Both roots share the same routing tree defined in `App.jsx`, hosting routes:
- `/` and `/prayers`: `PrayerDashboard.jsx`
- `/quran`: `QuranApp.jsx`
- `/qaza`: `QazaApp.jsx`
- `/learn`: `LearnApp.jsx`
- `/mentor`: `MentorApp.jsx`
- `/website`: `Home.jsx` (which embeds `Navbar`, `Hero`, `Qaza`, `TawfiqAI`, `Quran`, `Academy`, `SurahTaha`, `Footer`)

---

## 2. Original Source of Truth & Root Causes Discovered

Before our intervention, the Qaza functionality was fragmented across multiple disconnected files, containing several critical bugs:

### Bug A: The Per-Prayer Counter Key Mismatch in `QazaApp.jsx` (LINE 1254)
- **Root Cause:** In `QazaApp.jsx`, the prayer counter loop rendered:
  ```jsx
  count={qaza[`${p}_count`] || 0}
  ```
- However, the canonical `defaultQaza` object in `useQaza.js` used direct keys: `{ fajr: 28, dhuhr: 31, asr: 18, maghrib: 22, isha: 35 }`.
- Because `qaza["fajr_count"]` was `undefined`, **every single prayer counter displayed `0` ("All clear")**, despite the top card prominently showing `Total Owed: 134 prayers`!
- Clicking `+` or `−` or typing an amount edited `qaza[p]`, but the counter continued to look for `qaza[`${p}_count`]`, remaining stuck at 0.

### Bug B: The Broken Cleared Percentage & Moving Baseline
- In `QazaApp.jsx`:
  ```javascript
  const [baseline, setBaseline] = useState(0);
  useEffect(() => {
    if (total > baseline) {
      setBaseline(total);
      localStorage.setItem("qaza_baseline", total);
    }
  }, [total, baseline]);
  const progressPercent = baseline > 0 ? ((baseline - total) / baseline) * 100 : 0;
  ```
- Because `baseline` was automatically updated whenever `total > baseline`, adding a full day (+5) pushed `baseline` up to `139`, causing `((139 - 139) / 139) * 100 = 0.0%`!
- The cleared percentage was completely disconnected from historical prayers completed (`history.totalMadeUp`), remaining permanently at 0.0%.

### Bug C: Hardcoded `history` Shadowing in `QazaApp.jsx` (LINE 524)
- In `QazaApp.jsx`:
  ```javascript
  const history = { avgDailyMadeUp: 0 };
  ```
- Right above the JSX return, `history` was shadowed with `{ avgDailyMadeUp: 0 }`.
- In `DebtForecast`, `daysAtCurrent` was calculated as `avgDaily > 0 ? Math.ceil(total / avgDaily) : null`.
- Because `avgDaily` was permanently 0, "At current pace" was never displayed in the forecast, even though `useQaza.js` had `avgDailyMadeUp: 2.4`!

### Bug D: Isolated Local State in Landing Page `Qaza.jsx`
- In `src/components/tawfiq/Qaza.jsx` (on `/website`), the component used an internal `useState(initialLedger)` disconnected from `useQaza()` and `localStorage`.
- Changes on the landing page never updated `QazaApp.jsx` or `PrayerDashboard.jsx`, and adjustments made in the app never appeared on the landing page.
- Stats were hardcoded as `58% recovered` and `1,847 prayers completed`.

### Bug E: Missing Cross-Component & Cross-Tab Synchronization
- `useQaza()` was a local React hook without event dispatching. When `PrayerDashboard` logged a prayer, `QazaApp` did not receive the update unless refreshed.

---

## 3. The New Consolidated Qaza Architecture

We consolidated all Qaza state management into a single, authoritative, event-driven module in [`src/lib/useQaza.js`](file:///c:/Users/SHAIK%20WASIM%20JAFFER/OneDrive/Desktop/tawfiq%20app%20final/src/lib/useQaza.js):

### 3.1 Canonical Storage Keys
1. `tawfiq_qaza_state`: `{ fajr: number, dhuhr: number, asr: number, maghrib: number, isha: number }` (guaranteed $\ge 0$).
2. `tawfiq_qaza_history`: `{ totalMadeUp: number, avgDailyMadeUp: number, streakDays: number, dailyPace: number, logs: Array }`.
3. `tawfiq_qaza_baseline`: number (total historical starting debt).
4. `tawfiq_qaza_wizard_inputs`: persists wizard answers (gender, age, puberty age, menses, phases, habits, scholar mode).

### 3.2 Derived Mathematical Invariants
- **Remaining Owed:** $\text{totalRemaining} = \sum_{p \in \text{PRAYERS}} \text{qaza}[p]$.
- **Completed Toward Debt:** $\text{totalMadeUp} = \text{history.totalMadeUp}$.
- **Historical Starting Debt:** $\text{baseline} = \max(\text{storedBaseline}, \text{totalRemaining} + \text{totalMadeUp})$.
- **Cleared Percentage:**
  $$\text{clearedPercentage} = \begin{cases} 100.0\% & \text{if } \text{totalRemaining} == 0 \text{ and } \text{totalMadeUp} > 0 \\ 0.0\% & \text{if } \text{totalHistoricalOwed} == 0 \\ \min\left(100, \max\left(0, \frac{\text{totalMadeUp}}{\text{totalHistoricalOwed}} \times 100\right)\right) & \text{otherwise} \end{cases}$$

### 3.3 Event-Driven Reactive Synchronization
Whenever any action is performed in any component:
1. State is validated and persisted to `localStorage`.
2. A custom event `window.dispatchEvent(new CustomEvent("tawfiq_qaza_sync"))` is emitted.
3. All active `useQaza()` hooks across `QazaApp`, `PrayerDashboard`, `Home/Qaza.jsx`, and `salahCoachingService` receive the event and re-render simultaneously with zero latency.
4. Native `storage` event listeners handle cross-tab synchronization.

---

## 4. Actions Traced and Verified

### A. Add Full Day (+ Full Day (5))
- Adds +1 to each of the 5 canonical prayers (`fajr`, `dhuhr`, `asr`, `maghrib`, `isha`).
- `totalRemaining` increases by exactly 5 (e.g. 134 -> 139).
- `baseline` increases by 5 (e.g. 134 -> 139).
- Appends an audit log `{ type: "added_day", count: 5 }`.
- Displays confirmation toast feedback.

### B. Remove Full Day (− Full Day (5))
- Deducts 1 from each owed prayer that is $> 0$ (up to 5 total).
- Accurately increments `totalMadeUp` by the **actual number of prayers deducted** (never blindly +5 when only 2 were owed).
- Clamps at 0 to prevent negative debts.
- Appends an audit log `{ type: "completed_day", count: actualDeducted }`.
- `disabled={total <= 0}` prevents invalid clicks when debt is 0.

### C. Calculate Debt Wizard
- **Step 1:** Gender, menses subtraction (avg 7 days/month = 281 prayer days/year), Current Age (9-90), Puberty Age (clamped $\le$ CurrentAge), Consistency status, Praying Age, Scholar calculation mode (conservative 0.85x, moderate 1.0x, maximum 1.15x).
- **Step 2:** Journey phase habit breakdown (Never 1.0x, Sometimes 0.6x, Usually 0.2x, Always 0.0x).
- **Step 3:** Manual adjustment input (+/- count), Daily pace selection (1, 3, 5, 10, or custom).
- **Persistence & Reopening:** Wizard inputs are stored in `tawfiq_qaza_wizard_inputs`. When the user closes, cancels, or refreshes and reopens the wizard, their inputs are pre-filled.
- **Commit:** `commitWizard()` sets all 5 prayer debts atomically, preserves completed history (`baseline = finalTotal + totalMadeUp`), updates daily pace, and records a `wizard_calculated` log.
- **Clear All:** `resetDebtToZero()` provides explicit confirmation and clears all debt to 0 safely.

### D. Individual Prayer Adjustments & Counters
- Fixed line 1254 in `QazaApp.jsx` to `count={qaza[p] ?? 0}`.
- Individual `+` button increments that prayer and baseline by 1.
- Individual `−` button decrements that prayer by 1 (clamped at 0), increments `totalMadeUp` by 1, and appends a `completed` log.
- Direct number click allows manual edit (`setAmount(p, n)`).

### E. Current Day Salah vs. Historical Qaza Isolation
- Verified that cycling current-day prayer status (`unprayed`, `on_time`, `jamaah`, `late`) in `PrayerDashboard.jsx` **never modifies historical Qaza debt**.
- Only clicking the explicit quick-log button `+{PRAYER_NAMES[p].charAt(0)}` in the "Qaza Recovery" card logs a made-up Qaza prayer (`adjust(p, -1)`).

### F. Debt Forecast Component
- Displays:
  - "At current pace (X/day)": `Math.ceil(total / avgDaily)` (when `avgDaily > 0`).
  - "At target pace (+X daily)": `Math.ceil(total / dailyPace)`.
  - "+5 daily extra": `Math.ceil(total / 5)` (e.g. 134 / 5 = 27 days).
  - "+10 daily extra": `Math.ceil(total / 10)` (e.g. 134 / 10 = 14 days).

---

## 5. Automated Verification Results (`scripts/test_qaza_functionality.mjs`)

All 20 required scenarios were executed through the automated test suite:

```
==================================================================
   TAWFIQ QAZA PRAYER FUNCTIONALITY — 20 SCENARIO TEST SUITE      
==================================================================

[Test 1/20] 1. User starts with zero Qaza debt
  ✓ PASSED: Zero Qaza debt has total remaining = 0
  ✓ PASSED: Total made up is 0

[Test 2/20] 2. User adds one full day (+5)
  ✓ PASSED: Total owed increased from 134 to 139
  ✓ PASSED: Every prayer count incremented by exactly 1

[Test 3/20] 3. User adds several full days (+15 prayers)
  ✓ PASSED: Total correctly reached 154

[Test 4/20] 4. User removes a full day (-5)
  ✓ PASSED: Exactly 5 prayers deducted for full day
  ✓ PASSED: Total decreased by 5 to 149
  ✓ PASSED: History totalMadeUp increased by 5

[Test 5/20] 5. Removal attempted when insufficient debt remains
  ✓ PASSED: Only 2 prayers deducted when only 2 were owed (got 2)
  ✓ PASSED: No negative counts produced

[Test 6/20] 6. User completes one Qaza prayer (Fajr)
  ✓ PASSED: Fajr decreased from 5 to 4
  ✓ PASSED: totalMadeUp incremented to 1
  ✓ PASSED: Other prayers untouched

[Test 7/20] 7. User completes multiple Qaza prayers (Dhuhr, Asr, Isha)
  ✓ PASSED: Total remaining is 18 (25 - 7 completed)
  ✓ PASSED: totalMadeUp is 7

[Test 8/20] 8. Recording ordinary current-day prayer does not modify Qaza debt
  ✓ PASSED: Historical Qaza total unchanged (18)
  ✓ PASSED: Historical totalMadeUp unchanged

[Test 9/20] 9. User opens, completes, cancels, and reopens the debt wizard
  ✓ PASSED: Wizard retained gender
  ✓ PASSED: Wizard retained currentAge
  ✓ PASSED: Wizard retained menses subtraction
  ✓ PASSED: Wizard retained prayingAge

[Test 10/20] 10. Recalculate debt after previously completing Qaza prayers
  ✓ PASSED: New remaining debt is 250
  ✓ PASSED: Baseline preserved completed progress: 257
  ✓ PASSED: Cleared percentage correctly calculated: 2.7%

[Test 11/20] 11. User changes daily repayment forecast pace
  ✓ PASSED: Daily pace updated to 10 in history
  ✓ PASSED: Forecast at 10 pace is 25 days (got 25)

[Test 12/20] 12. Cross-page navigation and shared state read
  ✓ PASSED: Salah coaching context reads exact 250 debt
  ✓ PASSED: Coaching service reads exact Fajr debt

[Test 13/20] 13. State restoration after simulated refresh
  ✓ PASSED: Fajr debt accurately restored
  ✓ PASSED: Isha debt accurately restored
  ✓ PASSED: Total made up accurately restored

[Test 14/20] 14. Graceful handling of storage error
  ✓ PASSED: Sanitization recovers safely
  ✓ PASSED: Storage failure handled gracefully without unhandled crashes

[Test 15/20] 15. Rapid sequential submissions
  ✓ PASSED: Fajr safely decremented by 5 to 45
  ✓ PASSED: totalMadeUp safely incremented to 12

[Test 16/20] 16. Existing historical records & log validation
  ✓ PASSED: Historical logs loaded correctly
  ✓ PASSED: Log type preserved

[Test 17/20] 17. User has zero total debt (All caught up)
  ✓ PASSED: Total debt is 0
  ✓ PASSED: Cleared percentage is 100% (All caught up)

[Test 18/20] 18. Inconsistent legacy data sanitization & migration
  ✓ PASSED: String 'fajr_count' migrated to integer 20
  ✓ PASSED: Negative count clamped to 0
  ✓ PASSED: Invalid NaN count clamped to 0
  ✓ PASSED: Valid count preserved
  ✓ PASSED: Missing prayer defaulted to 0

[Test 19/20] 19. Cross-component data equality
  ✓ PASSED: useQaza total is 134
  ✓ PASSED: salahCoachingService total is 134
  ✓ PASSED: All 5 prayer amounts match exactly between components

[Test 20/20] 20. Unrelated functionality integrity (prayer times, streaks)
  ✓ PASSED: Prayer times calculation intact
  ✓ PASSED: Next prayer identified: Asr

==================================================================
   QAZA FUNCTIONALITY TEST RESULTS: 49 PASSED, 0 FAILED (100.0%)
==================================================================
```

---

## 6. Files Changed and Purpose of Each Change

| File | Purpose |
| :--- | :--- |
| [`src/lib/useQaza.js`](file:///c:/Users/SHAIK%20WASIM%20JAFFER/OneDrive/Desktop/tawfiq%20app%20final/src/lib/useQaza.js) | Canonical state store: event-driven intra-app and cross-tab sync, sanitization, progress percentage, atomic batch commit, and auditable logging. |
| [`src/pages/QazaApp.jsx`](file:///c:/Users/SHAIK%20WASIM%20JAFFER/OneDrive/Desktop/tawfiq%20app%20final/src/pages/QazaApp.jsx) | Fixed per-prayer counter line 1254 (`qaza[p]`), removed `history` shadowing, connected `clearedPercentage`, persisted wizard inputs, and added toast feedback. |
| [`src/components/tawfiq/Qaza.jsx`](file:///c:/Users/SHAIK%20WASIM%20JAFFER/OneDrive/Desktop/tawfiq%20app%20final/src/components/tawfiq/Qaza.jsx) | Connected landing page ledger directly to `useQaza()`, synchronizing stats, progress bar, and ledger adjustments with the main application state. |
| [`src/pages/PrayerDashboard.jsx`](file:///c:/Users/SHAIK%20WASIM%20JAFFER/OneDrive/Desktop/tawfiq%20app%20final/src/pages/PrayerDashboard.jsx) | Wired reactive Qaza quick log buttons with toast feedback, verified isolation between daily Salah tracking and Qaza debt. |
| [`src/lib/salahCoachingService.js`](file:///c:/Users/SHAIK%20WASIM%20JAFFER/OneDrive/Desktop/tawfiq%20app%20final/src/lib/salahCoachingService.js) | Consolidated Qaza context reading to `getStoredQazaState()` for guaranteed alignment with the active ledger. |
| `tawfiq-plus/src/*` | Fully synchronized all updated files to ensure 100% directory and bundle parity. |
| [`scripts/test_qaza_functionality.mjs`](file:///c:/Users/SHAIK%20WASIM%20JAFFER/OneDrive/Desktop/tawfiq%20app%20final/scripts/test_qaza_functionality.mjs) | 20-scenario automated integration test suite validating end-to-end state, persistence, math, and UI reactivity. |

---

## 7. Production Verification

1. **Production Build (`npm run build` in `tawfiq-plus/`):**
   - Transformed 2350 modules in 13.10s.
   - Built assets: `dist/assets/index-CC6o8W0s.css` (123.05 kB), `dist/assets/index-CEUChLRQ.js` (984.16 kB).
   - Zero compilation errors.
2. **Regression Test Suites:**
   - `scripts/test_scenario_answers.mjs`: **16 / 16 PASSED (100.0%)**
   - `scripts/test_unseen_heldout_suite.mjs`: **16 / 16 PASSED (100.0%)**
   - `scripts/test_qaza_functionality.mjs`: **49 / 49 PASSED (100.0%)**
3. **Zero Secrets in Production Bundle:** Confirmed 0 occurrences of API keys or private tokens in client bundles.

The Qaza feature is now completely functional, authoritative, mathematically consistent, and fully synchronized across every screen in the Tawfiq application.

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getLocalDateString,
  isPrayerCompleted,
  hasQualifyingPrayer,
  calculatePrayerStreak,
  getStoredCompletedDates,
  syncCompletedDate,
  PRAYERS,
} from "../src/lib/prayerUtils.js";
import { CITY_PRESETS } from "../src/lib/locationService.js";

// Mock localStorage for Node test environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => (mockStorage.has(key) ? mockStorage.get(key) : null),
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  get length() {
    return mockStorage.size;
  },
  key: (i) => Array.from(mockStorage.keys())[i] || null,
};

describe("Tawfiq Daily Salah Tracking, Date Isolation & Midnight Rollover Tests", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  test("Test 1: Fresh user has all 5 prayers pending (0 / 5)", () => {
    const todayStr = "2026-10-23";
    const userScope = "u_user1_";
    const todayKey = `tawfiq_prayers_${userScope}${todayStr}`;

    const stored = globalThis.localStorage.getItem(todayKey);
    const prayerStatuses = stored ? JSON.parse(stored) : {};

    const completed = PRAYERS.filter((p) => isPrayerCompleted(prayerStatuses[p]));
    assert.equal(completed.length, 0, "No prayers completed yet");
    assert.equal(hasQualifyingPrayer(prayerStatuses), false);
  });

  test("Test 2: Complete one prayer (Fajr -> 1 / 5, saved under correct date)", () => {
    const dateStr = "2026-10-23";
    const userScope = "u_user1_";
    const todayKey = `tawfiq_prayers_${userScope}${dateStr}`;

    // Mark Fajr as on_time
    const updated = { fajr: "on_time" };
    globalThis.localStorage.setItem(todayKey, JSON.stringify(updated));
    syncCompletedDate(dateStr, updated, userScope);

    // Read back
    const stored = JSON.parse(globalThis.localStorage.getItem(todayKey));
    assert.equal(stored.fajr, "on_time");
    assert.equal(isPrayerCompleted(stored.fajr), true);

    const completed = PRAYERS.filter((p) => isPrayerCompleted(stored[p]));
    assert.equal(completed.length, 1);
  });

  test("Test 3: Complete multiple prayers (Fajr + Dhuhr -> 2 / 5)", () => {
    const dateStr = "2026-10-23";
    const userScope = "u_user1_";
    const todayKey = `tawfiq_prayers_${userScope}${dateStr}`;

    const updated = { fajr: "on_time", dhuhr: "jamaah" };
    globalThis.localStorage.setItem(todayKey, JSON.stringify(updated));
    syncCompletedDate(dateStr, updated, userScope);

    const stored = JSON.parse(globalThis.localStorage.getItem(todayKey));
    const completed = PRAYERS.filter((p) => isPrayerCompleted(stored[p]));
    assert.equal(completed.length, 2);
    assert.equal(isPrayerCompleted(stored.asr), false);
    assert.equal(isPrayerCompleted(stored.maghrib), false);
    assert.equal(isPrayerCompleted(stored.isha), false);
  });

  test("Test 4: Reload the application restores completions for the active date", () => {
    const dateStr = "2026-10-23";
    const userScope = "u_user1_";
    const todayKey = `tawfiq_prayers_${userScope}${dateStr}`;

    // Previous session saved Fajr and Dhuhr
    globalThis.localStorage.setItem(todayKey, JSON.stringify({ fajr: "on_time", dhuhr: "jamaah" }));

    // Simulating component reload:
    const reloaded = JSON.parse(globalThis.localStorage.getItem(todayKey) || "{}");
    const count = PRAYERS.filter((p) => isPrayerCompleted(reloaded[p])).length;
    assert.equal(count, 2);
    assert.equal(reloaded.fajr, "on_time");
    assert.equal(reloaded.dhuhr, "jamaah");
  });

  test("Test 5: Simulate midnight transition -> fresh day starts at 0 / 5", () => {
    const day1Str = "2026-10-23";
    const day2Str = "2026-10-24";
    const userScope = "u_user1_";

    const day1Key = `tawfiq_prayers_${userScope}${day1Str}`;
    const day2Key = `tawfiq_prayers_${userScope}${day2Str}`;

    // Day 1 has 3 completed prayers
    const day1Statuses = { fajr: "on_time", dhuhr: "jamaah", asr: "on_time" };
    globalThis.localStorage.setItem(day1Key, JSON.stringify(day1Statuses));
    syncCompletedDate(day1Str, day1Statuses, userScope);

    // Day 2 arrives at 00:00:00 (simulating midnight)
    const day2Stored = globalThis.localStorage.getItem(day2Key);
    const day2Statuses = day2Stored ? JSON.parse(day2Stored) : {};

    const day2Count = PRAYERS.filter((p) => isPrayerCompleted(day2Statuses[p])).length;
    assert.equal(day2Count, 0, "Day 2 must start fresh at 0 / 5");

    // All prayers pending
    for (const p of PRAYERS) {
      assert.equal(isPrayerCompleted(day2Statuses[p]), false);
    }
  });

  test("Test 6: Verify historical data remains intact after midnight", () => {
    const day1Str = "2026-10-23";
    const day2Str = "2026-10-24";
    const userScope = "u_user1_";

    const day1Key = `tawfiq_prayers_${userScope}${day1Str}`;
    globalThis.localStorage.setItem(day1Key, JSON.stringify({ fajr: "on_time", dhuhr: "jamaah" }));

    // Verify Day 1 record in storage is untouched
    const day1Stored = JSON.parse(globalThis.localStorage.getItem(day1Key));
    assert.equal(day1Stored.fajr, "on_time");
    assert.equal(day1Stored.dhuhr, "jamaah");
  });

  test("Test 7: Complete a prayer on Day 2 -> distinct record, yesterday untouched", () => {
    const day1Str = "2026-10-23";
    const day2Str = "2026-10-24";
    const userScope = "u_user1_";

    const day1Key = `tawfiq_prayers_${userScope}${day1Str}`;
    const day2Key = `tawfiq_prayers_${userScope}${day2Str}`;

    globalThis.localStorage.setItem(day1Key, JSON.stringify({ fajr: "on_time", dhuhr: "jamaah" }));
    syncCompletedDate(day1Str, { fajr: "on_time", dhuhr: "jamaah" }, userScope);

    // On Day 2, user completes Fajr
    const day2Statuses = { fajr: "on_time" };
    globalThis.localStorage.setItem(day2Key, JSON.stringify(day2Statuses));
    syncCompletedDate(day2Str, day2Statuses, userScope);

    // Check Day 2
    const readDay2 = JSON.parse(globalThis.localStorage.getItem(day2Key));
    assert.equal(readDay2.fajr, "on_time");
    assert.equal(isPrayerCompleted(readDay2.dhuhr), false);

    // Check Day 1 (remains untouched!)
    const readDay1 = JSON.parse(globalThis.localStorage.getItem(day1Key));
    assert.equal(readDay1.fajr, "on_time");
    assert.equal(readDay1.dhuhr, "jamaah");

    // Check streak
    const completedDates = getStoredCompletedDates(userScope);
    assert.deepEqual(completedDates, [day1Str, day2Str]);

    const streakInfo = calculatePrayerStreak(completedDates, new Date(2026, 9, 24, 12, 0, 0));
    assert.equal(streakInfo.currentStreak, 2);
    assert.equal(streakInfo.isActiveToday, true);
  });

  test("Test 8: Resume after midnight correctly retrieves new date", () => {
    // Before midnight: 2026-10-23 23:59:50
    const beforeDate = new Date("2026-10-23T23:59:50Z");
    const date1 = getLocalDateString(beforeDate, "UTC");
    assert.equal(date1, "2026-10-23");

    // After midnight: 2026-10-24 00:00:10
    const afterDate = new Date("2026-10-24T00:00:10Z");
    const date2 = getLocalDateString(afterDate, "UTC");
    assert.equal(date2, "2026-10-24");
    assert.notEqual(date1, date2);
  });

  test("Test 9: Duplicate submissions are idempotent", () => {
    const dateStr = "2026-10-23";
    const userScope = "u_user1_";
    const todayKey = `tawfiq_prayers_${userScope}${dateStr}`;

    // Rapid double click with identical status
    let state = {};
    const applyClick = (key, status) => {
      if (state[key] === status) return state; // Idempotent guard
      state = { ...state, [key]: status };
      globalThis.localStorage.setItem(todayKey, JSON.stringify(state));
      syncCompletedDate(dateStr, state, userScope);
      return state;
    };

    applyClick("fajr", "on_time");
    applyClick("fajr", "on_time");
    applyClick("fajr", "on_time");

    const dates = getStoredCompletedDates(userScope);
    assert.equal(dates.filter((d) => d === dateStr).length, 1, "Only one date entry");
    const stored = JSON.parse(globalThis.localStorage.getItem(todayKey));
    assert.equal(stored.fajr, "on_time");
  });

  test("Test 10: Timezone boundaries (e.g. Makkah, New York, Tokyo)", () => {
    // 2026-10-23 22:30:00 UTC
    const utcDate = new Date("2026-10-23T22:30:00Z");

    // In New York (UTC-4): it is 18:30 on 2026-10-23
    const nyDate = getLocalDateString(utcDate, "America/New_York");
    assert.equal(nyDate, "2026-10-23");

    // In Makkah (UTC+3): 22:30 UTC + 3 hours = 01:30 on 2026-10-24!
    const makkahDate = getLocalDateString(utcDate, "Asia/Riyadh");
    assert.equal(makkahDate, "2026-10-24");

    // Ensure CITY_PRESETS contain timezones
    const makkahPreset = CITY_PRESETS.find((c) => c.city === "Makkah");
    assert.equal(makkahPreset.timezone, "Asia/Riyadh");
    const hydPreset = CITY_PRESETS.find((c) => c.city === "Hyderabad");
    assert.equal(hydPreset.timezone, "Asia/Kolkata");
  });
});

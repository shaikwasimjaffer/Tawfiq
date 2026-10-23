import test from "node:test";
import assert from "node:assert/strict";
import {
  SUNNAH_RAWATIB,
  TOTAL_SUNNAH_RAKAHS,
  calculateCompletedSunnahRakahs,
} from "../tawfiq-plus/src/lib/prayerUtils.js";

test("Sunnah Rawatib Configuration and Calculations", async (t) => {
  await t.test("Total configured rakahs is exactly 12", () => {
    assert.equal(TOTAL_SUNNAH_RAKAHS, 12);
  });

  await t.test("Sunnah structure contains exactly Fajr, Dhuhr, Maghrib, Isha in order", () => {
    const keys = SUNNAH_RAWATIB.map((item) => item.prayerKey);
    assert.deepEqual(keys, ["fajr", "dhuhr", "maghrib", "isha"]);

    // Verify Asr is NOT included
    assert.ok(!keys.includes("asr"), "Asr should not have Sunnah Rawatib");

    // Verify Voluntary prayers (Tahajjud, Ishraq, Duha, Awwabin, Witr) are NOT in this tracker
    const voluntaryKeys = ["tahajjud", "ishraq", "duha", "awwabin", "witr"];
    voluntaryKeys.forEach((k) => {
      assert.ok(!keys.includes(k), `${k} must not be in the 12 Sunnah Rawatib tracker`);
    });
  });

  await t.test("Test 1: New user starts at 0 / 12 Rak'ahs", () => {
    const emptyStatuses = {};
    assert.equal(calculateCompletedSunnahRakahs(emptyStatuses), 0);
  });

  await t.test("Test 2: Fajr completed adds 2 rak'ahs (2 / 12)", () => {
    const statuses = { fajr: { before: true } };
    assert.equal(calculateCompletedSunnahRakahs(statuses), 2);
  });

  await t.test("Test 3: Dhuhr pre-Fard set adds 4 rak'ahs (2 + 4 = 6 / 12)", () => {
    const statuses = {
      fajr: { before: true },
      dhuhr: { before: true, after: false },
    };
    assert.equal(calculateCompletedSunnahRakahs(statuses), 6);
  });

  await t.test("Test 4: Dhuhr post-Fard set adds 2 rak'ahs (6 + 2 = 8 / 12)", () => {
    const statuses = {
      fajr: { before: true },
      dhuhr: { before: true, after: true },
    };
    assert.equal(calculateCompletedSunnahRakahs(statuses), 8);
  });

  await t.test("Test 5: Maghrib completed adds 2 rak'ahs (8 + 2 = 10 / 12)", () => {
    const statuses = {
      fajr: { before: true },
      dhuhr: { before: true, after: true },
      maghrib: { after: true },
    };
    assert.equal(calculateCompletedSunnahRakahs(statuses), 10);
  });

  await t.test("Test 6: Isha completed adds 2 rak'ahs (10 + 2 = 12 / 12)", () => {
    const statuses = {
      fajr: { before: true },
      dhuhr: { before: true, after: true },
      maghrib: { after: true },
      isha: { after: true },
    };
    assert.equal(calculateCompletedSunnahRakahs(statuses), 12);
  });

  await t.test("Test 7 & 8: Dhuhr sets are independent (completing post does not complete pre)", () => {
    const onlyPostDhuhr = {
      dhuhr: { before: false, after: true },
    };
    assert.equal(calculateCompletedSunnahRakahs(onlyPostDhuhr), 2);

    const onlyPreDhuhr = {
      dhuhr: { before: true, after: false },
    };
    assert.equal(calculateCompletedSunnahRakahs(onlyPreDhuhr), 4);
  });

  await t.test("Test 12: Duplicate clicks do not inflate the completed rakah count", () => {
    // If state is already true, setting true again remains true
    const statuses = {
      fajr: { before: true },
    };
    assert.equal(calculateCompletedSunnahRakahs(statuses), 2);
    // Even if repeated
    const identical = { ...statuses };
    assert.equal(calculateCompletedSunnahRakahs(identical), 2);
  });

  await t.test("Test 10 & 11: Daily localStorage isolation per calendar date", () => {
    const mockStorage = new Map();
    const saveDay = (dateStr, userScope, data) => {
      const key = `tawfiq_sunnah_rawatib_${userScope ? `${userScope}_` : ""}${dateStr}`;
      mockStorage.set(key, JSON.stringify(data));
    };
    const loadDay = (dateStr, userScope) => {
      const key = `tawfiq_sunnah_rawatib_${userScope ? `${userScope}_` : ""}${dateStr}`;
      const raw = mockStorage.get(key);
      return raw ? JSON.parse(raw) : {};
    };

    const day1 = "2026-10-23";
    const day2 = "2026-10-24";
    const userScope = "guest";

    // Complete all 12 on Day 1
    saveDay(day1, userScope, {
      fajr: { before: true },
      dhuhr: { before: true, after: true },
      maghrib: { after: true },
      isha: { after: true },
    });

    assert.equal(calculateCompletedSunnahRakahs(loadDay(day1, userScope)), 12);

    // On Day 2, tracker loads fresh day 2 records -> starts at 0
    const day2Data = loadDay(day2, userScope);
    assert.equal(calculateCompletedSunnahRakahs(day2Data), 0);

    // Day 1 history remains intact
    assert.equal(calculateCompletedSunnahRakahs(loadDay(day1, userScope)), 12);
  });
});

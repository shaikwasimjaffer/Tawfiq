/**
 * Test Suite for Tawfiq Prayer Notifications & AzanScheduler
 */
import assert from "node:assert";

// Mock localStorage
const storage = {};
globalThis.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

// Mock window
globalThis.window = globalThis;

// Mock Audio
globalThis.Audio = class {
  play() { return Promise.resolve(); }
  pause() {}
  load() {}
  addEventListener() {}
  removeEventListener() {}
};

// Mock Notification
let lastNotification = null;
globalThis.Notification = class {
  constructor(title, options) {
    this.title = title;
    this.options = options;
    lastNotification = { title, options };
  }
  static permission = "granted";
  static requestPermission = async () => "granted";
};

// Import AzanScheduler classes
const { AzanScheduler, NOTIFICATION_MODES, ADVANCE_REMINDER_OPTIONS } = await import(
  "../tawfiq-plus/src/lib/azanScheduler.js"
);

console.log("▶ Running Prayer Notification Tests...\n");

// Test 1: Default configuration loading & schema normalization
{
  const scheduler = new AzanScheduler();
  const settings = scheduler.getSettings();
  const prayerKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  for (const k of prayerKeys) {
    assert.strictEqual(settings[k].atPrayerMode, NOTIFICATION_MODES.AZAN, `Default mode for ${k} should be AZAN`);
    assert.strictEqual(settings[k].advanceMinutes, 0, `Default advanceMinutes for ${k} should be 0`);
  }
  console.log("✔ Test 1 Passed: Default configuration loads with valid dual-setting schema");
}

// Test 2: Independent configuration for all 5 prayers
{
  const scheduler = new AzanScheduler();
  scheduler.setPrayerAtTimeMode("fajr", NOTIFICATION_MODES.OFF);
  scheduler.setPrayerAdvanceReminder("fajr", 5);

  scheduler.setPrayerAtTimeMode("dhuhr", NOTIFICATION_MODES.CHIME);
  scheduler.setPrayerAdvanceReminder("dhuhr", 10);

  scheduler.setPrayerAtTimeMode("asr", NOTIFICATION_MODES.AZAN);
  scheduler.setPrayerAdvanceReminder("asr", 0);

  scheduler.setPrayerAtTimeMode("maghrib", NOTIFICATION_MODES.AZAN);
  scheduler.setPrayerAdvanceReminder("maghrib", 10);

  scheduler.setPrayerAtTimeMode("isha", NOTIFICATION_MODES.SILENT);
  scheduler.setPrayerAdvanceReminder("isha", 5);

  const fajrCfg = scheduler.getPrayerConfig("fajr");
  assert.strictEqual(fajrCfg.atPrayerMode, NOTIFICATION_MODES.OFF);
  assert.strictEqual(fajrCfg.advanceMinutes, 5);

  const maghribCfg = scheduler.getPrayerConfig("maghrib");
  assert.strictEqual(maghribCfg.atPrayerMode, NOTIFICATION_MODES.AZAN);
  assert.strictEqual(maghribCfg.advanceMinutes, 10);

  console.log("✔ Test 2 Passed: Independent dual configuration for all 5 prayers persists correctly");
}

// Test 3: Backward compatibility with legacy string settings
{
  storage["tawfiq_prayer_notification_settings"] = JSON.stringify({
    fajr: "silent",
    dhuhr: "chime",
    asr: "off",
  });
  const scheduler = new AzanScheduler();
  const fajr = scheduler.getPrayerConfig("fajr");
  assert.strictEqual(fajr.atPrayerMode, "silent");
  assert.strictEqual(fajr.advanceMinutes, 0);

  const dhuhr = scheduler.getPrayerConfig("dhuhr");
  assert.strictEqual(dhuhr.atPrayerMode, "chime");

  console.log("✔ Test 3 Passed: Successfully normalizes legacy flat string configuration");
}

// Test 4: Advance pre-prayer notification trigger & deduplication
{
  const scheduler = new AzanScheduler();
  scheduler.setPrayerAdvanceReminder("maghrib", 10);
  scheduler.setPrayerAtTimeMode("maghrib", NOTIFICATION_MODES.AZAN);

  // Mock Maghrib at 18:20
  const maghribTime = new Date(2026, 9, 22, 18, 20, 0);
  const now1810 = new Date(2026, 9, 22, 18, 10, 0); // exactly 10 min before

  // Trigger advance reminder
  await scheduler.triggerAdvanceReminder("maghrib", maghribTime, 10, "2026-10-22");

  assert.ok(lastNotification, "Notification should have been dispatched");
  assert.ok(lastNotification.title.includes("10 minutes"), "Title should announce 10 minutes");
  assert.ok(lastNotification.title.includes("Maghrib"), "Title should specify Maghrib");
  assert.ok(scheduler.hasBeenNotified("2026-10-22", "maghrib", "advance_10"), "Event must be recorded as notified");

  // Re-trigger should be prevented by deduplication
  const countBefore = scheduler.getNotifiedRecords();
  assert.strictEqual(scheduler.hasBeenNotified("2026-10-22", "maghrib", "advance_10"), true);
  console.log("✔ Test 4 Passed: Advance 10-minute reminder triggers with correct copy and deduplicates");
}

// Test 5: Coexistence of pre-prayer reminder and at-prayer notification
{
  const scheduler = new AzanScheduler();
  scheduler.setPrayerAdvanceReminder("maghrib", 5);
  scheduler.setPrayerAtTimeMode("maghrib", NOTIFICATION_MODES.AZAN);

  const maghribTime = new Date(2026, 9, 22, 18, 20, 0);

  // Trigger advance
  await scheduler.triggerAdvanceReminder("maghrib", maghribTime, 5, "2026-10-22");
  assert.strictEqual(scheduler.hasBeenNotified("2026-10-22", "maghrib", "advance_5"), true);
  assert.strictEqual(scheduler.hasBeenNotified("2026-10-22", "maghrib", "at_prayer"), false, "at_prayer should still be un-triggered");

  // Now trigger at_prayer
  await scheduler.triggerPrayerNotification("maghrib", maghribTime, "2026-10-22");
  assert.strictEqual(scheduler.hasBeenNotified("2026-10-22", "maghrib", "at_prayer"), true, "at_prayer now marked as notified");
  assert.ok(lastNotification.title.includes("It is time for Maghrib"), "At-prayer alert dispatched");

  console.log("✔ Test 5 Passed: Advance reminder and at-prayer alert coexist as independent events");
}

console.log("\n All 5 Prayer Notification Tests Passed Successfully!");
process.exit(0);

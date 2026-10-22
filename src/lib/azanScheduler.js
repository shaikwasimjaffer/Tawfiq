/**
 * Tawfiq Azan Scheduler & Notification Engine
 *
 * Runs scheduled checks against astronomical prayer times.
 * Dispatches:
 * 1. Pre-prayer advance reminders (5 minutes before, 10 minutes before) with gentle notification
 * 2. At-prayer alerts (Azan audio, gentle chime, or silent notification)
 * Strictly separates audio and notifications, deduplicates events, and integrates with PWA Service Worker.
 */
import { getPrayerTimes, formatTime12, getLocalDateString } from "./prayerUtils.js";
import { azanAudioService } from "./azanAudioService.js";

const SETTINGS_KEY = "tawfiq_prayer_notification_settings";
const NOTIFIED_KEY = "tawfiq_notified_prayers";

export const NOTIFICATION_MODES = {
  AZAN: "azan",
  CHIME: "chime",
  SILENT: "silent",
  OFF: "off",
};

export const ADVANCE_REMINDER_OPTIONS = {
  OFF: 0,
  FIVE_MIN: 5,
  TEN_MIN: 10,
};

export const DEFAULT_PRAYER_CONFIG = {
  fajr: { atPrayerMode: NOTIFICATION_MODES.AZAN, advanceMinutes: 0 },
  dhuhr: { atPrayerMode: NOTIFICATION_MODES.AZAN, advanceMinutes: 0 },
  asr: { atPrayerMode: NOTIFICATION_MODES.AZAN, advanceMinutes: 0 },
  maghrib: { atPrayerMode: NOTIFICATION_MODES.AZAN, advanceMinutes: 0 },
  isha: { atPrayerMode: NOTIFICATION_MODES.AZAN, advanceMinutes: 0 },
};

export const PRAYER_NAMES = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export class AzanScheduler {
  constructor() {
    this.intervalId = null;
    this.subscribers = new Set();
    this.settings = this.loadSettings();
    this.lastTriggeredPrayer = null;

    if (typeof window !== "undefined") {
      this.start();
    }
  }

  /**
   * Normalizes loaded settings to support both legacy flat string modes ("azan")
   * and current dual-preference objects ({ atPrayerMode: "azan", advanceMinutes: 5 })
   */
  loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalized = {};
        for (const key of Object.keys(DEFAULT_PRAYER_CONFIG)) {
          const val = parsed[key];
          if (typeof val === "string") {
            normalized[key] = {
              atPrayerMode: val,
              advanceMinutes: 0,
            };
          } else if (val && typeof val === "object") {
            normalized[key] = {
              atPrayerMode: val.atPrayerMode || NOTIFICATION_MODES.AZAN,
              advanceMinutes: Number(val.advanceMinutes) || 0,
            };
          } else {
            normalized[key] = { ...DEFAULT_PRAYER_CONFIG[key] };
          }
        }
        return normalized;
      }
    } catch (e) {
      console.warn("[AzanScheduler] Failed to load settings:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PRAYER_CONFIG));
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {}
    this.notifySubscribers();
  }

  getSettings() {
    return JSON.parse(JSON.stringify(this.settings));
  }

  getPrayerConfig(prayerKey) {
    return (
      this.settings[prayerKey] || {
        atPrayerMode: NOTIFICATION_MODES.AZAN,
        advanceMinutes: 0,
      }
    );
  }

  setPrayerAtTimeMode(prayerKey, mode) {
    const current = this.getPrayerConfig(prayerKey);
    this.saveSettings({
      [prayerKey]: {
        ...current,
        atPrayerMode: mode,
      },
    });
  }

  setPrayerAdvanceReminder(prayerKey, minutes) {
    const current = this.getPrayerConfig(prayerKey);
    this.saveSettings({
      [prayerKey]: {
        ...current,
        advanceMinutes: Number(minutes) || 0,
      },
    });
  }

  setPrayerSetting(prayerKey, modeOrConfig) {
    if (typeof modeOrConfig === "string") {
      this.setPrayerAtTimeMode(prayerKey, modeOrConfig);
    } else if (typeof modeOrConfig === "object" && modeOrConfig !== null) {
      const current = this.getPrayerConfig(prayerKey);
      this.saveSettings({
        [prayerKey]: {
          atPrayerMode: modeOrConfig.atPrayerMode !== undefined ? modeOrConfig.atPrayerMode : current.atPrayerMode,
          advanceMinutes: modeOrConfig.advanceMinutes !== undefined ? Number(modeOrConfig.advanceMinutes) : current.advanceMinutes,
        },
      });
    }
  }

  getNotifiedRecords() {
    try {
      const raw = localStorage.getItem(NOTIFIED_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  markEventAsNotified(dateStr, prayerKey, eventType) {
    const records = this.getNotifiedRecords();
    const key = `${dateStr}_${prayerKey}_${eventType}`;
    records[key] = Date.now();

    // Clean up records older than 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const k of Object.keys(records)) {
      if (records[k] < sevenDaysAgo) {
        delete records[k];
      }
    }

    try {
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(records));
    } catch {}
  }

  hasBeenNotified(dateStr, prayerKey, eventType) {
    const records = this.getNotifiedRecords();
    // Check both namespaced key and legacy key for at_prayer
    if (eventType === "at_prayer") {
      if (records[`${dateStr}_${prayerKey}`]) return true;
    }
    return Boolean(records[`${dateStr}_${prayerKey}_${eventType}`]);
  }

  start() {
    if (this.intervalId) return;

    // Run check immediately on start
    this.checkPrayerSchedule();

    // Re-check every 15 seconds
    this.intervalId = setInterval(() => {
      this.checkPrayerSchedule();
    }, 15000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Main scheduler loop: checks prayer times against the current clock
   * Handles both advance pre-prayer reminders and at-prayer notifications
   */
  checkPrayerSchedule(customNow = null) {
    const now = customNow || new Date();
    const todayStr = getLocalDateString(now);
    const times = getPrayerTimes(now);
    const nowMs = now.getTime();

    const prayerKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

    for (const key of prayerKeys) {
      const prayerDate = times[key];
      if (!prayerDate) continue;

      const prayerMs = prayerDate.getTime();
      const cfg = this.getPrayerConfig(key);
      const timeDiffMs = prayerMs - nowMs; // positive if in future, negative if passed

      // 1. Advance Pre-Prayer Reminder check
      if (cfg.advanceMinutes > 0) {
        const targetAdvanceMs = cfg.advanceMinutes * 60 * 1000;
        // Window: within 90 seconds of the advance reminder mark
        // (e.g. For 10 min reminder: timeDiffMs between 600,000 and 510,000ms)
        const advanceLowerBound = targetAdvanceMs - 90000;
        const advanceUpperBound = targetAdvanceMs + 30000;

        if (timeDiffMs >= advanceLowerBound && timeDiffMs <= advanceUpperBound) {
          const eventType = `advance_${cfg.advanceMinutes}`;
          if (!this.hasBeenNotified(todayStr, key, eventType)) {
            this.triggerAdvanceReminder(key, prayerDate, cfg.advanceMinutes, todayStr);
          }
        }
      }

      // 2. At-Prayer Notification check
      // Window: within 2 minutes after prayer begins (diffMs between 0 and 120,000ms)
      const passedMs = nowMs - prayerMs;
      if (passedMs >= 0 && passedMs <= 120000) {
        if (!this.hasBeenNotified(todayStr, key, "at_prayer")) {
          this.triggerPrayerNotification(key, prayerDate, todayStr);
        }
      }
    }
  }

  /**
   * Dispatches gentle advance reminder (5 or 10 minutes before prayer)
   * Strictly separates advance notification from loud Azan audio.
   */
  async triggerAdvanceReminder(prayerKey, prayerDate, minutes, dateStr = getLocalDateString(new Date())) {
    this.markEventAsNotified(dateStr, prayerKey, `advance_${minutes}`);
    const pName = PRAYER_NAMES[prayerKey] || prayerKey;
    const timeStr = formatTime12(prayerDate);

    this.lastTriggeredPrayer = {
      type: "advance",
      key: prayerKey,
      name: pName,
      time: timeStr,
      minutes,
      timestamp: Date.now(),
    };

    // 1. Play soft gentle chime if audio is available (never full azan)
    try {
      azanAudioService.playGentleChime();
    } catch {}

    // 2. Native notification with clear advance copy
    const title = `${pName} prayer in ${minutes} minutes (${timeStr})`;
    const body = `Prepare for prayer • Tawfiq`;
    this.dispatchWebNotification(title, body, `tawfiq_advance_${prayerKey}`);

    this.notifySubscribers();
  }

  /**
   * Dispatches at-prayer notification according to user's atPrayerMode
   */
  async triggerPrayerNotification(prayerKey, prayerDate, dateStr = getLocalDateString(new Date())) {
    this.markEventAsNotified(dateStr, prayerKey, "at_prayer");
    const cfg = this.getPrayerConfig(prayerKey);
    const mode = cfg.atPrayerMode;

    if (mode === NOTIFICATION_MODES.OFF) return;

    const pName = PRAYER_NAMES[prayerKey] || prayerKey;
    const timeStr = formatTime12(prayerDate);

    this.lastTriggeredPrayer = {
      type: "at_prayer",
      key: prayerKey,
      name: pName,
      time: timeStr,
      mode,
      timestamp: Date.now(),
    };

    // 1. Play Audio based on mode
    if (mode === NOTIFICATION_MODES.AZAN) {
      await azanAudioService.playAzan(null, prayerKey);
    } else if (mode === NOTIFICATION_MODES.CHIME) {
      azanAudioService.playGentleChime();
    }

    // 2. Dispatch Native Web Notification if permitted
    const title = `It is time for ${pName} Prayer (${timeStr})`;
    const body = "Come to prayer, come to success • Tawfiq";
    this.dispatchWebNotification(title, body, `tawfiq_prayer_${prayerKey}`);

    // 3. Notify React subscribers for UI banner / updates
    this.notifySubscribers();
  }

  /**
   * Dispatches native Web Notification using Service Worker if available,
   * falling back to standard window Notification.
   */
  dispatchWebNotification(title, body, tag = "tawfiq-alert") {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      const options = {
        body,
        icon: "/icon-192.png",
        badge: "/favicon-32x32.png",
        tag,
        renotify: true,
        data: { url: "/" },
      };

      // Try via service worker registration first for background reliability
      if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready
          .then((registration) => {
            if (registration && typeof registration.showNotification === "function") {
              return registration.showNotification(title, options);
            }
            throw new Error("No showNotification method");
          })
          .catch(() => {
            try {
              new Notification(title, options);
            } catch (e) {
              console.warn("[AzanScheduler] Fallback notification failed:", e);
            }
          });
      } else {
        try {
          new Notification(title, options);
        } catch (err) {
          console.warn("[AzanScheduler] Native notification error:", err);
        }
      }
    }
  }

  async requestPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    try {
      const result = await Notification.requestPermission();
      this.notifySubscribers();
      return result;
    } catch {
      return "default";
    }
  }

  getPermissionState() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback({
      settings: this.settings,
      permission: this.getPermissionState(),
      lastTriggered: this.lastTriggeredPrayer,
    });
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const data = {
      settings: this.settings,
      permission: this.getPermissionState(),
      lastTriggered: this.lastTriggeredPrayer,
    };
    for (const sub of this.subscribers) {
      try {
        sub(data);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export const azanScheduler = new AzanScheduler();

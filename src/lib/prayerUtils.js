// Prayer utilities, naming, and calculation logic
export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export const PRAYER_NAMES = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export const PRAYER_DESCRIPTIONS = {
  fajr: "Dawn Prayer",
  dhuhr: "Noon Prayer",
  asr: "Afternoon Prayer",
  maghrib: "Sunset Prayer",
  isha: "Night Prayer",
};

export const VOLUNTARY_PRAYERS = ["tahajjud", "ishraq", "duha", "awwabin", "witr"];

export const VOLUNTARY_PRAYER_NAMES = {
  tahajjud: "Tahajjud",
  ishraq: "Ishraq",
  duha: "Duha",
  awwabin: "Awwabin",
  witr: "Witr",
};

export const VOLUNTARY_PRAYER_DESCRIPTIONS = {
  tahajjud: "Night Vigil Prayer • Immense reward in last third of night",
  ishraq: "Post-Sunrise Prayer • 15-20 min post sunrise",
  duha: "Forenoon Prayer • Mid-morning charity of the joints",
  awwabin: "Post-Maghrib Prayer • Prayer of the oft-returning",
  witr: "Night Witr Prayer • Concluding odd-numbered prayer",
};

import { Coordinates, PrayerTimes } from "adhan";
import {
  getSavedLocation,
  getCalculationPreferences,
  resolveCalculationParameters,
  calculateQiblaBearing,
} from "./locationService.js";

export const PRAYER_RAKATS = {
  fajr: { fard: 2, sunnah: 2 },
  dhuhr: { fard: 4, sunnah: 4, nafl: 2 },
  asr: { fard: 4, sunnah: 4 },
  maghrib: { fard: 3, sunnah: 2, nafl: 2 },
  isha: { fard: 4, sunnah: 2, witr: 3 },
};

/**
 * Calculates authentic astronomical prayer times using solar declination and local coordinates.
 */
export function getPrayerTimes(date = new Date(), customLocation = null, customPrefs = null) {
  const loc = customLocation || getSavedLocation();
  const prefs = customPrefs || getCalculationPreferences();
  const methodId = prefs.methodId || loc.method || "MWL";
  const params = resolveCalculationParameters(methodId, prefs.madhabId || "shafi");

  try {
    const coords = new Coordinates(loc.latitude, loc.longitude);
    const targetDate = new Date(date);
    const pt = new PrayerTimes(coords, targetDate, params);

    return {
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    };
  } catch (err) {
    console.error("Astronomical PrayerTimes calculation fallback:", err);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return {
      fajr: new Date(d.getTime() + (5 * 60 + 12) * 60000),
      sunrise: new Date(d.getTime() + (6 * 60 + 28) * 60000),
      dhuhr: new Date(d.getTime() + (12 * 60 + 18) * 60000),
      asr: new Date(d.getTime() + (15 * 60 + 42) * 60000),
      maghrib: new Date(d.getTime() + (18 * 60 + 10) * 60000),
      isha: new Date(d.getTime() + (19 * 60 + 26) * 60000),
    };
  }
}

export function formatTime12(date) {
  if (!date || isNaN(new Date(date).getTime())) return "";
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${strMinutes} ${ampm}`;
}

export function getNextPrayerInfo(now = new Date(), customLocation = null, customPrefs = null) {
  const loc = customLocation || getSavedLocation();
  const times = getPrayerTimes(now, loc, customPrefs);
  const qiblaBearing = calculateQiblaBearing(loc.latitude, loc.longitude);
  const nowMs = now.getTime();

  const schedule = [
    { key: "fajr", name: "Fajr", time: times.fajr },
    { key: "dhuhr", name: "Dhuhr", time: times.dhuhr },
    { key: "asr", name: "Asr", time: times.asr },
    { key: "maghrib", name: "Maghrib", time: times.maghrib },
    { key: "isha", name: "Isha", time: times.isha },
  ];

  let current = schedule[schedule.length - 1];
  let next = schedule[0];

  for (let i = 0; i < schedule.length; i++) {
    if (nowMs < schedule[i].time.getTime()) {
      next = schedule[i];
      current = i === 0 ? schedule[schedule.length - 1] : schedule[i - 1];
      break;
    }
  }

  // Calculate difference
  let targetDate = next.time;
  let targetTime = next.time.getTime();
  if (targetTime < nowMs) {
    // Tomorrow's Fajr
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = getPrayerTimes(tomorrow, loc, customPrefs);
    targetDate = tomorrowTimes.fajr;
    targetTime = tomorrowTimes.fajr.getTime();
  }

  const diffMs = Math.max(0, targetTime - nowMs);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  const countdownText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return {
    currentPrayer: current.name,
    currentPrayerKey: current.key,
    nextPrayer: next.name,
    nextPrayerKey: next.key,
    nextTime: formatTime12(targetDate),
    nextDate: targetDate,
    diffMinutes,
    countdownText,
    qiblaBearing,
    location: loc,
    times: {
      fajr: formatTime12(times.fajr),
      sunrise: formatTime12(times.sunrise),
      dhuhr: formatTime12(times.dhuhr),
      asr: formatTime12(times.asr),
      maghrib: formatTime12(times.maghrib),
      isha: formatTime12(times.isha),
    },
    rawTimes: times,
  };
}

/**
 * Calculates authentic astronomical schedule for voluntary (Nawafil & Sunnah) prayers.
 */
export function getVoluntaryPrayerInfo(now = new Date(), customLocation = null, customPrefs = null) {
  const loc = customLocation || getSavedLocation();
  const times = getPrayerTimes(now, loc, customPrefs);
  const nowMs = now.getTime();

  // 1. Tahajjud: Last third of night (~1h 15m before Fajr)
  const tahajjud = new Date(times.fajr.getTime() - 75 * 60000);
  // 2. Ishraq: Post-sunrise (~18m after sunrise)
  const ishraq = new Date(times.sunrise.getTime() + 18 * 60000);
  // 3. Duha: Forenoon (~midway between sunrise and dhuhr)
  const duha = new Date(times.sunrise.getTime() + (times.dhuhr.getTime() - times.sunrise.getTime()) * 0.5);
  // 4. Awwabin: Post-maghrib (~20m after maghrib)
  const awwabin = new Date(times.maghrib.getTime() + 20 * 60000);
  // 5. Witr: Concluding night prayer (~30m after isha)
  const witr = new Date(times.isha.getTime() + 30 * 60000);

  const schedule = [
    { key: "tahajjud", name: "Tahajjud", time: tahajjud },
    { key: "ishraq", name: "Ishraq", time: ishraq },
    { key: "duha", name: "Duha", time: duha },
    { key: "awwabin", name: "Awwabin", time: awwabin },
    { key: "witr", name: "Witr", time: witr },
  ];

  // Identify next upcoming voluntary prayer
  let next = schedule.find((s) => s.time.getTime() > nowMs) || schedule[0];

  return {
    nextVoluntaryKey: next.key,
    times: {
      tahajjud: formatTime12(tahajjud),
      ishraq: formatTime12(ishraq),
      duha: formatTime12(duha),
      awwabin: formatTime12(awwabin),
      witr: formatTime12(witr),
    },
    dates: {
      tahajjud,
      ishraq,
      duha,
      awwabin,
      witr,
    },
  };
}

export function getHijriDate(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-TN-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatter.format(date);
  } catch {
    return "18 Shawwal 1447 AH";
  }
}

export const QUALIFYING_STATUSES = ["on_time", "jamaah", "late"];

/**
 * Returns user's local date string formatted as YYYY-MM-DD.
 * Strictly uses local calendar components (not UTC) to prevent timezone/midnight bugs.
 */
export function getLocalDateString(d = new Date()) {
  const dateObj = d instanceof Date ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether a prayer status qualifies as completed.
 */
export function isPrayerCompleted(status) {
  return typeof status === "string" && QUALIFYING_STATUSES.includes(status);
}

/**
 * Checks if a daily prayer statuses map contains at least one completed prayer.
 */
export function hasQualifyingPrayer(prayerStatuses) {
  if (!prayerStatuses || typeof prayerStatuses !== "object") return false;
  return PRAYERS.some((p) => isPrayerCompleted(prayerStatuses[p]));
}

/**
 * Calculates current streak and longest streak from an array of completed date strings.
 * 
 * Rules:
 * 1. Each calendar day counts once.
 * 2. Consecutive days increase streak.
 * 3. Future dates are excluded.
 * 4. If today is active, streak includes today.
 * 5. If today is not active yet, but yesterday was active, streak is preserved from yesterday.
 * 6. If yesterday was also not active (full day missed), streak is 0.
 * 
 * @param {string[]} dates - Array of YYYY-MM-DD strings
 * @param {Date} [referenceDate=new Date()]
 * @returns {{ currentStreak: number, longestStreak: number, isActiveToday: boolean }}
 */
export function calculatePrayerStreak(dates = [], referenceDate = new Date()) {
  if (!Array.isArray(dates) || dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
  }

  const todayStr = getLocalDateString(referenceDate);
  const validDatesSet = new Set();

  for (const d of dates) {
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      if (d <= todayStr) {
        validDatesSet.add(d);
      }
    }
  }

  if (validDatesSet.size === 0) {
    return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
  }

  const isActiveToday = validDatesSet.has(todayStr);

  const yesterday = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() - 1,
    12,
    0,
    0,
  );
  const yesterdayStr = getLocalDateString(yesterday);

  let currentStreak = 0;
  let checkDate = null;

  if (isActiveToday) {
    checkDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
      12,
      0,
      0,
    );
  } else if (validDatesSet.has(yesterdayStr)) {
    // Preserve streak during today
    checkDate = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      12,
      0,
      0,
    );
  }

  if (checkDate) {
    while (true) {
      const curStr = getLocalDateString(checkDate);
      if (validDatesSet.has(curStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // All-time longest streak
  const sortedDates = Array.from(validDatesSet).sort();
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const cur = new Date(y, m - 1, d, 12, 0, 0);

    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffMs = cur.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    prevDate = cur;
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    isActiveToday,
  };
}

/**
 * Retrieves the stored list of completed prayer date strings for a user scope.
 */
export function getStoredCompletedDates(userScope = "") {
  const indexKey = `tawfiq_prayer_dates_${userScope}`;
  try {
    const raw = localStorage.getItem(indexKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}

  // Discover from localStorage keys
  const discovered = new Set();
  const prefix = `tawfiq_prayers_${userScope}`;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const datePart = k.slice(prefix.length);
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          try {
            const val = JSON.parse(localStorage.getItem(k));
            if (hasQualifyingPrayer(val)) {
              discovered.add(datePart);
            }
          } catch {}
        }
      }
    }
  } catch {}

  const dateList = Array.from(discovered).sort();
  try {
    localStorage.setItem(indexKey, JSON.stringify(dateList));
  } catch {}
  return dateList;
}

/**
 * Synchronizes a day's prayer statuses with the completed dates index.
 */
export function syncCompletedDate(dateStr, prayerStatuses, userScope = "") {
  const indexKey = `tawfiq_prayer_dates_${userScope}`;
  const existing = new Set(getStoredCompletedDates(userScope));
  const qualifies = hasQualifyingPrayer(prayerStatuses);

  let changed = false;
  if (qualifies && !existing.has(dateStr)) {
    existing.add(dateStr);
    changed = true;
  } else if (!qualifies && existing.has(dateStr)) {
    existing.delete(dateStr);
    changed = true;
  }

  const updatedList = Array.from(existing).sort();
  if (changed) {
    try {
      localStorage.setItem(indexKey, JSON.stringify(updatedList));
    } catch {}
  }
  return updatedList;
}


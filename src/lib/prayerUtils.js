export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export const PRAYER_NAMES = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export const CALCULATION_METHODS = [
  { id: "india", name: "Indian Timing" },

  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, name: "Spiritual Administration of Muslims of Russia" },
];

export async function fetchPrayerTimes(
  lat,
  lon,
  method = "india",
  date = new Date(),
) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  const dateStr = `${y}-${m}-${d}`;

  // Indian timing = Karachi calculation (method 1) + Hanafi Asr (school 1)
  const apiMethod = method === "india" ? 1 : method;
  const school = method === "india" ? 1 : 0;

  // Try cache first
  try {
    const { getCachedTimes, setCachedTimes } = await import("./prayerCache");
    const cached = getCachedTimes(lat, lon, method, dateStr);
    if (cached) return cached;

    const url =
      `https://api.aladhan.com/v1/timings/${d}-${m}-${y}` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&method=${apiMethod}` +
      `&school=${school}` +
      `&timezonestring=Asia/Kolkata`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch prayer times");
    const data = await res.json();
    setCachedTimes(lat, lon, method, dateStr, data.data);
    return data.data;
  } catch (e) {
    // If cache import fails, fall through to direct fetch
    const url =
      `https://api.aladhan.com/v1/timings/${d}-${m}-${y}` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&method=${apiMethod}` +
      `&school=${school}` +
      `&timezonestring=Asia/Kolkata`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch prayer times");
    const data = await res.json();
    return data.data;
  }
}

async function fetchHijriDate(date = new Date()) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  const res = await fetch(`https://api.aladhan.com/v1/gToH/${d}-${m}-${y}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.hijri;
}

export { fetchHijriDate };

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        alert("SUCCESS");

        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        alert(error.message);
        reject(error);
      },
    );
  });
}

export function formatTime12h(timeStr) {
  if (!timeStr) return "--:--";
  const [h, min] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${min.toString().padStart(2, "0")} ${period}`;
}

export function getDayScore(prayers) {
  if (!prayers) return 0;
  return Object.values(prayers).filter((s) => s === "on_time").length;
}

// Schedule browser notifications N minutes before each prayer time
export function schedulePrayerNotifications(
  timings,
  prayerOrder,
  minutesBefore = 15,
) {
  const ids = [];
  const now = new Date();

  prayerOrder.forEach((prayer) => {
    const key = prayer.charAt(0).toUpperCase() + prayer.slice(1);
    const timeStr = timings[key];
    if (!timeStr) return;
    const [h, min] = timeStr.split(":").map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(h, min, 0, 0);
    const notifyAt = new Date(prayerTime.getTime() - minutesBefore * 60 * 1000);
    const delay = notifyAt.getTime() - now.getTime();
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      const id = setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("Prayer Reminder", {
            body: `${PRAYER_NAMES[prayer]} is in ${minutesBefore} minutes`,
            icon: "/favicon.ico",
            tag: `prayer-${prayer}`,
          });
        }
      }, delay);
      ids.push(id);
    }
  });

  return () => ids.forEach(clearTimeout);
}

// Returns ms until the prayer window closes (30 min before next prayer start)
export function scheduleWindowWarnings(timings, prayerOrder, callback) {
  const ids = [];
  const now = new Date();

  prayerOrder.forEach((prayer, i) => {
    const nextPrayer = prayerOrder[i + 1];
    if (!nextPrayer) return;
    const nextTimeStr =
      timings[nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1)];
    if (!nextTimeStr) return;

    const [h, min] = nextTimeStr.split(":").map(Number);
    const windowEnd = new Date();
    windowEnd.setHours(h, min, 0, 0);

    const warnAt = new Date(windowEnd.getTime() - 30 * 60 * 1000);
    const delay = warnAt.getTime() - now.getTime();

    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      const id = setTimeout(() => callback(prayer), delay);
      ids.push(id);
    }
  });

  return () => ids.forEach(clearTimeout);
}
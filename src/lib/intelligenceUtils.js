import { PRAYERS, PRAYER_NAMES, getDayScore } from "./prayerUtils";
import { format, subDays, parseISO, differenceInDays } from "date-fns";

/** Build a date→log map for fast lookup */
export function buildLogMap(logs) {
  const map = {};
  logs.forEach((l) => {
    map[l.date] = l;
  });
  return map;
}

/** Prayer Health Score (0-100) */
export function calcHealthScore(logs) {
  const recent = logs.filter((l) => !l.is_exempt).slice(0, 30);
  if (recent.length === 0) return null;
  let total = 0,
    earned = 0;
  recent.forEach((l) => {
    PRAYERS.forEach((p) => {
      const s = l.prayers?.[p];
      if (!s || s === "none") return;
      total += 4;
      if (s === "on_time") earned += 2;
      else if (s === "late") earned += 1;
      if (l.jamaah?.[p]) earned += 1;
      if (l.quality?.[p]?.sunnah) earned += 0.5;
      if (l.quality?.[p]?.dhikr) earned += 0.5;
    });
  });
  return total > 0 ? Math.min(100, Math.round((earned / total) * 100)) : null;
}
/** Per-prayer on-time % for recent N days */
export function prayerRates(logs, days = 30) {
  const recent = logs.filter((l) => !l.is_exempt).slice(0, days);
  return PRAYERS.map((p) => {
    const logged = recent.filter(
      (l) => l.prayers?.[p] && l.prayers[p] !== "none",
    );
    const onTime = logged.filter((l) => l.prayers[p] === "on_time").length;
    return {
      prayer: p,
      name: PRAYER_NAMES[p],
      pct:
        logged.length > 0 ? Math.round((onTime / logged.length) * 100) : null,
      logged: logged.length,
    };
  });
}

/** Strongest and weakest prayer */
export function strongestWeakest(logs, days = 30) {
  const rates = prayerRates(logs, days).filter((r) => r.pct !== null);
  if (rates.length === 0) return { strongest: null, weakest: null };
  const sorted = [...rates].sort((a, b) => b.pct - a.pct);
  return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
}

/** Salah Age — first log date */
export function salahAge(logs) {
  if (logs.length === 0) return null;
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].date;
  const days = differenceInDays(new Date(), parseISO(first));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainDays = days % 30;
  return { days, years, months, remainDays, since: first };
}

/** Perfect days (all 5 on time) */
export function perfectDayStats(logs) {
  const nonExempt = logs.filter((l) => !l.is_exempt);
  const perfect = nonExempt.filter((l) => getDayScore(l.prayers) === 5);
  const total = nonExempt.length;

  // Perfect weeks: weeks where all tracked days are perfect
  const weekMap = {};
  nonExempt.forEach((l) => {
    const d = parseISO(l.date);
    const weekKey = format(subDays(d, d.getDay()), "yyyy-MM-dd");
    if (!weekMap[weekKey]) weekMap[weekKey] = { total: 0, perfect: 0 };
    weekMap[weekKey].total++;
    if (getDayScore(l.prayers) === 5) weekMap[weekKey].perfect++;
  });
  const perfectWeeks = Object.values(weekMap).filter(
    (w) => w.total >= 7 && w.perfect === w.total,
  ).length;

  return { perfectDays: perfect.length, totalDays: total, perfectWeeks };
}

/** Momentum score: weighted recent performance (last 7 vs last 30) */
export function calcMomentum(logs) {
  const recent7 = logs.filter((l) => !l.is_exempt).slice(0, 7);
  const recent30 = logs.filter((l) => !l.is_exempt).slice(0, 30);
  function avgScore(arr) {
    if (!arr.length) return 0;
    return (
      (arr.reduce((sum, l) => sum + getDayScore(l.prayers), 0) /
        arr.length /
        5) *
      100
    );
  }
  const s7 = avgScore(recent7);
  const s30 = avgScore(recent30);
  const delta = s7 - s30;
  let label = "Stable";
  if (delta > 10) label = "Rising";
  else if (delta > 5) label = "Improving";
  else if (delta < -10) label = "Declining";
  else if (delta < -5) label = "Slipping";
  return {
    score7: Math.round(s7),
    score30: Math.round(s30),
    delta: Math.round(delta),
    label,
  };
}

/** Risk engine: predict which prayers are at risk */
export function calcRiskScore(logs) {
  const recent = logs.filter((l) => !l.is_exempt).slice(0, 14);
  return PRAYERS.map((p) => {
    const tracked = recent.filter(
      (l) => l.prayers?.[p] && l.prayers[p] !== "none",
    );
    const missed = tracked.filter((l) => l.prayers[p] === "missed").length;
    const late = tracked.filter((l) => l.prayers[p] === "late").length;
    const risk =
      tracked.length > 0
        ? Math.round(((missed * 2 + late * 0.5) / (tracked.length * 2)) * 100)
        : 0;
    return {
      prayer: p,
      name: PRAYER_NAMES[p],
      risk: Math.min(100, risk),
      tracked: tracked.length,
    };
  });
}

/** Future self simulation */
export function futureSelf(logs) {
  const nonExempt = logs.filter((l) => !l.is_exempt);
  const recent30 = nonExempt.slice(0, 30);
  if (recent30.length === 0) return null;

  const avgDayScore =
    recent30.reduce((s, l) => s + getDayScore(l.prayers), 0) / recent30.length;
  const currentPct = Math.round((avgDayScore / 5) * 100);

  // Streak projection
  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    const l = nonExempt.find((x) => x.date === d);
    if (!l || getDayScore(l.prayers) < 5) {
      if (i > 0) break;
      else continue;
    }
    currentStreak++;
  }

  // Qaza trend
  return {
    currentPct,
    proj30: Math.min(100, Math.round(currentPct * 1.02)),
    proj90: Math.min(100, Math.round(currentPct * 1.05)),
    proj365: Math.min(100, Math.round(currentPct * 1.12)),
    currentStreak,
    projStreak30: Math.round(currentStreak * 1.5),
    projStreak90: Math.round(currentStreak * 2.5),
  };
}

/** Detect Islamic seasons */
export function detectSeason(hijriMonth, hijriDay) {
  if (!hijriMonth) return null;
  const m = Number(hijriMonth);
  const d = Number(hijriDay);
  if (m === 9)
    return {
      name: "Ramadan",
      icon: "🌙",
      desc: "Blessed month of fasting & worship",
    };
  if (m === 12)
    return {
      name: "Dhul Hijjah",
      icon: "🕋",
      desc: "Greatest days of the year",
    };
  if (m === 1 && d <= 10)
    return {
      name: "Muharram",
      icon: "📅",
      desc: "Sacred month, Ashura approaching",
    };
  return null;
}

/** End of day reflection */
export function endOfDayReflection(log) {
  if (!log) return null;
  const prayers = log.prayers || {};
  const completed = PRAYERS.filter(
    (p) => prayers[p] === "on_time" || prayers[p] === "late",
  );
  const missed = PRAYERS.filter((p) => prayers[p] === "missed");
  const best = PRAYERS.filter(
    (p) => prayers[p] === "on_time" && log.jamaah?.[p],
  );
  const bestPrayer =
    best.length > 0
      ? best[0]
      : PRAYERS.find((p) => prayers[p] === "on_time") || null;
  const improvement =
    missed[0] || PRAYERS.find((p) => prayers[p] === "late") || null;

  return {
    completedCount: completed.length,
    missedCount: missed.length,
    bestPrayer: bestPrayer ? PRAYER_NAMES[bestPrayer] : null,
    improvement: improvement ? PRAYER_NAMES[improvement] : null,
  };
}

/** Identify improvement causes */
export function whyImproving(logs) {
  const recent14 = logs.filter((l) => !l.is_exempt).slice(0, 14);
  const prev14 = logs.filter((l) => !l.is_exempt).slice(14, 28);
  if (recent14.length < 7 || prev14.length < 7) return null;

  function pct(arr) {
    let onT = 0,
      tot = 0;
    arr.forEach((l) =>
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (s && s !== "none") {
          tot++;
          if (s === "on_time") onT++;
        }
      }),
    );
    return tot > 0 ? Math.round((onT / tot) * 100) : 0;
  }

  function jamaahPct(arr) {
    let j = 0,
      tot = 0;
    arr.forEach((l) =>
      PRAYERS.forEach((p) => {
        if (l.prayers?.[p] === "on_time") {
          tot++;
          if (l.jamaah?.[p]) j++;
        }
      }),
    );
    return tot > 0 ? Math.round((j / tot) * 100) : 0;
  }

  const recentPct = pct(recent14);
  const prevPct = pct(prev14);
  const delta = recentPct - prevPct;
  const recentJ = jamaahPct(recent14);
  const prevJ = jamaahPct(prev14);

  const factors = [];
  if (recentJ > prevJ + 5) factors.push("Higher Jama'ah attendance");
  if (delta > 5) factors.push("Better weekly consistency");
  if (delta > 10) factors.push("Significant on-time improvement");

  return { delta, recentPct, prevPct, factors };
}

/** Dynamic goal generation */
export function generateGoal(logs) {
  const rates = prayerRates(logs, 14);
  const weak = rates
    .filter((r) => r.pct !== null)
    .sort((a, b) => a.pct - b.pct)[0];
  if (!weak)
    return {
      title: "Complete all 5 prayers today",
      desc: "Start your journey",
    };

  if (weak.pct < 40)
    return {
      title: `Complete ${weak.name} 3 days in a row`,
      desc: `Build the habit first`,
      next: `Then aim for 7 days`,
    };
  if (weak.pct < 60)
    return {
      title: `Pray ${weak.name} on time 5× this week`,
      desc: `Steady improvement`,
      next: `Then aim for daily`,
    };
  if (weak.pct < 80)
    return {
      title: `${weak.name} on time every day this week`,
      desc: `You're close`,
      next: `Then extend to 30 days`,
    };
  return {
    title: "Maintain perfect week",
    desc: "You're excelling — keep going",
    next: "Aim for a perfect month",
  };
}

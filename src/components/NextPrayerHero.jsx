import React, { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Compass } from "lucide-react";
import { CALCULATION_METHODS } from "@/lib/prayerUtils"; // Ensure path is correct

function parseTimeToDate(timeStr) {
  if (!timeStr) return null;
  const [h, min] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, min, 0, 0);
  return d;
}

function getNextPrayer(rawTimings) {
  if (!rawTimings) return null;
  const now = new Date();
  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  for (const name of order) {
    const t = parseTimeToDate(rawTimings[name]);
    if (t && t > now)
      return {
        name: name.toLowerCase(),
        label: name,
        time: t,
        raw: rawTimings[name],
      };
  }
  const t = parseTimeToDate(rawTimings["Fajr"]);
  if (t) {
    t.setDate(t.getDate() + 1);
  }
  return { name: "fajr", label: "Fajr", time: t, raw: rawTimings["Fajr"] };
}

function getStatus(nextPrayer, isFriday) {
  if (!nextPrayer?.time) return null;
  const diffMs = nextPrayer.time - new Date();
  const diffMin = diffMs / 60000;
  if (diffMs <= 0)
    return { label: "Time Entered", color: "bg-red-500", dot: "bg-red-300" };
  if (diffMin <= 15)
    return {
      label: "Starting Soon",
      color: "bg-amber-500",
      dot: "bg-amber-300",
    };
  return isFriday
    ? { label: "Upcoming", color: "bg-amber-600", dot: "bg-amber-300" }
    : { label: "Upcoming", color: "bg-emerald-600", dot: "bg-emerald-300" };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatCountdown(ms) {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h: pad2(h), m: pad2(m), s: pad2(s) };
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return "--:--";
  const [h, min] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${pad2(min)} ${period}`;
}

const NextPrayerHero = memo(function NextPrayerHero({
  rawTimings,
  calcMethod,
  onQiblaOpen,
  isFriday = false,
}) {
  const [countdown, setCountdown] = useState({ h: "--", m: "--", s: "--" });
  const [status, setStatus] = useState(null);
  const timerRef = useRef(null);

  const next = rawTimings ? getNextPrayer(rawTimings) : null;
  const methodName =
    CALCULATION_METHODS.find((m) => m.id === calcMethod)?.name ||
    "Standard Method";
    
  const bgUrl =
    "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1800&q=80&auto=format&fit=crop";

  useEffect(() => {
    if (!next?.time) return;
    function tick() {
      const ms = next.time - new Date();
      setCountdown(formatCountdown(ms));
      setStatus(getStatus(next, isFriday));
    }
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [next?.name, next?.time?.getTime(), isFriday]);

  const st = status || getStatus(next, isFriday);

  const digitText = isFriday ? "text-amber-300" : "text-white";
  const digitBox = isFriday
    ? "bg-amber-400/15 border-amber-300/25"
    : "bg-white/15 border-white/15";
  const digitLabel = isFriday ? "text-amber-200/70" : "text-white/60";

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/10 ring-1 ring-white/10"
      style={{ minHeight: 220 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage: `url(${bgUrl})`,
          willChange: "transform",
          animation: "heroZoom 35s ease-in-out infinite alternate",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

      <div className="relative px-5 pt-5 pb-5 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          {st ? (
            <span
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 shadow-lg rounded-full text-white ${st.color}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${st.dot}`}
              />
              {st.label}
            </span>
          ) : (
            <span className="text-xs text-white/60">Loading…</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-end gap-3">
            <p className="text-5xl font-extrabold tracking-tight text-white leading-[0.9]">
              {next?.label || "—"}
            </p>
            <p className="text-xl font-semibold text-white/70 leading-[1.1] pb-0.5">
              {next ? formatDisplayTime(next.raw) : ""}
            </p>
          </div>
          {rawTimings && (
            <div className="flex flex-col">
              <p className="flex items-center gap-1.5 text-[12px] text-white/70 font-medium">
                <Compass size={12} />
                {methodName}
              </p>
            </div>
          )}
        </div>

        {next && (
          <div className="flex items-center gap-2">
            {[
              ["h", "HRS"],
              ["m", "MIN"],
              ["s", "SEC"],
            ].map(([key, label]) => (
              <div
                key={key}
                className={`flex flex-col items-center backdrop-blur-md rounded-2xl px-4 py-3 min-w-[62px] shadow-lg border ${digitBox}`}
              >
                <span
                  className={`text-3xl font-black tabular-nums leading-none ${digitText}`}
                >
                  {countdown[key]}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.15em] mt-1 ${digitLabel}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onQiblaOpen}
            className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95"
          >
            <Compass size={13} /> Qibla
          </button>
          <Link
            to="/dhikr"
            className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95"
          >
            <BookOpen size={13} />
            Dhikr
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1.1); }
          to   { transform: scale(1.18); }
        }
      `}</style>
    </div>
  );
});

export default NextPrayerHero;
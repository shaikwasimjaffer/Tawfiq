import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Minus,
  CalendarDays,
  TrendingDown,
  Edit3,
  Check,
  X,
  Calculator,
  Trash2,
} from "lucide-react";
import { useQaza } from "@/lib/useQaza";
import { PRAYER_NAMES, PRAYERS } from "@/lib/prayerUtils";
import BottomNav from "@/components/BottomNav";

// ─── Native Zero-Dependency Confetti ──────────────────────────────────────────
const LocalConfetti = () => {
  const colors = [
    "#16a34a",
    "#d97706",
    "#ef4444",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];

  // Generate 75 random confetti pieces
  const pieces = useMemo(
    () =>
      Array.from({ length: 75 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${Math.random() * 2 + 2}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: `${Math.random() * 6 + 4}px`,
        height: `${Math.random() * 12 + 6}px`,
        rotation: `${Math.random() * 360}deg`,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-10%]"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation})`,
            animation: `confetti-fall ${p.animationDuration} linear ${p.animationDelay} forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ─── Counter Component ───────────────────────────────────────────────────────
function Counter({ name, count, onAdd, onSub, onSet }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  function startEdit() {
    setInputVal(String(count));
    setEditing(true);
  }

  function confirmEdit() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 0) onSet(n);
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between py-5 border-b border-border hover:bg-green-50 dark:hover:bg-green-950/20 rounded-2xl px-2 transition-all duration-300 last:border-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {count === 0 ? "All clear" : `${count} owed`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {editing ? (
          <>
            <input
              type="number"
              min="0"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="w-20 text-center font-bold text-base bg-secondary border border-border rounded-xl px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring tabular-nums"
              autoFocus
            />
            <button
              onClick={confirmEdit}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white active:scale-90 transition-all"
            >
              <Check size={13} />
            </button>
            <button
              onClick={cancelEdit}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground active:scale-90 transition-all"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onSub}
              disabled={count === 0}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-secondary hover:bg-red-50 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-all duration-300 active:scale-90"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={startEdit}
              className={`w-14 text-center text-2xl font-black tabular-nums transition-all ${count > 0 ? "text-foreground" : "text-muted-foreground/50"}`}
            >
              {count}
            </button>
            <button
              onClick={onAdd}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-90"
            >
              <Plus size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Debt Forecast Component ─────────────────────────────────────────────────
function DebtForecast({ total, history }) {
  const forecast = useMemo(() => {
    if (total === 0) return null;

    const avgDaily = history.avgDailyMadeUp || 0;
    const daysAtCurrent = avgDaily > 0 ? Math.ceil(total / avgDaily) : null;
    const daysAtPlus5 =
      avgDaily > 0 ? Math.ceil(total / (avgDaily + 5)) : Math.ceil(total / 5);
    const daysAtPlus10 = Math.ceil(total / 10);

    function formatDuration(days) {
      if (days <= 0) return "Done!";
      if (days < 30) return `${days} days`;
      if (days < 365) return `${Math.round(days / 30)} months`;
      return `${(days / 365).toFixed(1)} years`;
    }

    return {
      daysAtCurrent: daysAtCurrent ? formatDuration(daysAtCurrent) : null,
      daysAtPlus5: formatDuration(daysAtPlus5),
      daysAtPlus10: formatDuration(daysAtPlus10),
      avgDaily: avgDaily.toFixed(1),
    };
  }, [total, history]);

  if (!forecast) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown size={15} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Debt Forecast
        </p>
      </div>

      <div className="space-y-2.5">
        {forecast.daysAtCurrent && (
          <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-secondary">
            <p className="text-sm text-muted-foreground">At current pace</p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {forecast.daysAtCurrent}
            </p>
          </div>
        )}
        <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-foreground font-medium">+5 daily extra</p>
          <p className="text-sm font-bold text-primary tabular-nums">
            {forecast.daysAtPlus5}
          </p>
        </div>
        <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-secondary">
          <p className="text-sm text-muted-foreground">+10 daily extra</p>
          <p className="text-sm font-bold text-foreground tabular-nums">
            {forecast.daysAtPlus10}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Every prayer made up counts. Go at your own pace.
      </p>
    </div>
  );
}

// ─── Main Qaza Component ─────────────────────────────────────────────────────
export default function Qaza() {
  const {
    qaza,
    total,
    loading,
    adjust,
    addFullDay,
    subtractFullDay,
    setAmount,
  } = useQaza();

  // Baseline tracking for Progress Bar
  const [baseline, setBaseline] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("qaza_baseline");
    if (stored) setBaseline(parseInt(stored, 10));
  }, []);

  useEffect(() => {
    if (total > baseline) {
      setBaseline(total);
      localStorage.setItem("qaza_baseline", total);
    }
  }, [total, baseline]);

  const progressPercent =
    baseline > 0
      ? Math.max(0, Math.min(100, ((baseline - total) / baseline) * 100))
      : 0;

  // Milestone tracking for native Confetti
  const [showConfetti, setShowConfetti] = useState(false);
  const prevTotalRef = useRef(total);

  useEffect(() => {
    if (!loading && prevTotalRef.current > 0 && total < prevTotalRef.current) {
      const milestones = [0, 500, 1000, 1500, 2000, 2500, 3000];
      const crossed = milestones.some(
        (m) => prevTotalRef.current > m && total <= m,
      );
      if (crossed) {
        setShowConfetti(true);
        // Turn off confetti after 4 seconds
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
    prevTotalRef.current = total;
  }, [total, loading]);

  // Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [agePuberty, setAgePuberty] = useState(12);
  const [ageStarted, setAgeStarted] = useState(18);
  const [isFemale, setIsFemale] = useState(false);
  const [mensDays, setMensDays] = useState(7);

  function calculateAndApplyWizard() {
    if (total > 0) {
      const confirmed = window.confirm(
        "Applying this calculation will overwrite your current tracking data. Do you want to proceed?",
      );
      if (!confirmed) return;
    }

    const puberty = parseInt(agePuberty) || 0;
    const started = parseInt(ageStarted) || 0;
    const cycleDays = parseInt(mensDays) || 0;

    const yearsMissed = Math.max(0, started - puberty);
    let daysMissed = Math.ceil(yearsMissed * 365.25);

    if (isFemale) {
      const monthsMissed = yearsMissed * 12;
      const totalMensDays = monthsMissed * cycleDays;
      daysMissed = Math.max(0, daysMissed - totalMensDays);
    }

    PRAYERS.forEach((p) => setAmount(p, daysMissed));

    const newTotal = daysMissed * PRAYERS.length;
    setBaseline(newTotal);
    localStorage.setItem("qaza_baseline", newTotal.toString());

    setShowWizard(false);
  }

  function resetDebtToZero() {
    const confirmed = window.confirm(
      "Are you sure you want to completely clear all your Qaza tracking data? This action cannot be undone.",
    );
    if (!confirmed) return;

    PRAYERS.forEach((p) => setAmount(p, 0));
    setBaseline(0);
    localStorage.setItem("qaza_baseline", "0");
    setShowWizard(false);
  }

  const history = { avgDailyMadeUp: 0 };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Show native CSS confetti on milestones */}
      {showConfetti && <LocalConfetti />}

      {/* Setup Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-foreground">
                Calculate Debt
              </h2>
              <button
                onClick={() => setShowWizard(false)}
                className="w-8 h-8 flex items-center justify-center bg-secondary rounded-full text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Age of Puberty (Baligh)
                </label>
                <input
                  type="number"
                  value={agePuberty}
                  onChange={(e) =>
                    setAgePuberty(
                      e.target.value === "" ? "" : parseInt(e.target.value),
                    )
                  }
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Age Started Praying
                </label>
                <input
                  type="number"
                  value={ageStarted}
                  onChange={(e) =>
                    setAgeStarted(
                      e.target.value === "" ? "" : parseInt(e.target.value),
                    )
                  }
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="femaleToggle"
                  checked={isFemale}
                  onChange={(e) => setIsFemale(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="femaleToggle"
                  className="text-sm font-medium text-foreground select-none cursor-pointer"
                >
                  Subtract Menstruation Days
                </label>
              </div>

              {isFemale && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Avg Days Per Month
                  </label>
                  <input
                    type="number"
                    value={mensDays}
                    onChange={(e) =>
                      setMensDays(
                        e.target.value === "" ? "" : parseInt(e.target.value),
                      )
                    }
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={calculateAndApplyWizard}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                Apply Calculation
              </button>
              <button
                onClick={resetDebtToZero}
                className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 font-bold py-3.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all"
              >
                <Trash2 size={16} /> Clear All Debt to Zero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Fixed classes removed, matching new Sawm style */}
      <header className="bg-background border-b border-border px-6 py-5">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Qaza Prayers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and make up missed prayers
          </p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Total & Progress Bar */}
        <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-card border border-green-100 dark:border-green-900 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Owed
              </p>
              <div className="flex items-end gap-2 mt-1.5 mb-4">
                <p
                  className={`text-6xl font-black leading-none tabular-nums ${total > 0 ? "text-foreground" : "text-green-600"}`}
                >
                  {loading ? "—" : total}
                </p>
                <p className="text-green-700 dark:text-green-300 text-base pb-1 font-medium">
                  prayers
                </p>
              </div>
            </div>
            {!loading && baseline > 0 && total > 0 && (
              <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs font-bold px-3 py-1 rounded-full">
                {progressPercent.toFixed(1)}% cleared
              </div>
            )}
          </div>

          {!loading && baseline > 0 && total > 0 && (
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          )}

          {total === 0 && !loading && (
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-semibold">
              All caught up — well done.
            </p>
          )}
        </div>

        {/* Quick actions & Wizard */}
        <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={addFullDay}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
              <CalendarDays size={15} />+ Full Day (5)
            </button>
            <button
              onClick={subtractFullDay}
              disabled={total < 5}
              className="flex items-center justify-center gap-2 rounded-xl py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 border border-red-200 dark:border-red-800 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 active:scale-95 disabled:opacity-40"
            >
              <CalendarDays size={15} />− Full Day (5)
            </button>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 bg-secondary hover:bg-muted text-foreground font-semibold border border-border transition-all active:scale-95"
          >
            <Calculator size={16} className="text-muted-foreground" /> Calculate
            Debt Wizard
          </button>
        </div>

        {/* Debt Forecast */}
        {!loading && total > 0 && (
          <DebtForecast total={total} history={history} />
        )}

        {/* Per-prayer counters */}
        <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between pt-4 pb-1">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                  By Prayer
                </p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                Tap number to edit
              </span>
            </div>
          </div>
          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-14 my-2 rounded-xl bg-muted animate-pulse"
                  />
                ))
            : PRAYERS.map((p) => (
                <Counter
                  key={p}
                  name={PRAYER_NAMES[p]}
                  count={qaza[`${p}_count`] || 0}
                  onAdd={() => adjust(p, 1)}
                  onSub={() => adjust(p, -1)}
                  onSet={(n) => setAmount(p, n)}
                />
              ))}
        </div>

        <p className="text-sm text-center text-green-700 dark:text-green-300 font-medium px-4 pb-2">
          Add missed prayers from your past. Subtract one each time you make one
          up.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

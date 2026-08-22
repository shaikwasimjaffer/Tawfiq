import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import {
  Plus,
  Minus,
  CalendarDays,
  TrendingDown,
  Check,
  X,
  Calculator,
} from "lucide-react";
import { useQaza } from "@/lib/useQaza";
import { PRAYER_NAMES, PRAYERS } from "@/lib/prayerUtils";
import BottomNav from "@/components/BottomNav";

// ─── Calculation Constants ────────────────────────────────────────────────────
const PRAYER_MULTIPLIERS = {
  never: 1.0,
  sometimes: 0.6,
  usually: 0.2,
  always: 0.0,
};

const SCHOLAR_MODIFIERS = {
  conservative: 0.85,
  moderate: 1.0,
  maximum: 1.15,
};

const HABITS = ["Never", "Sometimes", "Usually", "Always"];

const getInitialPrayers = () => {
  const p = {};
  PRAYERS.forEach((k) => (p[k] = "Never"));
  return p;
};

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

  // Progress tracking
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

  // Milestone Confetti
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
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
    prevTotalRef.current = total;
  }, [total, loading]);

  // ─── WIZARD STATE ─────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  const [gender, setGender] = useState("");
  const [currentAge, setCurrentAge] = useState(25);
  const [pubertyAge, setPubertyAge] = useState(12);
  const [subtractMenses, setSubtractMenses] = useState(false);

  const [prayerStatus, setPrayerStatus] = useState("consistent");
  const [prayingAge, setPrayingAge] = useState(18);

  const [scholarMode, setScholarMode] = useState("moderate");
  const [showScholarInfo, setShowScholarInfo] = useState(false);
  const [manualAdjustment, setManualAdjustment] = useState(0);
  const [dailyPace, setDailyPace] = useState(3);
  const [customPace, setCustomPace] = useState("");

  const [phases, setPhases] = useState([
    {
      id: 1,
      startAge: 12,
      endAge: 18,
      prayers: getInitialPrayers(),
    },
  ]);

  // Constraints & Validations
  useEffect(() => {
    if (pubertyAge > currentAge) setPubertyAge(currentAge);
    if (prayingAge > currentAge) setPrayingAge(currentAge);
    if (prayingAge < pubertyAge) setPrayingAge(pubertyAge);
  }, [currentAge, pubertyAge, prayingAge]);

  useEffect(() => {
    if (prayerStatus === "never") return;

    setPhases((prev) => {
      const safePuberty = Math.min(pubertyAge, currentAge);
      const endLimit = Math.max(safePuberty, Math.min(prayingAge, currentAge));

      let newP = prev.map((p) => ({ ...p, prayers: { ...p.prayers } }));

      newP[0].startAge = safePuberty;

      for (let i = 0; i < newP.length; i++) {
        if (i > 0) newP[i].startAge = newP[i - 1].endAge;
        if (newP[i].endAge < newP[i].startAge)
          newP[i].endAge = newP[i].startAge;
        if (newP[i].endAge > endLimit) newP[i].endAge = endLimit;
      }

      newP[newP.length - 1].endAge = endLimit;

      for (let i = newP.length - 1; i > 0; i--) {
        if (newP[i].startAge > newP[i].endAge) {
          newP[i].startAge = newP[i].endAge;
          newP[i - 1].endAge = newP[i].startAge;
        }
      }

      newP[0].startAge = safePuberty;

      if (JSON.stringify(prev) === JSON.stringify(newP)) return prev;
      return newP;
    });
  }, [currentAge, pubertyAge, prayingAge, prayerStatus]);

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    const handleEscapeKey = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };

    if (isModalOpen) document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isModalOpen]);

  // Phase Helpers
  const handleAddPhase = () => {
    setPhases((prev) => {
      const last = prev[prev.length - 1];
      if (last.endAge - last.startAge <= 1) {
        alert("This phase is too short to divide further.");
        return prev;
      }
      const mid = Math.floor((last.startAge + last.endAge) / 2);
      const newPhases = [...prev];
      newPhases[newPhases.length - 1] = { ...last, endAge: mid };
      newPhases.push({
        id: Date.now(),
        startAge: mid,
        endAge: last.endAge,
        prayers: { ...last.prayers },
      });
      return newPhases;
    });
  };

  const handleDeletePhase = (indexToRemove) => {
    if (phases.length <= 1) return;
    setPhases((prev) => {
      const newPhases = [...prev];
      if (indexToRemove === 0) {
        newPhases[1].startAge = newPhases[0].startAge;
      } else {
        newPhases[indexToRemove - 1].endAge = newPhases[indexToRemove].endAge;
      }
      newPhases.splice(indexToRemove, 1);
      return newPhases;
    });
  };

  const updatePhaseBoundary = (index, value) => {
    const val = parseInt(value) || 0;
    setPhases((prev) => {
      const newP = prev.map((p) => ({ ...p }));
      if (index < newP.length - 1) {
        const minEnd = newP[index].startAge;
        const maxEnd = newP[index + 1].endAge;
        const clamped = Math.max(minEnd, Math.min(val, maxEnd));

        newP[index].endAge = clamped;
        newP[index + 1].startAge = clamped;
      }
      return newP;
    });
  };

  const updatePrayerHabit = (phaseIndex, prayer, habit) => {
    setPhases((prev) => {
      const newP = [...prev];
      newP[phaseIndex].prayers = {
        ...newP[phaseIndex].prayers,
        [prayer]: habit,
      };
      return newP;
    });
  };

  // ─── WIZARD CALCULATIONS ──────────────────────────────────────────────────
  const estimates = useMemo(() => {
    let finalTotal = 0;
    const prayerDebts = {};
    PRAYERS.forEach((p) => (prayerDebts[p] = 0));

    // Assumes roughly 84 menses days per year (7 days/month * 12)
    const daysPerYear = gender === "female" && subtractMenses ? 281 : 365;

    if (prayerStatus === "never") {
      const years = currentAge - pubertyAge;
      if (years > 0) {
        const totalDays = years * daysPerYear;
        PRAYERS.forEach((p) => {
          prayerDebts[p] += totalDays * SCHOLAR_MODIFIERS[scholarMode];
        });
      }
    } else {
      phases.forEach((phase) => {
        const years = phase.endAge - phase.startAge;
        if (years <= 0) return;
        const totalDays = years * daysPerYear;

        PRAYERS.forEach((prayer) => {
          const habit = phase.prayers[prayer] || "Never";
          const multiplier = PRAYER_MULTIPLIERS[habit.toLowerCase()];
          prayerDebts[prayer] +=
            totalDays * multiplier * SCHOLAR_MODIFIERS[scholarMode];
        });
      });
    }

    const finalPrayerDebts = {};
    const adjustmentPerPrayer = manualAdjustment / 5;

    PRAYERS.forEach((p) => {
      const finalDebt = Math.max(
        0,
        Math.round(prayerDebts[p] + adjustmentPerPrayer),
      );
      finalPrayerDebts[p] = finalDebt;
      finalTotal += finalDebt;
    });

    return { finalTotal, finalPrayerDebts };
  }, [
    phases,
    gender,
    subtractMenses,
    scholarMode,
    manualAdjustment,
    prayerStatus,
    currentAge,
    pubertyAge,
  ]);

  function handleCommitEstimate() {
    if (total > 0) {
      const confirmed = window.confirm(
        "Applying this calculation will overwrite your current tracking data. Do you want to proceed?",
      );
      if (!confirmed) return;
    }

    PRAYERS.forEach((p) => {
      setAmount(p, estimates.finalPrayerDebts[p]);
    });

    setBaseline(estimates.finalTotal);
    localStorage.setItem("qaza_baseline", estimates.finalTotal.toString());

    setIsModalOpen(false);
    setModalStep(1);
  }

  function resetDebtToZero() {
    const confirmed = window.confirm(
      "Are you sure you want to completely clear all your Qaza tracking data? This action cannot be undone.",
    );
    if (!confirmed) return;

    PRAYERS.forEach((p) => setAmount(p, 0));
    setBaseline(0);
    localStorage.setItem("qaza_baseline", "0");
    setIsModalOpen(false);
    setModalStep(1);
  }

  const history = { avgDailyMadeUp: 0 };

  return (
    <div className="min-h-screen bg-background pb-28">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #86EFAC;
            border-radius: 999px;
            border: 2px solid #F0FDF4;
            background-clip: padding-box; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #22C55E; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #86EFAC transparent; }
        `,
        }}
      />

      {/* Show native CSS confetti on milestones */}
      {showConfetti && <LocalConfetti />}

      {/* ─── 3-STEP RICH EDITORIAL WIZARD MODAL ────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-green-950/60 backdrop-blur-[4px] z-40"
            />

            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="custom-scrollbar bg-[#F0FDF4] border border-green-200/80 w-full max-w-[36rem] p-6 md:p-8 shadow-2xl relative pointer-events-auto text-left flex flex-col max-h-[90vh] overflow-y-auto"
                style={{ borderRadius: "0.75rem" }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-green-600/70 hover:text-green-950 transition-colors z-10 h-8 w-8 flex items-center justify-center rounded hover:bg-green-100"
                >
                  <X size={20} />
                </button>

                <AnimatePresence mode="wait">
                  {/* --- STEP 1 --- */}
                  {modalStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-['Geist',sans-serif] tracking-[0.25em] uppercase text-green-500 font-semibold">
                          Step 1 of 3
                        </p>
                      </div>

                      <h3 className="font-serif font-semibold text-[clamp(1.5rem,3vw,2rem)] text-green-950 mb-3 tracking-tight leading-[1.2]">
                        Estimate Your Missed Prayers
                      </h3>
                      <p className="text-sm md:text-base text-green-800/80 leading-relaxed mb-6">
                        Answer a few questions to build an accurate starting
                        point.
                      </p>

                      <div className="space-y-8">
                        {/* Gender & Menses */}
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <label className="block text-sm font-semibold uppercase tracking-wider text-green-950 mb-3">
                              Select your gender
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { id: "male", label: "Male" },
                                { id: "female", label: "Female" },
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => {
                                    setGender(option.id);
                                    if (option.id === "male")
                                      setSubtractMenses(false);
                                  }}
                                  className={`w-full text-center px-4 py-3 border rounded-lg transition-colors duration-200 text-sm cursor-pointer ${
                                    gender === option.id
                                      ? "border-green-950 bg-green-950/10 text-green-950 font-semibold"
                                      : "border-green-200 bg-white/50 text-green-700 hover:border-[#16A34A]"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <AnimatePresence>
                            {gender === "female" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <label className="flex items-center gap-3 cursor-pointer group pt-1">
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={subtractMenses}
                                    onChange={() =>
                                      setSubtractMenses(!subtractMenses)
                                    }
                                  />
                                  <div
                                    className={`w-5 h-5 flex items-center justify-center border rounded transition-colors duration-200 ${
                                      subtractMenses
                                        ? "border-green-950 bg-green-950"
                                        : "border-green-300 bg-white/80 group-hover:border-[#16A34A]"
                                    }`}
                                  >
                                    {subtractMenses && (
                                      <Check size={14} className="text-white" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-green-950">
                                    Exclude menstruation days (avg. 7
                                    days/month)
                                  </span>
                                </label>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Tactile Slider: Current Age */}
                          <div className="pt-2">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-sm font-semibold uppercase tracking-wider text-green-950">
                                Current Age?
                              </label>
                              <span className="text-base font-semibold text-[#16A34A]">
                                {currentAge}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="9"
                              max="90"
                              step="1"
                              value={currentAge}
                              onChange={(e) =>
                                setCurrentAge(Number(e.target.value))
                              }
                              className="w-full accent-[#16A34A] bg-green-200 h-1.5 rounded-lg cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-green-600 mt-2 font-semibold">
                              <span>9</span>
                              <span>90</span>
                            </div>
                          </div>

                          {/* Tactile Slider: Puberty Age */}
                          <div className="pt-2">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-sm font-semibold uppercase tracking-wider text-green-950">
                                Puberty Age?
                              </label>
                              <span className="text-base font-semibold text-[#16A34A]">
                                {pubertyAge}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="9"
                              max={currentAge}
                              step="1"
                              value={pubertyAge}
                              onChange={(e) =>
                                setPubertyAge(Number(e.target.value))
                              }
                              className="w-full accent-[#16A34A] bg-green-200 h-1.5 rounded-lg cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-green-600 mt-2 font-semibold">
                              <span>9</span>
                              <span>{currentAge}</span>
                            </div>
                          </div>

                          {/* Prayer Consistency Logic */}
                          <div className="pt-4">
                            <label className="block text-sm font-semibold uppercase tracking-wider text-green-950 mb-3">
                              Prayer Consistency
                            </label>

                            <div className="space-y-2 mb-6">
                              <label
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                  prayerStatus === "consistent"
                                    ? "border-green-950 bg-green-950/10 font-semibold"
                                    : "border-green-200 bg-white/50 hover:border-[#16A34A]"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                    prayerStatus === "consistent"
                                      ? "border-green-950"
                                      : "border-green-400"
                                  }`}
                                >
                                  {prayerStatus === "consistent" && (
                                    <div className="w-2 h-2 bg-green-950 rounded-full" />
                                  )}
                                </div>
                                <input
                                  type="radio"
                                  className="hidden"
                                  checked={prayerStatus === "consistent"}
                                  onChange={() => setPrayerStatus("consistent")}
                                />
                                <span className="text-sm text-green-950">
                                  I began praying consistently
                                </span>
                              </label>

                              <label
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                  prayerStatus === "never"
                                    ? "border-green-950 bg-green-950/10 font-semibold"
                                    : "border-green-200 bg-white/50 hover:border-[#16A34A]"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                    prayerStatus === "never"
                                      ? "border-green-950"
                                      : "border-green-400"
                                  }`}
                                >
                                  {prayerStatus === "never" && (
                                    <div className="w-2 h-2 bg-green-950 rounded-full" />
                                  )}
                                </div>
                                <input
                                  type="radio"
                                  className="hidden"
                                  checked={prayerStatus === "never"}
                                  onChange={() => setPrayerStatus("never")}
                                />
                                <span className="text-sm text-green-950">
                                  I have never prayed consistently
                                </span>
                              </label>
                            </div>

                            {/* Tactile Slider: Praying Age */}
                            <div
                              className={`transition-all duration-300 ${
                                prayerStatus === "never"
                                  ? "opacity-30 pointer-events-none grayscale"
                                  : "opacity-100"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-semibold uppercase tracking-wider text-green-950">
                                  Age you began praying regularly?
                                </label>
                                <span className="text-base font-semibold text-[#16A34A]">
                                  {prayingAge}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={pubertyAge}
                                max={currentAge}
                                step="1"
                                value={prayingAge}
                                onChange={(e) =>
                                  setPrayingAge(Number(e.target.value))
                                }
                                disabled={prayerStatus === "never"}
                                className="w-full accent-[#16A34A] bg-green-200 h-1.5 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                              />
                              <div className="flex justify-between text-xs text-green-600 mt-2 font-semibold">
                                <span>{pubertyAge}</span>
                                <span>{currentAge}</span>
                              </div>
                            </div>
                          </div>

                          {/* Scholar Mode */}
                          <div className="pt-6">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-sm font-semibold uppercase tracking-wider text-green-950">
                                Calculation Method
                              </label>
                              <button
                                onClick={() =>
                                  setShowScholarInfo(!showScholarInfo)
                                }
                                className="text-xs uppercase tracking-widest text-[#16A34A] hover:text-green-950 underline underline-offset-2 font-semibold cursor-pointer"
                              >
                                Learn More
                              </button>
                            </div>

                            <AnimatePresence>
                              {showScholarInfo && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-sm text-green-800 mb-3 p-3 bg-white/50 border border-green-200 rounded-lg">
                                    Provides different estimation models based
                                    on varying fiqh assumptions. Adjusting
                                    changes total +/- 15%.
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="grid grid-cols-3 gap-2">
                              {["conservative", "moderate", "maximum"].map(
                                (mode) => (
                                  <button
                                    key={mode}
                                    onClick={() => setScholarMode(mode)}
                                    className={`py-2 text-sm capitalize border rounded-lg transition-colors cursor-pointer ${
                                      scholarMode === mode
                                        ? "border-green-950 bg-green-950/10 font-semibold text-green-950"
                                        : "border-green-200 bg-white/50 text-green-700 hover:border-[#16A34A]"
                                    }`}
                                  >
                                    {mode}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-5 border-t border-green-200">
                          <button
                            onClick={() =>
                              setModalStep(
                                prayerStatus === "consistent" ? 2 : 3,
                              )
                            }
                            className="bg-green-950 text-white text-sm md:text-base font-semibold py-3 px-8 rounded-full hover:bg-[#16A34A] transition-colors duration-300 shadow-sm cursor-pointer"
                          >
                            Next Step
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- STEP 2: Phased Habits --- */}
                  {modalStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-['Geist',sans-serif] tracking-[0.25em] uppercase text-green-500 font-semibold">
                          Step 2 of 3
                        </p>
                      </div>

                      <h3 className="font-serif font-semibold text-[clamp(1.5rem,3vw,2rem)] text-green-950 mb-3 tracking-tight leading-[1.2]">
                        Detail Your Journey
                      </h3>
                      <p className="text-sm md:text-base text-green-800/80 leading-relaxed mb-6">
                        Break down the years between {pubertyAge} and{" "}
                        {prayingAge} to reflect when your habits changed.
                      </p>

                      <div className="space-y-6">
                        {phases.map((phase, index) => (
                          <div
                            key={phase.id}
                            className="p-5 border border-green-200 rounded-xl bg-white/50 relative"
                          >
                            {phases.length > 1 && (
                              <button
                                onClick={() => handleDeletePhase(index)}
                                className="absolute top-4 right-4 text-green-500 hover:text-red-500 transition-colors"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            )}

                            <h4 className="text-lg font-semibold text-green-950 mb-4">
                              Ages {phase.startAge} to {phase.endAge}
                            </h4>

                            {index < phases.length - 1 && (
                              <div className="mb-6">
                                <label className="block text-xs text-green-800 mb-2 font-semibold">
                                  Adjust End Age
                                </label>
                                <input
                                  type="range"
                                  min={phase.startAge + 1}
                                  max={phases[index + 1].endAge - 1}
                                  step="1"
                                  value={phase.endAge}
                                  onChange={(e) =>
                                    updatePhaseBoundary(index, e.target.value)
                                  }
                                  className="w-full accent-[#16A34A] bg-green-200 h-1.5 rounded-lg cursor-pointer"
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              {PRAYERS.map((prayer) => (
                                <div
                                  key={prayer}
                                  className="flex justify-between items-center bg-[#F0FDF4] p-2.5 px-3 border border-green-100 rounded-lg"
                                >
                                  <span className="font-semibold text-green-900 text-sm">
                                    {PRAYER_NAMES[prayer] || prayer}
                                  </span>
                                  <select
                                    value={phase.prayers[prayer] || "Never"}
                                    onChange={(e) =>
                                      updatePrayerHabit(
                                        index,
                                        prayer,
                                        e.target.value,
                                      )
                                    }
                                    className="bg-transparent text-sm text-green-800 font-semibold outline-none cursor-pointer"
                                  >
                                    {HABITS.map((habit) => (
                                      <option key={habit} value={habit}>
                                        {habit}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={handleAddPhase}
                          className="w-full py-3 border-2 border-dashed rounded-xl border-green-300 text-green-700 text-sm font-semibold hover:bg-green-100/50 transition-colors"
                        >
                          + Split into another phase
                        </button>

                        <div className="flex justify-between pt-6 border-t border-green-200">
                          <button
                            onClick={() => setModalStep(1)}
                            className="text-green-700 text-sm md:text-base font-semibold hover:text-green-950 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => setModalStep(3)}
                            className="bg-green-950 text-white text-sm md:text-base font-semibold py-3 px-8 rounded-full hover:bg-[#16A34A] transition-colors duration-300 shadow-sm"
                          >
                            Next Step
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- STEP 3: Final Tweaks --- */}
                  {modalStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-['Geist',sans-serif] tracking-[0.25em] uppercase text-green-500 font-semibold">
                          Step 3 of 3
                        </p>
                      </div>

                      <h3 className="font-serif font-semibold text-[clamp(1.5rem,3vw,2rem)] text-green-950 mb-3 tracking-tight leading-[1.2]">
                        Pace & Refinement
                      </h3>
                      <p className="text-sm md:text-base text-green-800/80 leading-relaxed mb-6">
                        Finalize your plan by setting your daily recovery pace
                        and any manual adjustments.
                      </p>

                      <div className="space-y-8">
                        <div>
                          <label className="block text-sm font-semibold uppercase tracking-wider text-green-950 mb-2">
                            Manual Adjustment (Optional)
                          </label>
                          <p className="text-xs md:text-sm text-green-700/80 mb-3">
                            Add or subtract specific prayers to the total if you
                            have previously made some up.
                          </p>
                          <input
                            type="number"
                            value={manualAdjustment}
                            onChange={(e) =>
                              setManualAdjustment(Number(e.target.value))
                            }
                            className="w-full bg-white/50 border border-green-200 rounded-lg p-3 text-green-950 text-base outline-none focus:border-[#16A34A] tabular-nums"
                            placeholder="e.g. -500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold uppercase tracking-wider text-green-950 mb-2">
                            Daily Pace
                          </label>
                          <p className="text-xs md:text-sm text-green-700/80 mb-3">
                            How many Qaza prayers do you plan to make up each
                            day?
                          </p>
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {[1, 3, 5, 10].map((pace) => (
                              <button
                                key={pace}
                                onClick={() => {
                                  setDailyPace(pace);
                                  setCustomPace("");
                                }}
                                className={`py-2 text-sm rounded-lg border transition-colors ${
                                  dailyPace === pace && !customPace
                                    ? "border-green-950 bg-green-950/10 font-semibold text-green-950"
                                    : "border-green-200 bg-white/50 text-green-700 hover:border-[#16A34A]"
                                }`}
                              >
                                {pace}
                              </button>
                            ))}
                          </div>
                          <input
                            type="number"
                            value={customPace}
                            onChange={(e) => setCustomPace(e.target.value)}
                            className="w-full bg-white/50 border border-green-200 rounded-lg p-3 text-green-950 text-base outline-none focus:border-[#16A34A] tabular-nums"
                            placeholder="Or enter a custom number..."
                          />
                        </div>

                        <div className="pt-6 border-t border-green-200">
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() =>
                                setModalStep(
                                  prayerStatus === "consistent" ? 2 : 1,
                                )
                              }
                              className="text-green-700 text-sm md:text-base font-semibold hover:text-green-950 transition-colors"
                            >
                              Back
                            </button>
                            <button
                              onClick={handleCommitEstimate}
                              className="bg-[#16A34A] text-white text-sm md:text-base font-semibold py-3 px-6 md:px-8 rounded-full hover:bg-green-600 transition-colors duration-300 shadow-sm"
                            >
                              Finalize Estimate
                            </button>
                          </div>
                          
                          <div className="mt-5 text-center">
                            <button
                              onClick={resetDebtToZero}
                              className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors py-1.5"
                            >
                              Clear all debt to zero
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ─── BASE TRACKER UI ────────────────────────────────────────────────── */}
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
        <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-card border border-green-100 dark:border-green-900 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Owed
              </p>
              <div className="flex items-end gap-2 mt-1.5 mb-4">
                <p
                  className={`text-6xl font-black leading-none tabular-nums ${
                    total > 0 ? "text-foreground" : "text-green-600"
                  }`}
                >
                  {loading ? "—" : total.toLocaleString()}
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
        <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl p-5 shadow-xs">
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
            onClick={() => setIsModalOpen(true)}
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
        <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl px-6 py-3 shadow-xs">
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
                  name={PRAYER_NAMES[p] || p}
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
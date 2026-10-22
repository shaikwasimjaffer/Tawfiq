import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  CalendarDays,
  TrendingDown,
  Check,
  X,
  Calculator,
  RotateCcw,
  BookOpen,
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { useQaza } from "@/lib/useQaza";
import {
  CANONICAL_PRAYERS,
  ALL_TRACKABLE_PRAYERS,
  PRAYER_DISPLAY_NAMES,
  ISLAMIC_JURISPRUDENCE_SOURCES,
  calculateWizardInitialDebt,
} from "@/lib/qazaEngine";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

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

// ─── Individual Prayer Counter Component ─────────────────────────────────────
function PrayerCounterCard({
  prayerKey,
  name,
  remaining,
  completed,
  progressPct,
  onMakeUp,
  onAddDebt,
  onSubDebt,
  onSetRemaining,
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  function startEdit() {
    setInputVal(String(remaining));
    setEditing(true);
  }

  function confirmEdit() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 0) onSetRemaining(n);
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 transition-all duration-300 hover:border-green-600/30 hover:shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: Prayer Name & Badges */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground tracking-tight">
              {name}
            </h3>
            {prayerKey === "witr" && (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full">
                Hanafi Wajib
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {remaining === 0 ? (
              <span className="text-green-600 dark:text-green-400 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 size={12} /> All clear
              </span>
            ) : (
              <span>
                <strong className="text-foreground">{remaining}</strong> remaining • {completed} made up ({progressPct.toFixed(0)}%)
              </span>
            )}
          </p>
        </div>

        {/* Right: Primary Make Up Button */}
        <button
          onClick={onMakeUp}
          disabled={remaining <= 0}
          title={`Mark 1 Qaza ${name} completed`}
          aria-label={`Mark 1 Qaza ${name} completed`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-700 hover:bg-green-800 active:scale-95 text-white shadow-xs transition-all disabled:opacity-40 disabled:hover:bg-green-700 cursor-pointer"
        >
          <Check size={14} className="stroke-[2.5]" />
          <span>Prayed</span>
        </button>
      </div>

      {/* Progress Track for this Prayer */}
      <div className="mt-3 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-green-600 transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
        />
      </div>

      {/* Footer Controls: Estimate corrections (+ / -) & Manual edit */}
      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span className="text-[11px] text-muted-foreground/80">Estimate adjustment:</span>
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                className="w-16 text-center text-xs font-bold bg-secondary border border-border rounded-lg px-1.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-green-600"
                autoFocus
              />
              <button
                onClick={confirmEdit}
                className="w-6 h-6 flex items-center justify-center rounded bg-green-600 text-white"
              >
                <Check size={11} />
              </button>
              <button
                onClick={cancelEdit}
                className="w-6 h-6 flex items-center justify-center rounded bg-secondary text-muted-foreground"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onSubDebt}
                disabled={remaining <= 0}
                title="Correct estimate downward by 1"
                aria-label="Correct estimate downward by 1"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-muted-foreground disabled:opacity-30 transition-all"
              >
                <Minus size={13} />
              </button>
              <button
                onClick={startEdit}
                title="Tap to edit remaining count"
                className="px-2 py-0.5 rounded text-xs font-bold tabular-nums text-foreground hover:bg-secondary transition-colors"
              >
                {remaining}
              </button>
              <button
                onClick={onAddDebt}
                title="Add 1 missed prayer to estimate"
                aria-label="Add 1 missed prayer to estimate"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/40 text-muted-foreground transition-all"
              >
                <Plus size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Jurisprudence Drawer Modal ──────────────────────────────────────────────
function JurisprudenceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />
      <div className="relative bg-card border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl z-10 text-left space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <BookOpen size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Islamic Jurisprudence</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground mt-1">
              Scholarly Foundations of Qaza
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 text-sm">
          {/* Obligation to make up missed prayers */}
          <div className="bg-secondary/60 rounded-2xl p-4 border border-border/80">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              {ISLAMIC_JURISPRUDENCE_SOURCES.obligation.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Authority: {ISLAMIC_JURISPRUDENCE_SOURCES.obligation.authority}
            </p>
            <p className="text-foreground/90 mt-2 leading-relaxed text-xs">
              {ISLAMIC_JURISPRUDENCE_SOURCES.obligation.summary}
            </p>
            <blockquote className="mt-2 text-xs italic text-green-800 dark:text-green-300 border-l-2 border-green-600 pl-2.5">
              "{ISLAMIC_JURISPRUDENCE_SOURCES.obligation.evidence}"
            </blockquote>
          </div>

          {/* Sleep and Forgetfulness */}
          <div className="bg-secondary/60 rounded-2xl p-4 border border-border/80">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              {ISLAMIC_JURISPRUDENCE_SOURCES.sleepAndForgetfulness.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Citation: {ISLAMIC_JURISPRUDENCE_SOURCES.sleepAndForgetfulness.citation}
            </p>
            <p className="text-foreground/90 mt-2 leading-relaxed text-xs">
              {ISLAMIC_JURISPRUDENCE_SOURCES.sleepAndForgetfulness.summary}
            </p>
            <blockquote className="mt-2 text-xs italic text-blue-800 dark:text-blue-300 border-l-2 border-blue-600 pl-2.5">
              "{ISLAMIC_JURISPRUDENCE_SOURCES.sleepAndForgetfulness.evidence}"
            </blockquote>
          </div>

          {/* Menstruation and Postpartum */}
          <div className="bg-secondary/60 rounded-2xl p-4 border border-border/80">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              {ISLAMIC_JURISPRUDENCE_SOURCES.menstruationExemption.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Authority: {ISLAMIC_JURISPRUDENCE_SOURCES.menstruationExemption.authority}
            </p>
            <p className="text-foreground/90 mt-2 leading-relaxed text-xs">
              {ISLAMIC_JURISPRUDENCE_SOURCES.menstruationExemption.summary}
            </p>
            <blockquote className="mt-2 text-xs italic text-rose-800 dark:text-rose-300 border-l-2 border-rose-600 pl-2.5">
              "{ISLAMIC_JURISPRUDENCE_SOURCES.menstruationExemption.evidence}"
            </blockquote>
          </div>

          {/* Witr across schools */}
          <div className="bg-secondary/60 rounded-2xl p-4 border border-border/80">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              {ISLAMIC_JURISPRUDENCE_SOURCES.witrStatus.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Source: {ISLAMIC_JURISPRUDENCE_SOURCES.witrStatus.authority}
            </p>
            <p className="text-foreground/90 mt-2 leading-relaxed text-xs">
              {ISLAMIC_JURISPRUDENCE_SOURCES.witrStatus.summary}
            </p>
          </div>

          {/* Prayer sequence (Tartib) */}
          <div className="bg-secondary/60 rounded-2xl p-4 border border-border/80">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              {ISLAMIC_JURISPRUDENCE_SOURCES.prayerSequence.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Citation: {ISLAMIC_JURISPRUDENCE_SOURCES.prayerSequence.citation}
            </p>
            <p className="text-foreground/90 mt-2 leading-relaxed text-xs">
              {ISLAMIC_JURISPRUDENCE_SOURCES.prayerSequence.summary}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center pt-2">
          Tawfiq provides transparent tracking tools grounded in scholarly evidence, not authoritative individual religious decrees.
        </p>
      </div>
    </div>
  );
}

// ─── Main Qaza Application Screen ────────────────────────────────────────────
export default function Qaza() {
  const {
    qaza,
    total,
    totalTrackedDebt,
    totalMadeUp,
    clearedPercentage,
    perPrayerProgress,
    reconciliation,
    todayCompletedCount,
    dailyTarget,
    dailyTargetPercentage,
    trackWitr,
    activePrayers,
    forecast,
    history,
    loading,
    logCompletedQaza,
    recordDebtAdjustment,
    setAmount,
    addFullDay,
    subtractFullDay,
    undoRecentAction,
    commitWizard,
    resetAllDebt,
    setDailyPace,
    setTrackWitr,
  } = useQaza();

  // Milestone Confetti
  const [showConfetti, setShowConfetti] = useState(false);
  const prevTotalRef = useRef(total);

  useEffect(() => {
    if (!loading && prevTotalRef.current > 0 && total < prevTotalRef.current) {
      const milestones = [0, 25, 50, 100, 250, 500, 1000, 1500, 2000, 2500, 3000];
      const crossed = milestones.some((m) => prevTotalRef.current > m && total <= m);
      if (crossed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
    prevTotalRef.current = total;
  }, [total, loading]);

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [isJurisprudenceOpen, setIsJurisprudenceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Wizard state
  const [gender, setGender] = useState("male");
  const [currentAge, setCurrentAge] = useState(25);
  const [pubertyAge, setPubertyAge] = useState(14);
  const [subtractMenses, setSubtractMenses] = useState(false);
  const [mensesDaysPerMonth, setMensesDaysPerMonth] = useState(7);
  const [prayerStatus, setPrayerStatus] = useState("consistent");
  const [prayingAge, setPrayingAge] = useState(20);
  const [wizardTrackWitr, setWizardTrackWitr] = useState(trackWitr);
  const [wizardPace, setWizardPace] = useState(dailyTarget);

  // Restore wizard inputs
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tawfiq_qaza_wizard_inputs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.currentAge) setCurrentAge(Number(parsed.currentAge));
        if (parsed.pubertyAge) setPubertyAge(Number(parsed.pubertyAge));
        if (parsed.subtractMenses !== undefined) setSubtractMenses(Boolean(parsed.subtractMenses));
        if (parsed.mensesDaysPerMonth) setMensesDaysPerMonth(Number(parsed.mensesDaysPerMonth));
        if (parsed.prayerStatus) setPrayerStatus(parsed.prayerStatus);
        if (parsed.prayingAge) setPrayingAge(Number(parsed.prayingAge));
        if (parsed.trackWitr !== undefined) setWizardTrackWitr(Boolean(parsed.trackWitr));
      }
    } catch {}
  }, [trackWitr]);

  // Wizard calculated debts preview
  const wizardCalculated = useMemo(() => {
    return calculateWizardInitialDebt({
      gender,
      currentAge,
      pubertyAge,
      subtractMenses,
      mensesDaysPerMonth,
      prayerStatus,
      prayingAge,
      trackWitr: wizardTrackWitr,
    });
  }, [gender, currentAge, pubertyAge, subtractMenses, mensesDaysPerMonth, prayerStatus, prayingAge, wizardTrackWitr]);

  function handleCommitWizard() {
    commitWizard(
      wizardCalculated.initialDebts,
      {
        gender,
        currentAge,
        pubertyAge,
        subtractMenses,
        mensesDaysPerMonth,
        prayerStatus,
        prayingAge,
        trackWitr: wizardTrackWitr,
        dailyTarget: wizardPace,
      },
      wizardPace
    );
    setIsModalOpen(false);
    setModalStep(1);
    toast.success("Initial Qaza debt estimate established successfully.");
  }

  function handleUndo() {
    const result = undoRecentAction();
    if (result) {
      if (result.type === "reversed_completion") {
        toast.info(`Undid prayer completion for ${PRAYER_DISPLAY_NAMES[result.target.prayer]}.`);
      } else {
        toast.info(`Undid recent debt adjustment for ${PRAYER_DISPLAY_NAMES[result.target.prayer]}.`);
      }
    } else {
      toast.info("No recent action available to undo.");
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32 font-sans select-none">
      {showConfetti && <LocalConfetti />}

      {/* Header */}
      <header className="bg-background border-b border-border/80 px-4 sm:px-6 py-4 sticky top-0 z-30 backdrop-blur-md bg-background/95">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Qaza Salah
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Accurate mathematical ledger & repayment planner
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsJurisprudenceOpen(true)}
              className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              title="Islamic Jurisprudence & Sources"
              aria-label="Islamic Jurisprudence & Sources"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={handleUndo}
              className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              title="Undo recent action"
              aria-label="Undo recent action"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Reconciliation Alert Banner (if completion exceeds debt estimate) */}
        {!reconciliation.isReconciled && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Estimate Review Needed</span>
            </div>
            <p className="leading-relaxed">
              You have recorded more completed prayers than your current estimated debt for:{" "}
              <strong>
                {reconciliation.mismatchedPrayers.map((p) => PRAYER_DISPLAY_NAMES[p]).join(", ")}
              </strong>.
              Your remaining balance is safely clamped to 0 and all completion records are preserved.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-amber-800 dark:text-amber-300 underline cursor-pointer"
            >
              Recalculate or adjust estimated debt →
            </button>
          </div>
        )}

        {/* Primary Metrics Card: Transparent Islamic Balance */}
        <div className="bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-950/40 dark:via-card dark:to-green-950/20 border border-green-200/80 dark:border-green-900/60 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                Remaining Qaza
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black text-foreground tabular-nums tracking-tight">
                  {loading ? "—" : total.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-muted-foreground">prayers</span>
              </div>
            </div>

            {totalTrackedDebt > 0 && (
              <div className="text-right">
                <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  {clearedPercentage.toFixed(1)}% cleared
                </span>
              </div>
            )}
          </div>

          {/* Progress bar towards zero */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5 font-medium">
              <span>Overall Progress</span>
              <span>
                {totalMadeUp.toLocaleString()} of {totalTrackedDebt.toLocaleString()} completed
              </span>
            </div>
            <div className="w-full bg-secondary/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, clearedPercentage))}%` }}
              />
            </div>
          </div>

          {/* 3-Column Metrics Breakdown */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-green-200/50 dark:border-green-900/40 text-center">
            <div className="bg-white/60 dark:bg-black/20 p-2 rounded-xl">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Estimated Debt
              </span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {totalTrackedDebt.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/60 dark:bg-black/20 p-2 rounded-xl">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Completed
              </span>
              <span className="text-sm font-bold text-green-700 dark:text-green-400 tabular-nums">
                {totalMadeUp.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/60 dark:bg-black/20 p-2 rounded-xl">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Today's Qaza
              </span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {todayCompletedCount} / {dailyTarget}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-card border border-border rounded-3xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </span>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackWitr}
                  onChange={(e) => setTrackWitr(e.target.checked)}
                  className="rounded text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <span>Track Witr</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                const count = addFullDay();
                toast.success(`Added 1 full day (+${count} missed prayers) to your debt.`);
              }}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-green-700 hover:bg-green-800 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <CalendarDays size={14} />
              <span>+ Full Day ({activePrayers.length})</span>
            </button>

            <button
              onClick={() => {
                const deducted = subtractFullDay();
                if (deducted > 0) {
                  toast.success(`Corrected estimate: removed ${deducted} prayer obligation${deducted > 1 ? "s" : ""}.`);
                } else {
                  toast.info("No remaining debt to reduce.");
                }
              }}
              disabled={total <= 0}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-secondary hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 border border-border text-foreground text-xs font-semibold active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
            >
              <CalendarDays size={14} />
              <span>− Full Day ({activePrayers.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold border border-border transition-all active:scale-95 cursor-pointer"
          >
            <Calculator size={14} className="text-green-700 dark:text-green-400" />
            <span>Calculate Debt Wizard</span>
          </button>
        </div>

        {/* Repayment Planner & Accurate Forecast */}
        {total > 0 && (
          <div className="bg-card border border-border rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown size={15} className="text-green-700 dark:text-green-400" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Repayment Forecast
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-muted-foreground">Target:</span>
                <select
                  value={dailyTarget}
                  onChange={(e) => setDailyPace(Number(e.target.value))}
                  className="text-xs font-bold bg-secondary border border-border rounded-lg px-2 py-1 text-foreground"
                >
                  <option value={1}>1 / day</option>
                  <option value={3}>3 / day</option>
                  <option value={5}>5 / day</option>
                  <option value={10}>10 / day</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {/* Forecast at current observed rate */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-secondary/70">
                <div>
                  <span className="font-semibold text-foreground block">
                    At observed pace ({forecast.observedDailyRate}/day)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Based on last 30 calendar days
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {forecast.formattedCurrentPace || "—"}
                </span>
              </div>

              {/* Forecast at target pace */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-green-50/80 dark:bg-green-950/30 border border-green-200/80 dark:border-green-900/60">
                <div>
                  <span className="font-semibold text-green-900 dark:text-green-200 block">
                    At target pace ({dailyTarget}/day)
                  </span>
                  <span className="text-[11px] text-green-800/70 dark:text-green-400/70">
                    If target is met daily
                  </span>
                </div>
                <span className="text-sm font-bold text-green-700 dark:text-green-400 tabular-nums">
                  {forecast.formattedTargetPace}
                </span>
              </div>

              {forecast.statusMessage && (
                <p className="text-[11px] text-muted-foreground text-center italic pt-1">
                  {forecast.statusMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Per-Prayer Individual Trackers */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              By Prayer Type
            </span>
            <span className="text-[11px] text-muted-foreground">
              Tap "Prayed" to log Qaza • Tap number to edit
            </span>
          </div>

          <div className="space-y-2.5">
            {activePrayers.map((p) => (
              <PrayerCounterCard
                key={p}
                prayerKey={p}
                name={PRAYER_DISPLAY_NAMES[p]}
                remaining={qaza[p] ?? 0}
                completed={perPrayerProgress[p] !== undefined ? Math.round(((qaza[p] ?? 0) * (perPrayerProgress[p] / 100)) / (1 - perPrayerProgress[p] / 100 || 1)) : 0}
                progressPct={perPrayerProgress[p] ?? 0}
                onMakeUp={() => {
                  logCompletedQaza(p, 1);
                  toast.success(`Recorded 1 Qaza ${PRAYER_DISPLAY_NAMES[p]} completed!`, {
                    description: "May Allah accept your worship.",
                  });
                }}
                onAddDebt={() => {
                  recordDebtAdjustment(p, 1, { category: "manual_addition" });
                  toast.info(`Added 1 missed ${PRAYER_DISPLAY_NAMES[p]} to estimate.`);
                }}
                onSubDebt={() => {
                  try {
                    recordDebtAdjustment(p, -1, { category: "manual_correction" });
                    toast.info(`Corrected ${PRAYER_DISPLAY_NAMES[p]} estimate downward.`);
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
                onSetRemaining={(n) => {
                  setAmount(p, n);
                  toast.success(`Updated ${PRAYER_DISPLAY_NAMES[p]} remaining debt to ${n}.`);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Jurisprudence References Modal */}
      <JurisprudenceModal
        isOpen={isJurisprudenceOpen}
        onClose={() => setIsJurisprudenceOpen(false)}
      />

      {/* Upgraded 3-Step Debt Calculation Wizard Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-green-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative bg-card border border-border w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl z-10 text-left max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-[11px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                    Step {modalStep} of 3
                  </span>
                  <h3 className="text-xl font-serif font-bold text-foreground mt-0.5">
                    {modalStep === 1
                      ? "Accountability & Starting Point"
                      : modalStep === 2
                      ? "Prayer Practice History"
                      : "Review & Establish Estimate"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Step 1: Starting point (puberty / accountability) */}
              {modalStep === 1 && (
                <div className="space-y-5 text-sm">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Under Islamic jurisprudence, prayer becomes obligatory upon reaching puberty (Bulugh). Enter your approximate accountability starting point.
                  </p>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["male", "female"].map((g) => (
                        <button
                          key={g}
                          onClick={() => {
                            setGender(g);
                            if (g === "male") setSubtractMenses(false);
                          }}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                            gender === g
                              ? "bg-green-700 text-white border-green-700 shadow-xs"
                              : "bg-secondary border-border text-foreground"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {gender === "female" && (
                    <div className="p-3 bg-secondary/80 rounded-2xl border border-border/80 space-y-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subtractMenses}
                          onChange={(e) => setSubtractMenses(e.target.checked)}
                          className="rounded text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-foreground">
                          Exclude menstruation & postpartum days
                        </span>
                      </label>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Under Sahih al-Bukhari 321 and Dar al-Ifta Fatwa 7959, prayers during menses are waived and not made up.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Current Age: <strong className="text-green-700 dark:text-green-400">{currentAge}</strong>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="85"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                        className="w-full accent-green-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Puberty Age: <strong className="text-green-700 dark:text-green-400">{pubertyAge}</strong>
                      </label>
                      <input
                        type="range"
                        min="9"
                        max={currentAge}
                        value={pubertyAge}
                        onChange={(e) => setPubertyAge(Number(e.target.value))}
                        className="w-full accent-green-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setModalStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Continue</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Practice history */}
              {modalStep === 2 && (
                <div className="space-y-5 text-sm">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      Prayer Practice Since Puberty
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "consistent", label: "Started praying regularly at a specific age" },
                        { id: "never", label: "Missed all prayers throughout accountability period" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setPrayerStatus(opt.id)}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                            prayerStatus === opt.id
                              ? "bg-green-50 dark:bg-green-950/40 border-green-600 text-foreground"
                              : "bg-secondary border-border text-muted-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {prayerStatus === "consistent" && (
                    <div className="p-3 bg-secondary/80 rounded-2xl border border-border space-y-2">
                      <label className="text-xs font-semibold text-foreground block">
                        Age you began praying regularly: <strong className="text-green-700 dark:text-green-400">{prayingAge}</strong>
                      </label>
                      <input
                        type="range"
                        min={pubertyAge}
                        max={currentAge}
                        value={prayingAge}
                        onChange={(e) => setPrayingAge(Number(e.target.value))}
                        className="w-full accent-green-600 cursor-pointer"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Unprayed span: {Math.max(0, prayingAge - pubertyAge)} years (~{Math.round(Math.max(0, prayingAge - pubertyAge) * 365.25)} days)
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-secondary/80 rounded-2xl border border-border">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-foreground">
                        Include Witr Prayer (Hanafi Wajib)
                      </span>
                      <input
                        type="checkbox"
                        checked={wizardTrackWitr}
                        onChange={(e) => setWizardTrackWitr(e.target.checked)}
                        className="rounded text-green-600 focus:ring-green-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setModalStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Review Estimate</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Commit */}
              {modalStep === 3 && (
                <div className="space-y-5 text-sm">
                  <div className="bg-secondary/60 rounded-2xl p-4 border border-border/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Total Estimated Debt:</span>
                      <span className="text-xl font-bold text-foreground tabular-nums">
                        {wizardCalculated.totalCalculated.toLocaleString()} prayers
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/60">
                      {wizardCalculated.activePrayers.map((p) => (
                        <div key={p} className="flex justify-between p-1.5 rounded bg-card/60">
                          <span className="text-muted-foreground">{PRAYER_DISPLAY_NAMES[p]}:</span>
                          <span className="font-bold text-foreground">
                            {wizardCalculated.initialDebts[p]?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Accountable span: {wizardCalculated.totalAccountableYears} years</p>
                    {gender === "female" && subtractMenses && (
                      <p>• Menses days excluded: ~{wizardCalculated.excludedDays} days</p>
                    )}
                    <p>• Note: This is an estimated opening balance, not an absolute proof of past history.</p>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() => setModalStep(2)}
                      className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCommitWizard}
                      className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Establish Estimate
                    </button>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-center">
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to completely clear all Qaza data?")) {
                          resetAllDebt();
                          setIsModalOpen(false);
                          toast.success("All Qaza debt cleared to zero.");
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Clear all debt to zero
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
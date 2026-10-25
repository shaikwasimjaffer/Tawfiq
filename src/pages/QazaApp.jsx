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
  Layers,
  History,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { useQaza } from "@/lib/useQaza";
import {
  CANONICAL_PRAYERS,
  ALL_TRACKABLE_PRAYERS,
  PRAYER_DISPLAY_NAMES,
  ISLAMIC_JURISPRUDENCE_SOURCES,
} from "@/lib/qazaEngine";
import { MADHHAB_OPTIONS } from "@/lib/fiqhConfigurations";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

import QazaWizardModal from "@/components/qaza/QazaWizardModal";
import RepaymentPlannerCard from "@/components/qaza/RepaymentPlannerCard";
import BatchLogModal from "@/components/qaza/BatchLogModal";
import HistoryAuditModal from "@/components/qaza/HistoryAuditModal";
import EstimateDetailsModal from "@/components/qaza/EstimateDetailsModal";

// ─── Native Zero-Dependency Confetti ──────────────────────────────────────────
const LocalConfetti = () => {
  const colors = [
    "#134D37",
    "#10b981",
    "#d97706",
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
  rangeInfo,
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
    <div className="bg-card border border-border/80 rounded-2xl p-4 transition-all duration-300 hover:border-[#134D37]/40 hover:shadow-sm">
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
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 size={12} /> All clear
              </span>
            ) : (
              <span>
                <strong className="text-foreground">{remaining}</strong> remaining • {completed} made up ({progressPct.toFixed(0)}%)
              </span>
            )}
          </p>
          {rangeInfo && (
            <p className="text-[10.5px] text-muted-foreground/80 mt-0.5">
              Uncertainty Range: {rangeInfo.low} – {rangeInfo.high} prayers
            </p>
          )}
        </div>

        {/* Right: Primary Make Up Button */}
        <button
          onClick={onMakeUp}
          disabled={remaining <= 0}
          title={`Mark 1 Qaza ${name} completed`}
          aria-label={`Mark 1 Qaza ${name} completed`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#134D37] hover:bg-[#0E3D2B] active:scale-95 text-white shadow-xs transition-all disabled:opacity-40 disabled:hover:bg-[#134D37] cursor-pointer"
        >
          <Check size={14} className="stroke-[2.5]" />
          <span>Prayed</span>
        </button>
      </div>

      {/* Progress Track for this Prayer */}
      <div className="mt-3 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-[#134D37] transition-all duration-700"
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
                className="w-16 text-center text-xs font-bold bg-secondary border border-border rounded-lg px-1.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                autoFocus
              />
              <button
                onClick={confirmEdit}
                className="w-6 h-6 flex items-center justify-center rounded bg-[#134D37] text-white"
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
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-muted-foreground disabled:opacity-30 transition-all cursor-pointer"
              >
                <Minus size={13} />
              </button>
              <button
                onClick={startEdit}
                title="Tap to edit remaining count"
                className="px-2 py-0.5 rounded text-xs font-bold tabular-nums text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                {remaining}
              </button>
              <button
                onClick={onAddDebt}
                title="Add 1 missed prayer to estimate"
                aria-label="Add 1 missed prayer to estimate"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/40 text-muted-foreground transition-all cursor-pointer"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />
      <div className="relative bg-card border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl z-10 text-left space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-[#134D37] dark:text-emerald-400">
              <BookOpen size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Islamic Jurisprudence</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground mt-1">
              Scholarly Foundations of Qaza
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Obligation */}
          <div className="bg-secondary/60 rounded-2xl p-4 border border-border/80">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              {ISLAMIC_JURISPRUDENCE_SOURCES.obligation.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Authority: {ISLAMIC_JURISPRUDENCE_SOURCES.obligation.authority}
            </p>
            <p className="text-foreground/90 mt-2 leading-relaxed text-xs">
              {ISLAMIC_JURISPRUDENCE_SOURCES.obligation.summary}
            </p>
            <blockquote className="mt-2 text-xs italic text-emerald-800 dark:text-emerald-300 border-l-2 border-emerald-600 pl-2.5">
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

          {/* Menses Exemption */}
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
    timelineSegments,
    excludedPeriods,
    estimateVersions,
    repaymentPlan,
    repaymentProjections,
    activeFiqhConfig,
    logCompletedQaza,
    logBatchCompletions,
    recordDebtAdjustment,
    setAmount,
    addFullDay,
    subtractFullDay,
    undoRecentAction,
    commitComprehensiveEstimate,
    updateRepaymentPlan,
    pauseRepaymentPlan,
    resumeRepaymentPlan,
    changeMadhhab,
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

  // Modal Dialog States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEstimateDetailsOpen, setIsEstimateDetailsOpen] = useState(false);
  const [isJurisprudenceOpen, setIsJurisprudenceOpen] = useState(false);

  // Latest estimate version bounds
  const latestEstimateVersion = estimateVersions[0] || null;

  function handleUndo() {
    const result = undoRecentAction();
    if (result) {
      if (result.type === "reversed_completion") {
        toast.info(`Undid prayer completion for ${PRAYER_DISPLAY_NAMES[result.target.prayer]}.`);
      } else {
        toast.info(`Undid debt adjustment for ${PRAYER_DISPLAY_NAMES[result.target.prayer]}.`);
      }
    } else {
      toast.info("No recent action available to undo.");
    }
  }

  function handleWizardCommit(wizardPayload) {
    const newVersion = commitComprehensiveEstimate(wizardPayload);
    toast.success("New Qaza debt estimate established successfully!", {
      description: `Target set to ${newVersion.totalTarget.toLocaleString()} prayers across ${newVersion.madhhab} profile.`,
    });
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
              className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
              title="Islamic Jurisprudence & Sources"
              aria-label="Islamic Jurisprudence & Sources"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
              title="Audit trail and history"
              aria-label="Audit trail and history"
            >
              <History size={16} />
            </button>
            <button
              onClick={handleUndo}
              className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
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
              onClick={() => setIsWizardOpen(true)}
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#134D37] dark:text-emerald-400 uppercase tracking-wider">
                  Remaining Qaza
                </span>
                <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                  {activeFiqhConfig.title.split("(")[0].trim()}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black text-foreground tabular-nums tracking-tight">
                  {loading ? "—" : total.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-muted-foreground">prayers</span>
              </div>
            </div>

            {totalTrackedDebt > 0 && (
              <div className="text-right">
                <span className="inline-block bg-green-100 text-[#134D37] dark:bg-green-900/50 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
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
                className="bg-[#134D37] h-2.5 rounded-full transition-all duration-1000 ease-out"
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
              <span className="text-sm font-bold text-[#134D37] dark:text-emerald-400 tabular-nums">
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

          {/* Inspect Assumptions Link */}
          <div className="mt-3 pt-2 text-center border-t border-border/40">
            <button
              type="button"
              onClick={() => setIsEstimateDetailsOpen(true)}
              className="text-[11px] text-[#134D37] dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Info size={12} />
              <span>Inspect or edit estimate assumptions & bounds →</span>
            </button>
          </div>
        </div>

        {/* Repayment Planner Card */}
        <RepaymentPlannerCard
          totalRemaining={total}
          repaymentPlan={repaymentPlan}
          repaymentProjections={repaymentProjections}
          activePrayers={activePrayers}
          onUpdatePlan={updateRepaymentPlan}
          onPausePlan={pauseRepaymentPlan}
          onResumePlan={resumeRepaymentPlan}
        />

        {/* Quick Actions Panel */}
        <div className="bg-card border border-border rounded-3xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackWitr}
                  onChange={(e) => setTrackWitr(e.target.checked)}
                  className="rounded text-[#134D37] focus:ring-[#134D37] cursor-pointer"
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
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#134D37] hover:bg-[#0E3D2B] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
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

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold border border-border transition-all active:scale-95 cursor-pointer"
            >
              <Layers size={14} className="text-[#134D37] dark:text-emerald-400" />
              <span>Log Batch</span>
            </button>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold border border-border transition-all active:scale-95 cursor-pointer"
            >
              <Calculator size={14} className="text-[#134D37] dark:text-emerald-400" />
              <span>Recalculate Wizard</span>
            </button>
          </div>
        </div>

        {/* Per-Prayer Individual Trackers */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              By Prayer Type
            </span>
            <span className="text-[11px] text-muted-foreground">
              Tap "Prayed" to log Qaza • Tap count to edit
            </span>
          </div>

          <div className="space-y-2.5">
            {activePrayers.map((p) => {
              const low = latestEstimateVersion?.lowerBounds?.[p];
              const high = latestEstimateVersion?.upperBounds?.[p];
              const rangeInfo = low !== undefined && high !== undefined && low !== high ? { low, high } : null;

              return (
                <PrayerCounterCard
                  key={p}
                  prayerKey={p}
                  name={PRAYER_DISPLAY_NAMES[p]}
                  remaining={qaza[p] ?? 0}
                  completed={
                    perPrayerProgress[p] !== undefined
                      ? Math.round(
                          ((qaza[p] ?? 0) * (perPrayerProgress[p] / 100)) /
                            (1 - perPrayerProgress[p] / 100 || 1)
                        )
                      : 0
                  }
                  progressPct={perPrayerProgress[p] ?? 0}
                  rangeInfo={rangeInfo}
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
              );
            })}
          </div>
        </div>
      </div>

      {/* Guided 5-Step Estimation Wizard Modal */}
      <QazaWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCommit={handleWizardCommit}
        initialData={{
          madhhab: activeFiqhConfig.madhhab,
          trackWitr,
          dailyTarget,
        }}
      />

      {/* Batch Completion Logging Modal */}
      <BatchLogModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        activePrayers={activePrayers}
        onLogBatch={(items, opts) => {
          const res = logBatchCompletions(items, opts);
          if (res) {
            toast.success(`Successfully recorded batch of ${res.entries.reduce((a, b) => a + b.count, 0)} completed Qaza prayers!`);
          }
        }}
      />

      {/* Audit Trail & History Modal */}
      <HistoryAuditModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyLogs={history.logs}
        onUndo={handleUndo}
      />

      {/* Estimate Assumptions & Provenance Details Modal */}
      <EstimateDetailsModal
        isOpen={isEstimateDetailsOpen}
        onClose={() => setIsEstimateDetailsOpen(false)}
        profile={activeFiqhConfig}
        activeFiqhConfig={activeFiqhConfig}
        timelineSegments={timelineSegments}
        excludedPeriods={excludedPeriods}
        estimateVersions={estimateVersions}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* Jurisprudence References Modal */}
      <JurisprudenceModal
        isOpen={isJurisprudenceOpen}
        onClose={() => setIsJurisprudenceOpen(false)}
      />

      <BottomNav />
    </div>
  );
}
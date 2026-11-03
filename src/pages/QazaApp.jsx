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
  Layers,
  History,
  ShieldCheck,
  Calendar,
  Award,
  Flame,
  Edit2,
  Play,
  Pause,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Compass,
} from "lucide-react";
import { useQaza } from "@/lib/useQaza";
import {
  CANONICAL_PRAYERS,
  ALL_TRACKABLE_PRAYERS,
  PRAYER_DISPLAY_NAMES,
  ISLAMIC_JURISPRUDENCE_SOURCES,
} from "@/lib/qazaEngine";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

import QazaWizardModal from "@/components/qaza/QazaWizardModal";
import BatchLogModal from "@/components/qaza/BatchLogModal";
import HistoryAuditModal from "@/components/qaza/HistoryAuditModal";
import EstimateDetailsModal from "@/components/qaza/EstimateDetailsModal";

// Prayer icons & metadata
const PRAYER_META = {
  fajr: {
    name: "Fajr",
    arabic: "الفجر",
    time: "Dawn • 2 Fard",
    icon: Sunrise,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  dhuhr: {
    name: "Dhuhr",
    arabic: "الظهر",
    time: "Noon • 4 Fard",
    icon: Sun,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
  },
  asr: {
    name: "Asr",
    arabic: "العصر",
    time: "Afternoon • 4 Fard",
    icon: Sun,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  maghrib: {
    name: "Maghrib",
    arabic: "المغرب",
    time: "Sunset • 3 Fard",
    icon: Sunset,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
  },
  isha: {
    name: "Isha",
    arabic: "العشاء",
    time: "Night • 4 Fard",
    icon: Moon,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  witr: {
    name: "Witr",
    arabic: "الوتر",
    time: "Night • 3 Wajib",
    icon: Moon,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
};

// Quick Pace Preset Options
const PACE_PRESETS = [
  { value: 1, label: "+1 / day", desc: "1 extra prayer daily" },
  { value: 2, label: "+2 / day", desc: "2 extra prayers daily" },
  { value: 3, label: "+3 / day", desc: "3 extra prayers daily" },
  { value: 5, label: "+5 / day", desc: "1 full day (1 after each Salah)" },
  { value: 10, label: "+10 / day", desc: "2 full days (2 after each Salah)" },
];

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

// ─── Jurisprudence Drawer Modal ──────────────────────────────────────────────
function JurisprudenceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />
      <div className="relative bg-card border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl z-10 text-left space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-[#134D37] dark:text-emerald-400">
              <BookOpen size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Islamic Jurisprudence
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground mt-1">
              Scholarly Foundations of Qaza
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
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

          {/* Witr Status */}
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
        </div>

        <p className="text-[11px] text-muted-foreground text-center pt-2">
          Tawfiq provides transparent tracking tools grounded in scholarly consensus across the four Sunni madhhabs.
        </p>
      </div>
    </div>
  );
}

// ─── Individual Prayer Row Component ─────────────────────────────────────────
function PrayerLedgerRow({
  prayerKey,
  meta,
  remaining,
  completed,
  progressPct,
  onMakeUp,
  onSetRemaining,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(String(remaining));

  const IconComponent = meta.icon || Clock;

  const handleSaveEdit = () => {
    const parsed = parseInt(editVal, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onSetRemaining(parsed);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 transition-all duration-200 hover:border-[#134D37]/40 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl ${meta.bg} flex items-center justify-center flex-shrink-0 ${meta.color}`}
          >
            <IconComponent size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-foreground text-base tracking-tight">
                {meta.name}
              </h4>
              <span className="text-xs font-arabic text-muted-foreground/80">
                {meta.arabic}
              </span>
              {prayerKey === "witr" && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  Hanafi Wajib
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {meta.time}
            </p>
          </div>
        </div>

        {/* Right: Action Button & Remaining Count */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Remaining Count & Tap to Edit */}
          <div className="text-right">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                  className="w-16 text-center text-xs font-bold bg-secondary border border-border rounded-lg py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="w-6 h-6 rounded bg-[#134D37] text-white flex items-center justify-center text-xs"
                >
                  <Check size={11} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditVal(String(remaining));
                  setIsEditing(true);
                }}
                title="Tap to adjust remaining count"
                className="group flex flex-col items-end cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-foreground tabular-nums group-hover:text-[#134D37] transition-colors">
                    {remaining}
                  </span>
                  <Edit2
                    size={11}
                    className="opacity-0 group-hover:opacity-70 text-muted-foreground transition-opacity"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {completed} made up
                </span>
              </button>
            )}
          </div>

          {/* Primary Make Up Button */}
          <button
            onClick={onMakeUp}
            disabled={remaining <= 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#134D37] hover:bg-[#0E3D2B] active:scale-95 text-white shadow-xs transition-all disabled:opacity-30 disabled:hover:bg-[#134D37] cursor-pointer"
          >
            <Check size={14} className="stroke-[2.5]" />
            <span>Prayed</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 pt-2 border-t border-border/50">
        <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
          <span>{progressPct.toFixed(0)}% recovered</span>
          <span>{remaining === 0 ? "All clear! Masha'Allah" : `${remaining} left`}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-[#134D37] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
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
    setTrackWitr,
  } = useQaza();

  // Milestone Confetti
  const [showConfetti, setShowConfetti] = useState(false);
  const prevTotalRef = useRef(total);

  useEffect(() => {
    if (!loading && prevTotalRef.current > 0 && total < prevTotalRef.current) {
      const milestones = [0, 25, 50, 100, 250, 500, 1000, 1500, 2000, 2500, 3000];
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

  // Modal Dialog States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEstimateDetailsOpen, setIsEstimateDetailsOpen] = useState(false);
  const [isJurisprudenceOpen, setIsJurisprudenceOpen] = useState(false);

  // Custom pace input state
  const [customPace, setCustomPace] = useState(String(dailyTarget || 5));
  const [isCustomPaceOpen, setIsCustomPaceOpen] = useState(false);

  // Handle Pace Selection
  const handlePaceSelect = (paceValue) => {
    const val = Math.max(1, parseInt(paceValue, 10) || 1);
    updateRepaymentPlan({
      dailyTarget: val,
      weeklyGoal: val * 7,
    });
    setCustomPace(String(val));
    setIsCustomPaceOpen(false);
    toast.success(`Repayment plan updated to +${val} prayer${val > 1 ? "s" : ""}/day!`);
  };

  // Dynamic Timeframe Calculation based on active dailyTarget and total remaining
  const dynamicPrediction = useMemo(() => {
    if (total <= 0) {
      return {
        days: 0,
        text: "Alhamdulillah! You have completed all tracked Qaza prayers.",
        dateString: "Completed",
        isComplete: true,
      };
    }

    const currentPace = Math.max(1, dailyTarget || 5);
    const daysToComplete = Math.ceil(total / currentPace);
    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + daysToComplete);

    const dateFormatted = finishDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let timeframeReadable = "";
    if (daysToComplete >= 365) {
      const years = (daysToComplete / 365).toFixed(1);
      const months = Math.round(daysToComplete / 30);
      timeframeReadable = `~${years} years (${daysToComplete.toLocaleString()} days)`;
    } else if (daysToComplete >= 30) {
      const months = Math.round(daysToComplete / 30);
      timeframeReadable = `~${months} month${months > 1 ? "s" : ""} (${daysToComplete} days)`;
    } else {
      timeframeReadable = `${daysToComplete} day${daysToComplete > 1 ? "s" : ""}`;
    }

    return {
      days: daysToComplete,
      timeframeReadable,
      dateFormatted,
      isComplete: false,
    };
  }, [total, dailyTarget]);

  // Log 1 full day (all active canonical prayers) as completed
  const handleLogFullDayCompleted = () => {
    const items = activePrayers.map((p) => ({ prayer: p, count: 1 }));
    const res = logBatchCompletions(items, { source: "quick_full_day" });
    if (res) {
      toast.success(
        `Alhamdulillah! Recorded 1 full day (${activePrayers.length} prayers) made up.`,
        {
          description: "May Allah accept your worship and ease your repayment journey.",
        },
      );
    }
  };

  function handleUndo() {
    const result = undoRecentAction();
    if (result) {
      if (result.type === "reversed_completion") {
        toast.info(
          `Undid prayer completion for ${PRAYER_DISPLAY_NAMES[result.target.prayer]}.`,
        );
      } else {
        toast.info(
          `Undid adjustment for ${PRAYER_DISPLAY_NAMES[result.target.prayer]}.`,
        );
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
      <header className="bg-background border-b border-border sticky top-0 z-30 shadow-xs">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Qaza Prayers
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lifetime missed prayers & recovery journey
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsJurisprudenceOpen(true)}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Islamic Jurisprudence & Scholarly Foundations"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Audit trail & repayment logs"
            >
              <History size={16} />
            </button>
            <button
              onClick={handleUndo}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Undo recent action"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-5 space-y-6">
        {/* Reconciliation Alert Banner if needed */}
        {!reconciliation.isReconciled && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-3xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Estimate Review Notice</span>
            </div>
            <p className="leading-relaxed">
              You have recorded more completed prayers than your current estimated debt for:{" "}
              <strong>
                {reconciliation.mismatchedPrayers
                  .map((p) => PRAYER_DISPLAY_NAMES[p])
                  .join(", ")}
              </strong>
              . Your remaining balance is safely protected at 0.
            </p>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="text-xs font-bold text-amber-800 dark:text-amber-300 underline cursor-pointer"
            >
              Recalculate or adjust estimated debt →
            </button>
          </div>
        )}

        {/* ─── SECTION 1: LIFETIME MISSED PRAYERS & RECOVERY (WHERE YOU STAND) ─── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Lifetime Reality
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                {activeFiqhConfig.title.split("(")[0].trim()}
              </span>
            </div>

            {totalTrackedDebt > 0 && (
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {clearedPercentage.toFixed(1)}% Recovered
              </span>
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-foreground tabular-nums tracking-tight">
                {loading ? "—" : total.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                missed prayers remaining
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated debt accumulated throughout your lifetime from puberty.
            </p>
          </div>

          {/* Progress Bar Toward Zero */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Overall Repayment</span>
              <span>
                {totalMadeUp.toLocaleString()} of {totalTrackedDebt.toLocaleString()} completed
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, clearedPercentage))}%`,
                }}
              />
            </div>
          </div>

          {/* Recalculate from Puberty CTA */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-border">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator size={14} />
              <span>Recalculate Lifetime Estimate (from Puberty)</span>
            </button>

            <button
              onClick={() => setIsEstimateDetailsOpen(true)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              <Info size={13} />
              <span>Details</span>
            </button>
          </div>

          {/* Spiritual Reassurance Quote */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-3.5 flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">🌿</span>
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium italic">
              "Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers it."
              <span className="not-italic block mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                — Sahih al-Bukhari & Sahih Muslim
              </span>
            </p>
          </div>
        </div>

        {/* ─── SECTION 2: REPAYMENT PACE & TIME PREDICTION (THE SIMULATOR) ─── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-primary">
                <TrendingDown size={17} />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Repayment Pace & Time Prediction
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set your daily capability to see when you'll reach zero debt.
              </p>
            </div>

            {/* Pause / Resume Button */}
            <button
              onClick={repaymentPlan.isPaused ? resumeRepaymentPlan : pauseRepaymentPlan}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                repaymentPlan.isPaused
                  ? "bg-primary text-white shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {repaymentPlan.isPaused ? (
                <>
                  <Play size={12} />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause size={12} />
                  <span>Pause Plan</span>
                </>
              )}
            </button>
          </div>

          {/* Capability Pace Selector Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Choose your daily capacity:
            </span>

            <div className="grid grid-cols-3 gap-2">
              {PACE_PRESETS.map((preset) => {
                const isSelected = dailyTarget === preset.value && !isCustomPaceOpen;
                return (
                  <button
                    key={preset.value}
                    onClick={() => handlePaceSelect(preset.value)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-secondary/70 border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xs font-black block">
                      {preset.label}
                    </span>
                    <span
                      className={`text-[9.5px] block truncate mt-0.5 ${
                        isSelected ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {preset.value === 5 ? "1 full set" : preset.desc.split(" ")[0]}
                    </span>
                  </button>
                );
              })}

              {/* Custom Pace Button */}
              <button
                onClick={() => setIsCustomPaceOpen(!isCustomPaceOpen)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
                  isCustomPaceOpen ||
                  !PACE_PRESETS.some((p) => p.value === dailyTarget)
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-secondary/70 border-border text-foreground hover:border-primary/40"
                }`}
              >
                <span className="text-xs font-black block">Custom</span>
                <span
                  className={`text-[9.5px] block truncate mt-0.5 ${
                    isCustomPaceOpen ||
                    !PACE_PRESETS.some((p) => p.value === dailyTarget)
                      ? "text-white/80"
                      : "text-muted-foreground"
                  }`}
                >
                  Any number
                </span>
              </button>
            </div>

            {/* Custom Pace Input Drawer */}
            {isCustomPaceOpen && (
              <div className="bg-secondary/60 border border-border rounded-2xl p-3 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <span className="text-xs font-medium text-foreground">
                  Enter prayers per day:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customPace}
                    onChange={(e) => setCustomPace(e.target.value)}
                    className="w-16 text-center text-xs font-bold bg-background border border-border rounded-xl py-1.5"
                  />
                  <button
                    onClick={() => handlePaceSelect(customPace)}
                    className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs active:scale-95"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Dynamic Prediction Banner */}
          <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-2xl p-5 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Sparkles size={13} /> Projected Completion
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200">
                At +{dailyTarget} / day
              </span>
            </div>

            {repaymentPlan.isPaused ? (
              <p className="text-sm font-semibold text-white/80">
                Plan is paused. Tap "Resume" to calculate your finish date.
              </p>
            ) : total <= 0 ? (
              <p className="text-base font-bold text-emerald-200">
                Masha'Allah, your Qaza debt is completely repaid!
              </p>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-300 tracking-tight">
                    {dynamicPrediction.timeframeReadable}
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Estimated completion date:{" "}
                  <strong className="text-white underline">
                    {dynamicPrediction.dateFormatted}
                  </strong>
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
              <span>Weekly pace: {dailyTarget * 7} prayers / week</span>
              <span>Consistency over speed</span>
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: TODAY'S FOCUS & QUICK ACTION BUTTONS ─── */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Today's Focus
              </h3>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {todayCompletedCount} of {dailyTarget} prayers completed today
              </p>
            </div>

            {/* Track Witr Checkbox */}
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={trackWitr}
                onChange={(e) => setTrackWitr(e.target.checked)}
                className="rounded text-[#134D37] focus:ring-[#134D37] cursor-pointer"
              />
              <span>Track Witr</span>
            </label>
          </div>

          {/* Today's Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((todayCompletedCount / (dailyTarget || 5)) * 100))}%`,
              }}
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* 1-Tap Log Full Day Completed */}
            <button
              onClick={handleLogFullDayCompleted}
              disabled={total <= 0}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-primary hover:bg-[#0E3D2B] active:scale-95 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-40 cursor-pointer"
            >
              <CalendarDays size={15} />
              <span>✓ Prayed 1 Full Day ({activePrayers.length})</span>
            </button>

            {/* Log Batch Dialog */}
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-secondary hover:bg-muted text-foreground text-xs font-bold border border-border transition-all active:scale-95 cursor-pointer"
            >
              <Layers size={15} className="text-primary" />
              <span>Log Past Batch</span>
            </button>
          </div>
        </div>

        {/* ─── SECTION 4: THE 5 DAILY PRAYERS LEDGER ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Prayer by Prayer Ledger
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium">
              Tap "Prayed" to mark 1 Qaza completed
            </span>
          </div>

          <div className="space-y-3">
            {activePrayers.map((prayerKey) => {
              const meta = PRAYER_META[prayerKey] || {
                name: PRAYER_DISPLAY_NAMES[prayerKey] || prayerKey,
                arabic: "",
                time: "Obligatory",
                icon: Clock,
                color: "text-foreground",
                bg: "bg-secondary",
              };

              const remaining = qaza[prayerKey] ?? 0;
              const progressPct = perPrayerProgress[prayerKey] ?? 0;
              const completed =
                perPrayerProgress[prayerKey] !== undefined
                  ? Math.round(
                      (remaining * (progressPct / 100)) /
                        (1 - progressPct / 100 || 1),
                    )
                  : 0;

              return (
                <PrayerLedgerRow
                  key={prayerKey}
                  prayerKey={prayerKey}
                  meta={meta}
                  remaining={remaining}
                  completed={completed}
                  progressPct={progressPct}
                  onMakeUp={() => {
                    logCompletedQaza(prayerKey, 1);
                    toast.success(
                      `Recorded 1 Qaza ${meta.name} completed!`,
                      {
                        description: "May Allah accept your worship.",
                      },
                    );
                  }}
                  onSetRemaining={(newCount) => {
                    setAmount(prayerKey, newCount);
                    toast.success(
                      `Updated remaining ${meta.name} debt to ${newCount}.`,
                    );
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 5-Step Guided Puberty & Lifetime Calculation Wizard Modal */}
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
            toast.success(
              `Successfully recorded batch of ${res.entries.reduce((a, b) => a + b.count, 0)} completed Qaza prayers!`,
            );
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

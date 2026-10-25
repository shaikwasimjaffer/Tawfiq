import React, { useState } from "react";
import {
  TrendingDown,
  Calendar,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PRAYER_DISPLAY_NAMES } from "@/lib/qazaEngine";

export default function RepaymentPlannerCard({
  totalRemaining,
  repaymentPlan = {},
  repaymentProjections = {},
  activePrayers = [],
  onUpdatePlan,
  onPausePlan,
  onResumePlan,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isPaused = Boolean(repaymentPlan.isPaused);
  const dailyTarget = repaymentPlan.dailyTarget || 5;
  const weeklyGoal = repaymentPlan.weeklyGoal || dailyTarget * 7;
  const categoryTargets = repaymentPlan.categoryTargets || {};

  function handleDailyTargetChange(val) {
    const num = Math.max(1, parseInt(val, 10) || 5);
    onUpdatePlan({ dailyTarget: num, weeklyGoal: num * 7 });
  }

  function handleCategoryTargetChange(prayerKey, val) {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...categoryTargets, [prayerKey]: num };
    onUpdatePlan({ categoryTargets: updated });
  }

  if (totalRemaining <= 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-3xl p-5 shadow-xs text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 mx-auto flex items-center justify-center">
          <CheckCircle2 size={20} />
        </div>
        <h4 className="font-bold text-base text-foreground">
          Your current Qaza tracking estimate is complete.
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Alhamdulillah, all currently tracked prayers have been repaid. May Allah accept your devotion and grant you steadfastness in your daily obligatory prayers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-4">
      {/* Header: Title + Pause/Resume Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown size={17} className="text-[#134D37] dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Repayment Planner & Projections
          </h3>
        </div>

        <button
          type="button"
          onClick={isPaused ? onResumePlan : onPausePlan}
          className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isPaused
              ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
              : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
          }`}
        >
          {isPaused ? (
            <>
              <Play size={12} />
              <span>Resume Plan</span>
            </>
          ) : (
            <>
              <Pause size={12} />
              <span>Pause Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Projection Banner */}
      <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80 space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-medium text-muted-foreground">
            {isPaused ? "Plan Status:" : "Estimated Finish Timeframe:"}
          </span>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {isPaused
              ? "Paused"
              : repaymentProjections.projectedDate
              ? `${repaymentProjections.daysToComplete} days (~${repaymentProjections.projectedDate})`
              : "Calculating..."}
          </span>
        </div>

        {/* Supportive Notice */}
        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
          *Projections are flexible mathematical estimates based on your chosen pace, not rigid religious deadlines. You can adjust your plan at any time without punitive judgment.
        </p>
      </div>

      {/* Primary Goal Selector: Daily Pace */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-secondary/30 rounded-xl border border-border/60 space-y-1">
          <span className="text-muted-foreground text-[10.5px] uppercase font-semibold block">
            Overall Daily Target
          </span>
          <div className="flex items-center gap-2">
            <select
              value={dailyTarget}
              onChange={(e) => handleDailyTargetChange(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs font-bold text-foreground"
            >
              <option value={1}>1 / day</option>
              <option value={2}>2 / day</option>
              <option value={3}>3 / day</option>
              <option value={5}>5 / day (1 set)</option>
              <option value={10}>10 / day (2 sets)</option>
              <option value={15}>15 / day (3 sets)</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-secondary/30 rounded-xl border border-border/60 space-y-1">
          <span className="text-muted-foreground text-[10.5px] uppercase font-semibold block">
            Weekly Equivalent
          </span>
          <span className="text-sm font-bold text-foreground tabular-nums block mt-1">
            {weeklyGoal} prayers / week
          </span>
        </div>
      </div>

      {/* Advanced Drawer: Category-Specific Targets */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-semibold text-[#134D37] dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>{showAdvanced ? "Hide category-specific targets" : "Set different targets per prayer"}</span>
          {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3.5 bg-secondary/30 rounded-2xl border border-border/70 space-y-2.5">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Set how many of each prayer you aim to make up daily:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activePrayers.map((p) => (
                <div key={p} className="p-2 rounded-xl bg-card border border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {PRAYER_DISPLAY_NAMES[p]}:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={categoryTargets[p] ?? 1}
                    onChange={(e) => handleCategoryTargetChange(p, e.target.value)}
                    className="w-12 text-center text-xs font-bold bg-background border border-border rounded-lg py-0.5"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

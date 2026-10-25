import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  Sliders,
  ChevronLeft,
  ArrowRight,
  Info,
  Calendar,
} from "lucide-react";
import { PRAYER_DISPLAY_NAMES } from "@/lib/qazaEngine";
import { getFiqhConfiguration, FIQH_REVIEW_STATUS } from "@/lib/fiqhConfigurations";
import {
  calculateComprehensiveQaza,
  ROUNDING_POLICIES,
} from "@/lib/qazaCalculationEngine";

export default function Step5ReviewAndConfirm({
  wizardData,
  updateWizardData,
  onConfirm,
  onBack,
  onGoToStep,
}) {
  const {
    madhhab = "hanafi",
    gender = "male",
    accountabilityType = "approximate_age",
    accountabilityStartDate = "",
    accountabilityAge = 14,
    currentAge = 25,
    isConvert = false,
    conversionDate = "",
    historicalEndDate = "",
    periods = [],
    excludedPeriods = [],
    subtractMenses = false,
    mensesDaysPerMonth = 7,
    mensesTotalDays = 0,
    roundingPolicy = ROUNDING_POLICIES.UPWARD,
    customTargets = {},
  } = wizardData;

  const fiqhConfig = getFiqhConfiguration(madhhab);
  const trackWitr = fiqhConfig.rules.trackWitr;

  // Compile global exclusions for computation
  const allExclusions = useMemo(() => {
    const list = [...excludedPeriods];
    if (gender === "female" && subtractMenses) {
      if (mensesTotalDays > 0) {
        list.push({ aggregateDays: mensesTotalDays });
      } else {
        // Approximate menses: 12 cycles per year * daysPerMonth
        const years = Math.max(1, currentAge - accountabilityAge);
        const totalEstimatedMensesDays = Math.round(years * 12 * mensesDaysPerMonth);
        list.push({ aggregateDays: totalEstimatedMensesDays });
      }
    }
    return list;
  }, [excludedPeriods, gender, subtractMenses, mensesTotalDays, currentAge, accountabilityAge, mensesDaysPerMonth]);

  // Run comprehensive calculation engine
  const calculationResult = useMemo(() => {
    return calculateComprehensiveQaza({
      periods,
      excludedPeriods: allExclusions,
      trackWitr,
      roundingPolicy,
      customTargets,
    });
  }, [periods, allExclusions, trackWitr, roundingPolicy, customTargets]);

  const [editableTargets, setEditableTargets] = useState(() => ({
    ...calculationResult.roundedTargets,
    ...customTargets,
  }));

  function handleTargetChange(prayerKey, val) {
    const n = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...editableTargets, [prayerKey]: n };
    setEditableTargets(updated);
    updateWizardData({ customTargets: updated });
  }

  function handleRoundingChange(newPolicy) {
    updateWizardData({ roundingPolicy: newPolicy });
  }

  return (
    <div className="space-y-6 text-foreground text-sm">
      {/* Review Header Banner */}
      <div className="p-4 bg-secondary/50 rounded-2xl border border-border/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Estimate Review & Confirmation
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
            <ShieldCheck size={13} /> {fiqhConfig.title}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please review the summary of your inputs and calculations below. You can adjust your tracking targets or change the rounding policy before establishing your live Qaza ledger.
        </p>
      </div>

      {/* 1. Accountable Period & Confidence Summary */}
      <div className="p-4 bg-card rounded-2xl border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Timeline & Boundaries</span>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="text-[11px] text-[#134D37] dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            Edit Start Point
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-secondary/60">
            <span className="text-muted-foreground block text-[10.5px]">Start Point:</span>
            <span className="font-semibold text-foreground">
              {isConvert
                ? `Conversion: ${conversionDate || "Entered Date"}`
                : accountabilityType === "exact_date"
                ? accountabilityStartDate
                : `Puberty ~Age ${accountabilityAge}`}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary/60">
            <span className="text-muted-foreground block text-[10.5px]">End Date:</span>
            <span className="font-semibold text-foreground">
              {historicalEndDate || "Today"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60 text-muted-foreground">
          <span>Total Accountable Calendar Days:</span>
          <strong className="text-foreground">{calculationResult.totalAccountableInclusiveDays.toLocaleString()} days</strong>
        </div>
        {calculationResult.totalExcludedDays > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Deducted Excluded Days (Menses / Illness):</span>
            <strong className="text-emerald-700 dark:text-emerald-400">
              −{calculationResult.totalExcludedDays.toLocaleString()} days
            </strong>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Net Eligible Calculation Days:</span>
          <strong className="text-foreground font-bold">
            {calculationResult.totalEligibleDays.toLocaleString()} days
          </strong>
        </div>
      </div>

      {/* 2. Timeline Segments Breakdown */}
      <div className="p-4 bg-card rounded-2xl border border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            Historical Segments ({periods.length})
          </span>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="text-[11px] text-[#134D37] dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            Edit Timeline
          </button>
        </div>

        <div className="space-y-2">
          {calculationResult.breakdownBySegment.map((seg) => (
            <div
              key={seg.segmentId}
              className="p-2.5 rounded-xl bg-secondary/50 text-xs flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-foreground block">{seg.label}</span>
                <span className="text-muted-foreground text-[11px]">
                  {seg.startDate} → {seg.endDate} ({seg.eligibleDays} eligible days)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(3)}
                className="text-[11px] text-[#134D37] dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Per-Prayer Estimates, Bounds, and Editable Targets */}
      <div className="p-4 bg-card rounded-2xl border border-border space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground block">
              Estimated Obligations & Tracking Targets
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Ranges reflect uncertainty. You can edit any target below.
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10.5px] text-muted-foreground">Round:</span>
            <select
              value={roundingPolicy}
              onChange={(e) => handleRoundingChange(e.target.value)}
              className="bg-secondary text-foreground text-xs font-semibold rounded-lg px-2 py-0.5 border border-border"
            >
              <option value={ROUNDING_POLICIES.UPWARD}>Upward (Precautionary)</option>
              <option value={ROUNDING_POLICIES.NEAREST}>Nearest whole</option>
            </select>
          </div>
        </div>

        <div className="space-y-2.5">
          {calculationResult.activePrayers.map((p) => {
            const hasRange = calculationResult.isRangePerPrayer[p];
            const isExact = calculationResult.isExactPerPrayer[p];
            const low = calculationResult.roundedLowBounds[p];
            const high = calculationResult.roundedHighBounds[p];
            const currentTarget = editableTargets[p] ?? calculationResult.roundedTargets[p];

            return (
              <div
                key={p}
                className="p-3 rounded-xl bg-secondary/40 border border-border/80 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground">
                      {PRAYER_DISPLAY_NAMES[p]}
                    </span>
                    {p === "witr" && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.2 rounded-full">
                        Witr
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isExact ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">Exact count</span>
                    ) : hasRange ? (
                      <span>Range: {low.toLocaleString()} – {high.toLocaleString()} prayers</span>
                    ) : (
                      <span>Calculated nominal estimate</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">Target:</span>
                  <input
                    type="number"
                    min="0"
                    value={currentTarget}
                    onChange={(e) => handleTargetChange(p, e.target.value)}
                    className="w-20 bg-background border border-border rounded-xl px-2 py-1 text-xs font-bold text-foreground text-center focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total prayers summary card */}
        <div className="p-3 rounded-xl bg-[#134D37]/10 dark:bg-[#134D37]/25 border border-[#134D37]/30 flex items-center justify-between">
          <span className="font-bold text-xs text-foreground">Total Starting Qaza Target:</span>
          <span className="text-lg font-black text-[#134D37] dark:text-emerald-400 tabular-nums">
            {Object.values(editableTargets).reduce((a, b) => a + b, 0).toLocaleString()} prayers
          </span>
        </div>
      </div>

      {/* 4. Ethical & Scholarly Clarity Notice */}
      <div className="p-3.5 bg-secondary/30 rounded-2xl border border-border/60 flex items-start gap-2.5 text-xs text-muted-foreground">
        <Info size={16} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Notice:</strong> This number represents a numerical estimation derived from your recorded history and selected jurisprudential assumptions. It is not an absolute divine verdict. Tawfiq helps you track sincere repayment with peace of mind.
        </p>
      </div>

      {/* Footer Navigation: Back & Explicit Confirm */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onConfirm(editableTargets, calculationResult)}
          className="px-6 py-3 rounded-2xl bg-[#134D37] hover:bg-[#0E3D2B] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <CheckCircle2 size={15} />
          <span>Confirm & Establish Live Ledger</span>
        </button>
      </div>
    </div>
  );
}

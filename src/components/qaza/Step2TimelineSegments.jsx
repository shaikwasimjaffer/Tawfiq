import React, { useState } from "react";
import { Plus, Trash2, Split, AlertTriangle, Calendar, Clock, ChevronRight, Edit3 } from "lucide-react";
import {
  calculateInclusiveCalendarDays,
  analyzeTimelineContinuity,
  formatLocalDate,
} from "@/lib/qazaCalculationEngine";

export const HISTORICAL_PATTERNS = [
  { id: "all_five", label: "Missed all five daily prayers", defaultFreq: 7 },
  { id: "only_particular", label: "Missed only particular prayers (e.g. Fajr only)", defaultFreq: 3 },
  { id: "different_days", label: "Missed different prayers on different days", defaultFreq: 3 },
  { id: "regular_occasional", label: "Prayed regularly but occasionally missed prayers", defaultFreq: 1 },
  { id: "irregular_routine", label: "Had an irregular prayer routine", defaultFreq: 4 },
  { id: "stopped_restarted", label: "Stopped praying for a period and restarted later", defaultFreq: 5 },
  { id: "exact_known", label: "Already know the number of missed prayers", defaultFreq: 0 },
  { id: "unsure_estimate", label: "I am unsure and need help estimating", defaultFreq: 3 },
];

export default function Step2TimelineSegments({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}) {
  const { periods = [] } = wizardData;
  const [editingPeriodId, setEditingPeriodId] = useState(null);

  // Validate continuity
  const continuity = analyzeTimelineContinuity(periods);

  function handleAddPeriod() {
    const last = periods[periods.length - 1];
    let nextStart = "2020-01-01";
    let nextEnd = "2021-12-31";

    if (last && last.endDate) {
      const d = new Date(last.endDate);
      d.setDate(d.getDate() + 1);
      nextStart = formatLocalDate(d);
      const nextYear = new Date(d);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      nextEnd = formatLocalDate(nextYear);
    }

    const newPeriod = {
      id: `seg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      label: `Period ${String.fromCharCode(65 + periods.length)}`,
      startDate: nextStart,
      endDate: nextEnd,
      patternType: "all_five",
      confidence: "medium",
      notes: "",
      prayers: {
        fajr: { mode: "every_day" },
        dhuhr: { mode: "every_day" },
        asr: { mode: "every_day" },
        maghrib: { mode: "every_day" },
        isha: { mode: "every_day" },
        witr: { mode: "every_day" },
      },
    };

    updateWizardData({ periods: [...periods, newPeriod] });
    setEditingPeriodId(newPeriod.id);
  }

  function handleRemovePeriod(id) {
    if (periods.length <= 1) {
      alert("At least one historical timeline period is required.");
      return;
    }
    const updated = periods.filter((p) => p.id !== id);
    updateWizardData({ periods: updated });
    if (editingPeriodId === id) setEditingPeriodId(null);
  }

  function handleSplitPeriod(period) {
    const s = new Date(period.startDate);
    const e = new Date(period.endDate);
    const midTime = s.getTime() + (e.getTime() - s.getTime()) / 2;
    const midDate = new Date(midTime);
    const midNext = new Date(midTime + 24 * 60 * 60 * 1000);

    const firstHalf = {
      ...period,
      id: `${period.id}_part1`,
      label: `${period.label} (Part 1)`,
      endDate: formatLocalDate(midDate),
    };

    const secondHalf = {
      ...period,
      id: `seg_${Date.now()}`,
      label: `${period.label} (Part 2)`,
      startDate: formatLocalDate(midNext),
    };

    const index = periods.findIndex((p) => p.id === period.id);
    const nextList = [...periods];
    nextList.splice(index, 1, firstHalf, secondHalf);
    updateWizardData({ periods: nextList });
  }

  function handleUpdatePeriodField(id, field, value) {
    const updated = periods.map((p) => {
      if (p.id !== id) return p;
      return { ...p, [field]: value };
    });
    updateWizardData({ periods: updated });
  }

  return (
    <div className="space-y-6 text-foreground text-sm">
      {/* Intro Header */}
      <div>
        <h3 className="font-bold text-base text-foreground">
          Build Your Prayer History Timeline
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Break your past into distinct life periods. Real lives have changing habits—some years consistent, some missed, some with only Fajr missed.
        </p>
      </div>

      {/* Continuity Warnings (Gaps or Overlaps) */}
      {continuity.hasOverlaps && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <span>Overlapping Dates Detected</span>
          </div>
          <p className="text-[11.5px] leading-relaxed">
            {continuity.overlaps.map((o) => `${o.periodA} overlaps with ${o.periodB} between ${o.overlapStartDate} and ${o.overlapEndDate}`).join(". ")}.
            Ensure dates are non-overlapping to avoid double counting.
          </p>
        </div>
      )}

      {continuity.hasGaps && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <Clock size={15} className="text-blue-600 shrink-0" />
            <span>Timeline Gap Detected</span>
          </div>
          <p className="text-[11.5px] leading-relaxed">
            {continuity.gaps.map((g) => `Gap between ${g.between} (${g.gapStartDate} to ${g.gapEndDate}, ~${g.gapDays} days)`).join(". ")}.
            Ensure you haven't omitted an unaccounted period.
          </p>
        </div>
      )}

      {/* Period Cards */}
      <div className="space-y-4">
        {periods.map((p, idx) => {
          const days = calculateInclusiveCalendarDays(p.startDate, p.endDate);
          const isEditing = editingPeriodId === p.id;
          const currentPattern = HISTORICAL_PATTERNS.find((hp) => hp.id === p.patternType) || HISTORICAL_PATTERNS[0];

          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all ${
                isEditing
                  ? "bg-card border-[#134D37] ring-1 ring-[#134D37] shadow-sm"
                  : "bg-secondary/40 border-border hover:bg-secondary/70"
              }`}
            >
              {/* Header: Label, Days Badge & Actions */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{p.label}</span>
                    <span className="text-[11px] font-semibold bg-[#134D37]/10 text-[#134D37] dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {days} days (~{(days / 365).toFixed(1)} yrs)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.startDate} → {p.endDate}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingPeriodId(isEditing ? null : p.id)}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title={isEditing ? "Done editing" : "Edit period dates"}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSplitPeriod(p)}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Split into two smaller periods"
                  >
                    <Split size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePeriod(p.id)}
                    disabled={periods.length <= 1}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-red-600 disabled:opacity-30 transition-colors"
                    title="Delete period"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Editable Date Fields */}
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Period Label:
                    </label>
                    <input
                      type="text"
                      value={p.label}
                      onChange={(e) => handleUpdatePeriodField(p.id, "label", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Confidence Level:
                    </label>
                    <select
                      value={p.confidence || "medium"}
                      onChange={(e) => handleUpdatePeriodField(p.id, "confidence", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                    >
                      <option value="high">High (Exact dates)</option>
                      <option value="medium">Medium (Approximate)</option>
                      <option value="low">Low (Uncertain estimate)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Start Date:
                    </label>
                    <input
                      type="date"
                      value={p.startDate}
                      onChange={(e) => handleUpdatePeriodField(p.id, "startDate", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      End Date:
                    </label>
                    <input
                      type="date"
                      value={p.endDate}
                      onChange={(e) => handleUpdatePeriodField(p.id, "endDate", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                    />
                  </div>
                </div>
              ) : null}

              {/* Question: How was your prayer during this period? */}
              <div className="pt-3 space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  How was your prayer during this period?
                </label>
                <select
                  value={p.patternType || "all_five"}
                  onChange={(e) => {
                    const patId = e.target.value;
                    handleUpdatePeriodField(p.id, "patternType", patId);
                  }}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                >
                  {HISTORICAL_PATTERNS.map((hp) => (
                    <option key={hp.id} value={hp.id}>
                      {hp.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Period Button */}
      <button
        type="button"
        onClick={handleAddPeriod}
        className="w-full py-3 border-2 border-dashed border-border hover:border-[#134D37] rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Plus size={15} />
        <span>Add Another Historical Period</span>
      </button>

      {/* Footer Navigation */}
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
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-[#134D37] hover:bg-[#0E3D2B] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <span>Configure Prayers for Each Period</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

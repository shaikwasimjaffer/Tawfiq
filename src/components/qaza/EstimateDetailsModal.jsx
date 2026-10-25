import React from "react";
import { X, ShieldCheck, Calculator, Calendar, Info, Edit3, ArrowRight } from "lucide-react";
import { PRAYER_DISPLAY_NAMES } from "@/lib/qazaEngine";

export default function EstimateDetailsModal({
  isOpen,
  onClose,
  profile = {},
  activeFiqhConfig = {},
  timelineSegments = [],
  excludedPeriods = [],
  estimateVersions = [],
  onOpenWizard,
}) {
  if (!isOpen) return null;

  const latestVersion = estimateVersions[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />
      <div className="relative bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl z-10 text-left flex flex-col max-h-[88vh] overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-[#134D37] dark:text-emerald-400">
              <ShieldCheck size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Active Estimate Assumptions
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-foreground mt-0.5">
              Estimate Provenance & Ranges
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable details */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          {/* Fiqh Configuration Badge */}
          <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{activeFiqhConfig.title}</span>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {activeFiqhConfig.reviewStatus?.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Reviewer: {activeFiqhConfig.reviewer}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              Witr Status: <strong>{activeFiqhConfig.rules?.witrClassification?.replace(/_/g, " ")}</strong>
            </p>
          </div>

          {/* Uncertainty Ranges & Targets */}
          {latestVersion && latestVersion.lowerBounds && (
            <div className="p-3.5 bg-secondary/40 rounded-2xl border border-border space-y-2">
              <span className="font-bold text-foreground block">
                Historical Uncertainty Ranges & Targets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(latestVersion.perPrayerTotals || {}).map((p) => {
                  const target = latestVersion.perPrayerTotals[p] || 0;
                  const low = latestVersion.lowerBounds[p] || target;
                  const high = latestVersion.upperBounds[p] || target;

                  return (
                    <div key={p} className="p-2 rounded-xl bg-card border border-border">
                      <div className="flex justify-between items-center font-bold text-foreground">
                        <span>{PRAYER_DISPLAY_NAMES[p]}:</span>
                        <span>{target.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        Range: {low.toLocaleString()} – {high.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline Segments */}
          <div className="p-3.5 bg-secondary/40 rounded-2xl border border-border space-y-2">
            <span className="font-bold text-foreground block">
              Active Timeline Periods ({timelineSegments.length}):
            </span>
            <div className="space-y-1.5">
              {timelineSegments.length === 0 ? (
                <span className="text-muted-foreground text-[11px]">Default baseline estimate</span>
              ) : (
                timelineSegments.map((seg, idx) => (
                  <div
                    key={seg.id || idx}
                    className="p-2 rounded-xl bg-card border border-border flex items-center justify-between text-[11px]"
                  >
                    <span className="font-semibold text-foreground">{seg.label}</span>
                    <span className="text-muted-foreground">
                      {seg.startDate} → {seg.endDate}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer: Recalculate CTA */}
        <div className="pt-3 border-t border-border shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Discovered new history?
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenWizard();
            }}
            className="px-4 py-2 bg-[#134D37] hover:bg-[#0E3D2B] text-white text-xs font-semibold rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 size={13} />
            <span>Revise Estimate in Wizard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

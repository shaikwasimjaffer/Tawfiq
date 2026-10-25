import React, { useState } from "react";
import { Check, Copy, Sliders, ChevronRight, Hash, TrendingUp, Sparkles } from "lucide-react";
import { PRAYER_DISPLAY_NAMES } from "@/lib/qazaEngine";
import { ESTIMATION_MODES } from "@/lib/qazaCalculationEngine";

export default function Step3PeriodPrayerConfig({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}) {
  const { periods = [], trackWitr = false } = wizardData;
  const activePrayers = trackWitr
    ? ["fajr", "dhuhr", "asr", "maghrib", "isha", "witr"]
    : ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  const [activePeriodIndex, setActivePeriodIndex] = useState(0);
  const currentPeriod = periods[activePeriodIndex] || periods[0];

  // Quick Action selection state
  const [selectedPrayersForBatch, setSelectedPrayersForBatch] = useState([]);
  const [batchFrequency, setBatchFrequency] = useState(7);

  if (!currentPeriod) {
    return <div>No periods found. Please return to Step 2.</div>;
  }

  function updatePrayerConfig(prayerKey, updates) {
    const updatedPeriods = periods.map((p, idx) => {
      if (idx !== activePeriodIndex) return p;
      const currentPrayers = p.prayers || {};
      const currentConfig = currentPrayers[prayerKey] || {};
      return {
        ...p,
        prayers: {
          ...currentPrayers,
          [prayerKey]: {
            ...currentConfig,
            ...updates,
          },
        },
      };
    });

    updateWizardData({ periods: updatedPeriods });
  }

  // Quick Action: Select all prayers
  function handleSelectAllPrayers() {
    setSelectedPrayersForBatch([...activePrayers]);
  }

  // Quick Action: Clear prayer selection
  function handleClearPrayerSelection() {
    setSelectedPrayersForBatch([]);
  }

  // Quick Action: Apply frequency to selected prayers
  function handleApplyBatchFrequency() {
    if (selectedPrayersForBatch.length === 0) return;
    const updatedPeriods = periods.map((p, idx) => {
      if (idx !== activePeriodIndex) return p;
      const currentPrayers = { ...(p.prayers || {}) };
      selectedPrayersForBatch.forEach((prayerKey) => {
        currentPrayers[prayerKey] = {
          mode: batchFrequency === 7 ? ESTIMATION_MODES.EVERY_ELIGIBLE_DAY : ESTIMATION_MODES.AVERAGE_WEEKLY,
          frequency: batchFrequency,
        };
      });
      return { ...p, prayers: currentPrayers };
    });

    updateWizardData({ periods: updatedPeriods });
    setSelectedPrayersForBatch([]);
  }

  // Quick Action: Copy pattern to another period
  function handleCopyPatternToAllPeriods() {
    if (periods.length <= 1) return;
    if (window.confirm(`Apply ${currentPeriod.label}'s prayer pattern to all other timeline periods?`)) {
      const patternSource = currentPeriod.prayers || {};
      const updatedPeriods = periods.map((p, idx) => {
        if (idx === activePeriodIndex) return p;
        return {
          ...p,
          prayers: JSON.parse(JSON.stringify(patternSource)),
        };
      });
      updateWizardData({ periods: updatedPeriods });
    }
  }

  return (
    <div className="space-y-6 text-foreground text-sm">
      {/* Period Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Select Period to Configure ({activePeriodIndex + 1} of {periods.length})
          </label>
          {periods.length > 1 && (
            <button
              type="button"
              onClick={handleCopyPatternToAllPeriods}
              className="text-[11px] font-semibold text-[#134D37] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy size={12} />
              <span>Copy to all periods</span>
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {periods.map((p, idx) => {
            const isCurrent = idx === activePeriodIndex;
            return (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => {
                  setActivePeriodIndex(idx);
                  setSelectedPrayersForBatch([]);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isCurrent
                    ? "bg-[#134D37] text-white border-[#134D37] shadow-xs"
                    : "bg-secondary/70 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="p-3 bg-secondary/50 rounded-2xl border border-border/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground">Quick Batch Actions:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllPrayers}
              className="text-[11px] text-[#134D37] dark:text-emerald-400 font-semibold hover:underline"
            >
              Select All
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              type="button"
              onClick={handleClearPrayerSelection}
              className="text-[11px] text-muted-foreground hover:underline"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Apply frequency:</span>
          <select
            value={batchFrequency}
            onChange={(e) => setBatchFrequency(Number(e.target.value))}
            className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-semibold"
          >
            <option value={7}>7/wk (Every day)</option>
            <option value={5}>5/wk (Frequently)</option>
            <option value={3}>3/wk (Sometimes)</option>
            <option value={1}>1/wk (Rarely)</option>
            <option value={0}>0/wk (Never missed)</option>
          </select>
          <button
            type="button"
            disabled={selectedPrayersForBatch.length === 0}
            onClick={handleApplyBatchFrequency}
            className="px-3 py-1 bg-[#134D37] disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-2xs hover:bg-[#0E3D2B] transition-all cursor-pointer"
          >
            Apply to {selectedPrayersForBatch.length} Selected
          </button>
        </div>
      </div>

      {/* Per-Prayer Config Cards */}
      <div className="space-y-3">
        {activePrayers.map((prayerKey) => {
          const prayerCfg = (currentPeriod.prayers && currentPeriod.prayers[prayerKey]) || {
            mode: ESTIMATION_MODES.EVERY_ELIGIBLE_DAY,
          };
          const isSelectedInBatch = selectedPrayersForBatch.includes(prayerKey);
          const currentMode = prayerCfg.mode || ESTIMATION_MODES.AVERAGE_WEEKLY;

          return (
            <div
              key={prayerKey}
              className={`p-3.5 rounded-2xl border transition-all ${
                isSelectedInBatch
                  ? "bg-[#134D37]/10 border-[#134D37] ring-1 ring-[#134D37]"
                  : "bg-card border-border hover:border-border/80"
              }`}
            >
              {/* Row Header: Checkbox + Prayer Name + Mode Selector */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelectedInBatch}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPrayersForBatch([...selectedPrayersForBatch, prayerKey]);
                      } else {
                        setSelectedPrayersForBatch(selectedPrayersForBatch.filter((k) => k !== prayerKey));
                      }
                    }}
                    className="w-4 h-4 rounded text-[#134D37] focus:ring-[#134D37] cursor-pointer"
                  />
                  <span className="font-bold text-sm text-foreground">
                    {PRAYER_DISPLAY_NAMES[prayerKey]}
                  </span>
                  {prayerKey === "witr" && (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      Witr
                    </span>
                  )}
                </label>

                {/* Mode Selector */}
                <select
                  value={currentMode}
                  onChange={(e) => updatePrayerConfig(prayerKey, { mode: e.target.value })}
                  className="bg-secondary text-foreground text-xs font-medium border border-border rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                >
                  <option value={ESTIMATION_MODES.EVERY_ELIGIBLE_DAY}>Every eligible day</option>
                  <option value={ESTIMATION_MODES.AVERAGE_WEEKLY}>Average / week</option>
                  <option value={ESTIMATION_MODES.UNCERTAIN_RANGE}>Uncertain range (low-high)</option>
                  <option value={ESTIMATION_MODES.EXACT}>Exact count known</option>
                  <option value={ESTIMATION_MODES.CUSTOM_TARGET}>Custom target</option>
                </select>
              </div>

              {/* Mode-Specific Parameter Inputs */}
              <div className="pt-2.5">
                {currentMode === ESTIMATION_MODES.EVERY_ELIGIBLE_DAY && (
                  <p className="text-xs text-muted-foreground">
                    Calculated as missed on 100% of eligible days in this period.
                  </p>
                )}

                {currentMode === ESTIMATION_MODES.AVERAGE_WEEKLY && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Average missed frequency:</span>
                      <strong className="text-foreground">
                        {prayerCfg.frequency !== undefined ? prayerCfg.frequency : 7} times / week
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      step="0.5"
                      value={prayerCfg.frequency !== undefined ? prayerCfg.frequency : 7}
                      onChange={(e) => updatePrayerConfig(prayerKey, { frequency: Number(e.target.value) })}
                      className="w-full accent-[#134D37] cursor-pointer"
                    />
                  </div>
                )}

                {currentMode === ESTIMATION_MODES.UNCERTAIN_RANGE && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-muted-foreground block mb-1">
                        Low bound: <strong>{prayerCfg.lowFrequency ?? 0}/wk</strong>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="7"
                        step="0.5"
                        value={prayerCfg.lowFrequency ?? 0}
                        onChange={(e) => updatePrayerConfig(prayerKey, { lowFrequency: Number(e.target.value) })}
                        className="w-full accent-[#134D37] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground block mb-1">
                        High bound: <strong>{prayerCfg.highFrequency ?? 7}/wk</strong>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="7"
                        step="0.5"
                        value={prayerCfg.highFrequency ?? 7}
                        onChange={(e) => updatePrayerConfig(prayerKey, { highFrequency: Number(e.target.value) })}
                        className="w-full accent-[#134D37] cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {currentMode === ESTIMATION_MODES.EXACT && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Exact number missed:</span>
                    <input
                      type="number"
                      min="0"
                      value={prayerCfg.exactCount ?? 0}
                      onChange={(e) => updatePrayerConfig(prayerKey, { exactCount: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-24 bg-background border border-border rounded-xl px-2.5 py-1 text-xs font-bold text-foreground text-center focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                    />
                    <span className="text-xs text-muted-foreground">prayers</span>
                  </div>
                )}

                {currentMode === ESTIMATION_MODES.CUSTOM_TARGET && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Custom target:</span>
                    <input
                      type="number"
                      min="0"
                      value={prayerCfg.customTarget ?? 0}
                      onChange={(e) => updatePrayerConfig(prayerKey, { customTarget: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-24 bg-background border border-border rounded-xl px-2.5 py-1 text-xs font-bold text-foreground text-center focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                    />
                    <span className="text-xs text-muted-foreground">prayers</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
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
          <span>Exemptions & Special Circumstances</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

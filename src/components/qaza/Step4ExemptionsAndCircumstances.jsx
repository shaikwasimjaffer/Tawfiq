import React, { useState } from "react";
import { Plus, Trash2, Shield, AlertTriangle, BookOpen, ChevronRight, HeartHandshake, Info } from "lucide-react";
import { getFiqhConfiguration } from "@/lib/fiqhConfigurations";

export default function Step4ExemptionsAndCircumstances({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}) {
  const {
    gender = "male",
    madhhab = "hanafi",
    subtractMenses = false,
    mensesMode = "aggregate", // "aggregate" | "date_ranges"
    mensesDaysPerMonth = 7,
    mensesTotalDays = 0,
    excludedPeriods = [],
    hasUncertainCircumstance = false,
    uncertainNotes = "",
  } = wizardData;

  const fiqhConfig = getFiqhConfiguration(madhhab);
  const [newExclusionCategory, setNewExclusionCategory] = useState("illness");
  const [newExclusionStart, setNewExclusionStart] = useState("");
  const [newExclusionEnd, setNewExclusionEnd] = useState("");
  const [newExclusionDays, setNewExclusionDays] = useState(0);

  function handleAddCustomExclusion() {
    if (!newExclusionStart && newExclusionDays <= 0) {
      alert("Please enter either a date range or aggregate number of excluded days.");
      return;
    }

    const newEx = {
      id: `ex_${Date.now()}`,
      category: newExclusionCategory,
      startDate: newExclusionStart || null,
      endDate: newExclusionEnd || newExclusionStart || null,
      aggregateDays: newExclusionDays > 0 ? Number(newExclusionDays) : 0,
    };

    updateWizardData({ excludedPeriods: [...excludedPeriods, newEx] });
    setNewExclusionStart("");
    setNewExclusionEnd("");
    setNewExclusionDays(0);
  }

  function handleRemoveExclusion(id) {
    updateWizardData({ excludedPeriods: excludedPeriods.filter((e) => e.id !== id) });
  }

  return (
    <div className="space-y-6 text-foreground text-sm">
      {/* Intro Header */}
      <div>
        <h3 className="font-bold text-base text-foreground">
          Periods or Circumstances That May Affect Your Estimate
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Certain periods are legally excused from prayer or makeup under Islamic jurisprudence. You can enter date ranges or aggregate days without disclosing unnecessary personal details.
        </p>
      </div>

      {/* 1. Menstruation & Postpartum (Female users) */}
      {gender === "female" && (
        <div className="p-4 bg-secondary/50 rounded-2xl border border-border/80 space-y-3.5">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-bold text-sm text-foreground block">
                Menstruation (Hayd) & Postnatal (Nifas) Exemption
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Under Sahih al-Bukhari 321 and consensus of the 4 Madhhabs, prayers during menses are waived and not made up.
              </span>
            </div>
            <input
              type="checkbox"
              checked={subtractMenses}
              onChange={(e) => updateWizardData({ subtractMenses: e.target.checked })}
              className="w-4 h-4 rounded text-[#134D37] focus:ring-[#134D37] cursor-pointer shrink-0"
            />
          </label>

          {subtractMenses && (
            <div className="space-y-3 pt-2.5 border-t border-border/60">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateWizardData({ mensesMode: "aggregate" })}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border ${
                    mensesMode === "aggregate"
                      ? "bg-[#134D37] text-white border-[#134D37]"
                      : "bg-background border-border text-foreground"
                  }`}
                >
                  Average Days / Month
                </button>
                <button
                  type="button"
                  onClick={() => updateWizardData({ mensesMode: "lump_sum" })}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border ${
                    mensesMode === "lump_sum"
                      ? "bg-[#134D37] text-white border-[#134D37]"
                      : "bg-background border-border text-foreground"
                  }`}
                >
                  Lump Sum Total Days
                </button>
              </div>

              {mensesMode === "aggregate" ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Average bleeding days per cycle:</span>
                    <strong className="text-foreground">{mensesDaysPerMonth} days / month</strong>
                  </div>
                  <input
                    type="range"
                    min={fiqhConfig.rules.exemptions.minMensesDaysPerCycle || 3}
                    max={fiqhConfig.rules.exemptions.maxMensesDaysPerCycle || 15}
                    value={mensesDaysPerMonth}
                    onChange={(e) => updateWizardData({ mensesDaysPerMonth: Number(e.target.value) })}
                    className="w-full accent-[#134D37] cursor-pointer"
                  />
                  <p className="text-[10.5px] text-muted-foreground">
                    Based on {fiqhConfig.title}: minimum {fiqhConfig.rules.exemptions.minMensesDaysPerCycle || 3} days, maximum {fiqhConfig.rules.exemptions.maxMensesDaysPerCycle || 15} days.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Total estimated excluded days:</span>
                  <input
                    type="number"
                    min="0"
                    value={mensesTotalDays}
                    onChange={(e) => updateWizardData({ mensesTotalDays: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-24 bg-background border border-border rounded-xl px-2.5 py-1 text-xs font-bold text-foreground text-center"
                  />
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Illness, Hospitalization, or Unconsciousness */}
      <div className="p-4 bg-secondary/50 rounded-2xl border border-border/80 space-y-3">
        <div>
          <span className="font-bold text-sm text-foreground block">
            Illness, Surgery, or Involuntary Incapacity
          </span>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            Add any extended illness or hospitalization periods that should be deducted from your accountable timeline.
          </span>
        </div>

        {/* Existing exclusions list */}
        {excludedPeriods.length > 0 && (
          <div className="space-y-2">
            {excludedPeriods.map((ex) => (
              <div
                key={ex.id}
                className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold capitalize text-foreground">{ex.category}: </span>
                  <span className="text-muted-foreground">
                    {ex.startDate ? `${ex.startDate} → ${ex.endDate}` : `${ex.aggregateDays} aggregate days`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExclusion(ex.id)}
                  className="p-1 rounded text-muted-foreground hover:text-red-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add custom exclusion form */}
        <div className="pt-2 border-t border-border/60 space-y-2.5">
          <span className="text-xs font-semibold text-foreground block">Add an Excluded Period:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={newExclusionCategory}
              onChange={(e) => setNewExclusionCategory(e.target.value)}
              className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground"
            >
              <option value="illness">Illness / Hospital</option>
              <option value="unconscious">Loss of Consciousness</option>
              <option value="travel_doubt">Uncertain Period</option>
              <option value="custom">Other Circumstance</option>
            </select>

            <input
              type="number"
              placeholder="Or total days"
              min="0"
              value={newExclusionDays || ""}
              onChange={(e) => setNewExclusionDays(e.target.value)}
              className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10.5px] text-muted-foreground block mb-0.5">Start Date (optional):</label>
              <input
                type="date"
                value={newExclusionStart}
                onChange={(e) => setNewExclusionStart(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-2.5 py-1 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="text-[10.5px] text-muted-foreground block mb-0.5">End Date (optional):</label>
              <input
                type="date"
                value={newExclusionEnd}
                onChange={(e) => setNewExclusionEnd(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-2.5 py-1 text-xs text-foreground"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCustomExclusion}
            className="w-full py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Excluded Period</span>
          </button>
        </div>
      </div>

      {/* 3. Uncertain Rulings & Scholar Referral Path */}
      <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
        <div className="flex items-center gap-1.5 font-bold">
          <BookOpen size={14} className="text-amber-700" />
          <span>Questions Requiring Scholarly Judgment</span>
        </div>
        <p className="leading-relaxed text-[11.5px]">
          If you have questions regarding the validity of past prayers (e.g. prayers performed without knowing purification rules, or disputed prayer times), Tawfiq does not substitute for a qualified Mufti.
        </p>
        <p className="text-[11px] italic text-amber-800/80 dark:text-amber-300/80">
          We recommend noting these prayers down and consulting a trusted local scholar. You can update your Qaza target at any time after receiving their guidance.
        </p>
      </div>

      {/* 4. Privacy Assurance Banner */}
      <div className="p-3 bg-secondary/40 rounded-xl border border-border/60 flex items-center gap-2.5 text-xs text-muted-foreground">
        <Shield size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span className="text-[11px]">
          All exemption calculations remain strictly private. Sensitive personal dates are never transmitted to analytics or diagnostics.
        </span>
      </div>

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
          <span>Review & Confirm Estimate</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

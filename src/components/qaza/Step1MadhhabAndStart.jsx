import React from "react";
import { Check, ShieldCheck, AlertCircle, HelpCircle, Calendar, Sparkles } from "lucide-react";
import { MADHHAB_OPTIONS, FIQH_REVIEW_STATUS } from "@/lib/fiqhConfigurations";

export default function Step1MadhhabAndStart({
  wizardData,
  updateWizardData,
  onNext,
}) {
  const {
    madhhab = "hanafi",
    accountabilityType = "approximate_age", // "exact_date" | "approximate_date" | "approximate_age" | "unsure"
    accountabilityStartDate = "",
    accountabilityAge = 14,
    currentAge = 25,
    gender = "male",
    isConvert = false,
    conversionDate = "",
    historicalEndDate = new Date().toISOString().split("T")[0],
    regularPrayerStartType = "none", // "none" | "specific_age" | "specific_date"
    regularPrayerStartAge = 20,
    regularPrayerStartDate = "",
  } = wizardData;

  const selectedOption = MADHHAB_OPTIONS.find((m) => m.id === madhhab) || MADHHAB_OPTIONS[0];

  return (
    <div className="space-y-6 text-foreground text-sm">
      {/* Introduction */}
      <div className="bg-secondary/50 rounded-2xl p-4 border border-border/70">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tawfiq calculates Qaza using your actual personal history and explicit jurisprudential guidelines. All madhhab profiles are transparently versioned and reviewed.
        </p>
      </div>

      {/* 1. Madhhab Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          1. Which Madhhab (School of Jurisprudence) do you follow?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MADHHAB_OPTIONS.map((opt) => {
            const isSelected = madhhab === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateWizardData({ madhhab: opt.id })}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#134D37]/10 dark:bg-[#134D37]/25 border-[#134D37] ring-1 ring-[#134D37] shadow-xs"
                    : "bg-card hover:bg-secondary/60 border-border text-foreground"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{opt.name}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#134D37] text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {opt.subtitle}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center gap-1.5 text-[10px]">
                  {opt.status === FIQH_REVIEW_STATUS.REVIEWED_AND_APPROVED ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <ShieldCheck size={11} /> Scholarly Reviewed
                    </span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400 font-medium inline-flex items-center gap-1">
                      <AlertCircle size={11} /> Basic Arithmetic
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Gender (required for authentic exemption rules) */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          2. Gender
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {["male", "female"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => updateWizardData({ gender: g })}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                gender === g
                  ? "bg-[#134D37] text-white border-[#134D37] shadow-xs"
                  : "bg-secondary/70 border-border text-foreground hover:bg-secondary"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conversion to Islam history */}
      <div className="p-4 bg-secondary/60 rounded-2xl border border-border/80 space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="pr-2">
            <span className="text-xs font-bold text-foreground block">
              I accepted Islam later in life (Revert / Convert)
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Under consensus Islamic jurisprudence, prayers missed before accepting Islam are completely waived and not made up.
            </span>
          </div>
          <input
            type="checkbox"
            checked={isConvert}
            onChange={(e) => updateWizardData({ isConvert: e.target.checked })}
            className="w-4 h-4 rounded text-[#134D37] focus:ring-[#134D37] cursor-pointer shrink-0"
          />
        </label>

        {isConvert && (
          <div className="pt-2 border-t border-border/60">
            <label className="text-xs font-semibold text-foreground block mb-1">
              Date you accepted Islam:
            </label>
            <input
              type="date"
              value={conversionDate}
              onChange={(e) => updateWizardData({ conversionDate: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
            />
            <p className="text-[10.5px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
              ✓ Only periods on or after this date will be calculated.
            </p>
          </div>
        )}
      </div>

      {/* 4. Accountability Starting Point (Bulugh) */}
      {!isConvert && (
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            3. When did your prayer obligation start (Puberty / Bulugh)?
          </label>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: "approximate_age", label: "Approximate Age" },
              { id: "exact_date", label: "Exact Starting Date" },
              { id: "approximate_date", label: "Approximate Month/Year" },
              { id: "unsure", label: "Help me estimate" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateWizardData({ accountabilityType: mode.id })}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                  accountabilityType === mode.id
                    ? "bg-[#134D37] text-white border-[#134D37]"
                    : "bg-card border-border text-foreground hover:bg-secondary"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {accountabilityType === "approximate_age" && (
            <div className="p-4 bg-secondary/50 rounded-2xl border border-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Puberty Age:</span>
                <span className="font-bold text-[#134D37] dark:text-emerald-400 text-sm">
                  Age {accountabilityAge}
                </span>
              </div>
              <input
                type="range"
                min="9"
                max={Math.min(currentAge, 21)}
                value={accountabilityAge}
                onChange={(e) => updateWizardData({ accountabilityAge: Number(e.target.value) })}
                className="w-full accent-[#134D37] cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground">
                Current age is {currentAge}. Accountability span is ~{Math.max(0, currentAge - accountabilityAge)} years.
              </p>
            </div>
          )}

          {accountabilityType === "exact_date" && (
            <div className="p-4 bg-secondary/50 rounded-2xl border border-border space-y-1">
              <label className="text-xs font-semibold text-foreground block">
                Exact start date:
              </label>
              <input
                type="date"
                value={accountabilityStartDate}
                onChange={(e) => updateWizardData({ accountabilityStartDate: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
              />
            </div>
          )}

          {accountabilityType === "approximate_date" && (
            <div className="p-4 bg-secondary/50 rounded-2xl border border-border space-y-1">
              <label className="text-xs font-semibold text-foreground block">
                Approximate Month & Year:
              </label>
              <input
                type="month"
                value={accountabilityStartDate ? accountabilityStartDate.slice(0, 7) : ""}
                onChange={(e) => updateWizardData({ accountabilityStartDate: `${e.target.value}-01` })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
              />
            </div>
          )}

          {accountabilityType === "unsure" && (
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <HelpCircle size={14} className="text-amber-700" />
                <span>Scholarly Guideline on Uncertain Puberty</span>
              </div>
              <p className="leading-relaxed text-[11.5px]">
                Under the classical consensus of the four Sunni schools, if physical signs of puberty are unremembered or delayed, legal obligation (Taklif) is established upon reaching <strong>15 lunar years</strong> (approximately 14.5 Gregorian solar years).
              </p>
              <button
                type="button"
                onClick={() => updateWizardData({ accountabilityType: "approximate_age", accountabilityAge: 15 })}
                className="text-xs font-bold text-[#134D37] dark:text-emerald-400 underline cursor-pointer"
              >
                Use age 15 as conservative starting point →
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Historical End Date */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          {isConvert ? "3." : "4."} End date of uncalculated prayer history
        </label>
        <div className="p-3 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-foreground block">History calculated up to:</span>
            <span className="text-[11px] text-muted-foreground">Default is today (subsequent missed prayers are tracked on the dashboard)</span>
          </div>
          <input
            type="date"
            value={historicalEndDate}
            onChange={(e) => updateWizardData({ historicalEndDate: e.target.value })}
            className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-[#134D37] hover:bg-[#0E3D2B] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <span>Continue to Timeline Builder</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

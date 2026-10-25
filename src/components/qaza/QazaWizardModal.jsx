import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, ShieldCheck, ArrowLeft } from "lucide-react";
import Step1MadhhabAndStart from "./Step1MadhhabAndStart";
import Step2TimelineSegments from "./Step2TimelineSegments";
import Step3PeriodPrayerConfig from "./Step3PeriodPrayerConfig";
import Step4ExemptionsAndCircumstances from "./Step4ExemptionsAndCircumstances";
import Step5ReviewAndConfirm from "./Step5ReviewAndConfirm";
import { ROUNDING_POLICIES } from "@/lib/qazaCalculationEngine";

const WIZARD_DRAFT_KEY = "tawfiq_qaza_wizard_active_draft";

export default function QazaWizardModal({
  isOpen,
  onClose,
  onCommit,
  initialData = {},
}) {
  const [currentStep, setCurrentStep] = useState(1);

  // Default initial wizard state
  const defaultWizardState = {
    madhhab: initialData.madhhab || "hanafi",
    gender: initialData.gender || "male",
    accountabilityType: "approximate_age",
    accountabilityStartDate: "",
    accountabilityAge: initialData.pubertyAge || 14,
    currentAge: initialData.currentAge || 25,
    isConvert: false,
    conversionDate: "",
    historicalEndDate: new Date().toISOString().split("T")[0],
    trackWitr: initialData.trackWitr || false,
    roundingPolicy: ROUNDING_POLICIES.UPWARD,
    subtractMenses: false,
    mensesMode: "aggregate",
    mensesDaysPerMonth: 7,
    mensesTotalDays: 0,
    excludedPeriods: [],
    customTargets: {},
    periods: [
      {
        id: "seg_1",
        label: "Period A",
        startDate: "2020-01-01",
        endDate: new Date().toISOString().split("T")[0],
        patternType: "all_five",
        confidence: "medium",
        prayers: {
          fajr: { mode: "every_day" },
          dhuhr: { mode: "every_day" },
          asr: { mode: "every_day" },
          maghrib: { mode: "every_day" },
          isha: { mode: "every_day" },
          witr: { mode: "every_day" },
        },
      },
    ],
  };

  const [wizardData, setWizardData] = useState(() => {
    try {
      const stored = localStorage.getItem(WIZARD_DRAFT_KEY);
      if (stored) {
        return { ...defaultWizardState, ...JSON.parse(stored) };
      }
    } catch {}
    return defaultWizardState;
  });

  // Persist draft on change so users never lose work if interrupted
  useEffect(() => {
    try {
      localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(wizardData));
    } catch {}
  }, [wizardData]);

  function updateWizardData(updates) {
    setWizardData((prev) => ({ ...prev, ...updates }));
  }

  function handleFinalConfirm(confirmedTargets, calculationResult) {
    if (onCommit) {
      onCommit({
        periods: wizardData.periods,
        excludedPeriods: wizardData.excludedPeriods,
        profileUpdates: {
          madhhab: wizardData.madhhab,
          roundingPolicy: wizardData.roundingPolicy,
          trackWitr: Boolean(wizardData.trackWitr),
          accountabilityStartDate: wizardData.accountabilityStartDate,
          accountabilityStartPrecision: wizardData.accountabilityType,
          historicalEndDate: wizardData.historicalEndDate,
        },
        estimateResult: calculationResult,
        customTargets: confirmedTargets,
      });
    }
    // Clear draft
    try {
      localStorage.removeItem(WIZARD_DRAFT_KEY);
    } catch {}
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Modal Dialog Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Sticky Header with Step Indicator */}
        <div className="px-5 py-4 border-b border-border/80 bg-card/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#134D37] dark:text-emerald-400 uppercase tracking-wider">
                Step {currentStep} of 5
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground font-medium">
                {currentStep === 1
                  ? "Madhhab & Starting Point"
                  : currentStep === 2
                  ? "Timeline Builder"
                  : currentStep === 3
                  ? "Per-Prayer Patterns"
                  : currentStep === 4
                  ? "Exemptions & Exclusions"
                  : "Review & Establish Estimate"}
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-foreground mt-0.5">
              Qaza Estimation Wizard
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close wizard"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-secondary h-1 shrink-0">
          <div
            className="bg-[#134D37] h-1 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Scrollable Step Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 text-left space-y-4">
          {currentStep === 1 && (
            <Step1MadhhabAndStart
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2TimelineSegments
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3PeriodPrayerConfig
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4ExemptionsAndCircumstances
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5ReviewAndConfirm
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              onConfirm={handleFinalConfirm}
              onBack={() => setCurrentStep(4)}
              onGoToStep={(s) => setCurrentStep(s)}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

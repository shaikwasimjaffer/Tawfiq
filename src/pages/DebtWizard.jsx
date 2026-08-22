import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";

// Premium Number Animation Hook
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const currentVal = parseFloat((node.textContent || "").replace(/[^\d.-]/g, "")) || 0;

    const controls = animate(currentVal, value, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(val) {
        if (node) {
          const formatted = val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          node.textContent = prefix + formatted + suffix;
        }
      },
    });

    return () => controls.stop();
  }, [value, prefix, suffix]);

  return <span ref={nodeRef}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

// Helper: Calculation Constants
const DEBT_TYPES = [
  { id: "credit-card", label: "Credit Card", icon: "CreditCard" },
  { id: "personal-loan", label: "Personal Loan", icon: "Banknote" },
  { id: "student-loan", label: "Student Loan", icon: "GraduationCap" },
  { id: "auto-loan", label: "Auto Loan", icon: "Truck" },
  { id: "mortgage", label: "Mortgage", icon: "Home" },
  { id: "other", label: "Other Debt", icon: "PlusCircle" }
];

const PAYMENT_STRATEGIES = {
  minimum: 0.7,    // Pay minimums only
  balanced: 1.0,   // Balanced approach
  aggressive: 1.3  // Aggressive payoff
};

export default function DebtWizard() {
  // App State
  const [hasCalculated, setHasCalculated] = useState(false);
  const [totalDebt, setTotalDebt] = useState(0);
  const [estimatedPayoffDate, setEstimatedPayoffDate] = useState("");

  // Modal & Wizard State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  // Global Settings
  const [currency, setCurrency] = useState("USD");
  const [debts, setDebts] = useState([]);

  // Payment Strategy
  const [paymentStrategy, setPaymentStrategy] = useState("balanced");
  const [showStrategyInfo, setShowStrategyInfo] = useState(false);

  // Estimation State
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(0);
  const [includeInterest, setIncludeInterest] = useState(true);

  // Validation
  const [validationErrors, setValidationErrors] = useState({});

  // --- Core Validation & Dependency Logic ---

  useEffect(() => {
    // Validate debts when they change
    const errors = {};
    let isValid = true;

    debts.forEach((debt, index) => {
      if (!debt.name || debt.name.trim() === "") {
        errors[`debtName${index}`] = "Debt name is required";
        isValid = false;
      }
      if (debt.amount <= 0) {
        errors[`debtAmount${index}`] = "Amount must be greater than 0";
        isValid = false;
      }
      if (debt.interestRate < 0) {
        errors[`debtInterest${index}`] = "Interest rate cannot be negative";
        isValid = false;
      }
      if (debt.minimumPayment <= 0) {
        errors[`debtMinimum${index}`] = "Minimum payment must be greater than 0";
        isValid = false;
      }
    });

    setValidationErrors(errors);
  }, [debts]);

  // --- Helpers for Debt Management ---
  const handleAddDebt = () => {
    setDebts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        amount: 0,
        interestRate: 0,
        minimumPayment: 0,
        type: "credit-card"
      }
    ]);
  };

  const handleDeleteDebt = (indexToRemove) => {
    if (debts.length <= 1) return;
    setDebts((prev) => {
      const newDebts = [...prev];
      newDebts.splice(indexToRemove, 1);
      return newDebts;
    });
  };

  const updateDebtField = (debtIndex, field, value) => {
    setDebts((prev) => {
      const newDebts = [...prev];
      newDebts[debtIndex] = {
        ...newDebts[debtIndex],
        [field]: value === "" ? 0 : parseFloat(value) || 0
      };
      return newDebts;
    });
  };

  const updateDebtName = (debtIndex, name) => {
    setDebts((prev) => {
      const newDebts = [...prev];
      newDebts[debtIndex] = {
        ...newDebts[debtIndex],
        name: name || ""
      };
      return newDebts;
    });
  };

  const updateDebtType = (debtIndex, type) => {
    setDebts((prev) => {
      const newDebts = [...prev];
      newDebts[debtIndex] = {
        ...newDebts[debtIndex],
        type: type
      };
      return newDebts;
    });
  };

  // --- Core Calculation Logic ---
  const calculations = useMemo(() => {
    let totalPrincipal = 0;
    let totalMinimumPayment = 0;
    let weightedAvgInterestRate = 0;
    const debtDetails = [];

    if (debts.length === 0) {
      return {
        totalPrincipal: 0,
        totalMinimumPayment: 0,
        weightedAvgInterestRate: 0,
        debtDetails: [],
        monthsToPayoff: 0,
        totalInterest: 0,
        totalCost: 0
      };
    }

    // Calculate totals
    debts.forEach((debt) => {
      totalPrincipal += debt.amount;
      totalMinimumPayment += debt.minimumPayment;
      weightedAvgInterestRate += debt.amount * debt.interestRate;
    });

    // Calculate weighted average interest rate
    if (totalPrincipal > 0) {
      weightedAvgInterestRate = weightedAvgInterestRate / totalPrincipal;
    }

    // Calculate debt details for breakdown
    debts.forEach((debt) => {
      debtDetails.push({
        id: debt.id,
        name: debt.name,
        amount: debt.amount,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment,
        type: debt.type,
        percentageOfTotal: (debt.amount / totalPrincipal) * 100
      });
    });

    // Payoff calculation with snowball/avalanche method (simplified)
    const monthlyPayment = totalMinimumPayment * PAYMENT_STRATEGIES[paymentStrategy] + extraMonthlyPayment;
    const monthlyInterestRate = (includeInterest && weightedAvgInterestRate > 0)
      ? (weightedAvgInterestRate / 100) / 12
      : 0;

    let monthsToPayoff = 0;
    let remainingBalance = totalPrincipal;
    let totalInterestPaid = 0;

    // Simplified amortization calculation
    if (monthlyPayment > 0 && monthlyInterestRate >= 0) {
      if (monthlyInterestRate === 0) {
        // No interest
        monthsToPayoff = Math.ceil(totalPrincipal / monthlyPayment);
      } else {
        // With interest - using loan formula
        monthsToPayoff = Math.ceil(
          -Math.log(1 - (totalPrincipal * monthlyInterestRate) / monthlyPayment) /
          Math.log(1 + monthlyInterestRate)
        );

        // Calculate total interest paid
        totalInterestPaid = (monthlyPayment * monthsToPayoff) - totalPrincipal;
      }
    }

    // Ensure minimum of 1 month if there's debt
    if (totalPrincipal > 0 && monthsToPayoff === 0) {
      monthsToPayoff = 1;
    }

    const totalCost = totalPrincipal + totalInterestPaid;

    // Calculate estimated payoff date
    let payoffDateString = "—";
    if (monthsToPayoff > 0 && monthsToPayoff < 1000) { // Reasonable limit
      const date = new Date();
      date.setMonth(date.getMonth() + monthsToPayoff);
      const options = { year: 'numeric', month: 'long' };
      payoffDateString = date.toLocaleDateString(undefined, options);
    }

    return {
      totalPrincipal,
      totalMinimumPayment,
      weightedAvgInterestRate,
      debtDetails,
      monthsToPayoff,
      totalInterestPaid: Math.max(0, totalInterestPaid),
      totalCost: Math.max(0, totalCost),
      monthlyPaymentRequired: monthlyPayment,
      payoffDateString
    };
  }, [
    debts,
    paymentStrategy,
    extraMonthlyPayment,
    includeInterest
  ]);

  const handleCalculateDebt = () => {
    setHasCalculated(true);
    setTotalDebt(calculations.totalPrincipal);
    setEstimatedPayoffDate(calculations.payoffDateString);
    setIsModalOpen(false);
    setModalStep(1);

    // Scroll to results
    const element = document.getElementById("debt-tracker");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="debt-wizard"
      className="relative bg-[#F0F9FF] py-24 md:py-32 overflow-hidden selection:bg-[#0EA5E9] selection:text-white"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #60A5FA;
            border-radius: 999px;
            border: 2px solid #F0F9FF;
            background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #3B82F6; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #60A5FA transparent; }
        `,
        }}
      />

      {/* 1. Header */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 pb-12 md:pb-16 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="font-['Newsreader',serif] font-light text-[clamp(2.5rem,5vw,5rem)] leading-[1.1] tracking-[-0.02em] text-blue-950 mb-6"
          >
            Your debt doesn't have to define you{" "}
            <span className="italic font-normal text-[#0EA5E9]">
              forever.
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-center space-y-4"
          >
            <p className="font-['Manrope'] text-[clamp(1.1rem,1.5vw,1.25rem)] md:text-[clamp(1.25rem,2vw,1.5rem)] text-blue-600 leading-[1.7] font-light max-w-xl">
              Gain clarity on your debt and create a customized payoff plan.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-950 text-white font-['Manrope'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] py-3.5 px-6 md:px-8 rounded-full hover:bg-[#0EA5E9] transition-colors duration-300 shadow-sm font-[clamp(0.875rem,1.5vw,1rem)]"
            >
              {hasCalculated ? "Update Debt Analysis" : "Analyze Your Debt"}
            </button>
          </motion.div>
        </div>
      </div>

      {/* 2. Tracker Reading */}
      <AnimatePresence initial={false}>
        {hasCalculated && (
          <motion.div
            id="debt-tracker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-2xl mx-auto px-6 md:px-10"
          >
            <div className="text-center space-y-6">
              {/* Eyebrow Label */}
              <p className="text-[11px] font-['Geist',sans-serif] tracking-[0.25em] uppercase text-blue-600 font-semibold">
                Your Debt Overview
              </p>

              {/* Main Number */}
              <div className="flex items-baseline gap-4">
                <AnimatedNumber
                  value={calculations.totalPrincipal}
                  prefix="$"
                  className="font-['Manrope'] font-light text-[clamp(4rem,10vw,6rem)] leading-[0.9] tracking-[-0.02em] text-blue-950"
                />
                <p className="font-['Manrope'] text-2xl md:text-3xl text-blue-700 italic font-light leading-[0.9]">
                  in total debt.
                </p>
              </div>

              {/* Payoff Timeline */}
              {calculations.monthsToPayoff > 0 && calculations.monthsToPayoff < 1000 && (
                <>
                  <p className="font-['Manrope'] text-[clamp(1.25rem,2vw,1.5rem)] text-blue-900 font-light leading-[1.6] max-w-xl mx-auto">
                    With your current plan, you'll be debt-free in{" "}
                    <span className="italic font-normal text-[#0EA5E9]">
                      {calculations.monthsToPayoff} months ({calculations.payoffDateString})
                    </span>
                  </p>
                  {calculations.totalInterestPaid > 0 && (
                    <p className="font-['Manrope'] text-[clamp(1rem,1.5vw,1.125rem)] text-blue-800 font-light leading-[1.6] max-w-xl mx-auto">
                      You'll pay approximately{" "}
                      <span className="italic font-normal text-[#0EA5E9]">
                        ${calculations.totalInterestPaid.toLocaleString()}
                      </span>
                      in interest.
                    </p>
                  )}
                </>
              )}

              {!hasCalculated && (
                <p className="font-['Manrope'] text-[clamp(1rem,1.5vw,1.125rem)] text-blue-500 font-light leading-[1.6] max-w-xl mx-auto">
                  Calculate your debt to see your payoff timeline
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Editorial Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-blue-950/60 backdrop-blur-[4px] z-40"
            />

            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="custom-scrollbar bg-[#F0F9FF] border border-blue-200/80 w-full max-w-[36rem] p-6 md:p-8 shadow-2xl relative pointer-events-auto text-left flex flex-col max-h-[90vh] overflow-y-auto"
                style={{ borderRadius: "0.5rem" }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-blue-400 hover:text-blue-800 transition-colors z-10 h-8 w-8 flex items-center justify-center rounded-hover:bg-blue-100"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <AnimatePresence mode="wait">
                  {/* --- STEP 1 --- */}
                  {modalStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-['Geist',sans-serif] tracking-[0.25em] uppercase text-blue-500 font-semibold">
                          Step 1 of 3
                        </p>
                      </div>

                      <h3 className="font-['Newsreader',serif] font-medium text-[clamp(1.875rem,3vw,2.25rem)] md:text-[clamp(2.25rem,4vw,2.75rem)] text-blue-950 mb-6 tracking-[-0.02em] leading-[1.2]">
                        List Your Debts
                      </h3>
                      <p className="font-['Manrope'] text-[clamp(1rem,1.5vw,1.125rem)] text-blue-600 leading-[1.7] mb-6">
                        Enter all your debts to get an accurate analysis.
                      </p>

                      {Object.keys(validationErrors).length > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800 font-medium">
                            Please fix the following errors:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-red-700 mt-1">
                            {Object.values(validationErrors).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Debt List */}
                        <div className="space-y-4">
                          <label className="block font-['Manrope'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-blue-950 mb-3">
                            Your Debts
                          </label>

                          {debts.length > 0 ? (
                            debts.map((debt, index) => (
                              <div
                                key={debt.id}
                                className="p-4 border border-blue-200 bg-white/50 rounded-lg"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-['Manrope'] text-[clamp(1rem,1.5vw,1.125rem)] font-medium text-blue-900">
                                    {debt.name || `Debt ${index + 1}`}
                                  </h4>
                                  <button
                                    onClick={() => handleDeleteDebt(index)}
                                    className="text-blue-500 hover:text-red-500 transition-colors p-1 rounded"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <line x1="18" y1="6" x2="6" y2="18"></line>
                                      <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[clamp(0.75rem,1.5vw,0.875rem)] text-blue-800 mb-1">
                                        Amount
                                      </label>
                                      <input
                                        type="number"
                                        value={debt.amount}
                                        onChange={(e) => updateDebtField(index, "amount", e.target.value)}
                                        className="w-full bg-white/50 border border-blue-200 p-2 font-['Manrope'] text-blue-900 text-[clamp(0.875rem,1.5vw,1rem)] outline-none focus:border-[#0EA5E9]"
                                        placeholder="e.g. 5000"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[clamp(0.75rem,1.5vw,0.875rem)] text-blue-800 mb-1">
                                        Type
                                      </label>
                                      <select
                                        value={debt.type}
                                        onChange={(e) => updateDebtType(index, e.target.value)}
                                        className="w-full bg-white/50 border border-blue-200 p-2 font-['Manrope'] text-blue-900 text-[clamp(0.875rem,1.5vw,1rem)] outline-none focus:border-[#0EA5E9]"
                                      >
                                        {DEBT_TYPES.map((type) => (
                                          <option key={type.id} value={type.id}>
                                            {type.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[clamp(0.75rem,1.5vw,0.875rem)] text-blue-800 mb-1">
                                        Interest Rate (%)
                                      </label>
                                      <input
                                        type="number"
                                        value={debt.interestRate}
                                        onChange={(e) => updateDebtField(index, "interestRate", e.target.value)}
                                        className="w-full bg-white/50 border border-blue-200 p-2 font-['Manrope'] text-blue-900 text-[clamp(0.875rem,1.5vw,1rem)] outline-none focus:border-[#0EA5E9]"
                                        placeholder="e.g. 18.9"
                                        step="0.1"
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[clamp(0.75rem,1.5vw,0.875rem)] text-blue-800 mb-1">
                                        Minimum Payment
                                      </label>
                                      <input
                                        type="number"
                                        value={debt.minimumPayment}
                                        onChange={(e) => updateDebtField(index, "minimumPayment", e.target.value)}
                                        className="w-full bg-white/50 border border-blue-200 p-2 font-['Manrope'] text-blue-900 text-[clamp(0.875rem,1.5vw,1rem)] outline-none focus:border-[#0EA5E9]"
                                        placeholder="e.g. 150"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-blue-500 italic py-6">
                              No debts added yet. Click "Add Debt" below to get started.
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between pt-4 border-t border-blue-200">
                          <button
                            onClick={() => setModalStep(1)}
                            className="text-blue-700 font-['Manrope'] text-[clamp(0.875rem,1.5vw,1rem)] font-medium hover:text-blue-950 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleAddDebt}
                            className="bg-blue-950 text-white font-['Manrope'] text-[clamp(0.875rem,1.5vw,1rem)] font-medium tracking-tight py-3 px-8 rounded-full hover:bg-[#0EA5E9] transition-colors duration-300 shadow-sm"
                          >
                            + Add Debt
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- STEP 2: Payment Strategy --- */}
                  {modalStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-['Geist',sans-serif] tracking-[0.25em] uppercase text-blue-500 font-semibold">
                          Step 2 of 3
                        </p>
                      </div>

                      <h3 className="font-['Newsreader',serif] font-medium text-[clamp(1.875rem,3vw,2.25rem)] md:text-[clamp(2.25rem,4vw,2.75rem)] text-blue-950 mb-6 tracking-[-0.02em] leading-[1.2]">
                        Choose Your Strategy
                      </h3>
                      <p className="font-['Manrope'] text-[clamp(1rem,1.5vw,1.125rem)] text-blue-600 leading-[1.7] mb-6">
                        Select how aggressively you want to pay off your debt.
                      </p>

                      <div className="space-y-6">
                        {/* Strategy Selection */}
                        <div className="space-y-4">
                          <label className="block font-['Manrope'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-blue-950 mb-3">
                            Payment Strategy
                          </label>

                          <div className="space-y-3">
                            {[["minimum", "Minimum Payments"], ["balanced", "Balanced Approach"], ["aggressive", "Aggressive Payoff"]].map(([strategy, label]) => (
                              <label
                                key={strategy}
                                className={`block cursor-pointer p-4 border rounded-lg transition-colors ${
                                  paymentStrategy === strategy
                                    ? "border-blue-950 bg-blue-950/5"
                                    : "border-blue-200 bg-white/50 hover:border-[#0EA5E9]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  className="hidden"
                                  name="paymentStrategy"
                                  checked={paymentStrategy === strategy}
                                  onChange={() => setPaymentStrategy(strategy)}
                                />
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-['Manrope'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-blue-900">
                                    {label}
                                  </div>
                                  {strategy === "minimum" && (
                                    <span className="text-xs text-blue-600">Pay only minimums</span>
                                  )}
                                  {strategy === "balanced" && (
                                    <span className="text-xs text-blue-600">Minimums + extra</span>
                                  )}
                                  {strategy === "aggressive" && (
                                    <span className="text-xs text-blue-600">Maximize payments</span>
                                  )}
                                </div>
                                <p className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-blue-600">
                                  {strategy === "minimum"
                                    ? "Make only the minimum required payments on each debt."
                                    : strategy === "balanced"
                                    ? "Pay minimums plus allocate extra funds strategically."
                                    : "Put as much as possible toward debt payoff each month."}
                                </p>
                              </label>
                            ))}
                          </div>
                        </div>

                        {showStrategyInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white/50 border border-blue-200 mt-4">
                              <p className="font-['Manrope'] text-[clamp(0.875rem,1.5vw,1rem)] text-blue-800">
                                Different strategies work for different situations:
                              </p>
                              <ul className="list-disc pl-5 text-[clamp(0.75rem,1.5vw,0.875rem)] text-blue-700 mt-2 space-y-1">
                                <li>Minimum payments are best when cash flow is tight</li>
                                <li>Balanced approach works for most people seeking steady progress</li>
                                <li>Aggressive payoff saves the most interest but requires discipline</li>
                              </ul>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-blue-200">
                          <button
                            onClick={() =>
                              setShowStrategyInfo(!showStrategyInfo)
                            }
                            className="text-[clamp(0.75rem,1.5vw,0.875rem)] uppercase tracking-widest font-['Manrope'] text-[#0EA5E9] hover:text-blue-950 underline underline-offset-2 font-semibold cursor-pointer"
                          >
                            Learn More
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6 border-t border-blue-200">
                        <button
                          onClick={() => setModalStep(1)}
                          className="text-blue-700 font-['Manrope'] text-[clamp(0.875rem,1.5vw,1rem)] font-medium hover:text-blue-950 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setModalStep(3)}
                          className="bg-blue-950 text-white font-['Manrope'] text-[clamp(0.875rem,1.5vw,1rem)] font-medium tracking-tight py-3 px-8 rounded-full hover:bg-[#0EA5E9] transition-colors duration-300 shadow-sm"
                        >
                          Next Step
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* --- STEP 3: Final Tweaks --- */}
                  {modalStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-['Geist',sans-serif] tracking-[0.25em] uppercase text-blue-500 font-semibold">
                          Step 3 of 3
                        </p>
                      </div>

                      <h3 className="font-['Newsreader',serif] font-medium text-[clamp(1.875rem,3vw,2.25rem)] md:text-[clamp(2.25rem,4vw,2.75rem)] text-blue-950 mb-6 tracking-[-0.02em] leading-[1.2]">
                        Payment Details & Refinement
                      </h3>
                      <p className="font-['Manrope'] text-[clamp(1rem,1.5vw,1.125rem)] text-blue-600 leading-[1.7] mb-6">
                        Fine-tune your plan with extra payments and interest settings.
                      </p>

                      <div className="space-y-8">
                        <div>
                          <label className="block font-['Manrope'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-blue-950 mb-3">
                            Extra Monthly Payment
                          </label>
                          <p className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-blue-600 mb-3">
                            Additional amount you can put toward debt each month beyond minimums.
                          </p>
                          <input
                            type="number"
                            value={extraMonthlyPayment}
                            onChange={(e) => setExtraMonthlyPayment(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white/50 border border-blue-200 p-3 font-['Manrope'] text-blue-900 text-[clamp(0.875rem,1.5vw,1rem)] outline-none focus:border-[#0EA5E9]"
                            placeholder="e.g. 200"
                          />
                        </div>

                        <div>
                          <label className="block font-['Manrope'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-blue-950 mb-3">
                            Interest Calculation
                          </label>
                          <p className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-blue-600 mb-3">
                            Whether to include interest in your payoff timeline calculation.
                          </p>
                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={includeInterest}
                                onChange={(e) => setIncludeInterest(e.target.checked)}
                                className="hidden"
                              />
                              <div
                                className={`w-4 h-4 flex items-center justify-center border transition-colors duration-200 ${
                                  includeInterest
                                    ? "border-blue-950 bg-blue-950"
                                    : "border-blue-200 bg-white/50 group-hover:border-[#0EA5E9]"
                                }`}
                              >
                                {includeInterest && (
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                              <span className="font-['Manrope'] text-[clamp(0.875rem,1.5vw,1rem)] text-blue-950">
                                Include interest in calculations
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-blue-200">
                          <button
                            onClick={() =>
                              setModalStep(
                                debts.length > 0 ? 2 : 1,
                              )
                            }
                            className="text-blue-700 font-['Manrope'] text-[clamp(0.875rem,1.5vw,1rem)] font-medium hover:text-blue-950 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleCalculateDebt}
                            className="bg-[#0EA5E9] text-white font-['Manrope'] text-[clamp(0.875rem,1.5vw,1rem)] font-medium tracking-tight py-3 px-8 rounded-full hover:bg-blue-600 transition-colors duration-300 shadow-sm"
                          >
                            Calculate Debt Plan
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
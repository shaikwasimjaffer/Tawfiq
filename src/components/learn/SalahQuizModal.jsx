import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Award,
  Sparkles,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import { SALAH_QUIZ_QUESTIONS } from "../../data/salahQuizData";

export default function SalahQuizModal({ isOpen, onClose, onQuizComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!isOpen) return null;

  const currentQuestion = SALAH_QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = SALAH_QUIZ_QUESTIONS.length;
  const userSelectedOption = selectedAnswers[currentIndex];
  const isAnswered = userSelectedOption !== undefined;

  // Calculate score
  const calculateScore = () => {
    let score = 0;
    SALAH_QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleSelectOption = (optIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIdx,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      // Submit
      handleSubmitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    if (onQuizComplete) {
      onQuizComplete(score, totalQuestions);
    }
    // Celebrate if passed (>= 7/10)
    if (score >= 7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setShowExplanation(false);
  };

  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-foreground leading-tight">
                Salah Knowledge Quiz
              </h2>
              <p className="text-xs text-muted-foreground">
                {isSubmitted
                  ? "Quiz Results & Review"
                  : `Question ${currentIndex + 1} of ${totalQuestions}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar (During Quiz) */}
        {!isSubmitted && (
          <div className="w-full bg-secondary h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isSubmitted ? (
            /* --- IN-PROGRESS QUESTION VIEW --- */
            <div className="space-y-6">
              {/* Question Text */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Question {currentIndex + 1}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-3 leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* 4 Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = userSelectedOption === optIdx;
                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                          : "border-border bg-secondary/40 hover:bg-secondary hover:border-primary/30"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-card text-muted-foreground border border-border"
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </span>
                      <span
                        className={`text-sm font-medium leading-relaxed ${
                          isSelected
                            ? "text-foreground font-semibold"
                            : "text-foreground/90"
                        }`}
                      >
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Instant explanation helper if answered */}
              {isAnswered && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline"
                  >
                    <HelpCircle size={14} />
                    {showExplanation
                      ? "Hide explanation"
                      : "View explanation for this question"}
                  </button>

                  {showExplanation && (
                    <div className="mt-2 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-foreground/90 leading-relaxed animate-in fade-in">
                      <p className="font-bold text-primary mb-1">
                        Explanation:
                      </p>
                      {currentQuestion.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* --- QUIZ RESULTS & DETAILED REVIEW VIEW --- */
            <div className="space-y-6">
              {/* Score Summary Card */}
              <div className="text-center p-6 bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center mb-3">
                  {score >= 7 ? <Award size={32} /> : <BookOpen size={32} />}
                </div>

                <div className="inline-block text-3xl font-black text-foreground">
                  {score} / {totalQuestions}
                </div>
                <div className="text-sm font-bold text-primary mt-1">
                  {percentage}% Accuracy
                </div>

                <p className="text-sm font-medium text-muted-foreground mt-2">
                  {score === 10
                    ? "Māshā'Allāh! Perfect score! You have mastered the essentials of Salah."
                    : score >= 7
                    ? "Alḥamdulillāh! Great job! You have a strong grasp of Salah fundamentals."
                    : "Good effort! Take time to review the questions and retake the quiz to solidify your understanding."}
                </p>
              </div>

              {/* Question-by-Question Review List */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  Detailed Answer Review
                </h4>

                <div className="space-y-3">
                  {SALAH_QUIZ_QUESTIONS.map((q, idx) => {
                    const userPick = selectedAnswers[idx];
                    const isCorrect = userPick === q.correctAnswer;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-sm space-y-2 ${
                          isCorrect
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                            : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0"
                            />
                          ) : (
                            <XCircle
                              size={18}
                              className="text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-bold text-foreground">
                              {idx + 1}. {q.question}
                            </span>
                          </div>
                        </div>

                        <div className="pl-6 text-xs space-y-1">
                          <p>
                            <span className="text-muted-foreground">
                              Your answer:{" "}
                            </span>
                            <span
                              className={`font-semibold ${
                                isCorrect
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-rose-700 dark:text-rose-300"
                              }`}
                            >
                              {userPick !== undefined
                                ? q.options[userPick]
                                : "Not answered"}
                            </span>
                          </p>

                          {!isCorrect && (
                            <p>
                              <span className="text-muted-foreground">
                                Correct answer:{" "}
                              </span>
                              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                {q.options[q.correctAnswer]}
                              </span>
                            </p>
                          )}

                          <p className="text-muted-foreground/90 italic pt-1 border-t border-border/50">
                            💡 {q.explanation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-3">
          {!isSubmitted ? (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft size={16} /> Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className="ml-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all active:scale-95"
              >
                {currentIndex === totalQuestions - 1 ? "Submit Quiz" : "Next"}
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary flex items-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw size={15} /> Retake Quiz
              </button>

              <button
                onClick={onClose}
                className="ml-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

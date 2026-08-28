import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  MoonStar,
  Send,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// Green Atmosphere
// ─────────────────────────────────────────────────────────────

const getAtmosphere = (hour) => {
  if (hour >= 4 && hour < 7) {
    return {
      bg: "bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#ffffff]",
      text: "text-emerald-950",
      muted: "text-emerald-700/60",
      accent: "text-emerald-600",
      button:
        "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.2)]",
      inputBg: "bg-emerald-900/[0.02]",
      focusRing:
        "focus:ring-emerald-500/20 focus:border-emerald-500/50",
      borderColor: "border-emerald-900/10",
      isDark: false,
    };
  }

  if (hour >= 7 && hour < 18) {
    return {
      bg: "bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#ecfdf5]",
      text: "text-emerald-950",
      muted: "text-emerald-700/60",
      accent: "text-emerald-600",
      button:
        "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.2)]",
      inputBg: "bg-emerald-900/[0.02]",
      focusRing:
        "focus:ring-emerald-500/20 focus:border-emerald-500/50",
      borderColor: "border-emerald-900/10",
      isDark: false,
    };
  }

  if (hour >= 18 && hour < 20) {
    return {
      bg: "bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]",
      text: "text-emerald-50",
      muted: "text-emerald-200/60",
      accent: "text-emerald-400",
      button:
        "bg-emerald-500 hover:bg-emerald-400 shadow-[0_8px_20px_rgba(16,185,129,0.2)]",
      inputBg: "bg-white/[0.04]",
      focusRing:
        "focus:ring-emerald-400/20 focus:border-emerald-400/50",
      borderColor: "border-emerald-100/10",
      isDark: true,
    };
  }

  return {
    bg: "bg-gradient-to-br from-[#022c22] via-[#014737] to-[#020617]",
    text: "text-emerald-50",
    muted: "text-emerald-200/50",
    accent: "text-emerald-400",
    button:
      "bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_20px_rgba(5,150,105,0.3)]",
    inputBg: "bg-white/[0.03]",
    focusRing:
      "focus:ring-emerald-500/20 focus:border-emerald-500/50",
    borderColor: "border-emerald-100/10",
    isDark: true,
  };
};

// ─────────────────────────────────────────────────────────────
// Haptics
// ─────────────────────────────────────────────────────────────

const triggerHaptic = (type = "light") => {
  if (typeof navigator === "undefined" || !navigator.vibrate) {
    return;
  }

  if (type === "light") navigator.vibrate(10);
  if (type === "medium") navigator.vibrate(25);
  if (type === "success") navigator.vibrate([20, 40, 20]);
  if (type === "error") navigator.vibrate([30, 50, 30, 50, 30]);
};

// ─────────────────────────────────────────────────────────────
// Living Moon
// ─────────────────────────────────────────────────────────────

const LivingMoon = ({ isDark }) => {
  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <div
        className={`absolute inset-0 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] ${
          isDark ? "bg-emerald-400/20" : "bg-emerald-500/20"
        }`}
      />

      <MoonStar
        size={30}
        strokeWidth={1.5}
        className={
          isDark
            ? "text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            : "text-emerald-600 drop-shadow-[0_0_12px_rgba(5,150,105,0.3)]"
        }
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const hour = now.getHours();

  const atmosphere = useMemo(
    () => getAtmosphere(hour),
    [hour]
  );

  const ambientTime = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  // ───────────────────────────────────────────────────────────
  // Clock
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ───────────────────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────────────────

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  // ───────────────────────────────────────────────────────────
  // Send Password Reset Email
  // ───────────────────────────────────────────────────────────

  const handleReset = async () => {
    triggerHaptic("medium");

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");

      triggerHaptic("error");

      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);

      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        );

      if (error) {
        throw error;
      }

      triggerHaptic("success");

      setEmailSent(true);
    } catch (err) {
      console.error(
        "PASSWORD RESET ERROR:",
        err
      );

      triggerHaptic("error");

      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);

      setError(
        err?.message ||
          "Unable to send the reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Resend
  // ───────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (loading) return;

    triggerHaptic("light");

    setLoading(true);
    setError("");

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        );

      if (error) {
        throw error;
      }

      triggerHaptic("success");
    } catch (err) {
      console.error(
        "RESEND RESET EMAIL ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to resend the email. Please try again."
      );

      triggerHaptic("error");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-center px-8 sm:px-12 transition-colors duration-[1500ms] ease-in-out ${atmosphere.bg}`}
    >
      <style>{`
        @keyframes subtle-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }

        .animate-shake {
          animation: subtle-shake 400ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        input {
          caret-color: #10b981;
        }
      `}</style>

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient light */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[140px] rounded-full animate-[spin_30s_linear_infinite] z-0 pointer-events-none" />

      {/* Time */}
      <div className="absolute top-10 right-10 flex items-center gap-2 z-10">
        <Clock
          size={12}
          className={`${atmosphere.muted} opacity-50`}
        />

        <span
          className={`text-[11px] font-semibold tracking-widest ${atmosphere.muted} tabular-nums`}
        >
          {ambientTime}
        </span>
      </div>

      {/* Main */}
      <div className="w-full max-w-[360px] mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-[42px]">
          <LivingMoon
            isDark={atmosphere.isDark}
          />

          <p
            className={`text-[11px] uppercase tracking-[0.3em] font-bold mt-5 ${atmosphere.accent}`}
          >
            Tawfiq
          </p>

          <h1
            className={`text-2xl font-bold tracking-tight mt-3 ${atmosphere.text}`}
          >
            {emailSent
              ? "Check your email."
              : "Forgot your password?"}
          </h1>

          <p
            className={`text-[13px] font-medium leading-relaxed mt-3 max-w-[300px] ${atmosphere.muted}`}
          >
            {emailSent
              ? "We've sent you a secure link to create a new password."
              : "Enter your email and we'll send you a secure password reset link."}
          </p>
        </div>

        {/* Card */}
        <div
          className={`rounded-[28px] border ${atmosphere.borderColor} ${
            atmosphere.isDark
              ? "bg-white/[0.04]"
              : "bg-white/70"
          } backdrop-blur-xl shadow-[0_20px_60px_rgba(16,185,129,0.12)] p-7 sm:p-8 ${
            shake ? "animate-shake" : ""
          }`}
        >
          {!emailSent ? (
            <>
              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  onFocus={() =>
                    triggerHaptic("light")
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleReset();
                    }
                  }}
                  autoComplete="email"
                  placeholder="Email Address"
                  className={`w-full h-[56px] px-4 rounded-2xl border border-transparent ${atmosphere.inputBg} ${atmosphere.focusRing} outline-none transition-all duration-[180ms] text-[15px] font-medium ${atmosphere.text}`}
                />

                <Mail
                  size={17}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${atmosphere.muted}`}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500 mt-2">
                  {error}
                </p>
              )}

              {/* Send */}
              <button
                onClick={handleReset}
                disabled={
                  loading ||
                  !email.trim()
                }
                className={`w-full mt-5 h-[56px] rounded-2xl text-[14px] font-semibold tracking-wide text-white transition-all duration-[180ms] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${atmosphere.button}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Reset Link
                  </>
                )}
              </button>

              {/* Security */}
              <div
                className={`mt-5 rounded-2xl px-4 py-3 ${
                  atmosphere.isDark
                    ? "bg-emerald-400/5"
                    : "bg-emerald-50"
                }`}
              >
                <p
                  className={`text-[11px] leading-relaxed text-center ${atmosphere.muted}`}
                >
                  🔒 Your reset link is secure and
                  expires after a limited time.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success */}
              <div className="flex flex-col items-center text-center">

                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />

                  <div
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
                      atmosphere.isDark
                        ? "bg-emerald-400/10"
                        : "bg-emerald-100"
                    }`}
                  >
                    <CheckCircle2
                      size={40}
                      className={atmosphere.accent}
                    />
                  </div>
                </div>

                <h2
                  className={`text-xl font-bold ${atmosphere.text}`}
                >
                  Reset link sent
                </h2>

                <p
                  className={`text-[13px] leading-relaxed mt-3 ${atmosphere.muted}`}
                >
                  We sent a password reset link to
                </p>

                <p
                  className={`text-[13px] font-semibold mt-1 break-all ${atmosphere.accent}`}
                >
                  {email}
                </p>

                <p
                  className={`text-[12px] leading-relaxed mt-5 ${atmosphere.muted}`}
                >
                  Open the email and tap the reset
                  link. You'll return to Tawfiq and
                  create your new password.
                </p>

                {error && (
                  <p className="text-sm text-red-500 mt-4">
                    {error}
                  </p>
                )}

                {/* Resend */}
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className={`mt-6 text-[12px] font-semibold ${atmosphere.accent} disabled:opacity-40 transition-opacity`}
                >
                  {loading
                    ? "Sending..."
                    : "Didn't receive it? Resend email"}
                </button>

                {/* Back login */}
                <button
                  onClick={() =>
                    navigate("/login")
                  }
                  className={`mt-6 w-full h-[52px] rounded-2xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${atmosphere.button} text-white`}
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          {!emailSent && (
            <div className="mt-7 text-center">
              <Link
                to="/login"
                onClick={() =>
                  triggerHaptic("light")
                }
                className={`text-[12px] font-medium ${atmosphere.muted} inline-flex items-center gap-2`}
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
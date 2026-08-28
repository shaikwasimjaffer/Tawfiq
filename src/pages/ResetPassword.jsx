import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  LockKeyhole,
  MoonStar,
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
      "focus:ring-emerald-500/20 focus:border-emerald-400/50",
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
// Password Requirement
// ─────────────────────────────────────────────────────────────

const PasswordRequirement = ({
  met,
  children,
  isDark,
}) => {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          met
            ? "bg-emerald-500 text-white scale-100"
            : isDark
              ? "border border-emerald-100/20 text-emerald-100/30"
              : "border border-emerald-900/15 text-emerald-700/30"
        }`}
      >
        {met && <Check size={10} strokeWidth={3} />}
      </div>

      <span
        className={`text-[11px] font-medium transition-colors duration-300 ${
          met
            ? isDark
              ? "text-emerald-300"
              : "text-emerald-600"
            : isDark
              ? "text-emerald-100/50"
              : "text-emerald-700/50"
        }`}
      >
        {children}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────────────────────

export default function ResetPassword() {
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);

  const [success, setSuccess] = useState(false);
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
  // Check Recovery Session
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        if (!data?.session) {
          setError(
            "This password reset link is invalid or has expired."
          );
        }
      } catch (err) {
        console.error(
          "RECOVERY SESSION ERROR:",
          err
        );

        if (mounted) {
          setError(
            "This password reset link is invalid or has expired."
          );
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    // Supabase can emit PASSWORD_RECOVERY when the
    // recovery link creates the recovery session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (!mounted) return;

        if (event === "PASSWORD_RECOVERY") {
          setError("");
          setCheckingSession(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // Password Requirements
  // ───────────────────────────────────────────────────────────

  const passwordRequirements = useMemo(
    () => ({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const isPasswordValid =
    passwordRequirements.length &&
    passwordRequirements.number &&
    passwordRequirements.special &&
    passwordsMatch;

  // ───────────────────────────────────────────────────────────
  // Update Password
  // ───────────────────────────────────────────────────────────

  const handleUpdatePassword = async () => {
    triggerHaptic("medium");

    setError("");

    if (!passwordRequirements.length) {
      setError(
        "Password must be at least 8 characters."
      );
      triggerHaptic("error");
      return;
    }

    if (!passwordRequirements.number) {
      setError(
        "Password must contain at least 1 number."
      );
      triggerHaptic("error");
      return;
    }

    if (!passwordRequirements.special) {
      setError(
        "Password must contain at least 1 special character."
      );
      triggerHaptic("error");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      triggerHaptic("success");

      setSuccess(true);

      // End the recovery session after changing
      // the password.
      await supabase.auth.signOut();
    } catch (err) {
      console.error(
        "UPDATE PASSWORD ERROR:",
        err
      );

      triggerHaptic("error");

      setError(
        err?.message ||
          "Unable to update your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Loading / Session Check
  // ───────────────────────────────────────────────────────────

  if (checkingSession) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${atmosphere.bg}`}
      >
        <div className="flex flex-col items-center gap-5">
          <LivingMoon
            isDark={atmosphere.isDark}
          />

          <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />

          <p
            className={`text-[11px] uppercase tracking-[0.25em] font-semibold ${atmosphere.muted}`}
          >
            Verifying secure link
          </p>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Success Screen
  // ───────────────────────────────────────────────────────────

  if (success) {
    return (
      <div
        className={`relative min-h-screen flex flex-col justify-center px-8 sm:px-12 ${atmosphere.bg}`}
      >
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="absolute top-10 right-10 flex items-center gap-2">
          <Clock
            size={12}
            className={`${atmosphere.muted} opacity-50`}
          />

          <span
            className={`text-[11px] font-semibold tracking-widest ${atmosphere.muted}`}
          >
            {ambientTime}
          </span>
        </div>

        <div className="w-full max-w-[360px] mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <LivingMoon
              isDark={atmosphere.isDark}
            />

            <div className="relative mt-8 mb-7">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl animate-pulse" />

              <div
                className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                  atmosphere.isDark
                    ? "bg-emerald-400/10"
                    : "bg-emerald-100"
                }`}
              >
                <CheckCircle2
                  size={48}
                  className={atmosphere.accent}
                />
              </div>
            </div>

            <h1
              className={`text-2xl font-bold ${atmosphere.text}`}
            >
              Password updated.
            </h1>

            <p
              className={`text-[13px] leading-relaxed mt-3 max-w-[300px] ${atmosphere.muted}`}
            >
              Your Tawfiq password has been
              successfully changed.
            </p>

            <button
              onClick={() => navigate("/login")}
              className={`w-full max-w-[320px] mt-8 h-[56px] rounded-2xl text-[14px] font-semibold text-white transition-all active:scale-[0.98] ${atmosphere.button}`}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Invalid / Expired Link
  // ───────────────────────────────────────────────────────────

  if (error && !loading && !password && !confirmPassword) {
    return (
      <div
        className={`relative min-h-screen flex flex-col justify-center px-8 sm:px-12 ${atmosphere.bg}`}
      >
        <div className="w-full max-w-[360px] mx-auto text-center">
          <LivingMoon
            isDark={atmosphere.isDark}
          />

          <h1
            className={`text-2xl font-bold mt-8 ${atmosphere.text}`}
          >
            Reset link unavailable
          </h1>

          <p
            className={`text-[13px] leading-relaxed mt-3 ${atmosphere.muted}`}
          >
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/forgot-password")
            }
            className={`w-full mt-8 h-[56px] rounded-2xl text-[14px] font-semibold text-white ${atmosphere.button}`}
          >
            Request a New Link
          </button>

          <button
            onClick={() => navigate("/login")}
            className={`mt-5 text-[12px] font-medium ${atmosphere.accent}`}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Main Reset UI
  // ───────────────────────────────────────────────────────────

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-center px-8 sm:px-12 ${atmosphere.bg}`}
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

      {/* Ambient Light */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[140px] rounded-full animate-[spin_30s_linear_infinite] pointer-events-none" />

      {/* Time */}
      <div className="absolute top-10 right-10 flex items-center gap-2">
        <Clock
          size={12}
          className={`${atmosphere.muted} opacity-50`}
        />

        <span
          className={`text-[11px] font-semibold tracking-widest ${atmosphere.muted}`}
        >
          {ambientTime}
        </span>
      </div>

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
            Create a new password.
          </h1>

          <p
            className={`text-[13px] font-medium leading-relaxed mt-3 max-w-[300px] ${atmosphere.muted}`}
          >
            Choose a strong password to keep your
            Tawfiq account secure.
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
          {/* Password */}
          <div className="relative">
            <LockKeyhole
              size={17}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${atmosphere.muted}`}
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                if (error) {
                  setError("");
                }
              }}
              autoComplete="new-password"
              placeholder="New Password"
              className={`w-full h-[56px] pl-11 pr-12 rounded-2xl border border-transparent ${atmosphere.inputBg} ${atmosphere.focusRing} outline-none transition-all duration-[180ms] text-[15px] font-medium tracking-wider ${atmosphere.text}`}
            />

            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");

                setShowPassword(
                  (value) => !value
                );
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 ${atmosphere.muted}`}
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative mt-4">
            <LockKeyhole
              size={17}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${atmosphere.muted}`}
            />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(
                  e.target.value
                );

                if (error) {
                  setError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdatePassword();
                }
              }}
              autoComplete="new-password"
              placeholder="Confirm Password"
              className={`w-full h-[56px] pl-11 pr-12 rounded-2xl border border-transparent ${atmosphere.inputBg} ${atmosphere.focusRing} outline-none transition-all duration-[180ms] text-[15px] font-medium tracking-wider ${atmosphere.text}`}
            />

            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");

                setShowConfirmPassword(
                  (value) => !value
                );
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 ${atmosphere.muted}`}
            >
              {showConfirmPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="mt-5 px-1">
            <p
              className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${atmosphere.muted}`}
            >
              Password requirements
            </p>

            <div className="space-y-2">
              <PasswordRequirement
                met={passwordRequirements.length}
                isDark={atmosphere.isDark}
              >
                At least 8 characters
              </PasswordRequirement>

              <PasswordRequirement
                met={passwordRequirements.number}
                isDark={atmosphere.isDark}
              >
                At least 1 number
              </PasswordRequirement>

              <PasswordRequirement
                met={passwordRequirements.special}
                isDark={atmosphere.isDark}
              >
                At least 1 special character
              </PasswordRequirement>

              <PasswordRequirement
                met={passwordsMatch}
                isDark={atmosphere.isDark}
              >
                Passwords match
              </PasswordRequirement>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 mt-4 leading-relaxed">
              {error}
            </p>
          )}

          {/* Update Button */}
          <button
            onClick={handleUpdatePassword}
            disabled={
              loading ||
              !isPasswordValid
            }
            className={`w-full mt-6 h-[56px] rounded-2xl text-[14px] font-semibold tracking-wide text-white transition-all duration-[180ms] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${atmosphere.button}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                Updating Password...
              </>
            ) : (
              <>
                <LockKeyhole size={16} />

                Update Password
              </>
            )}
          </button>

          {/* Back */}
          <div className="mt-6 text-center">
            <button
              onClick={() =>
                navigate("/login")
              }
              className={`text-[12px] font-medium ${atmosphere.muted}`}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Check,
  Circle,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// Green Atmosphere
// ─────────────────────────────────────────────────────────────

const getAtmosphere = (hour) => {
  // Softened button shadows for a calmer, less "SaaS" look
  if (hour >= 4 && hour < 7) {
    return {
      bg: "bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#ffffff]",
      text: "text-emerald-950",
      muted: "text-emerald-700/60",
      accent: "text-emerald-600",
      peerFocusAccent: "peer-focus:text-emerald-600",
      accentBg: "bg-emerald-600/10",
      borderColor: "border-emerald-900/10",
      button: "bg-emerald-600 hover:bg-emerald-500 shadow-sm",
      inputBg: "bg-emerald-900/[0.02]",
      focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500/30",
      isDark: false,
    };
  }

  if (hour >= 7 && hour < 18) {
    return {
      bg: "bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#ecfdf5]",
      text: "text-emerald-950",
      muted: "text-emerald-700/60",
      accent: "text-emerald-600",
      peerFocusAccent: "peer-focus:text-emerald-600",
      accentBg: "bg-emerald-600/10",
      borderColor: "border-emerald-900/10",
      button: "bg-emerald-600 hover:bg-emerald-500 shadow-sm",
      inputBg: "bg-emerald-900/[0.02]",
      focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500/30",
      isDark: false,
    };
  }

  if (hour >= 18 && hour < 20) {
    return {
      bg: "bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]",
      text: "text-emerald-50",
      muted: "text-emerald-200/60",
      accent: "text-emerald-400",
      peerFocusAccent: "peer-focus:text-emerald-400",
      accentBg: "bg-emerald-400/10",
      borderColor: "border-emerald-100/10",
      button: "bg-emerald-500 hover:bg-emerald-400 shadow-sm",
      inputBg: "bg-white/[0.04]",
      focusRing: "focus:ring-emerald-400/20 focus:border-emerald-400/30",
      isDark: true,
    };
  }

  return {
    bg: "bg-gradient-to-br from-[#022c22] via-[#014737] to-[#020617]",
    text: "text-emerald-50",
    muted: "text-emerald-200/50",
    accent: "text-emerald-400",
    peerFocusAccent: "peer-focus:text-emerald-400",
    accentBg: "bg-emerald-400/10",
    borderColor: "border-emerald-100/10",
    button: "bg-emerald-600 hover:bg-emerald-500 shadow-sm",
    inputBg: "bg-white/[0.03]",
    focusRing: "focus:ring-emerald-500/20 focus:border-emerald-500/30",
    isDark: true,
  };
};

// ─────────────────────────────────────────────────────────────
// Haptics
// ─────────────────────────────────────────────────────────────

const triggerHaptic = (type = "light") => {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  if (type === "light") navigator.vibrate(10);
  if (type === "medium") navigator.vibrate(25);
  if (type === "success") navigator.vibrate([20, 40, 20]);
  if (type === "error") navigator.vibrate([30, 50, 30, 50, 30]);
};

// ─────────────────────────────────────────────────────────────
// Living Moon
// ─────────────────────────────────────────────────────────────

const LivingMoon = memo(({ isDark, isFriday }) => {
  return (
    <div className="relative flex items-center justify-center w-16 h-16 animate-float">
      <div
        className={`absolute inset-0 rounded-full blur-[20px] opacity-70 animate-[pulse_4s_ease-in-out_infinite] ${
          isDark ? "bg-emerald-400/20" : "bg-emerald-500/20"
        }`}
      />

      <svg
        className={`relative w-9 h-9 transition-transform duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-in fade-in zoom-in rotate-[15deg] ${
          isDark
            ? "text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            : "text-emerald-600 drop-shadow-[0_0_12px_rgba(5,150,105,0.2)]"
        }`}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      {isFriday && (
        <Sparkles
          className={`absolute top-1 right-2 w-3 h-3 animate-[pulse_3s_ease-in-out_infinite] ${
            isDark ? "text-emerald-300" : "text-emerald-500"
          }`}
        />
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// Password Requirement
// ─────────────────────────────────────────────────────────────

const PasswordRequirement = ({ met, children, isDark }) => {
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
        {met ? (
          <Check size={10} strokeWidth={3} />
        ) : (
          <Circle size={5} fill="currentColor" strokeWidth={0} />
        )}
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
// Register
// ─────────────────────────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());

  const hour = now.getHours();
  const isFriday = now.getDay() === 5;

  const atmosphere = useMemo(() => getAtmosphere(hour), [hour]);

  // Layout State
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [shake, setShake] = useState(false);
  const [morphing, setMorphing] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const isPasswordValid =
    passwordRequirements.length &&
    passwordRequirements.number &&
    passwordRequirements.special;

  // ───────────────────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────────────────

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const validatePassword = (value) => {
    return (
      value.length >= 8 && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
    );
  };

  const validateName = (value) => {
    return value.trim().length >= 2;
  };

  const isFormValid = validateName(name) && validateEmail(email) && isPasswordValid;

  // ───────────────────────────────────────────────────────────
  // Create User Settings
  // ───────────────────────────────────────────────────────────

  const createUserSettings = async (userId) => {
    if (!userId) return;

    const { data: existingSettings, error: fetchError } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Could not check user settings:", fetchError);
      return;
    }

    if (existingSettings) return;

    const { error: insertError } = await supabase
      .from("user_settings")
      .insert({
        user_id: userId,
        onboarding_done: false,
        primary_goals: [],
      });

    if (insertError) {
      console.error("Could not create user settings:", insertError);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Email / Password Registration
  // ───────────────────────────────────────────────────────────

  const handleRegister = async () => {
    triggerHaptic("medium");

    let isValid = true;

    if (!validateName(name)) {
      setNameError("Name must be at least 2 characters");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password does not meet all requirements");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) {
      triggerHaptic("error");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Account could not be created.");

      localStorage.setItem("remember_email", email.trim().toLowerCase());

      if (data.session) {
        await createUserSettings(data.user.id);
      }

      triggerHaptic("success");
      setLoading(false);
      setMorphing(true);

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      console.error("Registration error:", err);
      triggerHaptic("error");
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);

      const message = err?.message?.toLowerCase() || "";

      if (
        message.includes("already registered") ||
        message.includes("already been registered")
      ) {
        setEmailError("An account with this email already exists.");
      } else if (message.includes("password")) {
        setPasswordError(err.message);
      } else {
        setEmailError(err?.message || "Registration failed. Please try again.");
      }
    }
  };

  // ───────────────────────────────────────────────────────────
  // GOOGLE SIGN IN
  // ───────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    if (loading || googleLoading || morphing) return;

    triggerHaptic("medium");
    setGoogleLoading(true);
    setEmailError("");
    setPasswordError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Google sign-in error:", err);
      triggerHaptic("error");
      setGoogleLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setEmailError(err?.message || "Unable to continue with Google. Please try again.");
    }
  };

  // ───────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center px-8 sm:px-12 transition-colors duration-[1500ms] ease-in-out ${
        atmosphere.bg
      } ${morphing ? "overflow-hidden" : ""}`}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

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

        input:focus {
          animation: focus-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes focus-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
      `}</style>

      {/* Grain & Ambient Light */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[140px] rounded-full animate-[spin_30s_linear_infinite_reverse] z-0 pointer-events-none" />

      {/* Main Wrapper - Note the pb-[10vh] to visually lift the content slightly upward */}
      <div
        className={`w-full max-w-[320px] pb-[10vh] relative z-10 flex flex-col items-center transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          morphing ? "opacity-0 scale-95 blur-[2px]" : "opacity-100 scale-100"
        }`}
      >
        {/* Zone 1: Context (Time) */}
        <div className="flex items-center gap-1.5 mb-10 opacity-70">
          <Clock size={13} className={atmosphere.muted} />
          <span className={`text-[12px] font-semibold tracking-wider ${atmosphere.muted}`}>
            {ambientTime}
          </span>
        </div>

        {/* Zone 2: Brand + Message */}
        <div className="flex flex-col items-center text-center mb-[40px] animate-in fade-in duration-700">
          <LivingMoon isDark={atmosphere.isDark} isFriday={isFriday} />

          <h2
            className={`text-[20px] font-arabic tracking-wide mt-5 mb-3 ${atmosphere.text}`}
          >
            بِسْمِ اللَّهِ
          </h2>

          <h1
            className={`text-[28px] font-extrabold tracking-tight mb-2 ${atmosphere.text}`}
          >
            Begin your journey.
          </h1>

          <p className={`text-[14px] font-medium tracking-wide ${atmosphere.muted}`}>
            {isFriday ? "A blessed Friday. Begin with intention." : "A new day. Begin with intention."}
          </p>
        </div>

        {/* Zone 3 & 4: Authentication Block */}
        <div className="w-full">
          {!showEmailForm ? (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Primary Action: Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading || morphing}
                className={`w-full h-[56px] rounded-[16px] text-[14px] font-semibold tracking-wide transition-all duration-[180ms] flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                  googleLoading
                    ? "bg-emerald-600 text-white opacity-80"
                    : `text-white ${atmosphere.button} hover:brightness-110`
                }`}
              >
                {googleLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    {/* Official Multi-color Google Icon */}
                    <div className="bg-white p-1 rounded-full">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z" />
                        <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.7Z" />
                        <path fill="#FBBC05" d="M6.54 13.82A5.84 5.84 0 0 1 6.23 12c0-.63.11-1.24.31-1.82V7.67H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.06 1.03 4.33l3.24-2.51Z" />
                        <path fill="#EA4335" d="M12 6.15c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.25 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.37l3.24 2.51C7.31 7.87 9.46 6.15 12 6.15Z" />
                      </svg>
                    </div>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Secondary Action: Email */}
              <div className="flex flex-col items-center mt-6 gap-2">
                <span className={`text-[12px] ${atmosphere.muted}`}>or</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setShowEmailForm(true);
                  }}
                  className={`text-[13px] font-medium transition-all hover:underline underline-offset-4 decoration-opacity-40 ${atmosphere.text}`}
                >
                  Continue with email
                </button>
              </div>

              {/* Zone 4: Trust Indicator */}
              <p className={`mt-8 text-[11px] font-medium opacity-50 ${atmosphere.muted}`}>
                Your information stays private.
              </p>
              
              {/* Login Link below Trust */}
              <Link
                to="/login"
                onClick={() => triggerHaptic("light")}
                className={`mt-6 text-[12px] font-medium ${atmosphere.muted} opacity-80 hover:opacity-100 transition-opacity`}
              >
                Already have an account?{" "}
                <span className={`underline underline-offset-4 decoration-opacity-40 ${atmosphere.accent}`}>
                  Log in
                </span>
              </Link>
            </div>
          ) : (
            /* Email Form View */
            <div className={`w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${shake ? "animate-shake" : ""}`}>
              <button
                onClick={() => setShowEmailForm(false)}
                className={`flex items-center gap-1.5 text-[13px] font-medium mb-6 ${atmosphere.muted} opacity-70 hover:opacity-100 transition-opacity`}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="space-y-[16px] text-left">
                {/* Name */}
                <div className="relative group">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    onFocus={() => triggerHaptic("light")}
                    autoComplete="name"
                    className={`peer w-full h-[56px] px-4 pt-4 rounded-[16px] border border-transparent ${atmosphere.inputBg} ${atmosphere.focusRing} focus:bg-transparent focus:scale-[1.01] focus:shadow-sm outline-none transition-all duration-[180ms] text-[15px] font-medium ${atmosphere.text} placeholder-transparent`}
                    placeholder="Full Name"
                  />
                  <label
                    htmlFor="name"
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium transition-all duration-[180ms] pointer-events-none ${atmosphere.muted} peer-focus:top-3.5 peer-focus:text-[10px] ${atmosphere.peerFocusAccent} ${name ? "top-3.5 text-[10px]" : ""}`}
                  >
                    Full Name
                  </label>
                  {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}
                </div>

                {/* Email */}
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    onFocus={() => triggerHaptic("light")}
                    autoComplete="email"
                    className={`peer w-full h-[56px] px-4 pt-4 rounded-[16px] border border-transparent ${atmosphere.inputBg} ${atmosphere.focusRing} focus:bg-transparent focus:scale-[1.01] focus:shadow-sm outline-none transition-all duration-[180ms] text-[15px] font-medium ${atmosphere.text} placeholder-transparent`}
                    placeholder="Email Address"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium transition-all duration-[180ms] pointer-events-none ${atmosphere.muted} peer-focus:top-3.5 peer-focus:text-[10px] ${atmosphere.peerFocusAccent} ${email ? "top-3.5 text-[10px]" : ""}`}
                  >
                    Email Address
                  </label>
                  {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
                </div>

                {/* Password */}
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    onFocus={() => triggerHaptic("light")}
                    autoComplete="new-password"
                    className={`peer w-full h-[56px] pl-4 pr-12 pt-4 rounded-[16px] border border-transparent ${atmosphere.inputBg} ${atmosphere.focusRing} focus:bg-transparent focus:scale-[1.01] focus:shadow-sm outline-none transition-all duration-[180ms] text-[15px] font-medium tracking-widest ${atmosphere.text} placeholder-transparent`}
                    placeholder="Password"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium tracking-normal transition-all duration-[180ms] pointer-events-none ${atmosphere.muted} peer-focus:top-3.5 peer-focus:text-[10px] ${atmosphere.peerFocusAccent} ${password ? "top-3.5 text-[10px]" : ""}`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setShowPassword((v) => !v);
                    }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${atmosphere.muted} transition-colors p-2 -mr-2`}
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="px-1 pt-0.5">
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2.5 ${atmosphere.muted}`}>
                    Password requirements
                  </p>
                  <div className="space-y-2">
                    <PasswordRequirement met={passwordRequirements.length} isDark={atmosphere.isDark}>
                      At least 8 characters
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.number} isDark={atmosphere.isDark}>
                      At least 1 number
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.special} isDark={atmosphere.isDark}>
                      At least 1 special character
                    </PasswordRequirement>
                  </div>
                </div>
                {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  onClick={handleRegister}
                  disabled={loading || googleLoading || morphing || !isFormValid}
                  className={`w-full h-[56px] rounded-[16px] text-[14px] font-semibold tracking-wide transition-all duration-[180ms] flex items-center justify-center gap-2 active:scale-[0.98] ${
                    loading
                      ? "bg-emerald-600 text-white opacity-80"
                      : isFormValid
                      ? `text-white ${atmosphere.button} hover:brightness-110`
                      : "bg-emerald-600/25 text-emerald-900/40 cursor-not-allowed shadow-none"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tiny Footer */}
      <div className={`absolute bottom-8 flex gap-4 text-[10px] font-medium opacity-40 hover:opacity-70 transition-opacity ${atmosphere.muted}`}>
        <a href="#" className="hover:underline">Privacy</a>
        <span>·</span>
        <a href="#" className="hover:underline">Terms</a>
      </div>

      {/* Auth Morphing Transition */}
      {morphing && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center ${atmosphere.bg} animate-in fade-in duration-700`}>
          <div className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-[spin_10s_linear_infinite] pointer-events-none" />
          <div className="relative flex flex-col items-center gap-8 animate-in slide-in-from-bottom-4 fade-in duration-1000">
            <div className="relative flex items-center justify-center w-28 h-28">
              <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500/60 animate-[spin_3s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
              <div className="absolute inset-4 rounded-full border border-emerald-500/15" />
              <div className="absolute inset-4 rounded-full border-l-2 border-emerald-400/60 animate-[spin_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite_reverse]" />
              <LivingMoon isDark={atmosphere.isDark} isFriday={isFriday} />
            </div>
            <div className="flex flex-col items-center gap-2.5">
              <h2 className={`text-2xl font-arabic tracking-widest ${atmosphere.text}`}>بِسْمِ اللَّهِ</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${atmosphere.muted}`}>Creating your account</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
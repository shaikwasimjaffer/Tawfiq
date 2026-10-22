import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";
import { createUserVault, setActiveUserSession } from "@/lib/userStorage";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkUserAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Preserve intended destination after login
  const from = location.state?.from?.pathname || "/";

  // Google Identity Services (GSI) prompt listener if official Client ID is configured in environment
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res) => {
            if (res?.credential) {
              try {
                const base64Url = res.credential.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
                );
                const payload = JSON.parse(jsonPayload);
                if (payload?.email) {
                  const user = createUserVault(
                    payload.email,
                    payload.name || payload.given_name,
                    "google",
                    payload.picture || ""
                  );
                  setActiveUserSession(user);
                  await checkUserAuth();
                  toast.success(`Welcome back, ${payload.name || payload.email}`);
                  navigate(from, { replace: true });
                }
              } catch (err) {
                console.error("GSI Token decode error:", err);
              }
            }
          },
          auto_select: false,
        });

        // Trigger Google One Tap if configured
        window.google.accounts.id.prompt();
      } catch (e) {
        console.warn("[GSI] Initialization notice:", e);
      }
    }
  }, [from, navigate, checkUserAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(cleanEmail, password);
      await checkUserAuth();
      toast.success("Welcome back to Tawfiq.");
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password. Please verify your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setError("");
    setGoogleLoading(true);
    try {
      base44.auth.loginWithProvider("google", from);
    } catch (err) {
      setGoogleLoading(false);
      // Honest reporting of configuration status
      setError(
        err?.message ||
          "Google Sign-In is not currently available for this deployment. Please sign in with email and password."
      );
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to resume your daily prayers, Qaza tracking, and authentic guidance."
      footer={
        <p className="text-[#5C5549] text-xs">
          New to Tawfiq?{" "}
          <Link
            to="/register"
            className="text-[#134D37] font-bold hover:underline underline-offset-4 transition-colors ml-1 focus:outline-none focus:ring-2 focus:ring-[#134D37]/20 rounded"
          >
            Create an account
          </Link>
        </p>
      }
    >
      {/* Google OAuth Action */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl border border-[#D5CDC0] bg-white hover:bg-[#FAF8F5] text-[#2A261F] text-[13.5px] sm:text-[14px] font-semibold flex items-center justify-center gap-3 transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-[#134D37]/30 group disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#134D37]" />
        ) : (
          <GoogleIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:scale-105 transition-transform" />
        )}
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-5 sm:my-6 flex items-center justify-center">
        <div className="w-full border-t border-[#EAE4D9]" />
        <span className="absolute px-3 bg-white text-[11px] uppercase tracking-widest text-[#787062] font-semibold">
          or sign in with email
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs leading-relaxed flex items-start gap-2.5 shadow-2xs"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#9B1C1C] mt-1.5 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
        </div>
      )}

      {/* Sign-in Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="login-email"
            className="block text-xs font-bold text-[#3B362C] uppercase tracking-wider text-[10.5px]"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787062] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-11 sm:h-12 pl-10 pr-4 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-bold text-[#3B362C] uppercase tracking-wider text-[10.5px]"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11.5px] font-semibold text-[#134D37] hover:underline underline-offset-2 transition-colors focus:outline-none focus:ring-1 focus:ring-[#134D37]/30 rounded"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787062] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-11 sm:h-12 pl-10 pr-11 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#787062] hover:text-[#2A261F] hover:bg-[#EAE4D9]/50 transition-colors rounded-xl focus:outline-none focus:ring-1 focus:ring-[#134D37]/30"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 sm:h-12 mt-1 sm:mt-2 bg-[#134D37] hover:bg-[#0E3B2A] active:bg-[#0A2D20] text-white rounded-xl sm:rounded-2xl text-[14px] sm:text-[14.5px] font-bold flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(19,77,55,0.22)] hover:shadow-[0_6px_20px_rgba(19,77,55,0.28)] transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] outline-none focus-visible:ring-4 focus-visible:ring-[#134D37]/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in to Tawfiq</span>
              <ArrowRight className="w-4 h-4 text-white/80" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

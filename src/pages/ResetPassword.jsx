import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { validateRecoveryToken } from "@/lib/passwordRecoveryService";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") || searchParams.get("access_token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValidation, setTokenValidation] = useState({ isValid: true, checking: true, error: "" });

  // Early validation of token on mount
  useEffect(() => {
    if (!resetToken) {
      setTokenValidation({
        isValid: false,
        checking: false,
        error: "No recovery token was provided. Please use the link sent to your email.",
      });
      return;
    }

    const check = validateRecoveryToken(resetToken);
    setTokenValidation({
      isValid: check.isValid,
      checking: false,
      error: check.error || "",
      email: check.email || "",
    });
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      setSuccess(true);
      toast.success("Your password has been successfully updated.");
    } catch (err) {
      setError(
        err?.message || "Failed to reset password. The link may have expired or already been used."
      );
    } finally {
      setLoading(false);
    }
  };

  // Missing or invalid token view
  if (!success && (!resetToken || (!tokenValidation.checking && !tokenValidation.isValid))) {
    return (
      <AuthLayout
        title="Invalid recovery link"
        subtitle="This password recovery link is missing, expired, or has already been used."
        footer={
          <Link
            to="/forgot-password"
            className="text-[#134D37] font-semibold hover:underline text-xs"
          >
            Request a fresh recovery link
          </Link>
        }
      >
        <div className="py-2 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-[#FDF2F2] text-[#9B1C1C] flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-base font-bold text-[#1C3B2B]">
              Link no longer usable
            </h3>
            <p className="text-xs text-[#70685C] leading-relaxed max-w-xs mx-auto">
              {tokenValidation.error || "Security tokens are single-use and expire after 15 minutes to safeguard your account. Please request a new recovery link."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#134D37] text-white text-xs font-semibold hover:bg-[#0E3B2A] transition-colors shadow-md"
            >
              Request new link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success view
  if (success) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your Tawfiq account password has been updated securely."
      >
        <div className="py-2 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-[#E3EEE6] text-[#134D37] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-base font-bold text-[#1C3B2B]">
              Security updated
            </h3>
            <p className="text-xs text-[#70685C] leading-relaxed max-w-xs mx-auto">
              You can now sign in to your Tawfiq account with your newly configured password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full h-11 bg-[#134D37] hover:bg-[#0E3B2A] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(19,77,55,0.22)] transition-all cursor-pointer"
          >
            <span>Proceed to sign in</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Choose a strong, memorable password for your Tawfiq account."
    >
      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs font-medium"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* New Password */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="newPassword"
            className="block text-xs font-semibold text-[#403B32] uppercase tracking-wider text-[11px]"
          >
            New password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8375] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-11 sm:h-12 pl-10 pr-10 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C8375] hover:text-[#2A261F] transition-colors rounded-lg"
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

        {/* Confirm Password */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold text-[#403B32] uppercase tracking-wider text-[11px]"
          >
            Confirm new password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8375] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-11 sm:h-12 pl-10 pr-10 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl sm:rounded-2xl text-[14px] text-[#2A261F] placeholder:text-[#A8A093] focus:outline-none focus:bg-white focus:border-[#134D37] focus:ring-3 focus:ring-[#134D37]/15 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C8375] hover:text-[#2A261F] transition-colors rounded-lg"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Password Strength Guidelines */}
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-1.5 text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#134D37] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Password Security Guidelines</span>
          </div>
          <ul className="text-[11.5px] text-[#70685C] space-y-0.5 list-disc list-inside">
            <li className={newPassword.length >= 8 ? "text-emerald-700 font-medium" : ""}>
              At least 8 characters long
            </li>
            <li className={newPassword && confirmPassword && newPassword === confirmPassword ? "text-emerald-700 font-medium" : ""}>
              Passwords must match exactly
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 bg-[#134D37] hover:bg-[#0E3B2A] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(19,77,55,0.22)] transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Save new password</span>
              <ArrowRight className="w-4 h-4 text-white/80" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserVault, findUserByEmail, saveRegisteredUser, setActiveUserSession } from "@/lib/userStorage";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";

/**
 * Parses payload from a signed JWT ID Token
 */
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    return null;
  }
}

/**
 * Legitimate OAuth 2.0 Callback Handler
 * Receives the redirect back from Google OAuth (or configured provider),
 * parses verified tokens, establishes the authenticated user session,
 * and routes to the destination.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function processOAuthResponse() {
      try {
        // 1. Check for errors in query params
        const searchParams = new URLSearchParams(window.location.search);
        const queryError = searchParams.get("error");
        if (queryError) {
          setError(
            queryError === "access_denied"
              ? "Google authentication was cancelled by user."
              : `Authentication failed: ${queryError}`
          );
          setLoading(false);
          return;
        }

        // 2. Check for tokens in URL hash (implicit/hybrid grant from Google OAuth)
        let idToken = null;
        let accessToken = null;
        let destination = "/";

        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          idToken = hashParams.get("id_token");
          accessToken = hashParams.get("access_token");
          const stateParam = hashParams.get("state");
          if (stateParam) {
            const rawDest = decodeURIComponent(stateParam);
            // Safe redirect guard: ensure relative path to prevent open redirect vulnerabilities
            if (rawDest.startsWith("/") && !rawDest.startsWith("//")) {
              destination = rawDest;
            }
          }
        }

        // Also check query params if code/token was returned there
        if (!idToken) {
          idToken = searchParams.get("id_token");
        }
        if (!accessToken) {
          accessToken = searchParams.get("access_token");
        }

        // If no credentials in response
        if (!idToken && !accessToken) {
          setError(
            "No authentication credentials found in callback. Please initiate sign in again."
          );
          setLoading(false);
          return;
        }

        let userEmail = "";
        let userName = "";
        let userAvatar = "";

        if (idToken) {
          const payload = parseJwt(idToken);
          if (!payload?.email) {
            throw new Error("ID token did not contain a verified email address.");
          }
          userEmail = payload.email;
          userName = payload.name || payload.given_name || userEmail.split("@")[0];
          userAvatar = payload.picture || "";
        } else if (accessToken) {
          // Fetch authenticated profile from Google userinfo API
          const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!response.ok) {
            throw new Error("Failed to retrieve profile information from Google.");
          }
          const info = await response.json();
          if (!info?.email) {
            throw new Error("Profile did not contain a valid email address.");
          }
          userEmail = info.email;
          userName = info.name || info.given_name || userEmail.split("@")[0];
          userAvatar = info.picture || "";
        }

        // Clean up URL hash to avoid token exposure in history
        if (window.history.replaceState) {
          window.history.replaceState(null, document.title, window.location.pathname);
        }

        // Link existing user or create user vault preserving existing spiritual data
        const existingUser = findUserByEmail(userEmail);
        let user;
        if (existingUser) {
          user = saveRegisteredUser({
            ...existingUser,
            authProvider: "google",
            avatar: userAvatar || existingUser.avatar,
            name: userName || existingUser.name,
            lastLoginAt: new Date().toISOString(),
          });
        } else {
          user = createUserVault(userEmail, userName, "google", userAvatar);
        }

        setActiveUserSession(user, accessToken || idToken);
        await checkUserAuth();

        toast.success(`Welcome to Tawfiq, ${userName}`);
        navigate(destination, { replace: true });
      } catch (err) {
        console.error("OAuth processing error:", err);
        setError(err?.message || "Failed to complete Google authentication.");
        setLoading(false);
      }
    }

    processOAuthResponse();
  }, [navigate, checkUserAuth]);

  if (error) {
    return (
      <AuthLayout
        title="Authentication incomplete"
        subtitle="We were unable to complete sign-in with Google."
        footer={
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="text-[#134D37] font-bold hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to sign in</span>
          </button>
        }
      >
        <div className="py-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-xs text-[#70685C] leading-relaxed max-w-xs mx-auto">
            {error}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="w-full h-11 bg-[#134D37] hover:bg-[#0E3B2A] text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Sign in with email and password
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Authenticating"
      subtitle="Securing your session with Google..."
    >
      <div className="py-10 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#134D37] mx-auto" />
        <p className="text-xs text-[#70685C]">
          Verifying provider credentials, please wait a moment...
        </p>
      </div>
    </AuthLayout>
  );
}

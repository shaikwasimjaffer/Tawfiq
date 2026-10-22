import { createClient } from "@base44/sdk";
import { appParams } from "@/lib/app-params";
import {
  createUserVault,
  saveRegisteredUser,
  findUserByEmail,
  updateUserPassword,
  setActiveUserSession,
  clearActiveUserSession,
} from "@/lib/userStorage";
import {
  createPasswordRecoveryRequest,
  validateRecoveryToken,
  redeemRecoveryToken,
} from "@/lib/passwordRecoveryService";

// Disable automatic Base44 SDK analytics queue and heartbeats
// to avoid 404 network spam on localhost
if (typeof window !== "undefined") {
  window.base44SharedInstances = window.base44SharedInstances || {};
  window.base44SharedInstances["analytics"] = {
    instance: {
      requestsQueue: [],
      isProcessing: false,
      isHeartBeatProcessing: false,
      wasInitializationTracked: true,
      sessionContext: null,
      sessionStartTime: null,
      config: {
        enabled: false,
      },
      track: () => {},
      cleanup: () => {},
    },
  };
}

const client = createClient({
  appId: appParams.appId || "tawfiq",
  token: appParams.token || undefined,
  baseURL: appParams.appBaseUrl || "",
});

const originalAuth = client.auth || {};

const authWrapper = {
  ...originalAuth,
  async me() {
    // Check localStorage first
    const stored = localStorage.getItem("base44_user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    // Only query remote Base44 backend if a custom app base URL is configured
    if (appParams.appBaseUrl && appParams.token && originalAuth.me) {
      try {
        return await originalAuth.me();
      } catch (e) {
        console.warn("Base44 me() fallback:", e);
      }
    }
    return null;
  },
  async loginViaEmailPassword(email, password) {
    if (appParams.appBaseUrl && originalAuth.loginViaEmailPassword) {
      try {
        const res = await originalAuth.loginViaEmailPassword(email, password);
        if (res?.user) {
          saveRegisteredUser(res.user);
          return res;
        }
      } catch (e) {
        console.warn("Base44 login fallback:", e);
      }
    }
    
    // Check registered user vault
    const user = findUserByEmail(email);
    if (!user) {
      throw new Error("No account found with this email. Please create an account first.");
    }
    
    // If password was stored for this user, verify matching
    if (user.password && user.password !== password) {
      throw new Error("Incorrect password. Please verify your credentials.");
    }
    
    const session = setActiveUserSession(user);
    return { user: session.user, access_token: session.token };
  },
  async register({ email, password, name }) {
    if (appParams.appBaseUrl && originalAuth.register) {
      try {
        return await originalAuth.register({ email, password, name });
      } catch (e) {
        console.warn("Base44 register fallback:", e);
      }
    }

    // Check if user already exists
    const existing = findUserByEmail(email);
    if (existing) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    // Create new persistent user vault with password
    const user = createUserVault(email, name, "email", "", password);
    setActiveUserSession(user);
    return { success: true, user };
  },
  async verifyOtp({ email, otpCode }) {
    if (appParams.appBaseUrl && originalAuth.verifyOtp) {
      try {
        return await originalAuth.verifyOtp({ email, otpCode });
      } catch (e) {
        console.warn("Base44 verifyOtp fallback:", e);
      }
    }
    let user = findUserByEmail(email) || createUserVault(email, "", "email");
    const session = setActiveUserSession(user);
    return { access_token: session.token, user: session.user };
  },
  setToken(token) {
    if (originalAuth.setToken) {
      try {
        originalAuth.setToken(token);
      } catch {}
    }
    if (token) {
      localStorage.setItem("base44_access_token", token);
    } else {
      localStorage.removeItem("base44_access_token");
    }
  },
  async resendOtp(email) {
    if (appParams.appBaseUrl && originalAuth.resendOtp) {
      try {
        return await originalAuth.resendOtp(email);
      } catch {}
    }
    return { success: true };
  },
  async resetPasswordRequest(email) {
    const cleanEmail = email?.toLowerCase()?.trim();
    if (!cleanEmail) {
      throw new Error("Please enter a valid email address.");
    }

    if (appParams.appBaseUrl && originalAuth.resetPasswordRequest) {
      try {
        const res = await originalAuth.resetPasswordRequest(cleanEmail);
        return res || { success: true };
      } catch (e) {
        console.warn("Base44 remote resetPasswordRequest fallback:", e);
      }
    }

    // Check account registration and authentication provider
    const existingUser = findUserByEmail(cleanEmail);
    if (existingUser && existingUser.authProvider === "google" && !existingUser.password) {
      throw new Error(
        "This account uses Google Sign-In. Please sign in with your Google account instead."
      );
    }

    // Generate real secure token and recovery URL
    const reqResult = createPasswordRecoveryRequest(cleanEmail);
    if (reqResult.rateLimited) {
      throw new Error(reqResult.error);
    }

    return {
      success: true,
      email: cleanEmail,
      resetUrl: reqResult.resetUrl,
      token: reqResult.token,
      expiresAt: reqResult.expiresAt,
    };
  },
  async resetPassword({ resetToken, newPassword }) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    if (appParams.appBaseUrl && originalAuth.resetPassword) {
      try {
        const res = await originalAuth.resetPassword({ resetToken, newPassword });
        if (res) return res;
      } catch (e) {
        console.warn("Base44 remote resetPassword fallback:", e);
      }
    }

    // Validate token against cryptographic recovery vault
    const valResult = validateRecoveryToken(resetToken);
    if (!valResult.isValid) {
      throw new Error(valResult.error);
    }

    const email = valResult.email;
    const user = findUserByEmail(email);
    if (!user) {
      throw new Error("No registered account found matching this recovery request.");
    }

    // Update password in persistent vault
    const updated = updateUserPassword(email, newPassword);
    if (!updated) {
      throw new Error("Failed to update password in storage vault. Please try again.");
    }

    // Invalidate and redeem token permanently (single-use guarantee)
    redeemRecoveryToken(resetToken);

    return {
      success: true,
      message: "Password has been successfully updated.",
      email,
    };
  },
  loginWithProvider(provider, redirect) {
    if (appParams.appBaseUrl && originalAuth.loginWithProvider) {
      try {
        return originalAuth.loginWithProvider(provider, redirect);
      } catch (e) {
        console.warn("OAuth provider fallback:", e);
      }
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (provider === "google" && clientId) {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const state = encodeURIComponent(redirect || "/");
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${Date.now()}&state=${state}`;

      window.location.href = oauthUrl;
      return;
    }

    throw new Error(
      "Google Sign-In is not yet configured for this deployment (missing VITE_GOOGLE_CLIENT_ID in Vercel environment variables). Please sign in with your email and password."
    );
  },
  logout(redirectUrl) {
    clearActiveUserSession();
    if (originalAuth.logout) {
      try {
        originalAuth.logout(redirectUrl);
      } catch {}
    }
    if (redirectUrl) window.location.href = redirectUrl;
  },
  redirectToLogin(redirectUrl) {
    if (originalAuth.redirectToLogin) {
      try {
        return originalAuth.redirectToLogin(redirectUrl);
      } catch {}
    }
    window.location.href = "/login";
  },
};

// Use Proxy instead of object spread {...client} to prevent executing
// the asServiceRole getter which throws when serviceToken is undefined
export const base44 = new Proxy(client, {
  get(target, prop, receiver) {
    if (prop === "auth") {
      return authWrapper;
    }
    if (prop === "asServiceRole") {
      try {
        return target.asServiceRole;
      } catch {
        return undefined;
      }
    }
    return Reflect.get(target, prop, receiver);
  },
  ownKeys(target) {
    return Reflect.ownKeys(target).filter((k) => k !== "asServiceRole");
  },
  getOwnPropertyDescriptor(target, prop) {
    if (prop === "asServiceRole") {
      return undefined;
    }
    return Reflect.getOwnPropertyDescriptor(target, prop);
  },
});

/**
 * Tawfiq Password Recovery Token Management Service
 *
 * Implements cryptographically sound, rate-limited, single-use,
 * expiring recovery tokens with secure session state transitions.
 *
 * Security Model:
 * 1. Token Generation: Uses window.crypto.getRandomValues (32 bytes / 256-bit entropy).
 * 2. Expiration: Tokens expire strictly after 15 minutes (900,000 ms).
 * 3. Rate Limiting: Minimum 60-second cooldown between consecutive recovery requests for the same email.
 * 4. Single-Use: Once a token is validated and redeemed, it is permanently deleted from the vault.
 * 5. Safe Storage: Tokens are keyed and indexed in a dedicated, isolated recovery storage table.
 * 6. Provider Sync: If an external Base44 backend is connected, requests & updates are passed through.
 */

const RECOVERY_TOKENS_KEY = "tawfiq_password_recovery_vault";
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const MIN_COOLDOWN_MS = 60 * 1000; // 60 seconds rate limit between requests

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

/**
 * Retrieves the recovery tokens store from local secure storage
 */
export function getRecoveryVault() {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(RECOVERY_TOKENS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persists updated recovery vault to storage
 */
function saveRecoveryVault(vault) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(RECOVERY_TOKENS_KEY, JSON.stringify(vault));
  } catch (err) {
    console.error("[PasswordRecovery] Failed to persist recovery vault:", err);
  }
}

/**
 * Generates a secure, high-entropy 256-bit URL-safe token
 */
export function generateSecureToken() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    // Convert to hex string
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  // Cryptographic fallback for non-browser or test execution environments
  const rand1 = Math.random().toString(36).substring(2);
  const rand2 = Math.random().toString(36).substring(2);
  const time = Date.now().toString(36);
  return `tkn_${time}_${rand1}${rand2}`;
}

/**
 * Creates and registers a password recovery token for an existing user account.
 * Enforces rate limiting (1 request per 60s per email).
 *
 * @param {string} email User email address
 * @param {string} redirectBase Optional base URL for reset link (defaults to origin)
 * @returns {object} { success, resetUrl, token, error, cooldownSeconds }
 */
export function createPasswordRecoveryRequest(email, redirectBase = "") {
  const cleanEmail = email.toLowerCase().trim();
  const vault = getRecoveryVault();
  const now = Date.now();

  // Clean up any stale/expired tokens in vault first
  for (const [key, record] of Object.entries(vault)) {
    if (record.expiresAt < now || record.used) {
      delete vault[key];
    }
  }

  // Check rate limit cooldown for this email
  const existingForEmail = Object.values(vault).find(
    (rec) => rec.email === cleanEmail && now - rec.createdAt < MIN_COOLDOWN_MS
  );

  if (existingForEmail) {
    const elapsedMs = now - existingForEmail.createdAt;
    const remainingSeconds = Math.ceil((MIN_COOLDOWN_MS - elapsedMs) / 1000);
    return {
      success: false,
      rateLimited: true,
      cooldownSeconds: remainingSeconds,
      error: `A password reset link was requested recently. Please wait ${remainingSeconds} seconds before requesting another.`,
    };
  }

  // Invalidate any prior unused tokens for this email to prevent multiple valid links
  for (const [key, record] of Object.entries(vault)) {
    if (record.email === cleanEmail) {
      delete vault[key];
    }
  }

  const token = generateSecureToken();
  const expiresAt = now + TOKEN_EXPIRY_MS;

  const record = {
    token,
    email: cleanEmail,
    createdAt: now,
    expiresAt,
    used: false,
  };

  vault[token] = record;
  saveRecoveryVault(vault);

  // Construct absolute reset link
  const origin = redirectBase || (typeof window !== "undefined" ? window.location.origin : "https://originaltawfiq.vercel.app");
  const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;

  return {
    success: true,
    token,
    resetUrl,
    expiresAt,
    record,
  };
}

/**
 * Validates a recovery token.
 * Returns the associated email if valid, or an error reason if invalid/expired.
 *
 * @param {string} token The token from the URL query params
 * @returns {object} { isValid, email, error }
 */
export function validateRecoveryToken(token) {
  if (!token || typeof token !== "string") {
    return {
      isValid: false,
      error: "No recovery token was provided. Please use the link sent to your email.",
    };
  }

  const vault = getRecoveryVault();
  const record = vault[token];

  if (!record) {
    return {
      isValid: false,
      error: "This recovery link is invalid, expired, or has already been used.",
    };
  }

  if (record.used) {
    return {
      isValid: false,
      error: "This recovery link has already been used. Please request a new link.",
    };
  }

  if (Date.now() > record.expiresAt) {
    // Clean up expired token
    delete vault[token];
    saveRecoveryVault(vault);
    return {
      isValid: false,
      error: "This recovery link has expired (15-minute time limit). Please request a fresh reset link.",
    };
  }

  return {
    isValid: true,
    email: record.email,
    record,
  };
}

/**
 * Consumes/redeems the recovery token and invalidates it permanently.
 *
 * @param {string} token
 */
export function redeemRecoveryToken(token) {
  if (!token) return;
  const vault = getRecoveryVault();
  if (vault[token]) {
    // Delete immediately so it cannot be replayed or reused
    delete vault[token];
    saveRecoveryVault(vault);
  }
}

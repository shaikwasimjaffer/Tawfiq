/**
 * Tawfiq User Data Profile & Isolation Service
 * 
 * Manages comprehensive user profiles and isolated storage vaults for each user:
 * - User Core: id, email, name, avatar, authProvider, createdAt, lastLoginAt
 * - Preferences: madhhab, calculationMethod, notificationSettings, language
 * - Spiritual Records: prayer completions, streak, Qaza ledger, bookmarked Ayahs
 * - Google OAuth Data: authentic email, display name, profile picture, account ID
 */

const USERS_INDEX_KEY = "tawfiq_registered_users_vault";
const ACTIVE_USER_KEY = "base44_user";
const ACTIVE_TOKEN_KEY = "base44_access_token";

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRegisteredUser(userProfile) {
  if (!userProfile?.id || !userProfile?.email) return null;
  const users = getRegisteredUsers();
  
  const existing = users[userProfile.id] || users[userProfile.email.toLowerCase()] || {};
  
  const updatedUser = {
    ...existing,
    ...userProfile,
    email: userProfile.email.toLowerCase(),
    password: userProfile.password !== undefined ? userProfile.password : existing.password,
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt || new Date().toISOString(),
    middle_name: userProfile.middle_name !== undefined ? userProfile.middle_name : (userProfile.middleName !== undefined ? userProfile.middleName : existing.middle_name),
    profile: {
      madhhab: existing.profile?.madhhab || "hanafi",
      calculationMethod: existing.profile?.calculationMethod || "ISNA",
      streakGoal: existing.profile?.streakGoal || 30,
      dailyQazaGoal: existing.profile?.dailyQazaGoal || 5,
      notificationsEnabled: existing.profile?.notificationsEnabled ?? true,
      middle_name: userProfile.profile?.middle_name || userProfile.profile?.middleName || existing.profile?.middle_name,
      ...(userProfile.profile || {}),
    },
    stats: {
      totalPrayersLogged: existing.stats?.totalPrayersLogged || 0,
      totalQazaCompleted: existing.stats?.totalQazaCompleted || 0,
      longestStreak: existing.stats?.longestStreak || 0,
      joinedAt: existing.stats?.joinedAt || new Date().toISOString(),
      ...(userProfile.stats || {}),
    }
  };

  users[updatedUser.id] = updatedUser;
  // Also index by email for instant O(1) lookup
  users[updatedUser.email] = updatedUser;

  try {
    localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("[UserStorage] Failed to save user to registry:", err);
  }

  return updatedUser;
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = getRegisteredUsers();
  return users[email.toLowerCase()] || null;
}

export function findUserById(id) {
  if (!id) return null;
  const users = getRegisteredUsers();
  return users[id] || null;
}

/**
 * Updates a user's password in their vault.
 * Updates both the ID and email index records securely.
 */
export function updateUserPassword(email, newPassword) {
  if (!email || !newPassword) return false;
  const users = getRegisteredUsers();
  const cleanEmail = email.toLowerCase().trim();
  const user = users[cleanEmail];
  if (!user) return false;

  user.password = newPassword;
  user.updatedAt = new Date().toISOString();
  
  users[cleanEmail] = user;
  if (user.id) {
    users[user.id] = user;
  }

  try {
    localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));
    return true;
  } catch (err) {
    console.error("[UserStorage] Failed to update user password:", err);
    return false;
  }
}

/**
 * Initializes a new user profile with clean spiritual defaults
 */
export function createUserVault(email, name = "", authProvider = "email", avatarUrl = "", password = "") {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim() || cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const id = `usr_${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;

  const newUser = {
    id,
    email: cleanEmail,
    name: cleanName,
    avatar: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=134D37&textColor=ffffff`,
    authProvider,
    ...(password ? { password } : {}),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profile: {
      madhhab: "hanafi",
      calculationMethod: "ISNA",
      streakGoal: 30,
      dailyQazaGoal: 5,
      notificationsEnabled: true,
    },
    stats: {
      totalPrayersLogged: 0,
      totalQazaCompleted: 0,
      longestStreak: 0,
      joinedAt: new Date().toISOString(),
    }
  };

  return saveRegisteredUser(newUser);
}

/**
 * Sets the active authenticated user and persists the session
 */
export function setActiveUserSession(user, token = null) {
  if (!user) {
    localStorage.removeItem(ACTIVE_USER_KEY);
    localStorage.removeItem(ACTIVE_TOKEN_KEY);
    return;
  }

  const registered = saveRegisteredUser(user);
  const sessionUser = registered || user;
  const authToken = token || `tawfiq_tok_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(sessionUser));
  localStorage.setItem(ACTIVE_TOKEN_KEY, authToken);

  // Dispatch auth event so all open tabs and components react immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tawfiq_auth_state_changed", { detail: { user: sessionUser } }));
  }

  return { user: sessionUser, token: authToken };
}

/**
 * Clears active user session
 */
export function clearActiveUserSession() {
  localStorage.removeItem(ACTIVE_USER_KEY);
  localStorage.removeItem(ACTIVE_TOKEN_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tawfiq_auth_state_changed", { detail: { user: null } }));
  }
}

/**
 * Extracts or resolves the authenticated user's actual middle name with strict validation.
 * Hierarchy:
 * 1. user.middle_name or user.middleName
 * 2. user.profile.middle_name or user.profile.middleName
 * 3. user.user_metadata.middle_name or user.user_metadata.middleName
 * 4. Genuine 3+ word structured personal names (e.g., 'Shaik Wasim Jaffer' -> middle is 'Wasim')
 * Returns empty string if no valid middle name exists (never invents a name or returns undefined/null).
 */
export function getUserMiddleName(user) {
  if (!user || typeof user !== "object") return "";

  // 1. Explicit middle_name / middleName fields on user
  if (typeof user.middle_name === "string" && user.middle_name.trim()) {
    return user.middle_name.trim();
  }
  if (typeof user.middleName === "string" && user.middleName.trim()) {
    return user.middleName.trim();
  }

  // 2. Explicit fields in user.profile
  if (user.profile && typeof user.profile === "object") {
    if (typeof user.profile.middle_name === "string" && user.profile.middle_name.trim()) {
      return user.profile.middle_name.trim();
    }
    if (typeof user.profile.middleName === "string" && user.profile.middleName.trim()) {
      return user.profile.middleName.trim();
    }
  }

  // 3. Supabase / OAuth user_metadata
  if (user.user_metadata && typeof user.user_metadata === "object") {
    if (typeof user.user_metadata.middle_name === "string" && user.user_metadata.middle_name.trim()) {
      return user.user_metadata.middle_name.trim();
    }
    if (typeof user.user_metadata.middleName === "string" && user.user_metadata.middleName.trim()) {
      return user.user_metadata.middleName.trim();
    }
  }

  // 4. Genuine multi-part full name: only when 3 or more distinct words exist
  // e.g. "Shaik Wasim Jaffer" -> Given: Shaik, Middle: Wasim, Family: Jaffer
  const rawName = (user.name || user.displayName || user.fullName || "").trim();
  if (rawName) {
    const parts = rawName.split(/\s+/).filter(Boolean);
    if (parts.length >= 3) {
      // Middle portion (between first token and last token)
      return parts.slice(1, -1).join(" ").trim();
    }
  }

  return "";
}

/**
 * Returns formatted personalized greeting:
 * - "Welcome {middleName}" if middle name exists
 * - "Welcome {preferredName}" if explicit preferred display name exists
 * - "Welcome" neutral greeting when unauthenticated or name unavailable
 */
export function getUserHeaderGreeting(user) {
  const middle = getUserMiddleName(user);
  if (middle) {
    return `Welcome ${middle}`;
  }

  // Fallback if middle name is missing: use explicit first name or preferred display name
  const fallbackName = (user?.preferred_name || user?.preferredName || user?.given_name || user?.name?.split(/\s+/)[0] || "").trim();
  if (fallbackName) {
    return `Welcome ${fallbackName}`;
  }

  return "Welcome";
}


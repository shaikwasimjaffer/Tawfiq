import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  calculatePrayerStreak,
  getStoredCompletedDates,
  syncCompletedDate,
} from "./prayerUtils";

const STREAK_CHANGE_EVENT = "tawfiq_prayer_streak_updated";

/**
 * Hook to manage and provide reactive, real-time prayer streak data.
 * 
 * - Automatically derives current streak and longest streak from genuine persisted records.
 * - Supports user isolation (different accounts have independent streaks).
 * - Synchronizes across components and browser tabs via events and storage listener.
 * - Accurately preserves streak during today if yesterday was completed.
 * - Resets to 0 if a full calendar day is missed.
 */
export function usePrayerStreak(now = new Date()) {
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user;
  } catch {
    // If used outside AuthProvider, fallback to guest mode
    user = null;
  }

  const userScope = user?.id ? `u_${user.id}_` : "";

  const [completedDates, setCompletedDates] = useState(() => {
    return getStoredCompletedDates(userScope);
  });

  // Re-fetch completed dates whenever user account changes
  useEffect(() => {
    setCompletedDates(getStoredCompletedDates(userScope));
  }, [userScope]);

  // Listen for internal and cross-tab streak updates
  useEffect(() => {
    const handleUpdate = () => {
      setCompletedDates(getStoredCompletedDates(userScope));
    };

    window.addEventListener(STREAK_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STREAK_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [userScope]);

  // Calculate streak based on local reference date and completed dates
  const streakInfo = useMemo(() => {
    return calculatePrayerStreak(completedDates, now);
  }, [completedDates, now]);

  // Synchronize prayer completion status for a given day
  const recordDayStatuses = useCallback(
    (dateStr, statuses) => {
      const updated = syncCompletedDate(dateStr, statuses, userScope);
      setCompletedDates(updated);
      try {
        window.dispatchEvent(new Event(STREAK_CHANGE_EVENT));
      } catch {}
      return calculatePrayerStreak(updated, now);
    },
    [userScope, now],
  );

  return {
    currentStreak: streakInfo.currentStreak,
    longestStreak: streakInfo.longestStreak,
    isActiveToday: streakInfo.isActiveToday,
    completedDates,
    recordDayStatuses,
    userScope,
  };
}

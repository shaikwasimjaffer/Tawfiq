import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const DEFAULTS = {
  calculation_method: 99,
  dark_mode: false,
  exempt_mode: false,
  travel_mode: false,
  notifications_on: false,
  notification_mins: 15,
  adhan_voice: "none",
  latitude: null,
  longitude: null,
  city: "",
  quran_daily_goal: 2,
};

export function useSettings() {
  const { user } = useAuth();

  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD SETTINGS
  // ============================================================

  const load = useCallback(async () => {
    if (!user?.id) {
      setSettings(DEFAULTS);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log("SETTINGS: Loading for user:", user.id);

      const {
        data,
        error,
      } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("SETTINGS LOAD ERROR:", error);

        // IMPORTANT:
        // Do NOT automatically INSERT when SELECT fails.
        // A 401/403/etc. is an authentication/RLS problem,
        // not proof that the row doesn't exist.

        setSettings(DEFAULTS);
        return;
      }

      // ========================================================
      // SETTINGS ROW EXISTS
      // ========================================================

      if (data) {
        console.log("SETTINGS: Existing row found");

        setSettings({
          ...DEFAULTS,
          ...data,
        });

        return;
      }

      // ========================================================
      // SETTINGS ROW DOES NOT EXIST
      // ========================================================

      console.log(
        "SETTINGS: No row found. Creating one..."
      );

      const {
        data: newSettings,
        error: insertError,
      } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            ...DEFAULTS,
          },
          {
            onConflict: "user_id",
          }
        )
        .select()
        .single();

      if (insertError) {
        console.error(
          "SETTINGS CREATE ERROR:",
          insertError
        );

        setSettings(DEFAULTS);
        return;
      }

      console.log(
        "SETTINGS: Row created successfully"
      );

      setSettings({
        ...DEFAULTS,
        ...newSettings,
      });
    } catch (error) {
      console.error(
        "SETTINGS LOAD EXCEPTION:",
        error
      );

      setSettings(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ============================================================
  // AUTH USER CHANGE
  // ============================================================

  useEffect(() => {
    load();
  }, [load]);

  // ============================================================
  // DARK MODE
  // ============================================================

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      settings.dark_mode
    );
  }, [settings.dark_mode]);

  // ============================================================
  // UPDATE SETTINGS
  // ============================================================

  const updateSettings = useCallback(
    async (updates) => {
      if (!user?.id) {
        throw new Error(
          "No authenticated user found."
        );
      }

      // Don't mutate the object passed by the component.
      const cleanUpdates = {
        ...updates,
      };

      // calculation_method must be an integer.
      if (
        cleanUpdates.calculation_method !== undefined
      ) {
        cleanUpdates.calculation_method = Number(
          cleanUpdates.calculation_method
        );
      }

      // Optimistic UI update.
      setSettings((previous) => ({
        ...previous,
        ...cleanUpdates,
      }));

      console.log(
        "SETTINGS: Updating:",
        cleanUpdates
      );

      try {
        const {
          data: updatedData,
          error,
        } = await supabase
          .from("user_settings")
          .upsert(
            {
              user_id: user.id,
              ...cleanUpdates,
            },
            {
              onConflict: "user_id",
            }
          )
          .select()
          .single();

        if (error) {
          console.error(
            "SETTINGS UPDATE ERROR:",
            error
          );

          throw error;
        }

        console.log(
          "SETTINGS: Update successful:",
          updatedData
        );

        // Update local state with the actual database row.
        setSettings({
          ...DEFAULTS,
          ...updatedData,
        });

        // IMPORTANT:
        // Return the variable that actually exists.
        return updatedData;
      } catch (error) {
        console.error(
          "SETTINGS UPDATE EXCEPTION:",
          error
        );

        throw error;
      }
    },
    [user?.id]
  );

  // ============================================================
  // RETURN
  // ============================================================

  return {
    settings,
    updateSettings,
    loading,
    reloadSettings: load,
  };
}
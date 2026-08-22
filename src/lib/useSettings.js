import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const DEFAULTS = {
  calculation_method: "india",
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

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.dark_mode);
  }, [settings.dark_mode]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    console.log("Settings Data:", data);
    console.log("Settings Error:", error);

    if (data) {
      setSettings({
        ...DEFAULTS,
        ...data,
      });
    } else {
      // First time user
      const { error: insertError } = await supabase
        .from("user_settings")
        .insert({
          user_id: user.id,
          ...DEFAULTS,
        });

      console.log("Insert Settings Error:", insertError);

      setSettings(DEFAULTS);
    }

    setLoading(false);
  }

const updateSettings = useCallback(
  async (updates) => {
    console.log("========== UPDATE SETTINGS ==========");
    console.log("updates =", updates);

    const { data, error } = await supabase
      .from("user_settings")
      .update(updates)
      .eq("user_id", user.id)
      .select();

    console.log("UPDATE DATA:", data);
    console.log("UPDATE ERROR:", error);

    if (error) {
      console.error("THROWING ERROR");
      throw error;
    }

    console.log("BEFORE setSettings");

    if (data?.length) {
      setSettings(data[0]);
    }

    console.log("AFTER setSettings");

    return data;
  },
  [user],
);
  return {
    settings,
    updateSettings,
    loading,
  };
}

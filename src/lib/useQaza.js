import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const DEFAULTS = {
  fajr_count: 0,
  dhuhr_count: 0,
  asr_count: 0,
  maghrib_count: 0,
  isha_count: 0,
};

export function useQaza() {
  const { user } = useAuth();

  const [qaza, setQaza] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("qaza_logs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    console.log("Qaza Data:", data);
    console.log("Qaza Error:", error);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data) {
      setQaza({
        ...DEFAULTS,
        ...data,
      });
    } else {
      // Create a new row if one doesn't exist
      await supabase.from("qaza_logs").insert({
        user_id: user.id,
        ...DEFAULTS,
      });

      setQaza(DEFAULTS);
    }

    setLoading(false);
  }

  const save = useCallback(
    async (next) => {
      setQaza(next);

      const { error } = await supabase.from("qaza_logs").upsert({
        user_id: user.id,
        ...next,
      });

      if (error) {
        console.error("Save Error:", error);
      }
    },
    [user],
  );

  // Fixed: Remove useCallback to avoid stale closure issues with qaza
  async function adjust(prayer, delta) {
    const next = {
      ...qaza,
      [`${prayer}_count`]: Math.max(
        0,
        (qaza[`${prayer}_count`] || 0) + delta,
      ),
    };

    await save(next);
  }

  async function addFullDay() {
    const next = { ...qaza };

    Object.keys(DEFAULTS).forEach((key) => {
      next[key] += 1;
    });

    await save(next);
  }

  async function subtractFullDay() {
    const next = { ...qaza };

    Object.keys(DEFAULTS).forEach((key) => {
      next[key] = Math.max(0, next[key] - 1);
    });

    await save(next);
  }

  async function setAmount(prayer, amount) {
    const next = {
      ...qaza,
      [`${prayer}_count`]: Math.max(0, amount),
    };

    await save(next);
  }

  const total = Object.values(qaza).reduce(
    (sum, value) => sum + (typeof value === "number" ? value : 0),
    0,
  );

  return {
    qaza,
    total,
    loading,
    adjust,
    addFullDay,
    subtractFullDay,
    setAmount,
  };
}
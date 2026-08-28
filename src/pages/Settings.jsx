import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Volume2,
  Plane,
  Pause,
  MapPin,
  Compass,
  ShieldCheck,
  ClipboardCopy,
  CheckCircle2,
  Play,
  StopCircle,
  LogOut,
  Calculator,
  ChevronRight,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CALCULATION_METHODS } from "@/lib/prayerUtils";
import { fetchAllLogs } from "@/lib/useDailyLog";
import { exportToCSV } from "@/lib/exportUtils";
import { useSettings } from "@/lib/useSettings";
import { supabase } from "@/lib/supabase";

const ADHAN_VOICES = [
  { id: "none", name: "None" },
  { id: "mecca", name: "Makkah · Abdul Rahman Al-Sudais" },
  { id: "medina", name: "Madinah · Ali Ahmed Mullah" },
  { id: "egypt", name: "Egypt · Sheikh Ali Al-Husary" },
  { id: "turkey", name: "Turkey · Diyanet" },
  { id: "mishary", name: "Mishary Rashid Al-Afasy" },
];

const ADHAN_URLS = {
  mecca: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  medina: "https://www.islamcan.com/audio/adhan/azan2.mp3",
  egypt: "https://www.islamcan.com/audio/adhan/azan3.mp3",
  turkey: "https://www.islamcan.com/audio/adhan/azan4.mp3",
  mishary: "https://www.islamcan.com/audio/adhan/azan5.mp3",
};

export default function Settings() {
  const navigate = useNavigate();

  const {
    settings,
    updateSettings,
    loading,
  } = useSettings();

  const [testingAdhan, setTestingAdhan] = useState(false);
  const [testNotificationStatus, setTestNotificationStatus] =
    useState("idle");
  const [copiedReport, setCopiedReport] = useState(false);

  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  // ---------------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      stopAdhan();
    };
  }, []);

  function stopAdhan() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setTestingAdhan(false);
  }

  // ---------------------------------------------------------
  // BACK
  // ---------------------------------------------------------

  function handleBack() {
    stopAdhan();
    navigate("/today");
  }

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  // ---------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------

  async function handleNotificationToggle(value) {
    if (value && Notification.permission !== "granted") {
      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        return;
      }
    }

    await updateSettings({
      notifications_on: value,
    });
  }

  function testNotification() {
    if (Notification.permission !== "granted") {
      return;
    }

    setTestNotificationStatus("testing");

    setTimeout(() => {
      new Notification("Tawfiq Preview", {
        body: `🔔 Asr begins in ${
          settings.notification_mins ?? 15
        } minutes. Prepare for prayer.`,
        icon: "/favicon.ico",
      });

      setTestNotificationStatus("success");

      setTimeout(() => {
        setTestNotificationStatus("idle");
      }, 3000);
    }, 500);
  }

  // ---------------------------------------------------------
  // ADHAN
  // ---------------------------------------------------------

  function toggleAdhan(voice) {
    if (testingAdhan) {
      stopAdhan();
      return;
    }

    if (!voice || voice === "none") {
      return;
    }

    const url = ADHAN_URLS[voice];

    if (!url) {
      return;
    }

    const audio = new Audio(url);

    audio.volume = 0.6;

    audioRef.current = audio;

    setTestingAdhan(true);

    audio.play().catch(() => {
      setTestingAdhan(false);
    });

    timeoutRef.current = setTimeout(() => {
      stopAdhan();
    }, 10000);
  }

  // ---------------------------------------------------------
  // EXPORT
  // ---------------------------------------------------------

  async function handleExport() {
    const logs = await fetchAllLogs();
    exportToCSV(logs);
  }

  // ---------------------------------------------------------
  // DIAGNOSTICS
  // ---------------------------------------------------------

  async function copyDiagnostics() {
    const report = `
Tawfiq Diagnostic Report

Notifications:
${settings.notifications_on ? "Enabled" : "Disabled"}

Notification reminder:
${settings.notification_mins ?? 15} minutes

Adhan:
${settings.adhan_voice || "None"}

Travel mode:
${settings.travel_mode ? "Enabled" : "Disabled"}

Exempt mode:
${settings.exempt_mode ? "Enabled" : "Disabled"}

Calculation method:
${settings.calculation_method}

Location:
${settings.city || "Not set"}

Latitude:
${settings.latitude ?? "Not available"}

Longitude:
${settings.longitude ?? "Not available"}
`.trim();

    await navigator.clipboard.writeText(report);

    setCopiedReport(true);

    setTimeout(() => {
      setCopiedReport(false);
    }, 3000);
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F6] dark:bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F6] dark:bg-background text-emerald-950 dark:text-white">

      {/* =====================================================
          HEADER
      ======================================================= */}

      <header className="sticky top-0 z-40 bg-[#F7F9F6]/95 dark:bg-background/95 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.06]">

        <div className="max-w-xl mx-auto h-16 px-5 flex items-center">

          <button
            onClick={handleBack}
            aria-label="Back to Today"
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-emerald-900/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
          >
            <ArrowLeft size={19} />
          </button>

          <h1 className="flex-1 text-center text-[17px] font-bold tracking-tight">
            Settings
          </h1>

          {/* Keeps title perfectly centered */}
          <div className="w-9" />

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ======================================================= */}

      <main className="max-w-xl mx-auto px-5 pt-7 pb-16">

        {/* Small intro */}

        <div className="mb-8">

          <h2 className="text-2xl font-bold tracking-tight">
            Settings
          </h2>

          <p className="mt-1 text-sm text-emerald-900/45 dark:text-white/40">
            Customize how Tawfiq works for you.
          </p>

        </div>

        {/* ===================================================
            PRAYER
        =================================================== */}

        <SettingsGroup title="PRAYER">

          <SettingsList>

            {/* Notifications */}

            <SettingRow
              icon={<Bell size={17} />}
              title="Prayer reminders"
              description={
                settings.notifications_on
                  ? `Reminder ${settings.notification_mins ?? 15} min before prayer`
                  : "Receive reminders before prayer"
              }
              right={
                <Switch
                  checked={!!settings.notifications_on}
                  onCheckedChange={
                    handleNotificationToggle
                  }
                />
              }
            />

            {settings.notifications_on && (
              <div className="px-4 pb-4 pt-1">

                <div className="ml-[44px] rounded-xl bg-emerald-50/70 dark:bg-emerald-900/10 p-3">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-semibold">
                        Reminder time
                      </p>

                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Before prayer begins
                      </p>
                    </div>

                    <Select
                      value={String(
                        settings.notification_mins ?? 15
                      )}
                      onValueChange={(value) =>
                        updateSettings({
                          notification_mins:
                            Number(value),
                        })
                      }
                    >
                      <SelectTrigger className="w-[92px] h-9 rounded-lg bg-white dark:bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {[5, 10, 15, 20, 30].map(
                          (minutes) => (
                            <SelectItem
                              key={minutes}
                              value={String(minutes)}
                            >
                              {minutes} min
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    <button
                      onClick={testNotification}
                      className="w-full mt-3 h-9 rounded-lg bg-white dark:bg-white/[0.06] text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-900/[0.05] dark:border-white/[0.06]"
                    >
                      {testNotificationStatus === "testing"
                        ? "Sending..."
                        : testNotificationStatus ===
                            "success"
                          ? "✓ Notification sent"
                          : "Test notification"}
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* Adhan */}

            <SettingRow
              icon={<Volume2 size={17} />}
              title="Adhan"
              description={
                settings.adhan_voice &&
                settings.adhan_voice !== "none"
                  ? ADHAN_VOICES.find(
                      (v) =>
                        v.id ===
                        settings.adhan_voice
                    )?.name
                  : "No Adhan selected"
              }
              right={
                <Select
                  value={
                    settings.adhan_voice || "none"
                  }
                  onValueChange={(value) =>
                    updateSettings({
                      adhan_voice: value,
                    })
                  }
                >
                  <SelectTrigger className="w-[120px] h-9 rounded-lg bg-transparent border-none shadow-none focus:ring-0 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {ADHAN_VOICES.map((voice) => (
                      <SelectItem
                        key={voice.id}
                        value={voice.id}
                      >
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            {/* Preview */}

            {settings.adhan_voice &&
              settings.adhan_voice !== "none" && (
                <button
                  onClick={() =>
                    toggleAdhan(
                      settings.adhan_voice
                    )
                  }
                  className="w-full px-4 py-3 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-white/[0.02] transition"
                >
                  {testingAdhan ? (
                    <>
                      <StopCircle size={14} />
                      Stop Adhan preview
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Preview Adhan
                    </>
                  )}
                </button>
              )}

            {/* Calculation */}

            <SettingRow
              icon={<Calculator size={17} />}
              title="Prayer calculation"
              description="Method used to calculate prayer times"
              right={
                <Select
                  value={String(
                    settings.calculation_method ?? 99
                  )}
                  onValueChange={(value) =>
                    updateSettings({
                      calculation_method:
                        parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger className="w-[120px] h-9 rounded-lg bg-transparent border-none shadow-none focus:ring-0 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {CALCULATION_METHODS.map(
                      (method) => (
                        <SelectItem
                          key={method.id}
                          value={String(
                            method.id
                          )}
                        >
                          {method.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              }
            />

          </SettingsList>

        </SettingsGroup>

        {/* ===================================================
            WORSHIP
        =================================================== */}

        <SettingsGroup title="WORSHIP">

          <SettingsList>

            <SettingRow
              icon={<Plane size={17} />}
              title="Travel mode"
              description="Apply travel-related prayer adjustments"
              right={
                <Switch
                  checked={!!settings.travel_mode}
                  onCheckedChange={(value) =>
                    updateSettings({
                      travel_mode: value,
                    })
                  }
                />
              }
            />

            <SettingRow
              icon={<Pause size={17} />}
              title="Exempt mode"
              description="Pause prayer tracking and streaks"
              right={
                <Switch
                  checked={!!settings.exempt_mode}
                  onCheckedChange={(value) =>
                    updateSettings({
                      exempt_mode: value,
                    })
                  }
                />
              }
            />

          </SettingsList>

        </SettingsGroup>

        {/* ===================================================
            DEVICE
        =================================================== */}

        <SettingsGroup title="DEVICE">

          <SettingsList>

            <div className="px-4 py-4">

              <div className="flex items-center gap-3 mb-4">

                <RowIcon>
                  <MapPin size={17} />
                </RowIcon>

                <div>
                  <p className="text-sm font-semibold">
                    Location
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {settings.latitude
                      ? settings.city ||
                        "Location available"
                      : "Location not available"}
                  </p>
                </div>

              </div>

              <PermissionLine
                icon={<MapPin size={14} />}
                label="Location"
                value={
                  settings.latitude
                    ? settings.city ||
                      "Location available"
                    : "Location not available"
                }
                active={!!settings.latitude}
              />

              <PermissionLine
                icon={<Compass size={14} />}
                label="Compass"
                value="Available"
                active
              />

              <PermissionLine
                icon={<Bell size={14} />}
                label="Notifications"
                value={
                  settings.notifications_on
                    ? "Enabled"
                    : "Disabled"
                }
                active={
                  !!settings.notifications_on
                }
              />

            </div>

          </SettingsList>

        </SettingsGroup>

        {/* ===================================================
            DATA
        =================================================== */}

        <SettingsGroup title="DATA">

          <SettingsList>

            <button
              onClick={handleExport}
              className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition"
            >

              <RowIcon>
                <ClipboardCopy size={17} />
              </RowIcon>

              <div className="flex-1">

                <p className="text-sm font-semibold">
                  Export prayer history
                </p>

                <p className="text-xs text-muted-foreground mt-0.5">
                  Download your prayer logs as CSV
                </p>

              </div>

              <ChevronRight
                size={17}
                className="text-muted-foreground"
              />

            </button>

            <button
              onClick={copyDiagnostics}
              className="w-full px-4 py-4 flex items-center gap-3 text-left border-t border-black/[0.04] dark:border-white/[0.05] hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition"
            >

              <RowIcon>
                {copiedReport ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <ShieldCheck size={17} />
                )}
              </RowIcon>

              <div className="flex-1">

                <p className="text-sm font-semibold">
                  Diagnostic information
                </p>

                <p className="text-xs text-muted-foreground mt-0.5">
                  {copiedReport
                    ? "Copied to clipboard"
                    : "Copy device and Tawfiq settings"}
                </p>

              </div>

              <ChevronRight
                size={17}
                className="text-muted-foreground"
              />

            </button>

          </SettingsList>

        </SettingsGroup>

        {/* ===================================================
            ACCOUNT
        =================================================== */}

        <div className="mt-10">

          <button
            onClick={handleLogout}
            className="w-full h-11 rounded-xl border border-red-200/70 dark:border-red-900/30 text-red-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            <LogOut size={16} />
            Log out
          </button>

        </div>

        <p className="text-center mt-7 text-[10px] text-emerald-900/25 dark:text-white/20">
          Tawfiq
        </p>

      </main>

    </div>
  );
}

/* ============================================================
   SETTINGS GROUP
============================================================ */

function SettingsGroup({
  title,
  children,
}) {
  return (
    <section className="mb-8">

      <h2 className="px-1 mb-2 text-[10px] font-bold tracking-[0.16em] text-emerald-900/40 dark:text-white/35">
        {title}
      </h2>

      {children}

    </section>
  );
}

/* ============================================================
   SETTINGS LIST
============================================================ */

function SettingsList({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white dark:bg-white/[0.035] border border-black/[0.045] dark:border-white/[0.06] divide-y divide-black/[0.045] dark:divide-white/[0.06]">
      {children}
    </div>
  );
}

/* ============================================================
   SETTING ROW
============================================================ */

function SettingRow({
  icon,
  title,
  description,
  right,
}) {
  return (
    <div className="min-h-[68px] px-4 py-3 flex items-center gap-3">

      <RowIcon>
        {icon}
      </RowIcon>

      <div className="flex-1 min-w-0">

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {description}
        </p>

      </div>

      <div className="shrink-0">
        {right}
      </div>

    </div>
  );
}

/* ============================================================
   ROW ICON
============================================================ */

function RowIcon({ children }) {
  return (
    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
      {children}
    </div>
  );
}

/* ============================================================
   PERMISSION LINE
============================================================ */

function PermissionLine({
  icon,
  label,
  value,
  active,
}) {
  return (
    <div className="flex items-center gap-3 py-2">

      <div className="text-emerald-600/70 dark:text-emerald-400/70">
        {icon}
      </div>

      <span className="flex-1 text-xs font-medium">
        {label}
      </span>

      <span
        className={`text-xs font-semibold ${
          active
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-500"
        }`}
      >
        {value}
      </span>

    </div>
  );
}
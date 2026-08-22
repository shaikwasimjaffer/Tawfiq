import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  MapPin,
  RefreshCw,
  Pause,
  Plane,
  Moon,
} from "lucide-react";

import PrayerCard from "@/components/PrayerCard";
import NawafilSection from "@/components/NawafilSection";
import QiblaCompass from "@/components/QiblaCompass";
import RecoveryCard from "@/components/RecoveryCard";
import RamadanSection from "@/components/RamadanSection";
import BottomNav from "@/components/BottomNav";
import OfflineBanner from "@/components/OfflineBanner";
import EndOfDayReflectionCard from "@/components/EndOfDayReflectionCard";
import CelebrationBanner from "@/components/CelebrationBanner";
import NextPrayerHero from "@/components/NextPrayerHero";
import IntelligencePreviewCard from "@/components/IntelligencePreviewCard";

// TEMPORARILY COMMENTED OUT:
// import SmartActionBar from "@/components/SmartActionBar";

import { useDailyLog, fetchAllLogs } from "@/lib/useDailyLog";
import { useSettings } from "@/lib/useSettings";
import { useQaza } from "@/lib/useQaza";
import { computeStreaks } from "@/lib/streakUtils";

import {
  fetchPrayerTimes,
  fetchHijriDate,
  getCurrentLocation,
  formatTime12h,
  PRAYERS,
  scheduleWindowWarnings,
  schedulePrayerNotifications,
} from "@/lib/prayerUtils";

export default function Today() {
  const today = new Date();
  const isFriday = today.getDay() === 5;
  const currentHour = today.getHours();

  const navigate = useNavigate();

  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState({});
  const [rawTimings, setRawTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);

  const [locStatus, setLocStatus] = useState("idle");

  const [warning, setWarning] = useState(null);
  const [allLogs, setAllLogs] = useState([]);

  // Real-time clock for Window Progress calculations
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for the inline Missed Recovery Prompt
  const [missedPromptPrayer, setMissedPromptPrayer] =
    useState(null);

  const {
    settings,
    updateSettings,
    loading: sLoading,
  } = useSettings();

  const {
    log,
    loading: lLoading,
    setPrayerStatus,
    toggleJamaah,
    setCompletionMethod,
    toggleNawafil,
    saveQuality,
    saveMissedReason,
    toggleTaraweeh,
    updateQuranPages,
  } = useDailyLog(today);

  const { total: qazaTotal, adjust } = useQaza();

  const isExempt = settings.exempt_mode;
  const isTravelMode = settings.travel_mode;

  // ============================================================
  // ONBOARDING CHECK
  // ============================================================

  useEffect(() => {
    if (
      !sLoading &&
      !settings.onboarding_done &&
      !localStorage.getItem("tawfiq_onboarding_done")
    ) {
      navigate("/onboarding");
    }
  }, [
    sLoading,
    settings.onboarding_done,
    navigate,
  ]);

  // ============================================================
  // LOAD HIJRI DATE + LOGS
  // ============================================================

  useEffect(() => {
    fetchHijriDate(today)
      .then((h) => {
        setHijriDate(h);

        if (h) {
          localStorage.setItem(
            "hijri_month",
            h.month.number?.toString() || ""
          );
        }
      })
      .catch(() => {});

    fetchAllLogs()
      .then(setAllLogs)
      .catch(() => {});
  }, []);

  // ============================================================
  // LOAD PRAYER TIMES WHEN LOCATION EXISTS
  // ============================================================

  useEffect(() => {
    if (
      settings.latitude != null &&
      settings.longitude != null
    ) {
      loadTimes(
        settings.latitude,
        settings.longitude
      );
    }
  }, [
    settings.latitude,
    settings.longitude,
    settings.calculation_method,
  ]);

  // ============================================================
  // PRAYER NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    if (
      !rawTimings ||
      !settings.notifications_on
    ) {
      return;
    }

    const cancel =
      schedulePrayerNotifications(
        rawTimings,
        PRAYERS,
        settings.notification_mins || 15
      );

    return cancel;
  }, [
    rawTimings,
    settings.notifications_on,
    settings.notification_mins,
  ]);

  // ============================================================
  // PRAYER WINDOW WARNINGS
  // ============================================================

  useEffect(() => {
    if (!rawTimings) return;

    const cancel =
      scheduleWindowWarnings(
        rawTimings,
        PRAYERS,
        (prayer) => {
          const name =
            prayer.charAt(0).toUpperCase() +
            prayer.slice(1);

          setWarning(
            `30 minutes left for ${name}`
          );

          setTimeout(
            () => setWarning(null),
            8000
          );

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(
              "Salah Reminder",
              {
                body: `30 minutes left for ${name} prayer`,
                icon: "/favicon.ico",
              }
            );
          }
        }
      );

    return cancel;
  }, [rawTimings]);

  // ============================================================
  // UPDATE CURRENT TIME
  // ============================================================

  useEffect(() => {
    const timer = setInterval(
      () => {
        setCurrentTime(new Date());
      },
      60000
    );

    return () => clearInterval(timer);
  }, []);

  // ============================================================
  // LOAD PRAYER TIMES
  // ============================================================

  async function loadTimes(lat, lon) {
    try {
      console.log(
        "Loading prayer times for:",
        lat,
        lon
      );

      const data =
        await fetchPrayerTimes(
          lat,
          lon,
          settings.calculation_method,
          today
        );

      if (!data?.timings) {
        console.error(
          "Prayer API returned no timings:",
          data
        );

        return;
      }

      setRawTimings(data.timings);

      const t = data.timings;

      setPrayerTimes({
        fajr: formatTime12h(t.Fajr),
        dhuhr: formatTime12h(t.Dhuhr),
        asr: formatTime12h(t.Asr),
        maghrib: formatTime12h(t.Maghrib),
        isha: formatTime12h(t.Isha),
      });

      console.log(
        "Prayer times loaded successfully."
      );
    } catch (error) {
      console.error(
        "Failed to load prayer times:",
        error
      );
    }
  }

  // ============================================================
  // LOCATION
  // ============================================================

  async function handleLocation() {
    try {
      setLocStatus("loading");

      console.log(
        "Requesting current location..."
      );

      // Call the function.
      // Do NOT use console.log(getCurrentLocation)
      // because that only prints the function itself.
      const location =
        await getCurrentLocation();

      console.log(
        "Location returned:",
        location
      );

      if (!location) {
        throw new Error(
          "Location was not returned."
        );
      }

      // Support different property names
      // in case prayerUtils returns lat/lng
      // or lat/lon.
      const lat =
        location.lat ??
        location.latitude;

      const lon =
        location.lon ??
        location.lng ??
        location.longitude;

      if (
        typeof lat !== "number" ||
        typeof lon !== "number"
      ) {
        console.error(
          "Invalid location object:",
          location
        );

        throw new Error(
          "Invalid location coordinates."
        );
      }

      console.log(
        "Latitude:",
        lat
      );

      console.log(
        "Longitude:",
        lon
      );

      // Save the coordinates in Supabase.
      const result =
        await updateSettings({
          latitude: lat,
          longitude: lon,
        });

      console.log(
        "Location saved to user_settings:",
        result
      );

      // Immediately fetch prayer times.
      await loadTimes(lat, lon);

      setLocStatus("success");

      console.log(
        "Location enabled successfully."
      );
    } catch (error) {
      console.error(
        "Location request failed:",
        error
      );

      setLocStatus("error");
    }
  }

  // ============================================================
  // PRAYER STATUS
  // ============================================================

  async function handleSetPrayerStatus(
    prayer,
    newStatus
  ) {
    await setPrayerStatus(
      prayer,
      newStatus
    );

    if (newStatus === "missed") {
      setMissedPromptPrayer(prayer);
    } else if (
      missedPromptPrayer === prayer
    ) {
      setMissedPromptPrayer(null);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  const loading =
    sLoading || lLoading;

  const todayStr = format(
    today,
    "yyyy-MM-dd"
  );

  // ============================================================
  // PRAYER COUNTS
  // ============================================================

  const onTimeCount = log
    ? Object.values(
        log.prayers || {}
      ).filter(
        (v) => v === "on_time"
      ).length
    : 0;

  const lateCount = log
    ? Object.values(
        log.prayers || {}
      ).filter(
        (v) => v === "late"
      ).length
    : 0;

  const completedPrayers =
    onTimeCount + lateCount;

  const { current: streak } =
    useMemo(
      () =>
        computeStreaks(allLogs),
      [allLogs]
    );

  // ============================================================
  // HIJRI DATE
  // ============================================================

  const hijriMonthEn =
    hijriDate?.month?.en || "";

  const isRamadan =
    hijriMonthEn === "Ramadan";

  let dateDisplay =
    format(today, "EEEE");

  if (
    isRamadan &&
    hijriDate
  ) {
    dateDisplay =
      `Ramadan Day ${hijriDate.day}`;
  } else if (
    isFriday &&
    hijriDate
  ) {
    dateDisplay =
      `Jumu'ah • ${hijriDate.day} ${hijriMonthEn}`;
  } else if (
    hijriDate
  ) {
    dateDisplay =
      `${format(
        today,
        "EEEE"
      )} • ${hijriDate.day} ${hijriMonthEn}`;
  }

  // ============================================================
  // DYNAMIC GREETING
  // ============================================================

  const dynamicGreeting =
    useMemo(() => {
      if (completedPrayers === 5) {
        return {
          ar: "الحمد لله",
          en: "All prayers completed today",
        };
      }

      if (isRamadan) {
        return {
          ar: "رمضان مبارك",
          en: "Ramadan Mubarak",
        };
      }

      if (isFriday) {
        return {
          ar: "جمعة مباركة",
          en: "Jumu'ah Mubarak",
        };
      }

      return {
        ar: "السلام عليكم",
        en: "Assalamu Alaikum",
      };
    }, [
      completedPrayers,
      isFriday,
      isRamadan,
    ]);

  // ============================================================
  // ACHIEVEMENT
  // ============================================================

  const subtleAchievement =
    useMemo(() => {
      if (streak === 7) {
        return "First perfect week. Alhamdulillah.";
      }

      if (streak === 30) {
        return "30 consecutive days. Alhamdulillah.";
      }

      return null;
    }, [streak]);

  // ============================================================
  // PRAYER WINDOW PROGRESS
  // ============================================================

  const prayerWindows =
    useMemo(() => {
      if (!rawTimings) return {};

      const parseTime = (
        timeStr
      ) => {
        if (!timeStr) return null;

        const [time] =
          timeStr.split(" ");

        const [hours, mins] =
          time
            .split(":")
            .map(Number);

        const d = new Date();

        d.setHours(
          hours,
          mins,
          0,
          0
        );

        return d;
      };

      const times = {
        fajr: parseTime(
          rawTimings.Fajr
        ),
        sunrise: parseTime(
          rawTimings.Sunrise
        ),
        dhuhr: parseTime(
          rawTimings.Dhuhr
        ),
        asr: parseTime(
          rawTimings.Asr
        ),
        maghrib: parseTime(
          rawTimings.Maghrib
        ),
        isha: parseTime(
          rawTimings.Isha
        ),
        midnight: parseTime(
          rawTimings.Midnight
        ),
      };

      // Handle midnight crossing
      // into the next day.
      if (
        times.midnight &&
        times.isha &&
        times.midnight <
          times.isha
      ) {
        times.midnight.setDate(
          times.midnight.getDate() +
            1
        );
      }

      const getWindow = (
        start,
        end
      ) => {
        if (!start || !end) {
          return null;
        }

        const total =
          end.getTime() -
          start.getTime();

        const elapsed =
          currentTime.getTime() -
          start.getTime();

        const remaining =
          end.getTime() -
          currentTime.getTime();

        if (
          currentTime < start
        ) {
          return {
            status: "upcoming",
            percent: 0,
            minsLeft: null,
          };
        }

        if (
          currentTime > end
        ) {
          return {
            status: "closed",
            percent: 100,
            minsLeft: 0,
          };
        }

        return {
          status: "open",
          percent: Math.min(
            100,
            Math.max(
              0,
              (elapsed /
                total) *
                100
            )
          ),
          minsLeft:
            Math.ceil(
              remaining /
                60000
            ),
        };
      };

      return {
        fajr: getWindow(
          times.fajr,
          times.sunrise
        ),

        dhuhr: getWindow(
          times.dhuhr,
          times.asr
        ),

        asr: getWindow(
          times.asr,
          times.maghrib
        ),

        maghrib: getWindow(
          times.maghrib,
          times.isha
        ),

        isha: getWindow(
          times.isha,
          times.midnight ||
            new Date(
              times.isha.getTime() +
                8 *
                  3600000
            )
        ),
      };
    }, [
      rawTimings,
      currentTime,
    ]);

  // ============================================================
  // END OF DAY
  // ============================================================

  const ishaLogged =
    log?.prayers?.isha &&
    log.prayers.isha !==
      "none";

  const showEOD =
    !loading &&
    !isExempt &&
    log &&
    (ishaLogged ||
      currentHour >= 20);

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#F9F9F7] dark:bg-background pb-28">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header
          className="relative overflow-hidden border-b border-emerald-900/[0.04] dark:border-emerald-100/[0.04] px-3 pb-6 bg-gradient-to-b from-white/95 to-[#F9F9F7]/95 dark:from-background/95 dark:to-background/90 backdrop-blur-xl transition-all duration-700"
          style={{
            paddingTop: "12px",
          }}
        >

          <div className="absolute -right-10 -top-10 opacity-[0.025] dark:opacity-[0.015] text-emerald-950 dark:text-emerald-100 pointer-events-none select-none transform -rotate-6">

            <svg
              width="220"
              height="220"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>

          </div>

          <div className="relative z-10 max-w-md mx-auto w-full flex flex-col mt-1">

            {/* Top row */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Moon
                  size={15}
                  className={
                    isFriday
                      ? "text-amber-800/60"
                      : "text-emerald-800/60 dark:text-emerald-300/60"
                  }
                  strokeWidth={2.5}
                />

                <h1
                  className={`text-sm font-bold tracking-wider uppercase opacity-80 ${
                    isFriday
                      ? "text-amber-800 dark:text-amber-400"
                      : "text-emerald-900 dark:text-emerald-400"
                  }`}
                >
                  {dateDisplay}
                </h1>

              </div>

              <div className="flex items-center gap-2">

                {/* Exempt badge */}

                {isExempt && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">

                    <Pause size={10} />

                    Exempt

                  </span>
                )}

                {/* Travel badge */}

                {isTravelMode && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">

                    <Plane size={10} />

                    Travel

                  </span>
                )}

                {/* SETTINGS BUTTON */}

                <button
                  onClick={() =>
                    navigate(
                      "/settings"
                    )
                  }
                  aria-label="Open Settings"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-transparent text-emerald-900/40 hover:bg-black/[0.04] dark:text-emerald-100/40 dark:hover:bg-white/10"
                >
                  <Settings
                    size={16}
                    strokeWidth={1.8}
                  />
                </button>

              </div>

            </div>

            {/* Greeting */}

            <div className="flex items-center justify-between mt-3 mb-1">

              <div className="flex flex-col items-start justify-start">

                <span
                  className={`text-[2.2rem] font-bold leading-none mb-1 tracking-tight select-none font-arabic ${
                    completedPrayers ===
                      5 ||
                    isFriday
                      ? "text-amber-800"
                      : "text-emerald-900 dark:text-emerald-200"
                  }`}
                  style={{
                    lineHeight:
                      "1.2",
                  }}
                >
                  {
                    dynamicGreeting.ar
                  }
                </span>

                <div className="flex flex-col gap-0.5">

                  <span
                    className={`text-md font-medium tracking-wide ${
                      completedPrayers ===
                        5 ||
                      isFriday
                        ? "text-amber-800/70"
                        : "text-emerald-900/60 dark:text-emerald-100/60"
                    }`}
                  >
                    {
                      dynamicGreeting.en
                    }
                  </span>

                  {subtleAchievement && (
                    <span className="text-xs font-medium text-emerald-700/50 dark:text-emerald-300/50 tracking-wide">
                      ✨{" "}
                      {
                        subtleAchievement
                      }
                    </span>
                  )}

                </div>

              </div>

            </div>

          </div>

        </header>

        {/* ======================================================
            OFFLINE
        ====================================================== */}

        <OfflineBanner />

        {/* ======================================================
            CELEBRATION
        ====================================================== */}

        {!loading && (
          <CelebrationBanner
            log={log}
            streak={streak}
          />
        )}

        {/* ======================================================
            WARNING
        ====================================================== */}

        {warning && (
          <div className="sticky top-[61px] z-30 px-4">

            <div className="max-w-md mx-auto mt-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm font-medium px-4 py-2.5 rounded-xl">

              ⏳ {warning}

            </div>

          </div>
        )}

        {/* ======================================================
            TRAVEL MODE
        ====================================================== */}

        {isTravelMode &&
          !loading && (
            <div className="px-4 pt-3">

              <div className="max-w-md mx-auto bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 rounded-2xl p-3.5 text-sm text-amber-800 dark:text-amber-400">

                <span className="font-semibold">
                  Travel Mode active.
                </span>{" "}
                Qasr (shortened prayers)
                and combining prayers is
                permissible.

              </div>

            </div>
          )}

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="max-w-md mx-auto px-4 pt-2 space-y-5">

          {/* Next prayer */}

          <NextPrayerHero
            rawTimings={rawTimings}
            calcMethod={
              settings.calculation_method
            }
            onQiblaOpen={() =>
              setQiblaOpen(true)
            }
            isFriday={isFriday}
          />

          {/* Intelligence */}

          {!loading &&
            allLogs.length > 0 && (
              <IntelligencePreviewCard
                logs={allLogs}
              />
            )}

          {/* ====================================================
              LOCATION
          ==================================================== */}

          {!settings.latitude && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">

              <MapPin
                size={17}
                className="text-emerald-700 dark:text-emerald-400 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">

                <p className="text-sm font-semibold text-foreground">
                  Enable Location
                </p>

                <p className="text-xs text-muted-foreground">
                  {locStatus ===
                  "error"
                    ? "Location permission was denied or unavailable"
                    : "For accurate local prayer times"}
                </p>

              </div>

              <button
                onClick={
                  handleLocation
                }
                disabled={
                  locStatus ===
                  "loading"
                }
                className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60"
              >

                {locStatus ===
                "loading" ? (
                  <>
                    <RefreshCw
                      size={12}
                      className="animate-spin"
                    />
                    Locating...
                  </>
                ) : locStatus ===
                  "success" ? (
                  "Enabled"
                ) : locStatus ===
                  "error" ? (
                  "Try Again"
                ) : (
                  "Allow"
                )}

              </button>

            </div>
          )}

          {/* ====================================================
              PRAYER CARDS
          ==================================================== */}

          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-3xl bg-gray-100/50 dark:bg-white/5 animate-pulse"
                  />
                ))
            : PRAYERS.map(
                (prayer) => (
                  <div
                    key={prayer}
                    id={`prayer-card-${prayer}`}
                    className="space-y-2"
                  >

                    <PrayerCard
                      prayer={prayer}
                      isFriday={
                        isFriday
                      }
                      status={
                        log?.prayers?.[
                          prayer
                        ] ||
                        "none"
                      }
                      prayerTime={
                        prayerTimes[
                          prayer
                        ]
                      }
                      rawPrayerTime={
                        rawTimings
                          ? rawTimings[
                              prayer
                                .charAt(
                                  0
                                )
                                .toUpperCase() +
                                prayer.slice(
                                  1
                                )
                            ]
                          : undefined
                      }
                      windowProgress={
                        prayerWindows[
                          prayer
                        ]
                      }
                      jamaah={
                        log?.jamaah?.[
                          prayer
                        ] ||
                        false
                      }
                      onJamaahToggle={
                        toggleJamaah
                      }
                      completionMethod={
                        log
                          ?.completion_method?.[
                          prayer
                        ] ||
                        null
                      }
                      onCompletionMethodChange={(
                        method
                      ) =>
                        setCompletionMethod &&
                        setCompletionMethod(
                          prayer,
                          method
                        )
                      }
                      quality={
                        log?.quality?.[
                          prayer
                        ] || {}
                      }
                      missedReason={
                        log?.missed_reasons?.[
                          prayer
                        ] || ""
                      }
                      isExempt={
                        isExempt
                      }
                      onStatusChange={
                        handleSetPrayerStatus
                      }
                      onQualitySave={
                        saveQuality
                      }
                      onMissedReasonSave={
                        saveMissedReason
                      }
                    />

                    {/* Missed recovery prompt */}

                    {missedPromptPrayer ===
                      prayer && (
                      <div className="flex items-center justify-between bg-white dark:bg-white/5 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3 shadow-sm mx-1 animate-in fade-in slide-in-from-top-2">

                        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          Add 1 Qaza?
                        </span>

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              setMissedPromptPrayer(
                                null
                              )
                            }
                            className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          >
                            Later
                          </button>

                          <button
                            onClick={() => {
                              if (
                                adjust
                              ) {
                                adjust(
                                  prayer,
                                  1
                                );
                              }

                              setMissedPromptPrayer(
                                null
                              );
                            }}
                            className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-sm"
                          >
                            Yes
                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                )
              )}

          {/* ====================================================
              RECOVERY
          ==================================================== */}

          {!loading &&
            !isExempt &&
            log &&
            (
              Object.values(
                log.prayers || {}
              ).filter(
                (v) =>
                  v ===
                  "missed"
              ).length >
                0 ||
              Object.values(
                log.prayers || {}
              ).some(
                (s) =>
                  s ===
                  "none"
              )
            ) && (
              <RecoveryCard
                log={log}
                prayerTimes={
                  prayerTimes
                }
                qazaTotal={
                  qazaTotal
                }
                isFriday={
                  isFriday
                }
              />
            )}

          {/* ====================================================
              RAMADAN
          ==================================================== */}

          {!loading &&
            log && (
              <RamadanSection
                log={log}
                quranGoal={
                  settings.quran_daily_goal ||
                  2
                }
                onToggleTaraweeh={
                  toggleTaraweeh
                }
                onUpdateQuranPages={
                  updateQuranPages
                }
              />
            )}

          {/* ====================================================
              NAWAFIL
          ==================================================== */}

          {!loading && (
            <NawafilSection
              nawafil={
                log?.nawafil ||
                {}
              }
              onToggle={
                toggleNawafil
              }
              isFriday={
                isFriday
              }
            />
          )}

          {/* ====================================================
              END OF DAY
          ==================================================== */}

          {showEOD && (
            <EndOfDayReflectionCard
              log={log}
              todayStr={
                todayStr
              }
            />
          )}

        </div>

        {/* ======================================================
            QIBLA
        ====================================================== */}

        <QiblaCompass
          open={qiblaOpen}
          onClose={() =>
            setQiblaOpen(false)
          }
          latitude={
            settings.latitude
          }
          longitude={
            settings.longitude
          }
        />

      </div>

      {/* ========================================================
          BOTTOM NAV
      ======================================================== */}

      <BottomNav
        isFriday={isFriday}
      />

    </>
  );
}
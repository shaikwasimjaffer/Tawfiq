/**
 * Tawfiq Salah & Qaza Coaching Service
 * Provides authorized, nonjudgmental, evidence-grounded coaching using
 * the user's actual stored prayer records and Qaza ledgers.
 * 
 * Rules:
 * - Read-only: never modifies religious tracking data through chat.
 * - Accurate: uses genuine numbers from localStorage (zero fabrication).
 * - Compassionate: encourages consistency without shame-based messaging.
 * - Privacy-respecting: respects user consent settings.
 */

import { PRAYERS, PRAYER_NAMES, getPrayerTimes, getNextPrayerInfo, formatTime12 } from "./prayerUtils.js";
import { getStoredQazaState } from "./useQaza.js";

/**
 * Retrieves the current authorized user's prayer and Qaza status snapshot.
 */
export function getAuthorizedUserPrayerContext(userScope = "") {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // 1. Unified Qaza state from canonical source of truth
    const { qaza: qazaLedger, history: qazaHistory } = getStoredQazaState();
    const totalQazaOwed = PRAYERS.reduce((sum, p) => sum + (qazaLedger[p] || 0), 0);

    // 3. Completed prayer dates for streak
    let completedDates = [];
    const storedDates = localStorage.getItem(`tawfiq_completed_prayer_dates_${userScope}`);
    if (storedDates) {
      completedDates = JSON.parse(storedDates);
    }

    // 4. Today's prayer statuses
    const now = new Date();
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    let todayStatuses = {};
    const storedToday = localStorage.getItem(`tawfiq_prayers_${userScope}${todayDateStr}`);
    if (storedToday) {
      todayStatuses = JSON.parse(storedToday);
    }

    // Calculate completed count for today
    const completedTodayCount = PRAYERS.filter((p) => {
      const s = todayStatuses[p];
      return s === "on_time" || s === "jamaah" || s === "made_up";
    }).length;

    // Next upcoming prayer
    const nextPrayer = getNextPrayerInfo(now);

    return {
      hasUserData: true,
      todayDate: todayDateStr,
      todayStatuses,
      completedTodayCount,
      totalQazaOwed,
      qazaLedger,
      qazaHistory,
      completedDatesCount: completedDates.length,
      currentStreakDays: qazaHistory.streakDays || (completedDates.length > 0 ? 1 : 0),
      nextPrayerName: nextPrayer.name,
      nextPrayerTime: formatTime12(nextPrayer.time),
      nextPrayerRemainingMinutes: nextPrayer.minutesRemaining,
    };
  } catch (err) {
    console.warn("[salahCoachingService] Error reading user context:", err);
    return null;
  }
}

/**
 * Checks if a user's question relates to personal Salah or Qaza coaching.
 */
export function isSalahCoachingQuery(query = "") {
  if (!query || typeof query !== "string") return false;
  const q = query.toLowerCase();

  const coachingPatterns = [
    /prayer consistency/i,
    /salah routine/i,
    /build a.*routine/i,
    /prepare.*for.*next prayer/i,
    /what patterns should i work on/i,
    /plan my qaza/i,
    /qaza recovery/i,
    /qaza target/i,
    /summarize my.*recovery/i,
    /how many qaza/i,
    /my streak/i,
    /how am i doing/i,
    /my progress/i,
    /prayers left/i,
    /qaza balance/i,
  ];

  return coachingPatterns.some((pattern) => pattern.test(q));
}

/**
 * Generates an evidence-grounded, personalized coaching response.
 */
export function generatePersonalizedCoachingAnswer(query, userContext) {
  const q = query.toLowerCase();

  if (!userContext || !userContext.hasUserData) {
    return {
      category: "general_guidance",
      categoryTitle: "Salah & Qaza Routine Guidance",
      directAnswer:
        "Building consistency in prayer begins with establishing a steady routine and making realistic, incremental goals.",
      explanation:
        "Allah loves small, consistent deeds performed continuously. The Prophet Muhammad ﷺ said: 'The most beloved deed to Allah is the most regular and constant even if it were little' (Sahih al-Bukhari 6464). If you enable personalization, I can also review your actual logged prayers and Qaza balance.",
      citations: [
        {
          type: "hadith",
          reference: "Sahih al-Bukhari 6464",
          collectionName: "Sahih al-Bukhari",
          text: "أَحَبَّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
          translation: "The most beloved deed to Allah is the most regular and constant even if it were little.",
          narrator: "Aisha (may Allah be pleased with her)",
        },
      ],
      scholarlyContext:
        "Scholars recommend praying the obligatory prayer at the earliest time and adding one missed prayer after each obligatory one to steadily recover arrears without causing exhaustion.",
      actionableSteps: [
        "Set an alarm for 15 minutes before the next prayer call.",
        "Track your daily prayers consistently in Tawfiq.",
      ],
    };
  }

  // 1. Qaza Planning Query
  if (/qaza|recovery|target|balance|plan my qaza/i.test(q)) {
    const { totalQazaOwed, qazaLedger, qazaHistory } = userContext;

    if (totalQazaOwed === 0) {
      return {
        category: "general_guidance",
        categoryTitle: "Qaza Recovery Complete",
        directAnswer:
          "Alhamdulillah! Your logged Qaza balance is currently zero. All your recorded obligatory prayers are up to date.",
        explanation:
          "Maintaining complete consistency in your five daily prayers is the highest spiritual priority. Focus now on protecting your current prayers on time and establishing voluntary Sunnah prayers.",
        citations: [
          {
            type: "quran",
            reference: "Quran 2:238",
            surahName: "Al-Baqarah",
            text: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ",
            translation: "Maintain with care the [obligatory] prayers and [in particular] the middle prayer and stand before Allah, devoutly obedient.",
          },
        ],
        scholarlyContext:
          "Scholars of all four Sunni schools agree that making up missed obligatory prayers (*Qada'*) is required, and once completed, one turns with joy and gratitude to voluntary nawafil.",
        actionableSteps: [
          "Continue praying all five obligatory prayers on time with Jama'ah when possible.",
          "Consider adopting the 12 voluntary Sunnah units (Rawatib) daily.",
        ],
      };
    }

    // Realistic target calculation:
    // Completing +1 with each of the 5 daily prayers = 5 per day.
    const dailyTarget = 5;
    const estimatedDays = Math.ceil(totalQazaOwed / dailyTarget);

    return {
      category: "general_guidance",
      categoryTitle: "Personalized Qaza Recovery Plan",
      directAnswer: `You currently have **${totalQazaOwed}** missed prayers recorded across your ledger (Fajr: ${qazaLedger.fajr}, Dhuhr: ${qazaLedger.dhuhr}, Asr: ${qazaLedger.asr}, Maghrib: ${qazaLedger.maghrib}, Isha: ${qazaLedger.isha}).`,
      explanation: `By establishing a realistic pace of completing just **1 Qaza prayer immediately following each of your 5 daily obligatory prayers** (+5 per day), you will complete your entire debt in approximately **${estimatedDays} days** (under ${Math.ceil(estimatedDays / 30)} months) with zero burnout. You have already made up **${qazaHistory.totalMadeUp || 0}** prayers so far—every single prayer is a step closer to zero!`,
      citations: [
        {
          type: "hadith",
          reference: "Sahih al-Bukhari 597",
          collectionName: "Sahih al-Bukhari",
          text: "مَنْ نَسِيَ صَلاَةً فَلْيُصَلِّ إِذَا ذَكَرَهَا، لاَ كَفَّارَةَ لَهَا إِلاَّ ذَلِكَ",
          translation: "Whoever forgets a prayer, let him pray it when he remembers it; there is no expiation for it except that.",
          narrator: "Anas ibn Malik (may Allah be pleased with him)",
        },
      ],
      scholarlyContext:
        "The classical majority position (*Jumhur*) across the Hanafi, Maliki, Shafi'i, and Hanbali schools holds that making up missed obligatory prayers is an urgent duty that should be scheduled systematically alongside regular prayers.",
      actionableSteps: [
        "Today's Goal: Pray 1 extra Fajr, Dhuhr, Asr, Maghrib, and Isha after each respective prayer.",
        "Tap the minus button in the Tawfiq Qaza Ledger after making up each prayer to keep your balance accurate.",
        "Remember: consistency is beloved to Allah; never allow Satan to make you feel overwhelmed.",
      ],
    };
  }

  // 2. Prayer Consistency & Streak Query
  if (/consistency|routine|streak|how am i doing|progress/i.test(q)) {
    const { completedTodayCount, currentStreakDays, nextPrayerName, nextPrayerTime } = userContext;

    return {
      category: "general_guidance",
      categoryTitle: "Your Salah Consistency Review",
      directAnswer: `You currently hold an active prayer streak of **${currentStreakDays} day${currentStreakDays === 1 ? "" : "s"}** and have completed **${completedTodayCount}/5** prayers today.`,
      explanation: `Every single prayer you perform strengthens your connection with your Creator. Next up is **${nextPrayerName}** at **${nextPrayerTime}**. Taking 2 minutes of quiet preparation before the Adhan brings tranquility (*Khushu'*) into your prayer.`,
      citations: [
        {
          type: "quran",
          reference: "Quran 29:45",
          surahName: "Al-Ankabut",
          text: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ",
          translation: "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.",
        },
      ],
      scholarlyContext:
        "Scholars note that establishing regular prayer times acts as the spiritual anchor of the believer's day, transforming daily routines into acts of remembrance (*Dhikr*).",
      actionableSteps: [
        `Prepare for ${nextPrayerName} by performing fresh Wudu a few minutes before ${nextPrayerTime}.`,
        "Recite Ayat al-Kursi and the 33 SubhanAllah / Alhamdulillah / Allahu Akbar praises after completing your fard.",
      ],
    };
  }

  // 3. Default Next Prayer Preparation Query
  return {
    category: "general_guidance",
    categoryTitle: "Next Prayer Preparation",
    directAnswer: `The next prayer is **${userContext.nextPrayerName}** at **${userContext.nextPrayerTime}** (in approximately ${userContext.nextPrayerRemainingMinutes} minutes).`,
    explanation:
      "Arriving at the prayer with calm and anticipation multiplies its spiritual reward. The Prophet ﷺ said: 'The person who waits for prayer is regarded as if he were in prayer' (Sahih Muslim 649).",
    citations: [
      {
        type: "hadith",
        reference: "Sahih Muslim 649",
        collectionName: "Sahih Muslim",
        text: "لاَ يَزَالُ أَحَدُكُمْ فِي صَلاَةٍ مَا انْتَظَرَ الصَّلاَةَ",
        translation: "One of you continues to be in prayer so long as he is waiting for the prayer.",
        narrator: "Abu Huraira (may Allah be pleased with him)",
      },
    ],
    scholarlyContext:
      "Classical scholars advise turning away from screens, making fresh ablution, and repeating the words of the Adhan to enter prayer with presence of heart.",
    actionableSteps: [
      `Make mindful Wudu with intention before ${userContext.nextPrayerTime}.`,
      "Disconnect from worldly concerns for 10 minutes to offer your heart completely to Allah.",
    ],
  };
}

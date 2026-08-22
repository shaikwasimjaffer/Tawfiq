import { useEffect, useMemo, useState } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dhikrHadiths } from "@/data/dhikrHadiths";
import DhikrCounter from "@/components/dhikr/DhikrCounter";
import DhikrSelector from "@/components/dhikr/DhikrSelector";
import GoalSelector from "@/components/dhikr/GoalSelector";
import ProgressBar from "@/components/dhikr/ProgressBar";
import Statistics from "@/components/dhikr/Statistics";
import BottomNav from "@/components/BottomNav"; // adjust path if BottomNav lives elsewhere

const STORAGE_KEY = "tawfiq_dhikr";

const DEFAULT_DHIKR = "SubhanAllah";

const DEFAULT_GOAL = 33;

const DHIKR_OPTIONS = [
  "SubhanAllah",
  "Alhamdulillah",
  "Allahu Akbar",
  "La ilaha illallah",
  "Astaghfirullah",
  "Allahumma Salli Ala Muhammad",
];

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function Dhikr() {
  const navigate = useNavigate();
  const [selectedDhikr, setSelectedDhikr] = useState(DEFAULT_DHIKR);

  const [goal, setGoal] = useState(DEFAULT_GOAL);

  const [count, setCount] = useState(0);

  const [dailyCount, setDailyCount] = useState(0);

  const [lifetimeCount, setLifetimeCount] = useState(0);

  const [sessionCount, setSessionCount] = useState(0);

  const [hadithIndex, setHadithIndex] = useState(
    Math.floor(Math.random() * dhikrHadiths.length),
  );

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) return;

    const today = todayString();

    setSelectedDhikr(saved.selectedDhikr || DEFAULT_DHIKR);

    setGoal(saved.goal || DEFAULT_GOAL);

    setCount(saved.count || 0);

    setLifetimeCount(saved.lifetimeCount || 0);

    if (saved.date === today) {
      setDailyCount(saved.dailyCount || 0);
    } else {
      setDailyCount(0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedDhikr,
        goal,
        count,
        dailyCount,
        lifetimeCount,
        date: todayString(),
      }),
    );
  }, [selectedDhikr, goal, count, dailyCount, lifetimeCount]);

  function loadRandomHadith() {
    let random;

    do {
      random = Math.floor(Math.random() * dhikrHadiths.length);
    } while (random === hadithIndex && dhikrHadiths.length > 1);

    setHadithIndex(random);
  }

  function increment() {
    navigator.vibrate?.(20);

    setCount((prev) => {
      const next = prev + 1;

      if (next % 33 === 0) {
        loadRandomHadith();
      }

      return next;
    });

    setDailyCount((d) => d + 1);

    setLifetimeCount((l) => l + 1);

    setSessionCount((s) => s + 1);
  }

  function resetCounter() {
    if (!window.confirm("Reset current counter?")) return;

    setCount(0);

    setSessionCount(0);
  }

  const progress = useMemo(() => {
    return Math.min((count / goal) * 100, 100);
  }, [count, goal]);

  const completed = count >= goal;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-5 flex items-center">
        <button
          onClick={() => navigate("/today")}
          className="p-2 rounded hover:bg-emerald-50/30 transition-colors text-emerald-600 hover:text-emerald-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-3xl font-bold">Dhikr</h1>
        <div className="w-8"> {/* spacer to balance button width */} </div>
      </header>

      <p className="text-muted-foreground text-center px-6 mt-2">
        Remember Allah throughout your day.
      </p>

      <main className="max-w-md mx-auto px-4 py-6 pb-28 space-y-6">
        <DhikrSelector
          options={DHIKR_OPTIONS}
          value={selectedDhikr}
          onChange={setSelectedDhikr}
        />

        <DhikrCounter
          dhikr={selectedDhikr}
          count={count}
          goal={goal}
          onTap={increment}
          onReset={resetCounter}
        />

        <GoalSelector goal={goal} onChange={setGoal} />

        <ProgressBar
          value={count}
          goal={goal}
          progress={progress}
          completed={completed}
        />

        <Statistics
          daily={dailyCount}
          session={sessionCount}
          lifetime={lifetimeCount}
        />

        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-700">
                DAILY REMINDER
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-1">
                Hadith of the Day
              </h2>
            </div>

            <button
              onClick={loadRandomHadith}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition"
            >
              <RefreshCw size={16} />
              New
            </button>
          </div>

          <blockquote className="italic text-[15px] leading-7 text-zinc-700">
            "{dhikrHadiths[hadithIndex].text}"
          </blockquote>

          <div className="mt-5 pt-4 border-t border-emerald-100">
            <span className="text-sm font-semibold text-emerald-700">
              {dhikrHadiths[hadithIndex].source}
            </span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
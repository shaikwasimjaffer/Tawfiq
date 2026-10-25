import React, { useState } from "react";
import { X, CheckCircle2, Layers, Calendar } from "lucide-react";
import { PRAYER_DISPLAY_NAMES } from "@/lib/qazaEngine";

export default function BatchLogModal({
  isOpen,
  onClose,
  activePrayers = [],
  onLogBatch,
}) {
  const [counts, setCounts] = useState(() => {
    const init = {};
    activePrayers.forEach((p) => (init[p] = 0));
    return init;
  });
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  function handleSetCount(prayerKey, val) {
    const n = Math.max(0, parseInt(val, 10) || 0);
    setCounts((prev) => ({ ...prev, [prayerKey]: n }));
  }

  function handleQuickSetFullDays(days) {
    const next = {};
    activePrayers.forEach((p) => (next[p] = days));
    setCounts(next);
  }

  const totalBatchCount = Object.values(counts).reduce((a, b) => a + b, 0);

  function handleSubmit() {
    if (totalBatchCount <= 0) {
      alert("Please enter at least one prayer count to log.");
      return;
    }

    const items = [];
    activePrayers.forEach((p) => {
      if (counts[p] > 0) {
        items.push({ prayer: p, count: counts[p] });
      }
    });

    onLogBatch(items, {
      localDate: completionDate,
      notes: notes || "Batch completion entry",
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />
      <div className="relative bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 text-left space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <span className="text-[11px] font-bold text-[#134D37] dark:text-emerald-400 uppercase tracking-wider">
              Batch Entry
            </span>
            <h3 className="text-lg font-serif font-bold text-foreground mt-0.5">
              Log Multiple Completed Qaza
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Day Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground block">
            Quick Fill Presets:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleQuickSetFullDays(d)}
                className="py-1.5 px-2 bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold rounded-xl border border-border transition-all cursor-pointer"
              >
                +{d} Full Day{d > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Per-Prayer Inputs */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Prayer Counts:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {activePrayers.map((p) => (
              <div
                key={p}
                className="p-2.5 rounded-xl bg-secondary/40 border border-border flex items-center justify-between"
              >
                <span className="font-bold text-foreground">
                  {PRAYER_DISPLAY_NAMES[p]}:
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={counts[p] || ""}
                  onChange={(e) => handleSetCount(p, e.target.value)}
                  placeholder="0"
                  className="w-14 text-center font-bold bg-background border border-border rounded-lg py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Calendar size={14} /> Date performed:
          </span>
          <input
            type="date"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            className="bg-background border border-border rounded-xl px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#134D37]"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div className="text-xs">
            <span className="text-muted-foreground block">Total prayers:</span>
            <strong className="text-sm font-bold text-foreground">{totalBatchCount}</strong>
          </div>
          <button
            type="button"
            disabled={totalBatchCount <= 0}
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-[#134D37] hover:bg-[#0E3D2B] disabled:opacity-40 text-white text-xs font-semibold rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 size={14} />
            <span>Record {totalBatchCount} Prayers</span>
          </button>
        </div>
      </div>
    </div>
  );
}

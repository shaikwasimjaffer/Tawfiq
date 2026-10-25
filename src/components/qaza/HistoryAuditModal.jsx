import React from "react";
import { X, RotateCcw, CheckCircle2, History, AlertCircle } from "lucide-react";
import { PRAYER_DISPLAY_NAMES } from "@/lib/qazaEngine";

export default function HistoryAuditModal({
  isOpen,
  onClose,
  historyLogs = [],
  onUndo,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />
      <div className="relative bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl z-10 text-left flex flex-col max-h-[85vh] overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-[#134D37] dark:text-emerald-400">
              <History size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Auditable Event Ledger
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-foreground mt-0.5">
              Qaza Activity & Reversals
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

        {/* Audit explanation */}
        <p className="text-xs text-muted-foreground leading-relaxed shrink-0">
          Every prayer logged or corrected is preserved in an immutable event ledger. Reversals create explicit offset entries rather than destructively erasing history.
        </p>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
          {historyLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No Qaza activity recorded yet.
            </div>
          ) : (
            historyLogs.map((item, idx) => {
              const isCompleted = item.type === "completed";
              const isReversed = Boolean(item.isReversed);
              const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "";
              const timeStr = item.timestamp
                ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";

              return (
                <div
                  key={item.id || idx}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                    isReversed
                      ? "opacity-50 bg-secondary/30 border-border line-through"
                      : isCompleted
                      ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40"
                      : "bg-secondary/40 border-border"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={14} /> : <History size={14} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <span>
                          {isCompleted ? "Prayed" : "Estimate Adj."}: {PRAYER_DISPLAY_NAMES[item.prayer] || item.prayer}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          ({item.count > 0 ? `+${item.count}` : item.count})
                        </span>
                      </div>
                      <span className="text-[10.5px] text-muted-foreground">
                        {dateStr} at {timeStr}
                        {isReversed && " • (Reversed)"}
                      </span>
                    </div>
                  </div>

                  {/* Undo Button on most recent active entry */}
                  {idx === 0 && !isReversed && (
                    <button
                      type="button"
                      onClick={() => onUndo()}
                      className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                      title="Undo this action"
                    >
                      <RotateCcw size={11} />
                      <span>Undo</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

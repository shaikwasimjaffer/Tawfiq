import React, { useMemo } from "react";

/**
 * QiblaDegreeRuler
 *
 * Professional horizontal compass heading tape ruler for Live AR Finder.
 * Features:
 * - High-precision real-time heading tape with smooth wraparound across 0°/360° boundary.
 * - Prominent Kaaba beacon target pin that slides directly on the tape.
 * - Clear cardinal direction indicators (N, NE, E, SE, S, SW, W, NW).
 * - Fixed center reticle hairline needle showing exact current heading.
 * - Out-of-view directional arrow pointers when Kaaba is beyond ±45° tape viewport.
 * - Independent layout footprint - guaranteed zero overlap with other UI elements.
 */
export default function QiblaDegreeRuler({ heading = 0, qiblaBearing = 0, isAligned = false }) {
  // Safe numeric values
  const safeHeading = typeof heading === "number" && Number.isFinite(heading) ? heading : 0;
  const safeBearing = typeof qiblaBearing === "number" && Number.isFinite(qiblaBearing) ? qiblaBearing : 0;

  // Calculate shortest difference from current heading to Kaaba bearing [-180, 180]
  const kaabaDiff = useMemo(() => {
    return ((safeBearing - safeHeading + 540) % 360) - 180;
  }, [safeBearing, safeHeading]);

  // Compute visible graduation marks for the tape (span of ±45° around heading)
  const ticks = useMemo(() => {
    const list = [];
    const span = 45;
    const startDeg = Math.floor((safeHeading - span) / 5) * 5;
    const endDeg = Math.ceil((safeHeading + span) / 5) * 5;

    for (let d = startDeg; d <= endDeg; d += 5) {
      const normalized = ((d % 360) + 360) % 360;
      const diff = ((normalized - safeHeading + 540) % 360) - 180;

      if (Math.abs(diff) <= span) {
        // Position percentage: 5% (diff = -45) to 95% (diff = +45)
        const leftPercent = 50 + (diff / span) * 45;
        const isMajor = normalized % 15 === 0;
        const isCardinal = [0, 90, 180, 270].includes(normalized);
        const isIntercardinal = [45, 135, 225, 315].includes(normalized);

        let label = null;
        if (normalized === 0) label = "N";
        else if (normalized === 90) label = "E";
        else if (normalized === 180) label = "S";
        else if (normalized === 270) label = "W";
        else if (normalized === 45) label = "NE";
        else if (normalized === 135) label = "SE";
        else if (normalized === 225) label = "SW";
        else if (normalized === 315) label = "NW";
        else if (normalized % 30 === 0) label = `${normalized}°`;

        list.push({
          deg: normalized,
          diff,
          leftPercent,
          isMajor,
          isCardinal,
          isIntercardinal,
          label,
        });
      }
    }
    return list;
  }, [safeHeading]);

  const isKaabaVisibleOnTape = Math.abs(kaabaDiff) <= 45;
  const kaabaLeftPercent = 50 + (kaabaDiff / 45) * 45;

  return (
    <div
      className={`relative w-full max-w-[320px] mx-auto h-12 rounded-2xl bg-black/75 backdrop-blur-md border px-2 select-none shadow-lg transition-colors duration-300 overflow-hidden flex flex-col justify-between ${
        isAligned
          ? "border-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.35)]"
          : "border-white/20"
      }`}
      aria-label={`Compass heading tape: ${Math.round(safeHeading)} degrees`}
    >
      {/* Tape viewport layer with edge fade masks */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-black/90 via-transparent to-black/90" />

      {/* Fixed Center Reticle Needle Indicator */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
        {/* Top needle triangle */}
        <div
          className={`w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[7px] ${
            isAligned ? "border-t-emerald-300" : "border-t-emerald-400"
          }`}
        />
        {/* Vertical center hairline */}
        <div
          className={`w-0.5 flex-1 ${
            isAligned
              ? "bg-emerald-300 shadow-[0_0_10px_#6ee7b7]"
              : "bg-emerald-400/80 shadow-[0_0_6px_#34d399]"
          }`}
        />
      </div>

      {/* Sliding Graduation Marks & Labels */}
      <div className="relative w-full h-7 overflow-hidden mt-1">
        {ticks.map((t) => (
          <div
            key={`${t.deg}-${t.diff}`}
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none will-change-transform"
            style={{ left: `${t.leftPercent}%` }}
          >
            {/* Tick Mark */}
            <div
              className={`w-[1px] ${
                t.isCardinal
                  ? "h-2.5 bg-emerald-400"
                  : t.isMajor
                  ? "h-2 bg-white/70"
                  : "h-1.5 bg-white/30"
              }`}
            />
            {/* Degree / Cardinal Label */}
            {t.label && (
              <span
                className={`text-[9.5px] leading-none mt-1 font-mono tracking-tight ${
                  t.deg === 0
                    ? "font-extrabold text-emerald-400"
                    : t.isCardinal
                    ? "font-bold text-stone-200"
                    : t.isIntercardinal
                    ? "font-medium text-stone-400"
                    : "text-stone-500"
                }`}
              >
                {t.label}
              </span>
            )}
          </div>
        ))}

        {/* Kaaba Beacon Marker on Tape */}
        {isKaabaVisibleOnTape && (
          <div
            className="absolute top-0 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-transform will-change-transform"
            style={{ left: `${kaabaLeftPercent}%` }}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shadow-md transition-all ${
                isAligned
                  ? "bg-emerald-400 text-black scale-110 ring-2 ring-emerald-300"
                  : "bg-amber-400 text-black scale-95"
              }`}
            >
              🕋
            </div>
            <div
              className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] -mt-0.5 ${
                isAligned ? "border-b-emerald-400" : "border-b-amber-400"
              }`}
            />
          </div>
        )}
      </div>

      {/* Bottom Sub-Tape Row: Current Heading & Off-screen Kaaba Pointers */}
      <div className="relative z-20 w-full flex items-center justify-between px-2 pb-0.5 text-[10px] font-mono">
        {/* Left off-screen Kaaba indicator */}
        <div className="w-14 text-left">
          {!isKaabaVisibleOnTape && kaabaDiff < -45 && (
            <span className="text-amber-400/90 font-bold flex items-center gap-0.5 animate-pulse">
              <span>◀ 🕋</span>
              <span className="text-[9px]">{Math.abs(Math.round(kaabaDiff))}°</span>
            </span>
          )}
        </div>

        {/* Center Current Heading Readout */}
        <div className="flex items-center gap-1">
          <span
            className={`font-bold tabular-nums tracking-wide ${
              isAligned ? "text-emerald-300" : "text-emerald-400"
            }`}
          >
            {Math.round(safeHeading)}°
          </span>
          {isAligned && (
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-1 rounded border border-emerald-500/50">
              Qibla
            </span>
          )}
        </div>

        {/* Right off-screen Kaaba indicator */}
        <div className="w-14 text-right">
          {!isKaabaVisibleOnTape && kaabaDiff > 45 && (
            <span className="text-amber-400/90 font-bold flex items-center justify-end gap-0.5 animate-pulse">
              <span className="text-[9px]">{Math.round(kaabaDiff)}°</span>
              <span>🕋 ▶</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

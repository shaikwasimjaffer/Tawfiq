import React from "react";

/**
 * Premium 3D Islamic Compass Icon
 * - High-resolution vector with dimensional lighting, beveled metallic ring,
 *   subtle inner compass dial, and faceted emerald directional needle.
 * - Genuinely 100% transparent background (no pill, no box, no outer container background).
 * - Primary color: Deep forest green (#153E2D / #1B4D38) with emerald highlights (#4EBA87 / #7FE8B6)
 *   and gold/brass compass needle tip.
 */
export default function Compass3DIcon({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Outer Beveled Metallic Ring Gradient */}
        <linearGradient id="compassRing" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4EBA87" />
          <stop offset="25%" stopColor="#2D6A4F" />
          <stop offset="55%" stopColor="#153E2D" />
          <stop offset="85%" stopColor="#0D281D" />
          <stop offset="100%" stopColor="#358B65" />
        </linearGradient>

        {/* Inner Bevel Specular Rim */}
        <linearGradient id="ringHighlight" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#34D399" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0.6" />
        </linearGradient>

        {/* Dial Face Subtle Radial Lighting */}
        <radialGradient id="dialFace" cx="38%" cy="32%" r="58%">
          <stop offset="0%" stopColor="#1F4D3A" />
          <stop offset="50%" stopColor="#123527" />
          <stop offset="85%" stopColor="#0B2319" />
          <stop offset="100%" stopColor="#061610" />
        </radialGradient>

        {/* North Needle: Vivid Emerald Facet */}
        <linearGradient id="needleNorthLight" x1="24" y1="7" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="45%" stopColor="#4EBA87" />
          <stop offset="100%" stopColor="#226444" />
        </linearGradient>

        <linearGradient id="needleNorthDark" x1="24" y1="7" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="45%" stopColor="#2A7652" />
          <stop offset="100%" stopColor="#0F3824" />
        </linearGradient>

        {/* South Needle: Pearl White / Muted Silver Facet */}
        <linearGradient id="needleSouthLight" x1="24" y1="41" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#DCE8E1" />
          <stop offset="100%" stopColor="#A6BAAF" />
        </linearGradient>

        <linearGradient id="needleSouthDark" x1="24" y1="41" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2EBE5" />
          <stop offset="60%" stopColor="#B3C4B9" />
          <stop offset="100%" stopColor="#7E9486" />
        </linearGradient>

        {/* Center Pivot Metallic Cap */}
        <radialGradient id="centerCap" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="45%" stopColor="#D97706" />
          <stop offset="90%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </radialGradient>

        {/* 3D Drop Shadow for Needle */}
        <filter id="needleShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0.8" dy="1.4" stdDeviation="1" floodColor="#020906" floodOpacity="0.65" />
        </filter>

        {/* Outer Ring Ambient Shadow */}
        <filter id="ringDepth" x="-20%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#04120C" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Main 3D Outer Ring with Shadow */}
      <g filter="url(#ringDepth)">
        {/* Outer Rim */}
        <circle cx="24" cy="24" r="21" fill="url(#compassRing)" stroke="#133C2A" strokeWidth="0.75" />
        {/* Specular Inner Rim */}
        <circle cx="24" cy="24" r="19.25" fill="none" stroke="url(#ringHighlight)" strokeWidth="0.85" />
        {/* Inner Dial Base */}
        <circle cx="24" cy="24" r="18" fill="url(#dialFace)" />
      </g>

      {/* Subtle Cardinal Tick Marks */}
      <g stroke="#6EE7B7" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round">
        {/* North Tick */}
        <line x1="24" y1="8.5" x2="24" y2="11.5" stroke="#A7F3D0" strokeWidth="1.25" />
        {/* South Tick */}
        <line x1="24" y1="36.5" x2="24" y2="39.5" />
        {/* East Tick */}
        <line x1="36.5" y1="24" x2="39.5" y2="24" />
        {/* West Tick */}
        <line x1="8.5" y1="24" x2="11.5" y2="24" />
      </g>

      {/* 3D Faceted Compass Needle */}
      <g filter="url(#needleShadow)">
        {/* North Needle - Left Facet */}
        <polygon points="24,7 20.2,24 24,24" fill="url(#needleNorthLight)" />
        {/* North Needle - Right Facet */}
        <polygon points="24,7 27.8,24 24,24" fill="url(#needleNorthDark)" />

        {/* South Needle - Left Facet */}
        <polygon points="24,41 20.2,24 24,24" fill="url(#needleSouthLight)" />
        {/* South Needle - Right Facet */}
        <polygon points="24,41 27.8,24 24,24" fill="url(#needleSouthDark)" />
      </g>

      {/* Center Brass/Gold Pivot Cap with Specular Ring */}
      <circle cx="24" cy="24" r="3.75" fill="url(#centerCap)" stroke="#FEF3C7" strokeWidth="0.5" strokeOpacity="0.7" />
      <circle cx="23.2" cy="23.2" r="1.1" fill="#FFFFFF" fillOpacity="0.85" />
    </svg>
  );
}

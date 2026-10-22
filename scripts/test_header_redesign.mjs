import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("▶ Running Tawfiq Header Redesign & Mentor Mode Entry Tests...\n");

// 1. Inspect TawfiqHeader.jsx
const headerPath = path.resolve("tawfiq-plus/src/components/TawfiqHeader.jsx");
const headerSrc = fs.readFileSync(headerPath, "utf-8");

// Change 1: "Enter Mentor Mode" green banner
assert(headerSrc.includes("Enter Mentor Mode"), 'TawfiqHeader must contain "Enter Mentor Mode" banner');
assert(headerSrc.includes('navigate("/mentor"'), 'Banner must navigate to /mentor');
assert(headerSrc.includes("bg-[#134D37]"), 'Banner must use Tawfiq signature green background');
console.log("✔ Test 1: 'Enter Mentor Mode' green banner implemented and interactive");

// Change 2: Arabic greeting & Hijri date removed from header
assert(!headerSrc.includes("السَّلَامُ عَلَيْكُمْ"), 'Arabic greeting removed from header');
assert(!headerSrc.includes("getHijriDate"), 'Redundant Hijri date presentation removed from header');
assert(!headerSrc.includes("TABS"), 'Segmented Tawfiq | Mentor toggle removed from header');
console.log("✔ Test 2: Crowded Arabic greeting, Hijri date, and segmented toggle removed from header");

// Change 3: Day Streak alignment
assert(headerSrc.includes("Flame"), 'Day Streak includes flame icon');
assert(headerSrc.includes("{currentStreak}"), 'Day Streak displays real currentStreak');
assert(headerSrc.includes("DAY STREAK"), 'Day Streak contains label');
assert(headerSrc.includes("flex items-center justify-center gap-1"), 'Flame and number centered together');
console.log("✔ Test 3: Day Streak number and flame icon centered as a unified group");

// Change 4 & 5: Component size standardization
assert(headerSrc.includes("h-[34px] sm:h-[36px]"), 'Compact header controls standardized to 34px/36px');
console.log("✔ Test 4: Compact controls standardized to consistent height and rounded pill styling");

// Change 6: Location control simplification
assert(!headerSrc.includes(">Change<"), 'Word "Change" removed from location control');
assert(headerSrc.includes("location.city"), 'Location pill displays city name');
assert(headerSrc.includes("MapPin"), 'Location pill includes MapPin icon');
assert(headerSrc.includes("handleOpenLocation"), 'Entire location pill (icon + city text) is interactive');
console.log("✔ Test 5: Location control simplified without 'Change' text; entire pill interactive");

// 2. Inspect PrayerDashboard.jsx
const dashboardPath = path.resolve("tawfiq-plus/src/pages/PrayerDashboard.jsx");
const dashboardSrc = fs.readFileSync(dashboardPath, "utf-8");

// Change 7: Removal of separate crowded quick-action strip
assert(!dashboardSrc.includes("<span>Azan</span>"), 'Standalone Azan pill removed from header');
assert(!dashboardSrc.includes("Configure Azan Audio Reciter"), 'Standalone Azan action removed from header row');
assert(dashboardSrc.includes("<TawfiqHeader"), 'PrayerDashboard embeds unified TawfiqHeader');
console.log("✔ Test 6: Crowded Qibla/Azan secondary strip removed; consolidated in modal & hero card");

// Change 8: Hero Card preserved
assert(dashboardSrc.includes("Next Namaz Hero Card"), 'Next Namaz Hero card preserved');
assert(dashboardSrc.includes("Obligatory Prayers"), 'Obligatory Prayers section preserved');
assert(dashboardSrc.includes("Mark Salah"), 'Mark Salah action preserved');
console.log("✔ Test 7: Next-prayer hero card and Obligatory Prayers section preserved intact");

// 3. Inspect AzanSettingsModal.jsx
const modalPath = path.resolve("tawfiq-plus/src/components/prayer/AzanSettingsModal.jsx");
const modalSrc = fs.readFileSync(modalPath, "utf-8");
assert(modalSrc.includes('initialTab = "location"'), 'AzanSettingsModal supports initialTab defaulting to location');
assert(modalSrc.includes("handleAutoDetectGPS"), 'GPS auto-detection preserved in modal');
assert(modalSrc.includes("handleSelectCityPreset"), 'City presets preserved in modal');
console.log("✔ Test 8: Unified settings modal provides location management, notifications, and Azan audio");

console.log("\n🎉 All Header Redesign & Mentor Mode Entry Tests Passed Successfully!\n");

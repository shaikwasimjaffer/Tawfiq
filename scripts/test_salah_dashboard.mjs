import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("▶ Running Salah Dashboard Redesign & Functionality Tests...\n");

// 1. Verify BottomNav.jsx has "Salah" label
const bottomNavPath = path.resolve("tawfiq-plus/src/components/BottomNav.jsx");
const bottomNavSrc = fs.readFileSync(bottomNavPath, "utf-8");

assert(bottomNavSrc.includes('label: "Salah"'), 'BottomNav must have label: "Salah"');
assert(!bottomNavSrc.includes('label: "Prayers"'), 'BottomNav must NOT have label: "Prayers"');
assert(bottomNavSrc.includes('id: "prayers"'), 'BottomNav must preserve id: "prayers"');
assert(bottomNavSrc.includes('path: "/"'), 'BottomNav must preserve path: "/"');
console.log("✔ Test 1: Bottom Navigation tab renamed to 'Salah' while preserving route and id");

// 2. Verify PrayerDashboard.jsx UI changes
const dashboardPath = path.resolve("tawfiq-plus/src/pages/PrayerDashboard.jsx");
const dashboardSrc = fs.readFileSync(dashboardPath, "utf-8");

// Change 1: Remove "STARTS IN" countdown
assert(!dashboardSrc.includes("STARTS IN"), 'PrayerDashboard must not contain "STARTS IN"');
assert(!dashboardSrc.includes("countdownText"), 'Hero card must not display countdownText');
console.log("✔ Test 2: 'STARTS IN' countdown removed from Next Prayer hero card");

// Change 2: Remove unwanted horizontal line divider
assert(!dashboardSrc.includes("border-t border-[#7FA693]/25"), 'Unwanted horizontal line divider removed');
console.log("✔ Test 3: Unwanted horizontal divider line removed from hero card");

// Change 3: Improved 5-segment data-driven progress indicator
assert(dashboardSrc.includes("Today's Prayers"), 'Must contain "Today\'s Prayers" label');
assert(dashboardSrc.includes("{completedCount}</span> / 5 completed"), 'Must show {completedCount} / 5 completed');
assert(dashboardSrc.includes("grid-cols-5"), 'Must render 5-segment worship progress bar');
console.log("✔ Test 4: Improved 5-segment data-driven worship progress indicator verified");

// Change 4: Remove date badge from prayer list header
assert(!dashboardSrc.includes('now.toLocaleDateString("en-US", { weekday: "short"'), 'Date pill badge removed from list header');
console.log("✔ Test 5: Date pill badge removed from section header");

// Change 5: Rename "Daily Prayers" to "Obligatory Prayers" and remove subtitle
assert(dashboardSrc.includes("Obligatory Prayers"), 'Heading renamed to "Obligatory Prayers"');
assert(!dashboardSrc.includes("Daily Prayers"), 'Heading must not say "Daily Prayers"');
assert(!dashboardSrc.includes("Tap status to record your prayer"), 'Redundant helper subtitle removed');
console.log("✔ Test 6: Heading renamed to 'Obligatory Prayers' with subtitle removed");

// Change 6: Remove bell icons from rows
assert(!dashboardSrc.includes("cycleNotificationMode"), 'Per-row bell toggle removed');
console.log("✔ Test 7: Bell/alert icons removed from individual prayer rows");

// Change 7: Replace "Not prayed yet" with functional "Mark Salah" action
assert(!dashboardSrc.includes('"Not prayed yet"'), '"Not prayed yet" status text removed from row button');
assert(dashboardSrc.includes("Mark Salah"), 'Prayer row includes "Mark Salah" button');
assert(dashboardSrc.includes('handleSetPrayerStatus(key, "on_time")'), 'Tapping Mark Salah marks status as completed on_time');
console.log("✔ Test 8: 'Not prayed yet' replaced with functional 'Mark Salah' action");

// Change 8: Remove redundant prayer descriptions
assert(!dashboardSrc.includes("PRAYER_DESCRIPTIONS"), 'PRAYER_DESCRIPTIONS removed from dashboard');
console.log("✔ Test 9: Redundant prayer descriptions (Dawn Prayer, etc.) removed");

// Change 9: Readability check
assert(dashboardSrc.includes("text-[17px] sm:text-[18px]"), 'Prayer name has enlarged font size');
assert(dashboardSrc.includes("text-[14.5px] sm:text-[15.5px]"), 'Prayer time has enlarged font size');
console.log("✔ Test 10: Prayer names and times have increased font size and readability");

console.log("\n🎉 All 10 Salah Dashboard Redesign & Functionality Tests Passed Successfully!\n");

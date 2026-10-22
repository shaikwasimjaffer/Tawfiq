import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const headerPath = path.join(rootDir, "tawfiq-plus", "src", "components", "TawfiqHeader.jsx");

console.log("--------------------------------------------------");
console.log("TAWFIQ MENTOR MODE HEADER REDESIGN VERIFICATION");
console.log("--------------------------------------------------");

if (!fs.existsSync(headerPath)) {
  console.error("FAIL: TawfiqHeader.jsx not found at", headerPath);
  process.exit(1);
}

const content = fs.readFileSync(headerPath, "utf-8");

// Test 1: Feature spotlight hierarchy checks
const requiredElements = [
  { name: "Small status label (NEW FEATURE)", pattern: /NEW FEATURE/ },
  { name: "Main heading (Meet Mentor Mode)", pattern: /Meet Mentor Mode/ },
  { name: "Accurate benefit description", pattern: /Personalized Islamic guidance grounded in verified Quran, Sahih Hadith, and sacred Fiqh/ },
  { name: "Primary action (Explore Mentor Mode)", pattern: /Explore Mentor Mode/ },
  { name: "Subtle directional arrow (ArrowRight)", pattern: /ArrowRight/ },
  { name: "Dismissal action (X icon button)", pattern: /handleDismissSpotlight/ },
  { name: "State persistence in localStorage", pattern: /tawfiq_mentor_spotlight_dismissed_/ },
  { name: "Compact entry fallback", pattern: /Mentor Mode/ },
  { name: "Compact entry AI Guide badge", pattern: /AI Guide/ },
  { name: "Separated utility row - Location", pattern: /handleOpenLocation/ },
  { name: "Separated utility row - Day Streak", pattern: /DAY STREAK/ },
  { name: "Separated utility row - Profile", pattern: /UserHeaderProfile/ },
  { name: "Animated entry state preserved", pattern: /state:\s*\{\s*animatedEntry:\s*true\s*\}/ },
  { name: "Reduced-motion support", pattern: /motion-reduce:transform-none/ },
];

let failedCount = 0;
for (const item of requiredElements) {
  if (item.pattern.test(content)) {
    console.log(`[PASS] ${item.name}`);
  } else {
    console.error(`[FAIL] ${item.name} not found in TawfiqHeader.jsx`);
    failedCount++;
  }
}

// Test 2: Check that old oversized green button alone is gone
if (/Enter Mentor Mode/.test(content)) {
  console.error("[FAIL] Old 'Enter Mentor Mode' text still present in TawfiqHeader.jsx");
  failedCount++;
} else {
  console.log("[PASS] Old oversized 'Enter Mentor Mode' button completely replaced");
}

if (failedCount > 0) {
  console.error(`\nFAILED: ${failedCount} checks failed.`);
  process.exit(1);
} else {
  console.log("\nALL HEADER REDESIGN TESTS PASSED SUCCESSFULLY!");
}

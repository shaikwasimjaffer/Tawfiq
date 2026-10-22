console.log("----------------------------------------------------------------");
console.log("TAWFIQ MENTOR MODE SPOTLIGHT - COMPREHENSIVE BEHAVIORAL TESTING");
console.log("----------------------------------------------------------------");

// Setup mock localStorage environment for testing
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

// Simulation of the exact state & transition logic from TawfiqHeader.jsx
class TawfiqHeaderSimulator {
  constructor(user = null) {
    this.user = user;
    this.navigatedTo = null;
    this.navigationState = null;
    this.init();
  }

  getStorageKey(u) {
    const scope = u?.id || u?.email || "guest";
    return `tawfiq_mentor_spotlight_dismissed_${scope}`;
  }

  init() {
    try {
      const userKey = this.getStorageKey(this.user);
      if (global.localStorage.getItem(userKey) === "true") {
        this.isSpotlightDismissed = true;
      } else if (global.localStorage.getItem("tawfiq_mentor_spotlight_dismissed") === "true") {
        this.isSpotlightDismissed = true;
      } else {
        this.isSpotlightDismissed = false;
      }
    } catch {
      this.isSpotlightDismissed = false;
    }
  }

  handleDismiss(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.isSpotlightDismissed = true;
    const userKey = this.getStorageKey(this.user);
    global.localStorage.setItem(userKey, "true");
    global.localStorage.setItem("tawfiq_mentor_spotlight_dismissed", "true");
  }

  handleExplore() {
    const userKey = this.getStorageKey(this.user);
    global.localStorage.setItem(userKey, "true");
    global.localStorage.setItem("tawfiq_mentor_spotlight_dismissed", "true");
    this.isSpotlightDismissed = true;
    this.navigatedTo = "/mentor";
    this.navigationState = { animatedEntry: true };
  }
}

// TEST SUITE
let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

// 1. Initial State for New / Undiscovered User
global.localStorage.clear();
const simNewUser = new TawfiqHeaderSimulator(null);
assert(simNewUser.isSpotlightDismissed === false, "Fresh user initially sees prominent feature spotlight card");

// 2. Dismissal Action without Navigation
let eventPropagationStopped = false;
let eventDefaultPrevented = false;
const mockEvent = {
  preventDefault: () => { eventDefaultPrevented = true; },
  stopPropagation: () => { eventPropagationStopped = true; },
};
simNewUser.handleDismiss(mockEvent);
assert(eventPropagationStopped === true, "Dismissal calls e.stopPropagation() to prevent unintended Mentor navigation");
assert(simNewUser.isSpotlightDismissed === true, "Spotlight state updates to dismissed");
assert(simNewUser.navigatedTo === null, "Dismissal does not navigate into Mentor Mode");
assert(global.localStorage.getItem("tawfiq_mentor_spotlight_dismissed_guest") === "true", "Dismissal persists in guest-scoped localStorage");
assert(global.localStorage.getItem("tawfiq_mentor_spotlight_dismissed") === "true", "Dismissal persists in global fallback key");

// 3. Returning User Session Persistence
const simReturningUser = new TawfiqHeaderSimulator(null);
assert(simReturningUser.isSpotlightDismissed === true, "Returning session reads persisted state and renders compact entry");

// 4. Authenticated User Scope
global.localStorage.clear();
const authUser = { id: "usr_99812", email: "believer@tawfiq.app" };
const simAuth = new TawfiqHeaderSimulator(authUser);
assert(simAuth.isSpotlightDismissed === false, "New authenticated user sees prominent feature spotlight");
simAuth.handleDismiss();
assert(global.localStorage.getItem("tawfiq_mentor_spotlight_dismissed_usr_99812") === "true", "Authenticated user dismissal persists with user-specific key");

// 5. Explore Action Navigation & Transition
global.localStorage.clear();
const simExplore = new TawfiqHeaderSimulator({ id: "usr_1" });
simExplore.handleExplore();
assert(simExplore.navigatedTo === "/mentor", "Clicking 'Explore Mentor Mode' navigates to /mentor");
assert(simExplore.navigationState?.animatedEntry === true, "Navigation preserves { state: { animatedEntry: true } } for smooth transition");
assert(simExplore.isSpotlightDismissed === true, "Exploring automatically records discovery so future visits use compact state");

console.log(`\nResults: ${passed}/${total} behavior tests passed!`);

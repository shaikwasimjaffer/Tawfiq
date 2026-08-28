import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";

import {
  Route,
  Routes,
  Navigate,
  BrowserRouter,
} from "react-router-dom";

import { useEffect } from "react";

// Pages
import Dhikr from "./pages/Dhikr";
import Today from "./pages/Today";
import Qaza from "./pages/Qaza";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LoadingScreen from "./pages/LoadingScreen";
import TawfiqTV from "./pages/TawfiqTV";
import Onboarding from "./pages/Onboarding";
import Quran from "./pages/Quran";
import Sawm from "./pages/Sawm";
import Learn from "./pages/Learn";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

import PageNotFound from "./lib/PageNotFound";

// Notifications
import {
  requestNotificationPermission,
  startPrayerReminder,
} from "@/utils/notificationScheduler";

// Auth
import { AuthProvider, useAuth } from "@/lib/AuthContext";

import UserNotRegisteredError from "@/components/UserNotRegisteredError";

// ─────────────────────────────────────────────────────────────
// Authenticated App
// ─────────────────────────────────────────────────────────────

const AuthenticatedApp = () => {
  const {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    navigateToLogin,
  } = useAuth();

  // ───────────────────────────────────────────────────────────
  // Authentication Loading
  // ───────────────────────────────────────────────────────────

  if (
    isLoadingPublicSettings ||
    isLoadingAuth
  ) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Authentication Errors
  // ───────────────────────────────────────────────────────────

  if (authError) {
    if (
      authError.type === "user_not_registered"
    ) {
      return <UserNotRegisteredError />;
    }

    if (
      authError.type === "auth_required"
    ) {
      navigateToLogin();
      return null;
    }
  }

  // ───────────────────────────────────────────────────────────
  // Routes
  // ───────────────────────────────────────────────────────────

  return (
    <Routes>

      {/* Root */}
      <Route
        path="/"
        element={
          <Navigate
            to="/today"
            replace
          />
        }
      />

      {/* ─────────────────────────────────────────────── */}
      {/* Authentication */}
      {/* ─────────────────────────────────────────────── */}

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Password recovery */}
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* Onboarding */}
      {/* ─────────────────────────────────────────────── */}

      <Route
        path="/onboarding"
        element={<Onboarding />}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* Loading */}
      {/* ─────────────────────────────────────────────── */}

      <Route
        path="/loading"
        element={<LoadingScreen />}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* Main App */}
      {/* ─────────────────────────────────────────────── */}

      <Route
        path="/today"
        element={<Today />}
      />

      <Route
        path="/quran"
        element={<Quran />}
      />

      <Route
        path="/learn"
        element={<Learn />}
      />

      <Route
        path="/tv"
        element={<TawfiqTV />}
      />

      <Route
        path="/qaza"
        element={<Qaza />}
      />

      <Route
        path="/sawm"
        element={<Sawm />}
      />

      <Route
        path="/dhikr"
        element={<Dhikr />}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* Settings */}
      {/* ─────────────────────────────────────────────── */}

      <Route
        path="/settings"
        element={<Settings />}
      />

      {/* ─────────────────────────────────────────────── */}
      {/* 404 */}
      {/* ─────────────────────────────────────────────── */}

      <Route
        path="*"
        element={<PageNotFound />}
      />

    </Routes>
  );
};

// ─────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────

function App() {
  useEffect(() => {
    requestNotificationPermission();
    startPrayerReminder();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <AuthenticatedApp />
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
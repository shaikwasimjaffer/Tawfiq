import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import { useEffect } from "react";

import Dhikr from "./pages/Dhikr";
import Today from "./pages/Today";
import Qaza from "./pages/Qaza";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import LoadingScreen from "./pages/LoadingScreen";
import TawfiqTV from "./pages/TawfiqTV";
import Onboarding from "./pages/Onboarding";
import Quran from "./pages/Quran";
import Sawm from "./pages/Sawm";
import Learn from "./pages/Learn";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

import PageNotFound from "./lib/PageNotFound";

import {
  requestNotificationPermission,
  startPrayerReminder,
} from "@/utils/notificationScheduler";

import {
  AuthProvider,
  useAuth,
} from "@/lib/AuthContext";

import UserNotRegisteredError from "@/components/UserNotRegisteredError";

const AuthenticatedApp = () => {
  const {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    navigateToLogin,
  } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    }

    if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>

      {/* Root */}
      <Route
        path="/"
        element={<Navigate to="/today" replace />}
      />

      {/* Authentication */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={<Onboarding />}
      />

      {/* Loading */}
      <Route
        path="/loading"
        element={<LoadingScreen />}
      />

      {/* Main App */}
      <Route path="/today" element={<Today />} />
      <Route path="/quran" element={<Quran />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/tv" element={<TawfiqTV />} />
      <Route path="/qaza" element={<Qaza />} />
      <Route path="/sawm" element={<Sawm />} />
      <Route path="/dhikr" element={<Dhikr />} />

      {/* Settings */}
      <Route
        path="/settings"
        element={<Settings />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={<PageNotFound />}
      />

    </Routes>
  );
};

function App() {
  useEffect(() => {
    requestNotificationPermission();
    startPrayerReminder();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>

        <Router basename={import.meta.env.BASE_URL}>
          <AuthenticatedApp />
        </Router>

        <Toaster />

      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
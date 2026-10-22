import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";

import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PrayerDashboard from "@/pages/PrayerDashboard";
import QuranApp from "@/pages/QuranApp";
import QazaApp from "@/pages/QazaApp";
import LearnApp from "@/pages/LearnApp";
import MentorApp from "@/pages/MentorApp";
import QiblaApp from "@/pages/QiblaApp";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import OAuthCallback from "@/pages/OAuthCallback";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import PageNotFound from "@/lib/PageNotFound";

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Routes>
            {/* Authenticated Application Vault (Guarded: Must sign in to access) */}
            <Route
              element={
                <ProtectedRoute
                  unauthenticatedElement={<Navigate to="/login" replace />}
                />
              }
            >
              <Route element={<AppLayout />}>
                <Route
                  path="/"
                  element={
                    <div className="section-content-fade">
                      <PrayerDashboard />
                    </div>
                  }
                />
                <Route
                  path="/prayers"
                  element={
                    <div className="section-content-fade">
                      <PrayerDashboard />
                    </div>
                  }
                />
                <Route
                  path="/quran"
                  element={
                    <div className="section-content-fade">
                      <QuranApp />
                    </div>
                  }
                />
                <Route
                  path="/qaza"
                  element={
                    <div className="section-content-fade">
                      <QazaApp />
                    </div>
                  }
                />
                <Route
                  path="/learn"
                  element={
                    <div className="section-content-fade">
                      <LearnApp />
                    </div>
                  }
                />
                <Route
                  path="/mentor"
                  element={
                    <div className="mentor-screen-enter">
                      <MentorApp />
                    </div>
                  }
                />
                <Route
                  path="/qibla"
                  element={
                    <div className="section-content-fade">
                      <QiblaApp />
                    </div>
                  }
                />
              </Route>
            </Route>

            {/* Public Marketing & Informational Website */}
            <Route path="/website" element={<Home />} />

            {/* Public Authentication Flows */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Fallback */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

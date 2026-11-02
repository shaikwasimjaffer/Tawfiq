import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

export default function AppLayout() {
  const location = useLocation();
  const isMentor = location.pathname.startsWith("/mentor");
  // Check if Qibla is currently in full-screen AR mode (via search query or location state)
  const isQiblaAR =
    location.pathname.startsWith("/qibla") &&
    (new URLSearchParams(location.search).get("mode") === "ar" || location.state?.mode === "ar");

  return (
    <div className="relative min-h-screen bg-[#F7F5EF]">
      {/* Content */}
      <Outlet />

      {/* Hide bottom nav on Mentor and full-screen AR mode */}
      {!isMentor && !isQiblaAR && <BottomNav />}
    </div>
  );
}

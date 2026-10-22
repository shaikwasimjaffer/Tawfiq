import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

export default function AppLayout() {
  const location = useLocation();
  const isMentor = location.pathname.startsWith("/mentor");

  return (
    <div className="relative min-h-screen bg-[#F7F5EF]">
      {/* Content */}
      <Outlet />

      {/* Hide bottom nav on Mentor to give full ChatGPT viewport height */}
      {!isMentor && <BottomNav />}
    </div>
  );
}

import React from "react";
import Navbar from "@/components/tawfiq/Navbar";
import Hero from "@/components/tawfiq/Hero";
import Qaza from "@/components/tawfiq/Qaza";
import TawfiqAI from "@/components/tawfiq/TawfiqAI";
import Quran from "@/components/tawfiq/Quran";
import Academy from "@/components/tawfiq/Academy";
import SurahTaha from "@/components/tawfiq/SurahTaha";
import Footer from "@/components/tawfiq/Footer";

export default function Home() {
  return (
    <div className="bg-[#F7F5F1]">
      <Navbar />
      <Hero />
      <Qaza />
      <TawfiqAI />
      <Quran />
      <Academy />
      <SurahTaha />
      <Footer />
    </div>
  );
}

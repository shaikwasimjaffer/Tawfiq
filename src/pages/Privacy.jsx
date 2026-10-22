import React from "react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] px-6 py-24 lg:px-12">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="font-serif text-xl text-stone-900 tracking-tight mb-12 inline-block"
        >
          Tawfiq
        </Link>
        <h1 className="font-serif text-4xl text-stone-900 mb-8">
          Privacy Policy
        </h1>
        <div className="space-y-6 font-sans text-stone-600 leading-relaxed">
          <p>
            Tawfiq is designed with your spiritual privacy at its core. We
            collect only what is necessary to provide you with a meaningful
            worship tracking experience.
          </p>
          <h2 className="font-serif text-2xl text-stone-800 pt-4">
            Data We Store
          </h2>
          <p>
            Your prayer records, Qaza counts, Quran reading progress, and dhikr
            counts are stored securely and are only accessible to you. We do not
            share your spiritual data with third parties.
          </p>
          <h2 className="font-serif text-2xl text-stone-800 pt-4">
            AI Companion
          </h2>
          <p>
            Questions you ask the AI Companion are processed to provide
            responses grounded in established Islamic scholarship. Conversations
            are not used to train external models.
          </p>
          <h2 className="font-serif text-2xl text-stone-800 pt-4">
            Your Control
          </h2>
          <p>
            You can export or delete your data at any time. Your spiritual
            journey is yours alone, and we respect your right to manage it.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex mt-12 text-sm font-sans text-[#134D37] hover:underline transition-colors"
        >
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}

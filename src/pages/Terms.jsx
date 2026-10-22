import React from "react";
import { Link } from "react-router-dom";

export default function Terms() {
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
          Terms of Service
        </h1>
        <div className="space-y-6 font-sans text-stone-600 leading-relaxed">
          <p>
            Tawfiq is a spiritual companion application designed to support
            Muslims in maintaining prayer consistency and spiritual growth. By
            using Tawfiq, you agree to the following terms.
          </p>
          <h2 className="font-serif text-2xl text-stone-800 pt-4">
            Spiritual Guidance
          </h2>
          <p>
            The AI Companion provides responses grounded in established Islamic
            scholarship, but it is not a substitute for qualified religious
            scholars. For definitive rulings on matters of fiqh, please consult
            your local imam or a trusted scholar.
          </p>
          <h2 className="font-serif text-2xl text-stone-800 pt-4">
            Acceptable Use
          </h2>
          <p>
            Tawfiq is a space for worship, reflection, and growth. Users are
            expected to engage with the platform and its AI Companion with
            respect and sincerity.
          </p>
          <h2 className="font-serif text-2xl text-stone-800 pt-4">
            Service Availability
          </h2>
          <p>
            We strive to maintain a reliable service but do not guarantee
            uninterrupted access. Feature availability may evolve as we continue
            to improve the Tawfiq experience.
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

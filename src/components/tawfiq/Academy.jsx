import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Academy — one immersive vertical scrolling experience.
// As the user scrolls, one topic transitions upward, making room for the next.
// Only one topic feels active at a time. No cards, no grids, no checklists.
// Large editorial panels: title, Arabic title, one meaningful sentence.

const topics = [
  {
    title: "Salah",
    arabic: "الصلاة",
    sentence: "The five moments that shape a day into a life of remembrance.",
    tint: "#F7F5F1",
  },
  {
    title: "Wudu",
    arabic: "الوضوء",
    sentence: "Purification of the body, a quiet preparation of the heart.",
    tint: "#F5F2EC",
  },
  {
    title: "Adhan",
    arabic: "الأذان",
    sentence:
      "The call that has gathered hearts to prayer for fourteen centuries.",
    tint: "#F3EFE8",
  },
  {
    title: "Hadith",
    arabic: "الحديث",
    sentence:
      "The preserved words of the Prophet ﷺ, a living guide after the Book.",
    tint: "#F1EDE5",
  },
  {
    title: "Ramadan",
    arabic: "رمضان",
    sentence: "The month of restraint, revelation, and return.",
    tint: "#EFEAE2",
  },
  {
    title: "Zakat",
    arabic: "الزكاة",
    sentence: "A portion given, a wealth purified, a community held.",
    tint: "#EDE8DF",
  },
  {
    title: "Zakat Calculator",
    arabic: "حاسبة الزكاة",
    sentence: "Know what is due, with clarity and ease.",
    tint: "#EBE6DC",
  },
  {
    title: "Names of Allah",
    arabic: "أسماء الله الحسنى",
    sentence: "Ninety-nine doors of knowing the One who knows you.",
    tint: "#E9E4D9",
  },
  {
    title: "Islamic History",
    arabic: "التاريخ الإسلامي",
    sentence: "The story of a faith that shaped civilizations.",
    tint: "#E7E2D6",
  },
  {
    title: "Learn Arabic",
    arabic: "تعلم العربية",
    sentence: "The language of revelation, learned one word at a time.",
    tint: "#E5E0D3",
  },
];

function TopicPanel({ topic, index, isLast }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    isLast ? [1, 1, 1] : [1, 1, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const blur = useTransform(scrollYProgress, [0.5, 1], [0, 4]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale, y, filter, backgroundColor: topic.tint }}
      className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      <div className="text-center max-w-3xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-[11px] font-sans tracking-[0.25em] uppercase text-stone-400 mb-10"
        >
          {String(index + 1).padStart(2, "0")} — Academy
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.02em] text-stone-900"
        >
          {topic.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-arabic text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.6] text-stone-500 mt-6"
          dir="rtl"
        >
          {topic.arabic}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="font-serif text-lg md:text-xl italic font-light text-stone-600 leading-relaxed max-w-xl mx-auto mt-10"
        >
          {topic.sentence}
        </motion.p>
      </div>
    </motion.div>
  );
}

export default function Academy() {
  return (
    <section id="academy" className="relative bg-[#F7F5F1]">
      {/* Section opening — a brief frame before the journey */}
      <div className="relative bg-[#F7F5F1] py-24 md:py-32 text-center px-6">
        <p className="text-[11px] font-sans tracking-[0.25em] uppercase text-stone-400 mb-8">
          03 — Features
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.01em] text-stone-900 max-w-2xl mx-auto"
        >
          Features of
          <br />
          <span className="italic font-light text-stone-500">Tawfiq.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-sans text-sm text-stone-400 mt-6"
        >
          Scroll gently.
        </motion.p>
      </div>

      {/* The immersive vertical journey */}
      <div>
        {topics.map((topic, i) => (
          <TopicPanel
            key={topic.title}
            topic={topic}
            index={i}
            isLast={i === topics.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

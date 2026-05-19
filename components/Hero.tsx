"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/motion";

const stats = [
  { label: "Currently", value: "Year 9 · Shibuya Makuhari" },
  { label: "Building", value: "AXYZ · Kythera Ventures" },
  { label: "Hobbies", value: "Debate · Code · Long-form reading" },
  { label: "Favorite food", value: "Tonkotsu ramen" },
  { label: "On loop", value: "Frank Ocean — Blonde" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 lg:px-16 py-32 overflow-hidden"
    >
      {/* large faint mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[10%] -right-[6%] text-[40vw] leading-none font-syne font-bold text-white/[0.015] select-none tracking-tighter"
      >
        SF
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerParent}
        className="max-w-[1280px] mx-auto w-full relative z-10"
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          className="font-jetbrains text-[11px] tracking-[0.18em] uppercase text-fog-3 mb-10"
        >
          ◣ Seia Funayama · Chiba, Japan
        </motion.p>

        {/* Name */}
        <motion.h1
          variants={fadeUp}
          className="font-syne font-extrabold uppercase leading-[0.86] tracking-[-0.04em] text-fog text-[clamp(64px,12vw,180px)] mb-16"
        >
          <span className="block">Seia</span>
          <span className="block text-fog/30 -mt-1">Funayama.</span>
        </motion.h1>

        {/* Centerpiece quote */}
        <motion.figure
          variants={fadeUp}
          className="border-l-2 border-electric/80 pl-6 md:pl-10 mb-20 max-w-[920px]"
        >
          <blockquote className="font-syne font-extrabold uppercase italic text-fog leading-[0.95] tracking-[-0.03em] text-[clamp(36px,5.5vw,68px)]">
            “Stay hungry,
            <br />
            stay foolish.”
          </blockquote>
          <figcaption className="mt-5 font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-3">
            — Steve Jobs
          </figcaption>
        </motion.figure>

        {/* Stats grid */}
        <motion.dl
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-edge border border-edge rounded-lg overflow-hidden"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-ink p-5 md:p-6">
              <dt className="font-jetbrains text-[9.5px] tracking-[0.18em] uppercase text-fog-3 mb-2">
                {s.label}
              </dt>
              <dd className="font-syne font-semibold uppercase tracking-tight text-fog text-[14px] md:text-[15px] leading-snug">
                {s.value}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute left-6 md:left-10 lg:left-16 bottom-10 flex items-center gap-3 text-fog-3"
        aria-hidden
      >
        <span className="block h-px w-8 bg-fog-3" />
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}

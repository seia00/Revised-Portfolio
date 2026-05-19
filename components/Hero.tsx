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
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* Faint giant background mark (intentional, behind all content) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[8%] -right-[6%] text-[40vw] leading-none font-syne font-bold text-white/[0.018] select-none tracking-tighter"
      >
        SF
      </div>

      {/* ── Top bar: brand left, location right ── */}
      <header className="relative z-10 w-full">
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-8 md:px-10 lg:px-16 pt-7 md:pt-9 flex items-center justify-between gap-4">
          <span className="font-syne font-extrabold uppercase tracking-tighter text-fog text-base md:text-lg">
            SF<span className="text-electric-soft">.</span>
          </span>
          <span className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-fog-3">
            Seia Funayama · Chiba, Japan
          </span>
        </div>
      </header>

      {/* ── Main hero content ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerParent}
        className="relative z-10 flex-1 w-full flex items-center"
      >
        <div className="max-w-[1200px] mx-auto w-full px-5 sm:px-8 md:px-10 lg:px-16 py-20 md:py-24">
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-electric-soft mb-8 md:mb-10"
          >
            ◣ Chapter i / introduction
          </motion.p>

          {/* Name — gap between the two lines so they read as two words */}
          <motion.h1
            variants={fadeUp}
            className="font-syne font-extrabold uppercase leading-[0.88] tracking-[-0.04em] text-fog mb-14 md:mb-20"
          >
            <span className="block text-[clamp(56px,12vw,170px)]">Seia</span>
            <span className="block text-[clamp(56px,12vw,170px)] text-fog/30 mt-1 md:mt-2">
              Funayama.
            </span>
          </motion.h1>

          {/* Quote — properly indented from screen edge */}
          <motion.figure
            variants={fadeUp}
            className="mb-16 md:mb-20 max-w-[900px] pl-5 md:pl-8 border-l-2 border-electric/80"
          >
            <blockquote className="font-syne font-extrabold uppercase italic text-fog leading-[0.96] tracking-[-0.025em] text-[clamp(30px,5.5vw,64px)]">
              “Stay hungry,
              <br />
              stay foolish.”
            </blockquote>
            <figcaption className="mt-5 font-jetbrains text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-fog-3">
              — Steve Jobs
            </figcaption>
          </motion.figure>

          {/* Info list — vertical, label left / value right, divider between rows */}
          <motion.dl
            variants={fadeUp}
            className="border-t border-edge max-w-[820px]"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] gap-4 sm:gap-8 py-4 sm:py-5 border-b border-edge"
              >
                <dt className="font-jetbrains text-[10px] tracking-[0.18em] uppercase text-fog-3 self-center">
                  {s.label}
                </dt>
                <dd className="font-syne font-semibold uppercase tracking-tight text-fog text-[14px] sm:text-[15px] md:text-[16px] leading-snug self-center">
                  {s.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      {/* ── Scroll cue — centered along the bottom ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="relative z-10 w-full pb-8 md:pb-10 flex justify-center"
        aria-hidden
      >
        <div className="flex flex-col items-center gap-2 text-fog-3">
          <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase">
            Scroll
          </span>
          <span className="block h-7 w-px bg-fog-3" />
        </div>
      </motion.div>
    </section>
  );
}

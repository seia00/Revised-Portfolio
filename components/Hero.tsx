"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/motion";

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerParent}
        className="max-w-[900px] mx-auto"
      >
        {/* Logo mark */}
        <motion.div variants={fadeUp} className="mb-10 flex justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-ink flex items-center justify-center">
            <span className="font-syne font-extrabold uppercase tracking-tighter text-ink text-xl md:text-2xl">
              SF
            </span>
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={fadeUp}
          className="font-syne font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink text-[clamp(36px,9vw,120px)]"
        >
          <span className="block">Seia</span>
          <span className="block">Funayama</span>
        </motion.h1>

        {/* Descriptors */}
        <motion.p
          variants={fadeUp}
          className="mt-7 font-jetbrains text-[12px] md:text-[13px] tracking-[0.25em] uppercase text-ink-3"
        >
          Developer · Debater · Founder
        </motion.p>

        {/* Location */}
        <motion.p
          variants={fadeUp}
          className="mt-2 font-jetbrains text-[11px] tracking-[0.2em] uppercase text-ink-4"
        >
          Chiba, Japan
        </motion.p>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-ink-3"
        aria-hidden
      >
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase">
          Scroll
        </span>
        <span className="block h-6 w-px bg-ink-3" />
      </motion.div>
    </section>
  );
}

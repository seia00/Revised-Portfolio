"use client";

import { motion } from "framer-motion";

const TAGS = ["AXYZ", "Stratum AI", "Infra", "TypeScript"];

export default function KytheraCard() {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="group relative border border-edge rounded-xl p-7 md:p-10 bg-gradient-to-br from-ink-2/60 to-ink-3/40 backdrop-blur-sm overflow-hidden"
    >
      {/* Pushed further off-canvas so it never overlaps headline text */}
      <span
        aria-hidden
        className="absolute -top-16 -right-12 font-syne font-extrabold text-[180px] leading-none text-white/[0.025] select-none tracking-tighter pointer-events-none"
      >
        KV
      </span>

      {/* Top row — category left, status right */}
      <header className="relative flex items-center justify-between gap-4 mb-8">
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
          ◆ Executive · 2026 —
        </span>
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-electric-soft">
          Active role
        </span>
      </header>

      {/* Role title on its own line */}
      <p className="relative font-jetbrains text-[10px] tracking-[0.22em] uppercase text-electric mb-3">
        Chief Technology Officer
      </p>

      <h3 className="relative font-syne font-extrabold uppercase tracking-[-0.025em] text-fog text-3xl md:text-4xl leading-[0.95] mb-5">
        Kythera
        <br />
        Ventures.
      </h3>

      <p className="relative font-inter text-fog-2 text-[14.5px] leading-[1.7] max-w-[480px] mb-8">
        CTO at AXYZ and the Stratum AI solutions arm of Kythera Ventures —
        shipping infrastructure for the next decade of Japanese AI work.
      </p>

      {/* Pill tags — explicit list, generous spacing so they read as separate chips */}
      <ul className="relative flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <li
            key={t}
            className="font-jetbrains text-[10px] tracking-[0.08em] uppercase text-fog-2 px-2.5 py-1 border border-edge-2 rounded-full bg-ink-3/40"
          >
            {t}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

export default function KytheraCard() {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="group relative border border-edge rounded-xl p-7 md:p-9 bg-gradient-to-br from-ink-2/60 to-ink-3/40 backdrop-blur-sm overflow-hidden"
    >
      {/* watermark mark */}
      <span
        aria-hidden
        className="absolute -top-12 -right-6 font-syne font-extrabold text-[160px] leading-none text-white/[0.02] select-none tracking-tighter"
      >
        KV
      </span>

      <header className="flex items-center justify-between mb-8">
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
          ◆ Executive · 2026 —
        </span>
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-electric-soft">
          Active role
        </span>
      </header>

      <p className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-electric mb-3">
        Chief Technology Officer
      </p>

      <h3 className="font-syne font-extrabold uppercase tracking-[-0.025em] text-fog text-3xl md:text-4xl leading-[0.95] mb-5">
        Kythera<br />
        Ventures.
      </h3>

      <p className="font-inter text-fog-2 text-[14.5px] leading-[1.7] max-w-[460px] mb-9">
        CTO at AXYZ and the Stratum AI solutions arm of Kythera
        Ventures — shipping infrastructure for the next decade of
        Japanese AI work.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {["AXYZ", "Stratum AI", "Infra", "TypeScript"].map((t) => (
          <span
            key={t}
            className="font-jetbrains text-[10px] tracking-[0.06em] text-fog-2 px-2 py-1 border border-edge rounded"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

export default function NpoCard() {
  return (
    <motion.a
      href="https://en2u.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="group relative block border border-edge rounded-xl p-7 md:p-9 bg-ink-2/40 backdrop-blur-sm overflow-hidden h-full"
    >
      {/* Header — clearly separated category + URL */}
      <header className="flex items-center justify-between gap-4 mb-7 md:mb-8">
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
          ◆ Non-profit
        </span>
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-electric-soft">
          en2u.vercel.app
        </span>
      </header>

      {/* Title on its own dedicated line */}
      <h3 className="font-syne font-extrabold uppercase tracking-[-0.025em] text-fog text-3xl md:text-4xl leading-[0.95] mb-5">
        EN2U.
      </h3>

      <p className="font-inter text-fog-2 text-[14.5px] leading-[1.7] max-w-[420px] mb-9">
        A peer-mentorship network: 13–18 year olds teach English to other teens
        in underserved Japanese communities. I co-founded it and built the
        platform.
      </p>

      <span className="inline-flex items-center gap-3 font-jetbrains text-[11px] tracking-[0.2em] uppercase text-fog group-hover:text-electric-soft transition-colors">
        Visit site
        <span aria-hidden className="text-base leading-none">↗</span>
      </span>
    </motion.a>
  );
}

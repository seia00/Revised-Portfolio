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
      className="group relative flex h-full flex-col border border-edge rounded-xl p-7 md:p-9 bg-field-2/40 backdrop-blur-sm overflow-hidden"
    >
      <header className="flex items-center justify-between mb-8">
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-ink-3">
          ◆ Non-profit
        </span>
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-ember">
          en2u.vercel.app
        </span>
      </header>

      {/* Same scale as the Programming card beside it — see the note there. */}
      <h3 className="font-syne font-extrabold uppercase tracking-[-0.025em] text-ink text-3xl lg:text-4xl leading-[0.95] mb-5">
        EN2U.
      </h3>

      <p className="font-inter text-ink-2 text-[14.5px] leading-[1.7] max-w-[420px] mb-9">
        A peer-mentorship network: 13–18 year olds teach English to other
        teens in underserved Japanese communities. I co-founded it and
        built the platform.
      </p>

      <span className="mt-auto inline-flex items-center gap-3 font-jetbrains text-[11px] tracking-[0.2em] uppercase text-ink group-hover:text-ember transition-colors">
        Visit site
        <span aria-hidden className="text-base">
          ↗
        </span>
      </span>
    </motion.a>
  );
}

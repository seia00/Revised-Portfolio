"use client";

import { motion } from "framer-motion";
import { reveal, revealViewport } from "@/lib/motion";
import { ACTIVITIES } from "@/data/activities";
import { SectionHeader, Serif, Star } from "./ornaments";

export default function Activities() {
  return (
    <section
      id="activities"
      aria-label="Where I'm at right now"
      className="relative px-5 md:px-10 lg:px-16 py-28 md:py-40"
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="04" label="Now" aside="Currently — 2026">
          Where I&apos;m <Serif>at.</Serif>
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink border border-ink">
          {ACTIVITIES.map((a, i) => (
            <motion.article
              key={a.n}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
              custom={i}
              className="group relative bg-field text-ink hover:bg-ink hover:text-field transition-colors duration-500 p-7 md:p-9 flex flex-col min-h-[460px]"
            >
              <div className="flex items-baseline justify-between font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-ink-3 group-hover:text-field/60 transition-colors duration-500">
                <span>Nº {a.n}</span>
                <span>{a.tag}</span>
              </div>

              <div className="mt-6 h-px bg-current opacity-20" />

              <h3 className="mt-10 font-serif text-[clamp(56px,5.6vw,84px)] leading-[0.9] tracking-[-0.02em] group-hover:italic">
                {a.title}
              </h3>

              <p className="mt-6 text-[15px] leading-[1.65] text-ink-2 group-hover:text-field/80 transition-colors duration-500">
                {a.summary}
              </p>

              <ul className="mt-auto pt-8 space-y-3">
                {a.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 font-mono text-[11px] leading-[1.5] tracking-[0.03em] text-ink-2 group-hover:text-field/80 transition-colors duration-500"
                  >
                    <Star className="w-2.5 h-2.5 mt-[3px]" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

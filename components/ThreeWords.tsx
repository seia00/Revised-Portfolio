"use client";

import { motion } from "framer-motion";
import { reveal, revealViewport } from "@/lib/motion";
import { WORDS } from "@/data/words";
import { SectionHeader } from "./ornaments";

export default function ThreeWords() {
  return (
    <section
      id="words"
      aria-label="Three words"
      className="relative px-5 md:px-10 lg:px-16 py-28 md:py-40"
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="01" label="About" aside="In three words" />

        <p className="font-serif italic text-ink-2 text-2xl md:text-3xl mb-12 md:mb-16 max-w-[520px]">
          If I had to describe myself in three words —
        </p>

        <ol className="border-t border-edge">
          {WORDS.map((w, i) => (
            <motion.li
              key={w.word}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
              custom={i}
              className="grid grid-cols-12 gap-x-4 gap-y-5 items-end py-9 md:py-12 border-b border-edge"
            >
              <span className="col-span-2 md:col-span-1 self-start font-serif italic text-ink-3 text-2xl md:text-3xl leading-none">
                {w.numeral}
              </span>
              <span
                className={`col-span-10 md:col-span-7 text-ink leading-[0.85] text-[clamp(46px,8.6vw,124px)] ${w.style}`}
              >
                {w.word}
              </span>
              <div className="col-span-10 col-start-3 md:col-span-4 md:col-start-auto md:pl-6 md:border-l border-edge">
                <p className="font-mono text-[11px] tracking-[0.06em] text-ink-3">
                  {w.syllables} <span className="text-ink-4">{w.ipa}</span>
                </p>
                <p className="mt-2 text-ink-2 text-[15px] leading-[1.55]">
                  <em className="font-serif italic text-ink text-lg mr-1.5">adj.</em>
                  {w.definition}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

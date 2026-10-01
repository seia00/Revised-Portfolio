"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/motion";

const WORDS = ["Relentless", "Curious", "Driven"];

export default function ThreeWords() {
  return (
    <section
      id="words"
      aria-label="Three words"
      className="relative px-6 md:px-10 lg:px-16 py-32 md:py-44"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-15% 0px" }}
        variants={staggerParent}
        className="max-w-[1100px] mx-auto text-center"
      >
        <motion.p
          variants={fadeUp}
          className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-ink-3 mb-10"
        >
          Three words
        </motion.p>

        <div className="flex flex-col divide-y divide-edge border-t border-b border-edge">
          {WORDS.map((word, i) => (
            <motion.div
              key={word}
              variants={fadeUp}
              className="flex flex-col items-center justify-center gap-2 py-7 md:py-9"
            >
              <span className="font-jetbrains text-[11px] tracking-[0.2em] text-ink-3">
                0{i + 1}
              </span>
              <span className="font-syne font-extrabold uppercase tracking-[-0.03em] text-ink text-[clamp(32px,8vw,100px)] leading-none">
                {word}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

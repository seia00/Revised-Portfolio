"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/motion";
import { TIMELINE } from "@/data/timeline";

export default function Timeline() {
  return (
    <section
      id="timeline"
      aria-label="My life"
      className="relative px-6 md:px-10 lg:px-16 py-32 md:py-44"
    >
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={staggerParent}
          className="mb-20 md:mb-28 max-w-[640px]"
        >
          <motion.p
            variants={fadeUp}
            className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-ink-3 mb-6"
          >
            Important events
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-syne font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink text-[clamp(36px,6vw,72px)]"
          >
            My life, thus far.
          </motion.h2>
        </motion.div>

        <ol className="border-t border-edge">
          {TIMELINE.map((m, i) => (
            <motion.li
              key={m.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-2 md:gap-10 py-10 md:py-12 border-b border-edge"
            >
              <div>
                <span className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-ink-3">
                  {m.age}
                </span>
              </div>
              <div className="max-w-[680px]">
                <h3 className="font-syne font-bold uppercase tracking-[-0.015em] text-ink text-xl md:text-3xl mb-3">
                  {m.title}
                </h3>
                <p className="font-inter text-ink-2 leading-[1.65] text-[15px] md:text-base mb-4">
                  {m.body}
                </p>
                <span className="font-jetbrains text-[10px] tracking-[0.2em] uppercase text-ink-4">
                  {m.place}
                </span>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

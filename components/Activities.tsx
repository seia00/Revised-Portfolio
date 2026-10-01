"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/motion";
import { ACTIVITIES } from "@/data/activities";

export default function Activities() {
  return (
    <section
      id="activities"
      aria-label="Where I'm at right now"
      className="relative px-6 md:px-10 lg:px-16 py-32 md:py-44"
    >
      <div className="max-w-[1200px] mx-auto">
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
            Right now
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-syne font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink text-[clamp(36px,6vw,72px)]"
          >
            Where I&apos;m at.
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-edge border border-edge">
          {ACTIVITIES.map((a, i) => (
            <motion.div
              key={a.n}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="bg-field p-8 md:p-9 flex flex-col"
            >
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-ink-3">
                  /{a.n}
                </span>
                <span className="font-jetbrains text-[10px] tracking-[0.2em] uppercase text-ink-4">
                  {a.tag}
                </span>
              </div>

              <h3 className="font-syne font-extrabold uppercase tracking-[-0.02em] text-ink text-2xl md:text-3xl mb-4">
                {a.title}
              </h3>

              <p className="font-inter text-ink-2 leading-[1.65] text-[15px] mb-6">
                {a.summary}
              </p>

              <ul className="mt-auto pt-5 border-t border-edge space-y-2.5">
                {a.points.map((p) => (
                  <li
                    key={p}
                    className="font-jetbrains text-[11px] tracking-[0.05em] text-ink-3 flex gap-2.5"
                  >
                    <span aria-hidden className="text-ink-4">
                      —
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

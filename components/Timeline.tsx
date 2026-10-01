"use client";

import { motion } from "framer-motion";
import { reveal, revealViewport } from "@/lib/motion";
import { TIMELINE } from "@/data/timeline";
import { SectionHeader, Serif } from "./ornaments";

export default function Timeline() {
  return (
    <section
      id="timeline"
      aria-label="My life"
      className="relative px-5 md:px-10 lg:px-16 py-28 md:py-40"
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="02" label="Life" aside="Four turning points">
          My life, <Serif>thus far.</Serif>
        </SectionHeader>

        <ol className="relative">
          {/* the rail */}
          <span
            aria-hidden
            className="hidden md:block absolute top-0 bottom-0 left-[calc(29.1667%-0.42rem)] w-px bg-edge"
          />
          {TIMELINE.map((m, i) => (
            <motion.li
              key={m.title}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
              className="group relative grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-4 py-12 md:py-16 border-t border-edge last:border-b"
            >
              <div className="col-span-12 md:col-span-3 flex md:block items-end gap-4">
                <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-3 md:mb-3">
                  Age
                </span>
                <span className="block font-serif text-ink leading-[0.75] text-[clamp(88px,11vw,168px)] group-hover:italic">
                  {String(m.age).padStart(2, "0")}
                </span>
              </div>

              {/* marker on the rail */}
              <span
                aria-hidden
                className="hidden md:block absolute top-[4.4rem] left-[calc(29.1667%-0.42rem)] -translate-x-1/2 w-2.5 h-2.5 rotate-45 border border-ink bg-field transition-colors group-hover:bg-ink"
              />

              <div className="col-span-12 md:col-span-8 md:col-start-5">
                <p className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-ink-3 mb-4">
                  Chapter 0{i + 1} — {m.place}
                </p>
                <h3 className="font-sans font-semibold tracking-[-0.03em] text-ink leading-[1.05] text-[clamp(28px,3.4vw,46px)] mb-5">
                  {m.title}
                </h3>
                <p className="text-ink-2 leading-[1.7] text-[15px] md:text-[17px] max-w-[580px]">
                  {m.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

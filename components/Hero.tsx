"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/motion";
import { CropMarks, Registration, Star } from "./ornaments";

const RING = "SEIA FUNAYAMA • PORTFOLIO • MMXXVI • CHIBA, JAPAN • ";

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-svh flex flex-col px-5 md:px-10 pt-16"
    >
      <div className="relative flex-1 flex flex-col my-5 md:my-8">
        <CropMarks />
        <div aria-hidden className="hero-grid absolute inset-0 pointer-events-none" />
        <Registration className="hidden md:block absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-field" />
        <Registration className="hidden md:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-field" />

        <div className="relative grid grid-cols-2 md:grid-cols-3 items-start p-4 md:p-6 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-ink-3">
          <span>Nº 001 — Index</span>
          <span className="hidden md:block text-center">35.61° N, 140.11° E</span>
          <span className="text-right">Portfolio — MMXXVI</span>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerParent}
          className="relative flex-1 flex flex-col items-center justify-center text-center py-8"
        >
          <motion.div variants={fadeUp}>
            <Seal />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-8 md:mt-10 font-serif text-ink leading-[0.84] tracking-[-0.02em] text-[clamp(64px,min(22vw,24svh),240px)]"
          >
            <span className="block italic">Seia</span>
            <span className="block uppercase">Funayama</span>
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="mt-8 md:mt-10 flex items-center justify-center gap-3 md:gap-5 font-sans text-[11px] md:text-[13px] font-medium tracking-[0.26em] uppercase text-ink-2"
          >
            <span>Developer</span>
            <Star />
            <span>Debater</span>
            <Star />
            <span>Founder</span>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-3 font-serif italic text-ink-3 text-lg md:text-xl">
            based in Chiba, Japan
          </motion.p>
        </motion.div>

        <div className="relative grid grid-cols-2 md:grid-cols-3 items-end p-4 md:p-6 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-ink-3">
          <span>(Scroll)</span>
          <span aria-hidden className="hidden md:flex justify-center">
            <span className="scroll-cue block w-px h-10 bg-ink" />
          </span>
          <span className="text-right">4 Chapters</span>
        </div>
      </div>
    </section>
  );
}

function Seal() {
  return (
    <div className="relative w-[112px] h-[112px] md:w-[140px] md:h-[140px]">
      <svg viewBox="0 0 100 100" className="seal-spin absolute inset-0 w-full h-full text-ink" aria-hidden>
        <defs>
          <path id="seal-path" d="M50,50 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" />
        </defs>
        <text className="font-mono" fontSize="7" fill="currentColor">
          <textPath href="#seal-path" textLength="257" lengthAdjust="spacing">
            {RING}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[23%] rounded-full border border-ink flex items-center justify-center">
        <span className="font-serif italic text-[30px] md:text-[38px] leading-none text-ink">SF</span>
      </div>
    </div>
  );
}

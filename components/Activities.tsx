"use client";

import { motion } from "framer-motion";
import DebateAccordion from "./activities/DebateAccordion";
import ProgrammingCard from "./activities/ProgrammingCard";
import NpoCard from "./activities/NpoCard";
import KytheraCard from "./activities/KytheraCard";
import { fadeUp, staggerParent } from "@/lib/motion";

export default function Activities() {
  return (
    <section
      id="activities"
      aria-label="Activities"
      className="relative px-6 md:px-10 lg:px-16 py-40 md:py-56 font-inter"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={staggerParent}
          className="mb-20 md:mb-28 max-w-[720px]"
        >
          <motion.p
            variants={fadeUp}
            className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-3 mb-6"
          >
            ◇ Chapter iii / activities
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-inter font-medium text-fog leading-[1.0] tracking-[-0.025em] text-[clamp(46px,7vw,84px)]"
          >
            The four
            <br />
            <span className="text-fog/40">things I actually do.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-inter text-fog-2 mt-7 text-base md:text-lg leading-[1.65] max-w-[540px]"
          >
            Debate, code, mentorship, and an early-stage CTO role. Each one
            feeds the others.
          </motion.p>
        </motion.div>

        {/* — Debate accordion: spans full width — */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="flex items-baseline justify-between mb-5 px-1">
            <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-fog text-xl md:text-2xl">
              Debate
            </h3>
            <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
              /01 — competitive results
            </span>
          </div>
          <DebateAccordion />
        </motion.div>

        {/* — Programming card + NPO card row — */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-baseline justify-between mb-5 px-1">
              <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-fog text-xl md:text-2xl">
                Programming
              </h3>
              <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
                /02
              </span>
            </div>
            <ProgrammingCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-baseline justify-between mb-5 px-1">
              <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-fog text-xl md:text-2xl">
                NPO Work
              </h3>
              <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
                /03
              </span>
            </div>
            <NpoCard />
          </motion.div>
        </div>

        {/* — Kythera Ventures executive card, full width — */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-baseline justify-between mb-5 px-1">
            <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-fog text-xl md:text-2xl">
              Kythera Ventures
            </h3>
            <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
              /04 — exec
            </span>
          </div>
          <KytheraCard />
        </motion.div>
      </div>
    </section>
  );
}

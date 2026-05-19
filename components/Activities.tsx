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
      className="relative px-5 sm:px-8 md:px-10 lg:px-16 py-32 md:py-48 font-inter"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={staggerParent}
          className="mb-16 md:mb-24 max-w-[760px]"
        >
          <motion.p
            variants={fadeUp}
            className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-fog-3 mb-5 md:mb-6"
          >
            ◇ Chapter iii / activities
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-inter font-medium text-fog leading-[1.02] tracking-[-0.025em] text-[clamp(44px,7vw,84px)]"
          >
            The four
            <br />
            <span className="text-fog/40">things I actually do.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-inter text-fog-2 mt-7 md:mt-8 text-base md:text-lg leading-[1.65] max-w-[540px]"
          >
            Debate, code, mentorship, and an early-stage CTO role. Each one
            feeds the others.
          </motion.p>
        </motion.div>

        {/* 01 — Debate (full width) */}
        <ActivityBlock label="Debate" idx="01" subtitle="competitive results">
          <DebateAccordion />
        </ActivityBlock>

        {/* 02 + 03 — Programming + NPO, equal-height row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 md:mb-10 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <ActivityHeader label="Programming" idx="02" />
            <div className="flex-1">
              <ProgrammingCard />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: 0.7,
              delay: 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col"
          >
            <ActivityHeader label="NPO Work" idx="03" />
            <div className="flex-1">
              <NpoCard />
            </div>
          </motion.div>
        </div>

        {/* 04 — Kythera (full width) */}
        <ActivityBlock label="Kythera Ventures" idx="04" subtitle="exec">
          <KytheraCard />
        </ActivityBlock>
      </div>
    </section>
  );
}

/* ───────────────────────────── helpers ───────────────────────────── */

function ActivityBlock({
  label,
  idx,
  subtitle,
  children,
}: {
  label: string;
  idx: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 md:mb-10"
    >
      <ActivityHeader label={label} idx={idx} subtitle={subtitle} />
      {children}
    </motion.div>
  );
}

function ActivityHeader({
  label,
  idx,
  subtitle,
}: {
  label: string;
  idx: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 md:mb-5 px-1">
      <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-fog text-xl md:text-2xl">
        {label}
      </h3>
      <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
        /{idx}
        {subtitle ? ` — ${subtitle}` : ""}
      </span>
    </div>
  );
}

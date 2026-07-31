"use client";

import { motion } from "framer-motion";
import DebateAccordion from "./activities/DebateAccordion";
import ProgrammingCard from "./activities/ProgrammingCard";
import NpoCard from "./activities/NpoCard";
import KytheraCard from "./activities/KytheraCard";
import { fadeUp, staggerParent } from "@/lib/motion";

/*
 * Vertical rhythm for this section, in one place so the four groups stay
 * legible as four groups:
 *
 *   GAP_IN     label → its own card. Tight, so the pair reads as one unit.
 *   GAP_OUT    group → next group. ~6x GAP_IN. Anything close to GAP_IN and
 *              the groups merge into one undifferentiated stack of boxes.
 *   header → first group is larger still, so the section opening outranks
 *   the divisions inside it.
 *
 * Every box edge, section label and card body also has to land on the same
 * left rail — that means no horizontal insets out here, and matching inner
 * padding on the accordion rows and the cards (see DebateAccordion).
 */
const GAP_IN = "mb-4";
const GAP_OUT = "mb-24 md:mb-32";

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
          className="mb-28 md:mb-40 max-w-[720px]"
        >
          <motion.p
            variants={fadeUp}
            className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-ink-3 mb-6"
          >
            ◇ Chapter iv / activities
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-space-grotesk font-bold text-ink leading-[0.95] tracking-[-0.04em] text-[clamp(48px,7.5vw,92px)]"
          >
            The four
            <br />
            <span className="text-ink/40 italic">things I actually do.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-inter text-ink-2 mt-7 text-base md:text-lg leading-[1.65] max-w-[540px]"
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
          className={GAP_OUT}
        >
          <div className={`flex items-baseline justify-between ${GAP_IN}`}>
            <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-ink text-xl md:text-2xl">
              Debate
            </h3>
            <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-ink-3">
              /01 — competitive results
            </span>
          </div>
          <DebateAccordion />
        </motion.div>

        {/* — Programming card + NPO card row — */}
        {/* gap-y matches GAP_OUT: below md these two stop being a row and
            become two more groups in the stack. */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-24 ${GAP_OUT}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`flex items-baseline justify-between ${GAP_IN}`}>
              <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-ink text-xl md:text-2xl">
                Programming
              </h3>
              <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-ink-3">
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
            <div className={`flex items-baseline justify-between ${GAP_IN}`}>
              <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-ink text-xl md:text-2xl">
                NPO Work
              </h3>
              <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-ink-3">
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
          <div className={`flex items-baseline justify-between ${GAP_IN}`}>
            <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-ink text-xl md:text-2xl">
              Kythera Ventures
            </h3>
            <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-ink-3">
              /04 — exec
            </span>
          </div>
          <KytheraCard />
        </motion.div>
      </div>
    </section>
  );
}

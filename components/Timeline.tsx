"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type MotionValue,
} from "framer-motion";
import { TIMELINE, type Milestone } from "@/data/timeline";

export default function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 30%"],
  });

  // Maps scroll progress (0..1) onto the height of the glowing line (0..100%)
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      id="timeline"
      aria-label="My life thus far"
      className="relative px-6 md:px-10 lg:px-16 py-40 md:py-56"
    >
      <div className="max-w-[1080px] mx-auto">
        {/* Section header */}
        <div className="mb-24 md:mb-32 max-w-[680px]">
          <p className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-3 mb-6">
            ◇ Chapter ii
          </p>
          <h2 className="font-playfair italic font-medium text-fog leading-[1.02] tracking-[-0.02em] text-[clamp(46px,7vw,88px)]">
            My life,
            <br />
            <span className="text-fog/40">thus far.</span>
          </h2>
          <p className="font-playfair text-fog-2 mt-8 text-lg md:text-xl leading-[1.6] max-w-[560px]">
            Six waypoints that explain how I got here — and where I&apos;m
            pointed next.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* faint baseline track */}
          <div
            aria-hidden
            className="absolute left-[14px] md:left-[18px] top-0 bottom-0 w-px bg-edge"
          />

          {/* glowing progress line, height scroll-driven */}
          <motion.div
            aria-hidden
            style={{ height: lineHeight }}
            className="absolute left-[14px] md:left-[18px] top-0 w-px bg-gradient-to-b from-electric via-electric-soft to-transparent shadow-[0_0_24px_rgba(91,141,255,0.6)] origin-top"
          />

          <ol className="space-y-24 md:space-y-32">
            {TIMELINE.map((m, idx) => (
              <TimelineRow
                key={`${m.year}-${idx}`}
                milestone={m}
                index={idx}
                progress={scrollYProgress}
                total={TIMELINE.length}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

interface RowProps {
  milestone: Milestone;
  index: number;
  progress: MotionValue<number>;
  total: number;
}

function TimelineRow({ milestone, index, progress, total }: RowProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const inView = useInView(rowRef, { margin: "-25% 0px -40% 0px", once: false });

  // dot fade-in is driven by scroll progress crossing the row's position
  const threshold = (index + 0.5) / total;
  const dotOpacity = useTransform(progress, [threshold - 0.05, threshold], [0.3, 1]);
  const dotScale = useTransform(progress, [threshold - 0.05, threshold], [0.6, 1]);

  return (
    <li ref={rowRef} className="relative pl-12 md:pl-16">
      {/* dot */}
      <motion.span
        aria-hidden
        style={{ opacity: dotOpacity, scale: dotScale }}
        className="absolute left-[8px] md:left-[12px] top-3 h-3.5 w-3.5 rounded-full bg-electric shadow-[0_0_18px_rgba(91,141,255,0.85)] origin-center"
      />
      {/* faint ring */}
      <span
        aria-hidden
        className="absolute left-[2px] md:left-[6px] top-[6px] h-6 w-6 rounded-full border border-electric/25"
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.18, y: 14 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 mb-3">
          <span className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-electric-soft">
            {milestone.year}
          </span>
          <span className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-3">
            / {milestone.place}
          </span>
        </div>
        <h3 className="font-playfair italic font-medium text-fog leading-[1.05] tracking-[-0.01em] text-[clamp(28px,4.2vw,52px)] mb-4">
          {milestone.title}
        </h3>
        <p className="font-playfair text-fog-2 text-lg md:text-xl leading-[1.65] max-w-[640px]">
          {milestone.body}
        </p>
      </motion.div>
    </li>
  );
}

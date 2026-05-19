"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TIMELINE, type Milestone } from "@/data/timeline";

export default function Timeline() {
  const railRef = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  // Track horizontal scroll progress for fade overlay + progress bar.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const handler = () => {
      const max = el.scrollWidth - el.clientWidth;
      const p = max <= 0 ? 1 : el.scrollLeft / max;
      setProgress(p);
      setAtEnd(p > 0.985);
    };
    handler();
    el.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      el.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return (
    <section
      id="timeline"
      aria-label="My life thus far"
      className="relative py-32 md:py-48"
    >
      {/* ── Header — full-width, vertically stacked, consistent left padding ── */}
      <div className="px-5 sm:px-8 md:px-10 lg:px-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-fog-3 mb-5 md:mb-6">
            ◇ Chapter ii / timeline
          </p>
          <h2 className="font-playfair italic font-medium text-fog leading-[1.02] tracking-[-0.02em] text-[clamp(44px,7vw,84px)]">
            My life,
            <br />
            <span className="text-fog/40">thus far.</span>
          </h2>
          <p className="font-playfair text-fog-2 mt-7 md:mt-8 text-base md:text-xl leading-[1.6] max-w-[560px]">
            Six waypoints that explain how I got here — and where I&apos;m
            pointed next.
          </p>
        </div>
      </div>

      {/* ── Horizontal scroll rail ── */}
      <div className="relative mt-14 md:mt-20">
        <ol
          ref={railRef}
          className="no-scrollbar flex gap-5 md:gap-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-2"
          style={{
            paddingLeft: "max(20px, calc((100vw - 1200px) / 2 + 20px))",
            paddingRight: "max(96px, 10vw)",
            scrollPaddingLeft: "max(20px, calc((100vw - 1200px) / 2 + 20px))",
          }}
          aria-label="Life milestones — scroll horizontally"
        >
          {TIMELINE.map((m, idx) => (
            <TimelineCard
              key={`${m.year}-${idx}`}
              milestone={m}
              index={idx}
              total={TIMELINE.length}
            />
          ))}
        </ol>

        {/* Right-edge fade hint (fades to 0 at end of rail) */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 right-0 w-20 md:w-32 transition-opacity duration-300"
          style={{
            opacity: atEnd ? 0 : 1,
            background:
              "linear-gradient(to left, rgba(6,7,10,1) 0%, rgba(6,7,10,0.85) 40%, rgba(6,7,10,0) 100%)",
          }}
        />
      </div>

      {/* ── Bottom progress indicator ── */}
      <div className="px-5 sm:px-8 md:px-10 lg:px-16 mt-8">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4">
          <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
            Scroll
          </span>
          <span aria-hidden className="text-fog-3 text-base leading-none">→</span>
          <div className="flex-1 max-w-[220px] h-px bg-edge relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-electric shadow-[0_0_10px_rgba(91,141,255,0.7)]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="font-jetbrains text-[10px] tracking-[0.2em] uppercase text-fog-4 tabular-nums">
            {String(
              Math.min(
                TIMELINE.length,
                Math.round(progress * (TIMELINE.length - 1)) + 1
              )
            ).padStart(2, "0")}
            <span className="text-fog-4/60"> / {String(TIMELINE.length).padStart(2, "0")}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

interface CardProps {
  milestone: Milestone;
  index: number;
  total: number;
}

function TimelineCard({ milestone, index, total }: CardProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px -10% 0px -10%" }}
      transition={{
        duration: 0.7,
        delay: Math.min(index, 4) * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="snap-start shrink-0 relative flex flex-col border border-edge rounded-xl bg-ink-2/40 backdrop-blur-sm overflow-hidden"
      style={{
        width: "min(360px, 86vw)",
        // Uniform height — all six cards match exactly
        height: "440px",
        padding: "28px",
      }}
    >
      {/* TOP — number + location label */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-jetbrains text-[10px] tracking-[0.24em] uppercase text-fog-4 tabular-nums">
          {String(index + 1).padStart(2, "0")}
          <span className="text-fog-4/60">
            {" "}/ {String(total).padStart(2, "0")}
          </span>
        </span>
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-electric-soft">
          {milestone.place}
        </span>
      </div>

      {/* Year row (only when an actual year exists) */}
      {milestone.year && milestone.year !== "—" && (
        <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3 mb-3">
          ◆ {milestone.year}
        </span>
      )}

      {/* TITLE — mid-sized, Playfair italic */}
      <h3 className="font-playfair italic font-medium text-fog leading-[1.05] tracking-[-0.015em] mb-5 text-[28px] md:text-[32px]">
        {milestone.title}
      </h3>

      {/* BODY */}
      <p className="font-playfair text-fog-2 text-[15px] md:text-[16px] leading-[1.6] flex-1 overflow-hidden">
        {milestone.body}
      </p>

      {/* Faint corner index — purely decorative, doesn't affect layout */}
      <span
        aria-hidden
        className="absolute -bottom-4 -right-2 font-playfair italic text-white/[0.04] select-none pointer-events-none"
        style={{ fontSize: "120px", lineHeight: 0.8 }}
      >
        {index + 1}
      </span>
    </motion.li>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TIMELINE, type Milestone } from "@/data/timeline";

export default function Timeline() {
  const railRef = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 — how far along the rail
  const [atEnd, setAtEnd] = useState(false);

  // Track horizontal scroll progress for the bottom indicator + fade fade-out.
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
      className="relative py-40 md:py-56"
    >
      {/* ── Header (full-width, vertical stack — unchanged) ── */}
      <div className="px-6 md:px-10 lg:px-16">
        <div className="max-w-[1080px] mx-auto">
          <div className="mb-20 md:mb-28 max-w-[680px]">
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
        </div>
      </div>

      {/* ── Horizontal scroll rail ── */}
      <div className="relative">
        <ol
          ref={railRef}
          className="no-scrollbar flex gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory px-6 md:px-10 lg:px-16 pb-2"
          style={{
            // generous end padding so the last card can fully clear the
            // right-edge fade overlay
            paddingRight: "max(96px, 8vw)",
            scrollPaddingLeft: "1.5rem",
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

        {/* Right-edge fade hint — fades out when user reaches the end */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 right-0 w-24 md:w-32 transition-opacity duration-300"
          style={{
            opacity: atEnd ? 0 : 1,
            background:
              "linear-gradient(to left, rgba(6,7,10,1) 0%, rgba(6,7,10,0.85) 40%, rgba(6,7,10,0) 100%)",
          }}
        />
      </div>

      {/* ── Scroll indicator (label + thin progress bar) ── */}
      <div className="px-6 md:px-10 lg:px-16 mt-8">
        <div className="max-w-[1080px] mx-auto flex items-center gap-4">
          <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
            Scroll
          </span>
          <span aria-hidden className="text-fog-3 text-base">
            →
          </span>
          <div className="flex-1 max-w-[200px] h-px bg-edge relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-electric shadow-[0_0_10px_rgba(91,141,255,0.7)]"
              style={{ width: `${progress * 100}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <span className="font-jetbrains text-[10px] tracking-[0.18em] uppercase text-fog-4">
            {String(Math.min(TIMELINE.length, Math.round(progress * (TIMELINE.length - 1)) + 1)).padStart(2, "0")}
            <span className="text-fog-4/60"> / {String(TIMELINE.length).padStart(2, "0")}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

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
      className="snap-start shrink-0 relative flex flex-col border border-edge rounded-xl bg-ink-2/40 backdrop-blur-sm p-7 md:p-8 overflow-hidden"
      style={{
        width: "min(380px, 86vw)",
        minHeight: "440px",
      }}
    >
      {/* glowing dot + ring — same vocabulary as the old vertical timeline */}
      <div className="flex items-center justify-between mb-7">
        <div className="relative">
          <span
            aria-hidden
            className="block h-3.5 w-3.5 rounded-full bg-electric shadow-[0_0_18px_rgba(91,141,255,0.85)]"
          />
          <span
            aria-hidden
            className="absolute -inset-[6px] rounded-full border border-electric/25"
          />
        </div>
        <span className="font-jetbrains text-[10px] tracking-[0.24em] uppercase text-fog-4">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* year + place row */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-5">
        <span className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-electric-soft">
          {milestone.year}
        </span>
        <span className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-3">
          / {milestone.place}
        </span>
      </div>

      <h3 className="font-playfair italic font-medium text-fog leading-[1.05] tracking-[-0.01em] text-[clamp(28px,3.2vw,40px)] mb-5">
        {milestone.title}
      </h3>

      <p className="font-playfair text-fog-2 text-base md:text-lg leading-[1.65]">
        {milestone.body}
      </p>

      {/* large faint index in the corner, matches Hero/Friction watermark vibe */}
      <span
        aria-hidden
        className="absolute -bottom-6 -right-2 font-playfair italic text-white/[0.03] select-none pointer-events-none"
        style={{ fontSize: "160px", lineHeight: 0.8 }}
      >
        {index + 1}
      </span>
    </motion.li>
  );
}

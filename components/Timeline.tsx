"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { TIMELINE, type Milestone } from "@/data/timeline";

/**
 * Horizontal scroll-jacked chapter book.
 *
 * Mechanic: the outer <section> is N * 100vh tall, so the page has plenty of
 * vertical scroll room. A sticky inner viewport stays pinned at 100vh while
 * the user scrolls through that range, and we map scroll progress (0..1) to a
 * negative translateX on the flex row of full-screen panels.
 *
 * Net effect: scrolling DOWN advances chapters horizontally. Each chapter
 * fills the entire viewport.
 */

const N = TIMELINE.length;

// Dwell fraction within each panel slot (0..1). The rest is the transition
// to the next panel. Higher = more "hold time" on each chapter.
const DWELL = 0.6;

// Build keyframed inputs/outputs so each panel holds still for the dwell
// portion of its slot, then transitions to the next during the remainder.
function buildXKeyframes() {
  const inputs: number[] = [0];
  const outputs: string[] = ["0vw"];
  for (let i = 0; i < N; i++) {
    const dwellEnd = (i + DWELL) / N;
    const slotEnd = (i + 1) / N;
    inputs.push(dwellEnd);
    outputs.push(`-${i * 100}vw`);
    if (i < N - 1) {
      inputs.push(slotEnd);
      outputs.push(`-${(i + 1) * 100}vw`);
    }
  }
  if (inputs[inputs.length - 1] < 1) {
    inputs.push(1);
    outputs.push(`-${(N - 1) * 100}vw`);
  }
  return { inputs, outputs };
}

const { inputs: X_INPUTS, outputs: X_OUTPUTS } = buildXKeyframes();

export default function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Keyframed translate — holds each panel still for DWELL of its slot.
  const x = useTransform(scrollYProgress, X_INPUTS, X_OUTPUTS);

  // Discrete chapter index (drives the "01 / 06" indicator)
  const [chapter, setChapter] = useState(0);
  // Continuous 0..100 percentage
  const [percent, setPercent] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // Clamp so the count doesn't overshoot at boundaries.
    const clamped = Math.max(0, Math.min(1, p));
    setChapter(Math.min(N - 1, Math.floor(clamped * N)));
    setPercent(Math.round(clamped * 100));
  });

  return (
    <>
      {/* ── Vertical header (stays full-width, stacked, as requested) ── */}
      <div className="px-6 md:px-10 lg:px-16 pt-40 md:pt-56 pb-24 md:pb-32">
        <div className="max-w-[1080px] mx-auto">
          <div className="max-w-[680px]">
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
              pointed next. Keep scrolling to advance the chapters.
            </p>
          </div>
        </div>
      </div>

      {/* ── Scroll-jacked horizontal chapter book ── */}
      <section
        ref={sectionRef}
        id="timeline"
        aria-label="My life — chapters"
        className="relative"
        style={{ height: `${N * 200}vh` }}
      >
        <div className="sticky top-0 h-screen w-screen overflow-hidden bg-ink">
          {/* Moving rail of panels */}
          <motion.ol
            style={{ x }}
            className="flex h-full will-change-transform"
          >
            {TIMELINE.map((m, idx) => (
              <ChapterPanel
                key={`${m.year}-${idx}`}
                milestone={m}
                index={idx}
                progress={scrollYProgress}
              />
            ))}
          </motion.ol>

          {/* Fixed UI overlay — stays put while panels translate beneath */}
          <FixedOverlay chapter={chapter} percent={percent} progress={scrollYProgress} />
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

interface PanelProps {
  milestone: Milestone;
  index: number;
  progress: MotionValue<number>;
}

function ChapterPanel({ milestone, index, progress }: PanelProps) {
  // Each panel "owns" the progress slice [index/N, (index+1)/N]. Within that
  // slice, the rail holds still for the first DWELL portion, then transitions
  // out. We mirror that with content opacity: full during dwell, fade during
  // transitions, so text "lands" and stays put before sliding away.
  const inStart = (index - (1 - DWELL)) / N; // start of incoming transition
  const dwellStart = index / N;
  const dwellEnd = (index + DWELL) / N;
  const outEnd = (index + 1) / N;

  const contentOpacity = useTransform(
    progress,
    [inStart, dwellStart, dwellEnd, outEnd],
    [0, 1, 1, 0]
  );
  const contentY = useTransform(
    progress,
    [inStart, dwellStart, dwellEnd, outEnd],
    [40, 0, 0, -40]
  );
  const watermarkOpacity = useTransform(
    progress,
    [inStart, dwellStart, dwellEnd, outEnd],
    [0, 0.06, 0.06, 0]
  );

  // Big watermark text — year when present, otherwise the chapter number.
  const watermark = milestone.year && milestone.year !== "—" ? milestone.year : String(index + 1).padStart(2, "0");

  return (
    <li className="relative shrink-0 h-full w-screen flex items-center px-8 md:px-16 lg:px-24 overflow-hidden">
      {/* Bottom-left huge watermark */}
      <motion.span
        aria-hidden
        style={{ opacity: watermarkOpacity }}
        className="absolute -bottom-6 md:-bottom-12 left-4 md:left-8 font-syne font-extrabold uppercase tracking-tighter text-fog leading-[0.8] select-none pointer-events-none"
      >
        <span className="block text-[28vw] md:text-[24vw]">{watermark}</span>
      </motion.span>

      {/* Center content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 max-w-[1100px] w-full"
      >
        {/* Chapter label */}
        <p className="font-jetbrains text-[11px] md:text-[12px] tracking-[0.24em] uppercase text-fog-3 mb-8 md:mb-10">
          ※ Chapter · {String(index + 1).padStart(2, "0")} ·{" "}
          <span className="text-electric-soft">{milestone.place}</span>
        </p>

        {/* Headline — Playfair italic, big-and-quiet editorial energy */}
        <h3 className="font-playfair italic font-medium text-fog leading-[0.96] tracking-[-0.025em] mb-8 md:mb-10 text-[clamp(56px,10vw,148px)]">
          {milestone.title.replace(/\.$/, "")}
          <span className="text-electric-soft">.</span>
        </h3>

        {/* Body */}
        <p className="font-playfair text-fog-2 leading-[1.55] max-w-[720px] text-[clamp(15px,1.5vw,22px)]">
          {milestone.body}
        </p>

        {/* Year tag (only when an actual year exists) */}
        {milestone.year && milestone.year !== "—" && (
          <p className="font-jetbrains text-[11px] tracking-[0.24em] uppercase text-fog-4 mt-10">
            ◆ {milestone.year}
          </p>
        )}
      </motion.div>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

interface OverlayProps {
  chapter: number;
  percent: number;
  progress: MotionValue<number>;
}

function FixedOverlay({ chapter, percent, progress }: OverlayProps) {
  const barWidth = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none z-20 flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-start justify-between p-6 md:p-8 lg:p-10">
        {/* Brand mark */}
        <span className="font-syne font-extrabold uppercase text-fog tracking-tighter text-base md:text-lg">
          SF<span className="text-electric-soft">.</span>
        </span>

        {/* Chapter counter + progress bar */}
        <div className="flex items-center gap-4 md:gap-5">
          <span className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-2">
            <span className="text-fog">
              {String(chapter + 1).padStart(2, "0")}
            </span>
            <span className="text-fog-4"> / {String(N).padStart(2, "0")}</span>
          </span>
          <div className="hidden sm:block w-[120px] md:w-[160px] h-px bg-edge relative overflow-hidden">
            <motion.div
              style={{ width: barWidth }}
              className="absolute inset-y-0 left-0 bg-electric shadow-[0_0_10px_rgba(91,141,255,0.7)]"
            />
          </div>
          <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-4 tabular-nums">
            {String(percent).padStart(2, "0")}%
          </span>
        </div>
      </div>

      {/* Bottom cue */}
      <div className="mt-auto flex items-end justify-between p-6 md:p-8 lg:p-10">
        <span className="font-jetbrains text-[10px] tracking-[0.24em] uppercase text-fog-4">
          ◇ My life · chapter ii
        </span>
        <span className="font-jetbrains text-[10px] tracking-[0.24em] uppercase text-fog-3 flex items-center gap-2">
          Scroll
          <span aria-hidden className="text-base">↓</span>
        </span>
      </div>
    </div>
  );
}

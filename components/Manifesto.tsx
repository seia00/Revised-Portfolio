"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Manifesto — Chapter V.
 *
 * Scroll-driven cinematic text reveal. Seven sentences each occupy 100vh of
 * scroll; an extra step at the top is reserved for the chapter eyebrow.
 * Sentences cross-fade via opacity tied to scroll progress (no animation
 * library — plain scroll listener throttled with requestAnimationFrame).
 */

const SENTENCES = [
  "My name is Seia Funayama. I'm 15, based in Japan, working at the intersection of AI and software development.",
  "I'm very opinionated — and I'm never afraid to back it up.",
  "I love surrounding myself with hungry and extreme people.",
  "I truly believe that life was made to live on the edge.",
  "I'm aiming to make $10,000 from my first online business this summer.",
  "I am so ahead of everyone at my age. I am never afraid to try new things.",
  "If I sound like someone you'd like to work with — I'm always open.",
];

const N = SENTENCES.length;
const STEPS = N + 1;             // step 0 = chapter eyebrow, 1..N = sentences
const SECTION_VH = STEPS * 100;  // total vertical scroll length

// Smoothstep — eases linear distance into a soft S-curve so each sentence
// "breathes" at full opacity instead of snapping at its peak.
function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const update = () => {
      rafId = null;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
    };
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // For each step, peak at its center, fade to 0 at neighbor centers.
  // smoothstep gives a soft hold around the peak — feels like breathing.
  const opacities = Array.from({ length: STEPS }, (_, i) => {
    const center = (i + 0.5) / STEPS;
    const dist = Math.abs(progress - center) * STEPS;
    if (dist >= 1) return 0;
    return smoothstep(1 - dist);
  });

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      aria-label="Manifesto"
      className="relative"
      style={{ height: `${SECTION_VH}vh`, backgroundColor: "#000" }}
    >
      {/* Soft seam blends — feathers the section edges into surrounding ink */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-20 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-ink), transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-20 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--color-ink), transparent)",
        }}
      />

      {/* Pinned viewport */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center px-6">
        {/* Top-left "// manifesto" label, visible only while section is in view */}
        <span
          aria-hidden
          className="absolute top-6 left-6 md:top-8 md:left-10 font-jetbrains text-[10px] tracking-[0.22em] text-fog-3 z-20"
        >
          // manifesto
        </span>

        {/* Chapter eyebrow — fades in first, then yields to the sentences */}
        <p
          className="absolute left-0 right-0 text-center font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-3 z-20"
          style={{ top: "38vh", opacity: opacities[0] }}
        >
          ◇ Chapter v · manifesto
        </p>

        {/* Stacked sentence layers — all absolute-positioned in the same
            centered spot; opacity is the only thing that changes per step. */}
        <div className="relative w-full max-w-[1100px] h-full pointer-events-none">
          {SENTENCES.map((text, i) => (
            <ManifestoLine
              key={i}
              text={text}
              opacity={opacities[i + 1]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function ManifestoLine({ text, opacity }: { text: string; opacity: number }) {
  // Pull the trailing period off so we can render it in orange.
  const trimmed = text.trimEnd();
  const hasPeriod = trimmed.endsWith(".");
  const body = hasPeriod ? trimmed.slice(0, -1) : trimmed;

  return (
    <p
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-2"
      style={{
        opacity,
        // Hide from layout when fully transparent so nothing visually flashes
        // and screen-reader cursors don't land on invisible text.
        visibility: opacity < 0.01 ? "hidden" : "visible",
      }}
    >
      <span
        className="font-inter font-light leading-[1.3] tracking-[-0.02em]"
        style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
      >
        <span
          style={{
            backgroundImage:
              "linear-gradient(135deg, #4a6fa5 0%, #6b93d6 50%, #8ab4f8 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          {body}
        </span>
        {hasPeriod && (
          <span
            style={{
              color: "#ff6b2b",
              fontSize: "1.1em",
              textShadow: "0 0 12px rgba(255, 107, 43, 0.6)",
              marginLeft: "0.02em",
            }}
          >
            .
          </span>
        )}
      </span>
    </p>
  );
}

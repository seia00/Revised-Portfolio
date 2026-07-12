"use client";

import { useEffect, useRef } from "react";

/**
 * Manifesto — Chapter II.
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

// Smoothstep — eases linear into a soft S-curve so the fade-in/out
// feels like a held breath, not a snap.
function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

// Each step owns its own zone with NO crossfade overlap into neighbours
// — overlapping wrapped sentences turn into visual mush on mobile.
// Trapezoid: fade in over first 15%, hold flat for 70%, fade out over
// final 15%. At zone boundaries both adjacent sentences are at 0 — a
// brief film-cut to black, which reads as cinematic.
function stepOpacity(progress: number, i: number): number {
  const local = (progress - i / STEPS) * STEPS;
  if (local < 0 || local > 1) return 0;
  if (local < 0.15) return smoothstep(local / 0.15);
  if (local > 0.85) return smoothstep((1 - local) / 0.15);
  return 1;
}

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  // Layer 0 = chapter eyebrow, 1..N = sentences. Opacity is written
  // straight to the DOM in the rAF handler — a React state update here
  // would re-render the whole section on every scroll frame across an
  // ~800vh range for what is purely a style mutation.
  const layersRef = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const update = () => {
      rafId = null;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / total));
      for (let i = 0; i < STEPS; i++) {
        const layer = layersRef.current[i];
        if (!layer) continue;
        const op = stepOpacity(p, i);
        layer.style.opacity = op.toFixed(3);
        layer.style.visibility = op < 0.01 ? "hidden" : "visible";
      }
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

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      aria-label="Manifesto"
      className="manifesto-section relative"
      style={{ backgroundColor: "#000" }}
    >
      {/* Responsive scroll length — long on desktop for cinematic weight,
          shorter on mobile so the section isn't a 6000px commitment. */}
      <style>{`
        .manifesto-section { height: ${STEPS * 100}vh; }
        @media (max-width: 768px) { .manifesto-section { height: ${STEPS * 70}vh; } }
      `}</style>
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
          ref={(el) => { layersRef.current[0] = el; }}
          className="absolute left-0 right-0 text-center font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-3 z-20"
          style={{ top: "38vh", opacity: 0, visibility: "hidden" }}
        >
          ◇ Chapter ii · manifesto
        </p>

        {/* Stacked sentence layers — all absolute-positioned in the same
            centered spot; opacity is the only thing that changes per step. */}
        <div className="relative w-full max-w-[1100px] h-full pointer-events-none">
          {SENTENCES.map((text, i) => (
            <ManifestoLine
              key={i}
              text={text}
              lineRef={(el) => { layersRef.current[i + 1] = el; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function ManifestoLine({
  text,
  lineRef,
}: {
  text: string;
  lineRef: (el: HTMLParagraphElement | null) => void;
}) {
  // Pull the trailing period off so we can render it in orange.
  const trimmed = text.trimEnd();
  const hasPeriod = trimmed.endsWith(".");
  const body = hasPeriod ? trimmed.slice(0, -1) : trimmed;

  return (
    <p
      ref={lineRef}
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-2"
      // Starts hidden; the scroll handler writes opacity/visibility
      // directly (keeps invisible text away from screen-reader cursors
      // without re-rendering React on every frame).
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <span
        className="leading-[1.3] tracking-[-0.02em]"
        style={{
          fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
          fontFamily: "'Quffer', 'Playfair Display', serif",
          fontWeight: 400,
        }}
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

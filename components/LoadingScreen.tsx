"use client";

import { useEffect, useRef, useState } from "react";
import { onSignal, signal } from "@/lib/boot";

/**
 * Full-bleed curtain that holds the page until the Spline hero has booted.
 *
 * The wordmark writes itself: the capital S settles first, then e, i and a
 * slide out from behind it one at a time. The trailing letters live inside
 * `.ls-slide`, a container clipped flush with the S's right edge — so their
 * starting offsets (measured at runtime, since a script face gives no
 * predictable advance widths) park them out of sight underneath the S until
 * they travel out.
 */

const TRAIL = ["e", "i", "a"];

// Choreography, in ms. Letters move strictly one at a time — they end at
// different x, so a later letter always overtakes an earlier one, and
// overlapping travel reads as a scramble rather than a sequence.
const S_SETTLE = 260;
const SLIDE = 600;
const STAGGER = 460;
const HOLD = 400;
// When the last letter reaches its place.
const SETTLED = S_SETTLE + STAGGER * (TRAIL.length - 1) + SLIDE;
const MIN_VISIBLE = SETTLED + HOLD;

// Ceiling on how long we'll wait for the 3D scene before lifting anyway.
const SCENE_TIMEOUT = 4500;
// Ceiling on how long we'll wait for the script face before measuring.
const FONT_TIMEOUT = 1500;
const EXIT = 750;

type Phase = "loading" | "exit" | "done";

export default function LoadingScreen() {
  const [phase, setPhase] = useState<Phase>("loading");
  const innerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLSpanElement>(null);
  const trailRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Measure each trailing letter's travel, then kick off the choreography.
  useEffect(() => {
    let cancelled = false;
    let started = false;
    let raf = 0;
    let settle = 0;

    const start = () => {
      if (cancelled || started) return;
      const inner = innerRef.current;
      const word = wordRef.current;
      const cap = capRef.current;
      const slide = trailRefs.current[0]?.parentElement;
      if (!inner || !word || !cap || !slide) return;
      started = true;

      // The S carries a settle transform, so its client rect is the *scaled*
      // box — go through offsetLeft for its true laid-out left edge.
      const wordLeft = word.getBoundingClientRect().left;
      const capLeft = wordLeft + cap.offsetLeft;
      // The reveal edge: anything left of this is hidden by `.ls-slide`. Its
      // clip-path leans a little left of the box, so read the resolved inset
      // back rather than assuming the box edge.
      const inset = getComputedStyle(slide).clipPath.match(/-?[\d.]+px/g);
      const clipLeft =
        slide.getBoundingClientRect().left + (inset ? parseFloat(inset[3]) : 0);
      // Slack for the ink a script glyph throws past its own advance width.
      const bleed = parseFloat(getComputedStyle(word).fontSize) * 0.2;

      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        const box = el.getBoundingClientRect();
        // Park at the S's left edge, but never so far right that any part of
        // the glyph pokes past the reveal edge before it starts moving.
        const dx = Math.min(capLeft - box.left, clipLeft - box.right - bleed);
        el.style.setProperty("--dx", `${dx}px`);
        el.style.setProperty("--d", `${S_SETTLE + i * STAGGER}ms`);
      });

      // Reveal the parked layout, let it paint, *then* release the transitions.
      inner.classList.add("is-set");
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          if (!cancelled) inner.classList.add("is-go");
        });
      });

      // Once everyone's home, widen the reveal edge back out. It cuts the
      // letters' bloom while it's doing its job, which leaves a seam down the
      // middle of the finished wordmark.
      settle = window.setTimeout(() => {
        if (!cancelled) inner.classList.add("is-settled");
      }, SETTLED);
    };

    // A script face has wildly different metrics from the fallback, so the
    // measurement is only meaningful once the real font is in.
    const fallback = setTimeout(start, FONT_TIMEOUT);
    document.fonts.ready.then(() => {
      clearTimeout(fallback);
      start();
    });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      clearTimeout(settle);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Lift the curtain once the scene is up (or we've waited long enough),
  // never before the wordmark has finished writing itself.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const floor = reduced ? 600 : MIN_VISIBLE;
    const t0 = performance.now();
    let claimed = false;
    let exitTimer = 0;
    let doneTimer = 0;

    const lift = () => {
      if (claimed) return;
      claimed = true;
      const wait = Math.max(0, floor - (performance.now() - t0));
      exitTimer = window.setTimeout(() => {
        setPhase("exit");
        doneTimer = window.setTimeout(() => {
          setPhase("done");
          signal("reveal");
        }, EXIT);
      }, wait);
    };

    const off = onSignal("scene", lift);
    const cap = setTimeout(lift, SCENE_TIMEOUT);

    return () => {
      off();
      clearTimeout(cap);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  // Hold the page at the top and freeze scrolling behind the curtain.
  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className="ls-root"
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div ref={innerRef} className="ls-inner">
        <div className="ls-glow" aria-hidden />

        <div ref={wordRef} className="ls-word" aria-hidden>
          <span ref={capRef} className="ls-cap">
            S
          </span>
          <span className="ls-slide">
            {TRAIL.map((ch, i) => (
              <span
                key={ch}
                ref={(el) => {
                  trailRefs.current[i] = el;
                }}
                className="ls-letter"
                style={{ zIndex: TRAIL.length - i }}
              >
                {ch}
              </span>
            ))}
          </span>
        </div>

        <div className="ls-rule" aria-hidden />
      </div>
    </div>
  );
}

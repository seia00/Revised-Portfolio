"use client";

import { useEffect, useRef, useState } from "react";
import { signal } from "@/lib/boot";

/**
 * Full-bleed curtain over the page while the wordmark writes itself.
 *
 * The wordmark writes itself: the capital S settles first, then e, i and a
 * slide out from behind it one at a time. The trailing letters live inside
 * `.ls-slide`, whose left edge carries a feathered mask — so their starting
 * offsets (measured at runtime, since a script face gives no predictable
 * advance widths) park them out of sight underneath the S, and each one
 * dissolves into view as it crosses the ramp rather than being cut by it.
 */

const TRAIL = ["e", "i", "a"];

// Choreography, in ms. Must stay in step with the durations in globals.css.
//
// The stagger is deliberately shorter than the slide, so a letter is always
// launching while the one before it is still decelerating — there's no beat
// where the wordmark is completely static. It can't shrink much further
// though: all three start stacked behind the S and finish at different x, so
// too much overlap has them visibly crossing each other.
const S_SETTLE = 700;
const SLIDE = 900;
const STAGGER = 520;
// Beat to sit on the finished wordmark before the curtain lifts.
const HOLD = 1000;
// When the last letter reaches its place, measured from the moment motion
// starts — not from mount. Font loading and the warm-up sit in between.
const SETTLED = S_SETTLE + STAGGER * (TRAIL.length - 1) + SLIDE;
// Paint-to-raster grace before releasing the first transition.
const WARMUP = 120;

// Hard backstop in case measurement never runs — the page is frozen
// behind the curtain until it lifts, so it must always lift.
const STUCK_TIMEOUT = 6000;
// Ceiling on how long we'll wait for the script face before measuring.
const FONT_TIMEOUT = 1500;
const EXIT = 1000;

type Phase = "loading" | "exit" | "done";

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
    let launched = false;
    let raf = 0;
    let settle = 0;
    let warmup = 0;
    let exitTimer = 0;
    let doneTimer = 0;
    let lifted = false;

    // Hold for `wait`, dissolve, unmount, then release the page.
    const lift = (wait: number) => {
      if (lifted || cancelled) return;
      lifted = true;
      exitTimer = window.setTimeout(() => {
        setPhase("exit");
        doneTimer = window.setTimeout(() => {
          setPhase("done");
          signal("reveal");
        }, EXIT);
      }, wait);
    };

    // Park the trailing letters underneath the S. Re-runnable, because the
    // font size is viewport-derived: a resize (or a rotation) before the
    // letters launch would otherwise leave them parked against stale metrics
    // — visible, and short of the S.
    //
    // Strictly before launch, though. Afterwards the is-go rule pins every
    // letter at translateX(0), so --dx has nothing left to say, and moving a
    // letter mid-flight would only jerk it.
    const measure = () => {
      if (launched) return;
      const word = wordRef.current;
      const cap = capRef.current;
      const slide = trailRefs.current[0]?.parentElement;
      if (!word || !cap || !slide) return;

      // Everything here works in the word's own coordinate space via
      // offsetLeft. Client rects would be wrong: the S and the letters both
      // carry entrance transforms, so their rects are the *transformed*
      // boxes, not where the type actually sits.
      const capLeft = cap.offsetLeft;
      // The reveal edge is now `.ls-slide`'s own border-box left: its mask
      // ramps from fully transparent exactly there. The box already sits
      // 0.3em left of where the letters start (padding out, negative margin
      // back), so this needs no correction — it used to parse the value out
      // of the clip-path that the mask replaced.
      const hideLeft = slide.offsetLeft;
      // Slack for everything a glyph throws past its own advance width:
      // script overhang, the launch stretch, the halo, the stroke.
      const bleed = parseFloat(getComputedStyle(word).fontSize) * 0.25;

      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        // Park at the S's left edge, but never so far right that any part of
        // the glyph pokes into the ramp before it starts moving.
        const dx = Math.min(
          capLeft - el.offsetLeft,
          hideLeft - (el.offsetLeft + el.offsetWidth) - bleed
        );
        el.style.setProperty("--dx", `${dx}px`);
        el.style.setProperty("--d", `${S_SETTLE + i * STAGGER}ms`);
      });
    };

    const start = () => {
      if (cancelled || started) return;
      const inner = innerRef.current;
      if (!inner) return;
      started = true;

      measure();

      // Reveal the parked layout, then hold for a warm-up beat before
      // releasing the transitions. Two frames is enough to guarantee the
      // start state has been *painted*, but not to guarantee the promoted
      // layers have been rasterized — and the first frame of a move that
      // still has to raster a 360px glyph is the frame that gets dropped.
      // The screen is black throughout, so the wait costs nothing to look at.
      inner.classList.add("is-set");
      warmup = window.setTimeout(() => {
        raf = requestAnimationFrame(() => {
          if (cancelled) return;
          launched = true;
          inner.classList.add("is-go");

          // Everything downstream is timed from the moment motion actually
          // starts, not from measurement — otherwise the warm-up eats into
          // the hold and the flare fires while letters are still moving.
          settle = window.setTimeout(
            () => {
              if (cancelled) return;
              inner.classList.add("is-settled");
              // Wordmark complete: hold on it, then lift. Nothing else to
              // wait for — the hero is CSS now, so there's no scene boot to
              // gate on the way there used to be.
              lift(prefersReduced() ? 250 : HOLD);
            },
            // Under reduced motion the CSS durations collapse to nothing, so
            // the wordmark is already complete — don't sit on a static screen.
            prefersReduced() ? 0 : SETTLED
          );
        });
      }, WARMUP);
    };

    // A script face has wildly different metrics from the fallback, so the
    // measurement is only meaningful once the real font is in. Wait on that
    // one face specifically — `document.fonts.ready` would also block on the
    // five body faces the curtain doesn't use, which delays the whole
    // sequence for nothing.
    const fallback = setTimeout(start, FONT_TIMEOUT);
    const scriptFace = () => {
      const word = wordRef.current;
      if (!word) return Promise.resolve();
      const cs = getComputedStyle(word);
      const face = cs.fontFamily.split(",")[0].trim();
      return document.fonts.load(`${cs.fontSize} ${face}`);
    };
    scriptFace()
      .catch(() => {})
      .then(() => {
        clearTimeout(fallback);
        start();
      });

    window.addEventListener("resize", measure);

    // Backstop. If measurement never happens the curtain would sit there
    // forever with the page frozen behind it, so lift regardless.
    const cap = window.setTimeout(() => lift(0), STUCK_TIMEOUT);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      clearTimeout(settle);
      clearTimeout(warmup);
      clearTimeout(cap);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
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
        {/* .ls-stage carries the constant camera push, separately from the
            exit scale on .ls-inner — one element can't run an animation and
            a transition on the same property. */}
        <div className="ls-stage">
          <div className="ls-glow" aria-hidden />
          <div className="ls-flare" aria-hidden />

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
    </div>
  );
}

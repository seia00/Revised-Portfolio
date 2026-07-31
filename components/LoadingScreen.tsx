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
const S_SETTLE = 520;
const SLIDE = 720;
const STAGGER = 480;
// Beat to sit on the finished wordmark before the curtain lifts.
const HOLD = 1000;
// When the last letter reaches its place.
const SETTLED = S_SETTLE + STAGGER * (TRAIL.length - 1) + SLIDE;
const MIN_VISIBLE = SETTLED + HOLD;

// Ceiling on how long we'll wait for the 3D scene before lifting anyway.
const SCENE_TIMEOUT = 5000;
// Ceiling on how long we'll wait for the script face before measuring.
const FONT_TIMEOUT = 1500;
const EXIT = 850;

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
    let launched = false;
    let raf = 0;
    let settle = 0;

    // Park the trailing letters underneath the S. Re-runnable, because the
    // font size is viewport-derived: a resize (or a rotation) before the
    // letters launch would otherwise leave them parked against stale metrics
    // — visible, and short of the S.
    //
    // Strictly before launch, though. Afterwards the is-go rule pins every
    // letter at translateX(0), so --dx has nothing left to say, and reading
    // the reveal edge back once is-settled has widened it would compute a
    // parking spot from the wrong geometry.
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
      // The reveal edge: anything left of this is hidden by `.ls-slide`. Its
      // clip-path leans a little left of the box, so read the resolved inset
      // back rather than assuming the box edge.
      const inset = getComputedStyle(slide).clipPath.match(/-?[\d.]+px/g);
      const clipLeft = slide.offsetLeft + (inset ? parseFloat(inset[3]) : 0);
      // Slack for everything a glyph throws past its own advance width:
      // script overhang, the launch stretch, the motion blur, the stroke.
      const bleed = parseFloat(getComputedStyle(word).fontSize) * 0.25;

      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        // Park at the S's left edge, but never so far right that any part of
        // the glyph pokes past the reveal edge before it starts moving.
        const dx = Math.min(
          capLeft - el.offsetLeft,
          clipLeft - (el.offsetLeft + el.offsetWidth) - bleed
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

      // Reveal the parked layout, let it paint, *then* release the transitions.
      inner.classList.add("is-set");
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          if (cancelled) return;
          launched = true;
          inner.classList.add("is-go");
        });
      });

      // Once everyone's home: drop the reveal edge (it clips the letters'
      // halo into a seam beside the S), pulse the flare, and release the
      // heavy work that's been waiting for a quiet main thread.
      settle = window.setTimeout(() => {
        if (cancelled) return;
        inner.classList.add("is-settled");
        signal("stage");
      }, SETTLED);
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

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      clearTimeout(settle);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
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
  );
}

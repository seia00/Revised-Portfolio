import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import type { VirtualScrollData } from "lenis";

/**
 * Slow zones: moments in the page that the scroll slows down through.
 *
 * Around each one the same push of the wheel or finger carries the page less
 * far, easing down to a fraction of its pace at the moment itself and back up
 * either side. The page never stops and nothing is taken from the reader's
 * hands — it gets heavier where there is something to take in, so the eye has
 * time to land, and is light again in between.
 *
 * It works on the input rather than the scroll position, so Lenis still eases
 * every move and the slowing is felt rather than seen as a change of gear.
 *
 * Sections declare their moments with `useSlowZones`, as a function that
 * measures them on demand, so they always match the current layout.
 */

/** Something on the page that can say where its moments are, in px of scroll. */
type Measure = () => readonly number[];

const sources = new Set<Measure>();

/** How slow the page gets at the heart of a zone, as a fraction of its pace. */
const SLOWEST = 0.4;

/** How far a zone reaches either side of its moment, in screens. */
const REACH = 0.22;

/** How finely a move is walked through the zones, in px of input. */
const STEP = 2;

/** Every moment on the page. */
function allMoments(): number[] {
  const moments: number[] = [];
  for (const measure of sources) moments.push(...measure());
  return moments;
}

/**
 * The page's pace at scroll position `x`, as a fraction of normal: a cosine
 * dip around each moment, so it eases in and out of the slowing with no edge
 * to feel. Where zones overlap the slowest one holds; they do not compound.
 */
function paceAt(x: number, moments: readonly number[], reach: number): number {
  let pace = 1;
  for (const moment of moments) {
    const t = Math.abs(x - moment) / reach;
    if (t >= 1) continue;
    const dip = 1 - (1 - SLOWEST) * 0.5 * (1 + Math.cos(Math.PI * t));
    if (dip < pace) pace = dip;
  }
  return pace;
}

/**
 * How far `input` px of scrolling carries the page from `from`, walked through
 * every zone it passes so a long fling slows where it crosses one, not just
 * where it starts.
 */
function travel(from: number, input: number, moments: readonly number[], reach: number): number {
  const near = moments.some((m) => Math.abs(m - from) < Math.abs(input) + reach);
  if (!near) return input;
  const direction = Math.sign(input);
  let x = from;
  for (let left = Math.abs(input); left > 0; left -= STEP) {
    x += direction * Math.min(left, STEP) * paceAt(x, moments, reach);
  }
  return x - from;
}

/** Declare a section's moments. `measure` is called whenever the page moves. */
export function useSlowZones(measure: Measure): void {
  const latest = useRef(measure);

  useEffect(() => {
    latest.current = measure;
  });

  useEffect(() => {
    const source: Measure = () => latest.current();
    sources.add(source);
    return () => {
      sources.delete(source);
    };
  }, []);
}

/**
 * Lenis's `virtualScroll` hook: every wheel and touch move passes through here
 * before Lenis acts on it, and is shortened by the zones it crosses. Lenis
 * reads the delta back off `data` after this returns, which is the documented
 * way to adjust it.
 */
export function createSlowdown(getLenis: () => Lenis | undefined) {
  return (data: VirtualScrollData): boolean => {
    const lenis = getLenis();
    if (!lenis || data.event.ctrlKey) return true;

    const moments = allMoments();
    if (moments.length === 0) return true;
    const reach = REACH * window.innerHeight;
    const from = lenis.targetScroll;

    // A released touch carries on under its own inertia, which Lenis sizes
    // from the finger's velocity rather than this delta — so the throw is
    // slowed once Lenis has set it going, the moment this event is done.
    if (data.event.type === "touchend") {
      if (!lenis.options.syncTouch) return true;
      queueMicrotask(() => {
        const thrown = lenis.targetScroll - from;
        if (thrown === 0) return;
        const slowed = travel(from, thrown, moments, reach);
        if (slowed === thrown) return;
        lenis.scrollTo(from + slowed, {
          programmatic: false,
          lerp: lenis.options.syncTouchLerp,
        });
      });
      return true;
    }

    if (data.deltaY !== 0) data.deltaY = travel(from, data.deltaY, moments, reach);
    return true;
  };
}

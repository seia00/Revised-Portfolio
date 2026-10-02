import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import type { VirtualScrollData } from "lenis";

/**
 * Scroll stops: points the page comes to rest on and will not be flung past.
 *
 * This is scroll snapping with `scroll-snap-stop: always` semantics, done on
 * top of Lenis because CSS snapping fights a smoothed scroll. A gesture that
 * would carry the page across a stop is caught, eased into the stop, and the
 * rest of that gesture — including a trackpad's momentum, which keeps firing
 * wheel events for a second or more after the fingers lift — is absorbed. Only
 * a new gesture, after a short rest, moves the page on. Between stops the page
 * scrolls freely, so a long section can still be read at the reader's pace.
 *
 * Sections declare their stops with `useScrollStops`, as a function that
 * measures them on demand, so they always match the current layout.
 */

/** Something on the page that can say where its stops are, in px of scroll. */
type Measure = () => readonly number[];

const sources = new Set<Measure>();

/** How long the page rests on a stop once it has arrived, in ms. */
const DWELL = 500;

/** Fallback for an arrival that never completes (another scroll took over). */
const MAX_WAIT = 2000;

/** A pause in wheel input this long means the hand has left the wheel. */
const GESTURE_GAP = 200;

/**
 * A wheel delta this much bigger than the one before is a fresh push. Momentum
 * only ever decays, so a rise means a hand is on the wheel again.
 */
const SURGE = 1.6;

/** A stop within this many px of the scroll position is the one being stood on. */
const EDGE = 2;

/** How gently the page eases into a stop. */
const SETTLE_LERP = 0.075;

/** Every stop on the page, ascending. */
function allStops(): number[] {
  const stops: number[] = [];
  for (const measure of sources) {
    for (const stop of measure()) stops.push(Math.round(stop));
  }
  return stops.sort((a, b) => a - b);
}

/** The first stop a move from `from` to `to` would cross, if any. */
function crossed(from: number, to: number): number | undefined {
  const stops = allStops();
  if (to > from) return stops.find((stop) => stop > from + EDGE && stop <= to);
  for (let i = stops.length - 1; i >= 0; i--) {
    if (stops[i] < from - EDGE && stops[i] >= to) return stops[i];
  }
  return undefined;
}

/** Declare a section's stops. `measure` is called whenever the page moves. */
export function useScrollStops(measure: Measure): void {
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

type Hold = {
  /** The stop being held. */
  at: number;
  since: number;
  arrivedAt: number | null;
  /** Whether a new gesture has begun since the page was caught. */
  fresh: boolean;
};

/**
 * The gate every wheel and touch event passes through before Lenis acts on it,
 * as Lenis's `virtualScroll` option. Returning false drops the event.
 */
export function createStopGate(getLenis: () => Lenis | undefined) {
  let hold: Hold | null = null;
  let lastAt = 0;
  let lastAbs = 0;
  let lastSign = 0;

  function absorb(event: Event): false {
    if (event.cancelable) event.preventDefault();
    return false;
  }

  return ({ deltaY, event }: VirtualScrollData): boolean => {
    const lenis = getLenis();
    if (!lenis || event.ctrlKey) return true;

    const now = performance.now();
    const touch = event.type.startsWith("touch");
    const abs = Math.abs(deltaY);
    const sign = Math.sign(deltaY);

    const fresh = touch
      ? event.type === "touchstart"
      : now - lastAt > GESTURE_GAP ||
        (sign !== 0 && sign !== lastSign) ||
        abs > lastAbs * SURGE + 4;
    if (!touch) {
      lastAt = now;
      lastAbs = abs;
      lastSign = sign;
    }

    if (hold) {
      // Something else moved the page — a nav link, a chapter marker — so
      // there is nothing left to hold.
      if (Math.abs(lenis.targetScroll - hold.at) > EDGE) hold = null;
    }

    if (hold) {
      if (fresh) hold.fresh = true;
      const rested =
        hold.arrivedAt === null
          ? now - hold.since >= MAX_WAIT
          : now - hold.arrivedAt >= DWELL;
      if (!hold.fresh || !rested) return absorb(event);
      hold = null;
    }

    // A released touch carries on under its own inertia, and Lenis sizes that
    // throw from the finger's velocity rather than its last move — so the
    // check has to look as far ahead as Lenis is about to go.
    const travel =
      event.type === "touchend" && lenis.options.syncTouch
        ? Math.sign(deltaY) * Math.abs(lenis.velocity) ** lenis.options.touchInertiaExponent
        : deltaY;
    if (travel === 0) return true;

    const from = lenis.targetScroll;
    const stop = crossed(from, from + travel);
    // A stop past either end of the page is one the page already rests on.
    if (stop === undefined || stop < 0 || stop > lenis.limit) return true;

    const caught: Hold = { at: stop, since: now, arrivedAt: null, fresh: false };
    hold = caught;
    // Not `programmatic`: a programmatic scroll walks Lenis's target along with
    // the animation, where this sets it on the stop outright — which is what
    // the check above relies on to tell the hold apart from a scroll that
    // something else started.
    lenis.scrollTo(stop, {
      programmatic: false,
      lerp: SETTLE_LERP,
      onComplete: () => {
        caught.arrivedAt = performance.now();
      },
    });
    return absorb(event);
  };
}

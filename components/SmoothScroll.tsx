"use client";

import type Lenis from "lenis";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { createSlowdown } from "@/lib/slowZones";

/** The one Lenis instance, for the slowdown. There is only ever one root. */
let instance: Lenis | undefined;

// Module-level, so the object is the same on every render: ReactLenis rebuilds
// its instance whenever the options change.
const OPTIONS = {
  lerp: 0.085,
  wheelMultiplier: 0.8,
  syncTouch: true,
  // Anchor handling is ours — Nav and the footer scroll through `useLenis` so
  // they can apply the fixed header's offset.
  anchors: false,
  virtualScroll: createSlowdown(() => instance),
};

/**
 * Damped scrolling for the whole page, slowing through its key moments.
 *
 * A wheel notch moves a native page in hard steps, and every scroll-linked shot
 * on this site — the hero plate drifting, the hands locking into place — inherits
 * that steppiness. Lenis keeps the real scroll position (so `position: sticky`,
 * `useScroll` and the section observer all still work) but eases it toward the
 * input, which turns those steps into a continuous move.
 *
 * Every input also passes through the slowdown (see lib/slowZones), which is
 * what makes the page heavier through each chapter's key moments, so they are
 * taken in rather than flung past, without ever stopping it.
 *
 * The wheel is turned down a little from native: the pinned chapters spend a
 * screen or more of scroll on a single gesture of the picture, and at full
 * speed one flick of a trackpad covers several of them.
 *
 * Touch goes through Lenis too (`syncTouch`). Native momentum cannot be slowed
 * mid-flight, so a phone would fling straight through every zone; routing
 * touch here means the page slows the same way on every device. Lenis supplies
 * its own inertia on release, sized from the finger's velocity.
 *
 * Lenis honours `prefers-reduced-motion` itself, forcing `lerp` to 1 and making
 * programmatic scrolls instant, so there is nothing to branch on here.
 */
export default function SmoothScroll() {
  return (
    <ReactLenis
      root
      options={OPTIONS}
      ref={(handle) => {
        instance = handle?.lenis;
      }}
    />
  );
}

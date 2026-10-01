"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

/**
 * Damped scrolling for the whole page.
 *
 * A wheel notch moves a native page in hard steps, and every scroll-linked shot
 * on this site — the hero plate drifting, the hands locking into place — inherits
 * that steppiness. Lenis keeps the real scroll position (so `position: sticky`,
 * `useScroll` and the section observer all still work) but eases it toward the
 * input, which turns those steps into a continuous move.
 *
 * `lerp` is deliberately light. Heavier damping reads as lag rather than weight,
 * and on a trackpad — which is already smooth — it starts to feel disconnected
 * from the hand.
 *
 * Touch is left alone: native momentum scrolling on a phone is better than
 * anything re-implemented on top of it, so `syncTouch` stays off.
 *
 * Lenis honours `prefers-reduced-motion` itself, forcing `lerp` to 1 and making
 * programmatic scrolls instant, so there is nothing to branch on here.
 */
export default function SmoothScroll() {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        wheelMultiplier: 1,
        // Anchor handling is ours — Nav and the footer scroll through `useLenis`
        // so they can apply the fixed header's offset.
        anchors: false,
      }}
    />
  );
}

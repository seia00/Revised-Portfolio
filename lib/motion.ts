/**
 * Shared Framer Motion presets so motion personality stays consistent
 * across components.
 */
import type { Variants, Transition } from "framer-motion";

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeOutQuart: Transition["ease"] = [0.25, 1, 0.5, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: easeOutQuart } },
};

export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easeOutQuart },
  },
};

/**
 * Damping for scroll-linked motion.
 *
 * A value read straight off the scroll position tracks the wheel exactly, which
 * reads as mechanical — the picture is being dragged rather than moving. Run
 * through this spring it arrives a beat late and settles, the way a camera does.
 *
 * Tuned tight on purpose. Lenis is already easing the scroll position, so this
 * is the *second* lag in the chain, and the hands plate is something the reader
 * is effectively scrubbing — too much here stops reading as weight and starts
 * reading as the page ignoring them. These values sit just past critical damping
 * (ratio ≈ 1.1, settling in roughly 140ms): enough to round off the wheel, no
 * overshoot, no float. Soften by lowering `stiffness`; tighten by raising it.
 */
export const scrollSpring = {
  stiffness: 420,
  damping: 27,
  mass: 0.35,
  restDelta: 0.0005,
} as const;

/**
 * The hand-off from the hands plate to the river: how far the river's chapter
 * has risen into view, in screens, when the page has gone fully dark.
 *
 * The plate darkens on its way out at exactly the rate the river's ground does
 * on its way in, so the seam between them is never seen, and the river's title
 * can come to rest before the river has risen all the way.
 */
export const NIGHTFALL = 0.6;

/** How long each item in a group waits behind the one before it, in seconds. */
const REVEAL_STEP = 0.09;

/**
 * The reveal every section enters on. Longer and travelling further than a
 * normal UI fade, because at this scale the motion is the pacing: it is what
 * gives each block a beat of its own instead of snapping into place.
 *
 * The stagger lives in the variant rather than in a `transition` prop on the
 * element, because a transition declared inside a variant overrides that prop
 * outright — a delay passed from outside would be dropped on the floor. Pass
 * the item's index as `custom`; leave it off for blocks that stand alone.
 */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.15,
      ease: easeOutExpo,
      delay: index * REVEAL_STEP,
    },
  }),
};

/**
 * One line across the whole page where a reveal is considered to have entered,
 * so blocks do not each fire at their own arbitrary threshold.
 */
export const revealViewport = { once: true, margin: "-14% 0px -6% 0px" } as const;

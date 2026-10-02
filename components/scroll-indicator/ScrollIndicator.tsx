"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { createLiquidRenderer, type LiquidRenderer } from "./liquidRenderer";
import { useScrollActivity } from "./useScrollActivity";

/** The liquid follows the scroll like something with weight: it lags, then settles. */
const VISCOUS = { stiffness: 60, damping: 18, mass: 1 } as const;

/** Room around the object for its shadow and glints, as a fraction of its height. */
const MARGIN = 0.24;

/** Sharper than this costs fill rate and buys nothing at this size. */
const MAX_DPR = 2;

/** How much the page's own speed stirs the liquid, and the most it can. */
const STIR = 18;
const MAX_STIR = 2.5;

/** It drops in on a spring, with a little give, and is drawn back up briskly. */
const DROP: Variants = {
  hidden: { y: "-100%", transition: { duration: 0.5, ease: [0.55, 0, 0.75, 0.06] } },
  shown: { y: "0%", transition: { type: "spring", stiffness: 240, damping: 21, mass: 1 } },
};

const FADE: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.2 } },
  shown: { opacity: 1, transition: { duration: 0.2 } },
};

/**
 * A scroll-progress indicator: a piece of chrome hardware holding a channel of
 * black liquid, which fills the channel as the page is read.
 *
 * It drops down from under the header once the reader starts scrolling and is
 * drawn back up when they stop, so it is there while they move and out of the
 * way while they read. The liquid animates on its own clock, stirred harder
 * while the page moves; its fill follows the scroll through a soft spring so
 * its leading edge travels with some weight.
 *
 * Decorative: it carries no text and takes no pointer events.
 */
export default function ScrollIndicator() {
  const reduced = useReducedMotion();
  const still = reduced === true;
  const active = useScrollActivity();
  // Whether it has finished withdrawing — the render loop runs until then.
  const [parked, setParked] = useState(true);

  const { scrollYProgress } = useScroll();
  const viscous = useSpring(scrollYProgress, VISCOUS);

  const body = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<LiquidRenderer | null>(null);

  useEffect(() => {
    const host = body.current;
    const el = canvas.current;
    if (!host || !el) return;

    const level = still ? scrollYProgress : viscous;
    const fallBack = () => {
      host.dataset.engine = "fallback";
      renderer.current = null;
    };
    const created = createLiquidRenderer(
      el,
      () => ({
        progress: level.get(),
        agitation: still
          ? 0
          : Math.min(Math.abs(scrollYProgress.getVelocity()) * STIR, MAX_STIR),
      }),
      fallBack
    );
    if (!created) {
      fallBack();
      return;
    }
    host.dataset.engine = "webgl";
    renderer.current = created;

    // The canvas overhangs the object on every side, for its shadow and glints.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const margin = Math.round(height * MARGIN);
      el.style.left = `${-margin}px`;
      el.style.top = `${-margin}px`;
      el.style.width = `${width + margin * 2}px`;
      el.style.height = `${height + margin * 2}px`;
      created.resize(width, height, margin, Math.min(window.devicePixelRatio || 1, MAX_DPR));
    });
    observer.observe(host);

    return () => {
      observer.disconnect();
      created.destroy();
      renderer.current = null;
    };
  }, [still, scrollYProgress, viscous]);

  // Animate while it is out, and until it has finished going back.
  const running = active || !parked;
  useEffect(() => {
    const current = renderer.current;
    if (!current) return;
    if (running && !still) current.start();
    else current.stop();
  }, [running, still]);

  // With motion reduced the liquid holds still, so it is only redrawn when the
  // reading position changes.
  useMotionValueEvent(scrollYProgress, "change", () => {
    if (still) renderer.current?.draw();
  });

  return (
    <motion.div
      aria-hidden
      className="scroll-indicator"
      initial={false}
      animate={active ? "shown" : "hidden"}
      variants={still ? FADE : DROP}
      onAnimationComplete={(definition) => setParked(definition === "hidden")}
    >
      <div ref={body} className="scroll-indicator-body">
        <canvas ref={canvas} className="scroll-indicator-canvas" />
        <div className="scroll-indicator-fallback">
          <motion.span style={{ scaleX: viscous }} />
        </div>
      </div>
    </motion.div>
  );
}

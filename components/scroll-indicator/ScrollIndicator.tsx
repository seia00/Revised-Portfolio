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
import { ALMOND_PATH, EYE_BOX, EYE_PATH } from "./eye";
import { createLiquidRenderer, type LiquidRenderer } from "./liquidRenderer";
import { useScrollActivity } from "./useScrollActivity";

/** The liquid follows the scroll like something with weight: it lags, then settles. */
const VISCOUS = { stiffness: 60, damping: 18, mass: 1 } as const;

/** Room around the object for its shadow and glints, as a fraction of its height. */
const MARGIN = 0.24;

/** Sharper than this costs fill rate and buys nothing at this size. */
const MAX_DPR = 2;

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
 * The fallback's channel: the almond drawn in, about its middle, by about the
 * width of the WebGL object's rim.
 */
const CHANNEL_INSET = (() => {
  const cx = EYE_BOX.x + EYE_BOX.width / 2;
  const cy = EYE_BOX.y + EYE_BOX.height / 2;
  return `translate(${cx} ${cy}) scale(0.88 0.62) translate(${-cx} ${-cy})`;
})();

/**
 * A scroll-progress indicator: an eye in polished chrome — a long almond with
 * a needle-thin blade off each end — holding a channel of black liquid, which
 * fills the almond from left to right as the page is read.
 *
 * It drops down from under the header once the reader starts scrolling and is
 * drawn back up when they stop, so it is there while they move and out of the
 * way while they read. The liquid animates on its own clock, stirred harder
 * while the page moves — it sloshes forward with the scroll, rocks back when
 * the page stops, and throws droplets off its front; its fill follows the
 * scroll through a soft spring so its leading edge travels with some weight.
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
        velocity: still ? 0 : scrollYProgress.getVelocity(),
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
        <svg
          className="scroll-indicator-fallback"
          viewBox={`${EYE_BOX.x} ${EYE_BOX.y} ${EYE_BOX.width} ${EYE_BOX.height}`}
        >
          <defs>
            <linearGradient id="scroll-indicator-chrome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4f6f8" />
              <stop offset="0.12" stopColor="#6a6f75" />
              <stop offset="0.42" stopColor="#141518" />
              <stop offset="0.62" stopColor="#0b0c0e" />
              <stop offset="0.86" stopColor="#3b3e43" />
              <stop offset="1" stopColor="#dfe2e6" />
            </linearGradient>
            <clipPath id="scroll-indicator-channel">
              <path d={ALMOND_PATH} transform={CHANNEL_INSET} />
            </clipPath>
          </defs>
          <path d={EYE_PATH} fill="url(#scroll-indicator-chrome)" />
          <g clipPath="url(#scroll-indicator-channel)">
            <rect {...EYE_BOX} fill="#585c61" />
            <motion.rect {...EYE_BOX} fill="#030304" style={{ scaleX: viscous, originX: 0 }} />
          </g>
        </svg>
      </div>
    </motion.div>
  );
}

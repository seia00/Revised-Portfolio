"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { scrollSpring } from "@/lib/motion";
import { useSlowZones } from "@/lib/slowZones";
import IdleFigure from "./IdleFigure";

const EMAIL = "seiafunayama@gmail.com";
const INSTAGRAM = "https://instagram.com/seiafunayama";

/** The other ways in, listed in a corner; email is the big link. */
const LINKS = [
  { title: "Instagram", handle: "@seiafunayama", href: INSTAGRAM },
  { title: "LinkedIn", handle: "Seia Funayama", href: "https://www.linkedin.com/in/seiafunayama/" },
] as const;

/**
 * The chapter's height, in screens. The first is the scene rising into view;
 * for the rest it is pinned, and the scroll drives the camera.
 */
const SCREENS = 2.6;

/** Chapter progress after `screens` of scrolling. */
const at = (screens: number) => screens / SCREENS;

/** The header gets out of the way once the scene has most of the screen. */
const CLOSE_FROM = at(0.75);

/** Pinned, the camera holds close on the figure, then pulls back. */
const HOLD_END = at(1.3);
const PULLED_BACK = at(2.15);

/** The header returns partway through the pull-back. */
const HEADER_BACK = at(1.8);

/** Where the scroll slows: on the figure, close up, just after it pins. */
const LINGER = 1.12;

/** The details arrive one after another as the camera settles. */
const DETAILS_FROM = at(1.75);
const DETAIL_STAGGER = at(0.1);
const DETAIL_SPAN = at(0.3);

/**
 * Where things are in the frame, as fractions of it, read off the frames
 * themselves: the crown's tips sit 37.3% down and the figure runs off the
 * foot of the frame, its widest across 32.5–69.5%, its crown across 47.5–69.5%.
 * Across its lowest quarter, where the bottom corners sit beside it, it
 * reaches no further right than 65%.
 */
const FIGURE_TOP = 0.373;
const FIGURE_WIDTH = 0.37;
const FIGURE_LEFT = 0.325;
const FIGURE_LOW_RIGHT = 0.65;
const CROWN = [0.475, 0.695] as const;
const ASPECT = 16 / 9;

/**
 * Pulled back, beside the four corners: the figure's share of the screen at
 * most, and the clearance it keeps from the text in the bottom corners, px.
 */
const FRAMED_CORNERS = { tall: 0.54, wide: 0.34, clear: 32 } as const;

/** Pulled back under the stacked details, on a phone or a portrait screen. */
const FRAMED_STACKED = { wide: 0.96, gap: 28 } as const;

/** Close up: the figure stands this tall, unless the crown would leave the screen. */
const CLOSE = { tall: 0.92, crown: 0.9 } as const;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** The camera for the current screen. */
type Camera = {
  /** The frame's height when pulled back, px. */
  height: number;
  /** How much closer than that it starts. */
  close: number;
  /** How far the crown sits from the middle of the screen when pulled back, px. */
  crown: number;
};

/**
 * Size the framed shot to the screen and the details around it, and set the
 * close-up from it.
 */
function frameShot(stage: HTMLElement, details: HTMLElement): Camera {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const figureWidth = FIGURE_WIDTH * ASPECT;
  const figureHeight = 1 - FIGURE_TOP;

  // Which layout the details are in is the stylesheet's call (see
  // .ending-details); this reads it rather than repeating the breakpoint.
  const corners = getComputedStyle(details).getPropertyValue("--ending-layout").trim() === "corners";

  let frame: number;
  if (corners) {
    // Kept clear of the text in the bottom corners, which sits beside the
    // figure's lowest quarter: its back on the left, its arm on the right.
    const { left, right } = textReach(stage, details);
    const centre = width / 2;
    frame = Math.min(
      (FRAMED_CORNERS.tall * height) / figureHeight,
      (FRAMED_CORNERS.wide * width) / figureWidth,
      (centre - left - FRAMED_CORNERS.clear) / (0.5 - FIGURE_LEFT) / ASPECT,
      (right - FRAMED_CORNERS.clear - centre) / (FIGURE_LOW_RIGHT - 0.5) / ASPECT
    );
  } else {
    // The figure stands on the foot of the screen, its crown clear of
    // whatever the details take up above it.
    let band = 0;
    for (const el of Array.from(details.children) as HTMLElement[]) {
      band = Math.max(band, el.offsetTop + el.offsetHeight);
    }
    frame = Math.min(
      (FRAMED_STACKED.wide * width) / figureWidth,
      (height - band - FRAMED_STACKED.gap) / figureHeight
    );
  }

  const frameWidth = frame * ASPECT;
  const close = Math.max(
    1,
    Math.min(
      (CLOSE.tall * height) / (figureHeight * frame),
      (CLOSE.crown * width) / ((CROWN[1] - CROWN[0]) * frameWidth)
    )
  );
  const crown = ((CROWN[0] + CROWN[1]) / 2 - 0.5) * frameWidth;
  return { height: frame, close, crown };
}

/**
 * How far the bottom corners' text runs in towards the middle, px from the
 * stage's left: the bottom-left's right edge, and the bottom-right's left.
 */
function textReach(stage: HTMLElement, details: HTMLElement): { left: number; right: number } {
  const origin = stage.getBoundingClientRect().left;
  const edges = (selector: string) =>
    Array.from(details.querySelectorAll(selector), (el) => el.getBoundingClientRect());
  const left = Math.max(origin, ...edges(".ending-mail .ending-ink").map((r) => r.right));
  const right = Math.min(
    origin + stage.clientWidth,
    ...edges(".ending-dm .ending-ink").map((r) => r.left)
  );
  return { left: left - origin, right: right - origin };
}

/**
 * The last chapter: the idle figure, alone.
 *
 * It rises into view close up, the crown filling the screen and the header
 * gone, so for a moment there is nothing else on the page. Then, as the
 * reader carries on, the camera pulls back — the whole frame, never the
 * figure apart from it — and the ways to get in touch come in around the
 * edges: the framed shot the page ends on.
 *
 * The figure's own motion is all in its frames (see IdleFigure); the only
 * movement added here is the camera's.
 */
export default function Connect() {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const still = reduced === true;
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState<Camera | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const progress = useSpring(scrollYProgress, scrollSpring);

  useEffect(() => {
    const s = stage.current;
    const d = details.current;
    if (!s || !d) return;
    const measure = () => setCamera(frameShot(s, d));
    measure();
    // The stage for the screen, the text for the fonts arriving.
    const observer = new ResizeObserver(measure);
    observer.observe(s);
    d.querySelectorAll(".ending-ink").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Pulled back in steps of equal ratio, so the camera seems to move at one
  // speed, with the crown travelling steadily from the middle to its place.
  const pull = useTransform(progress, [HOLD_END, PULLED_BACK], [0, 1], { ease: easeInOutCubic });
  const scale = useTransform(pull, (p) => (camera ? camera.close ** (1 - p) : 1));
  const x = useTransform(pull, (p) =>
    camera ? camera.crown * (p - camera.close ** (1 - p)) : 0
  );

  // Tell the page where it is, so the header and the paper grain can stand
  // aside (see globals.css): the grain whenever the scene is in view, so the
  // frames show exactly as drawn; the header while it is close up.
  useEffect(() => {
    const root = document.documentElement;
    const mark = (p: number) => {
      if (p <= 0) delete root.dataset.ending;
      else root.dataset.ending = !still && p > CLOSE_FROM && p < HEADER_BACK ? "close" : "on";
    };
    mark(scrollYProgress.get());
    const unsubscribe = scrollYProgress.on("change", mark);
    return () => {
      unsubscribe();
      delete root.dataset.ending;
    };
  }, [scrollYProgress, still]);

  useSlowZones(() => {
    const el = ref.current;
    if (!el) return [];
    const appears = el.getBoundingClientRect().top + window.scrollY - window.innerHeight;
    return [appears + (LINGER * el.offsetHeight) / SCREENS];
  });

  const backToTop = () =>
    lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      ref={ref}
      id="connect"
      aria-label="How to connect"
      className="ending"
      style={{ height: `${SCREENS * 100}svh` }}
    >
      <div ref={stage} className="ending-stage">
        <motion.div
          aria-hidden
          className="ending-camera"
          style={{
            height: camera ? `${camera.height}px` : undefined,
            ...(still ? null : { x, scale, originX: 0.5, originY: 1 }),
          }}
        >
          <IdleFigure />
        </motion.div>

        <div ref={details} className="ending-details">
          <Detail index={0} progress={progress} still={still} className="ending-status">
            <p className="ending-label">§ 05 — Contact</p>
            <p>DMs open</p>
            <p>Tokyo / UTC+9</p>
          </Detail>

          <Detail index={1} progress={progress} still={still} className="ending-links">
            <p className="ending-label">Links</p>
            <ul>
              {LINKS.map((l) => (
                <li key={l.title}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="ending-link">
                    {l.title} / {l.handle}
                  </a>
                </li>
              ))}
            </ul>
            <p className="ending-fine ending-colophon">
              Set in Instrument Serif, Inter Tight &amp; JetBrains Mono
            </p>
          </Detail>

          <Detail index={2} progress={progress} still={still} className="ending-mail">
            <a href={`mailto:${EMAIL}`} className="ending-big ending-ink ending-link">
              {EMAIL}
            </a>
            <p className="ending-fine">
              <span className="ending-ink">© 2026 Seia Funayama</span>
            </p>
          </Detail>

          <Detail index={3} progress={progress} still={still} className="ending-dm">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="ending-big ending-ink ending-link"
            >
              Send a DM →
            </a>
            <p className="ending-fine">
              <button
                onClick={backToTop}
                className="ending-ink ending-link cursor-pointer uppercase"
              >
                Back to top ↑
              </button>
            </p>
          </Detail>
        </div>
      </div>
    </footer>
  );
}

/**
 * One block of the details, rising into place on its turn. Out of sight until
 * then, so nothing hidden can be tabbed to.
 */
function Detail({
  index,
  progress,
  still,
  className,
  children,
}: {
  index: number;
  progress: MotionValue<number>;
  still: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const start = DETAILS_FROM + index * DETAIL_STAGGER;
  const end = start + DETAIL_SPAN;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [24, 0]);
  const visibility = useTransform(opacity, (o) => (o > 0.01 ? "visible" : "hidden"));

  return (
    <motion.div className={className} style={still ? undefined : { opacity, y, visibility }}>
      {children}
    </motion.div>
  );
}

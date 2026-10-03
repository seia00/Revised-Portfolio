"use client";

import { useEffect, useId, useImperativeHandle, useRef, type Ref } from "react";
import { animate, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { MARK_HEIGHT, MARK_LOOPS, MARK_PATH, MARK_WIDTH } from "./mark";

export type ChromeMarkHandle = {
  /** Take the mark apart and draw it again. Ignored while it is already playing. */
  redraw(): void;
};

/** The redraw's ease: slow off the mark, quick through the middle, slow to land. */
const EASE = [0.65, 0, 0.35, 1] as const;

/** How thick the drawn line is on screen, in px, whatever size the mark is shown at. */
const LINE_PX = 1.1;

/** Room around the mark for the line, which straddles its edge, in mark units. */
const PAD = 24;

const VIEW = `${-PAD} ${-PAD} ${MARK_WIDTH + PAD * 2} ${MARK_HEIGHT + PAD * 2}`;

/**
 * The steel's gradient axis, in mark units: tilted off vertical so the bands
 * of light lie across the bars at an angle. With the gradient mirrored, one
 * full repeat is twice this vector — see `chrome-flow` in globals.css, which
 * must slide by exactly that.
 */
const FLOW_X = 120;
const FLOW_Y = 330;

/**
 * The monogram in polished metal: near-black chrome with bands of reflected
 * light flowing slowly across it, and a glint that sweeps over it every few
 * seconds, so it always catches the light.
 *
 * `redraw` plays the same move as the hover on louisraille.fr's star: the
 * metal wipes away from the top as its outline appears and unwinds, the
 * outline draws itself back, and the metal pours back in from the bottom.
 */
export default function ChromeMark({
  height,
  className = "",
  ref,
}: {
  /** Rendered height of the mark itself, in px. */
  height: number;
  className?: string;
  ref?: Ref<ChromeMarkHandle>;
}) {
  // Gradient and clip ids have to be unique on the page and safe in url().
  const id = `mark${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const still = useReducedMotion() === true;

  const wipe = useRef<SVGRectElement>(null);
  const outline = useRef<SVGGElement>(null);
  const playing = useRef(false);
  const running = useRef<AnimationPlaybackControls[]>([]);

  useEffect(() => {
    const current = running;
    return () => current.current.forEach((c) => c.stop());
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      redraw() {
        const rect = wipe.current;
        const lines = outline.current;
        if (still || playing.current || !rect || !lines) return;
        playing.current = true;
        play(rect, lines, running.current).finally(() => {
          playing.current = false;
        });
      },
    }),
    [still]
  );

  // Screen px per mark unit; the box is a little bigger than the mark, for
  // the line to straddle its edge.
  const scale = height / MARK_HEIGHT;
  const line = LINE_PX / scale;

  return (
    <svg
      viewBox={VIEW}
      width={Math.round(scale * (MARK_WIDTH + PAD * 2))}
      height={Math.round(scale * (MARK_HEIGHT + PAD * 2))}
      aria-hidden
      className={`chrome-mark ${className}`}
    >
      <defs>
        {/* Chrome reflects, it has no colour: near-black steel with a
            bright band of reflected light across it, repeated (mirrored)
            along a tilted axis so a band or two always cross the mark. The
            group holding it slides one whole repeat at a time, so the bands
            flow over the bars without a seam. */}
        <linearGradient
          id={`${id}-steel`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={FLOW_X}
          y2={FLOW_Y}
          spreadMethod="reflect"
        >
          <stop offset="0" stopColor="#08090a" />
          <stop offset="0.3" stopColor="#25292e" />
          <stop offset="0.44" stopColor="#80868e" />
          {/* Just short of white, so a band crossing a bar never quite
              melts into the paper behind it. */}
          <stop offset="0.5" stopColor="#d9dde1" />
          <stop offset="0.56" stopColor="#6f757d" />
          <stop offset="0.68" stopColor="#16181b" />
          <stop offset="1" stopColor="#060708" />
        </linearGradient>
        <linearGradient id={`${id}-glint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.58" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-shape`}>
          <path d={MARK_PATH} clipRule="evenodd" />
        </clipPath>
        {/* What is left of the metal during a redraw: everything below the
            rect's top edge. */}
        <clipPath id={`${id}-wipe`}>
          <rect ref={wipe} x={-PAD} y={-PAD} width={MARK_WIDTH + PAD * 2} height={MARK_HEIGHT + PAD * 2} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-wipe)`}>
        <g clipPath={`url(#${id}-shape)`}>
          <g className="chrome-mark-flow">
            <rect x="-400" y="-900" width={MARK_WIDTH + 800} height={MARK_HEIGHT + 1800} fill={`url(#${id}-steel)`} />
          </g>
          <g className="chrome-mark-glint">
            <rect x="-260" y="-200" width="220" height={MARK_HEIGHT + 400} transform="skewX(-24)" fill={`url(#${id}-glint)`} />
          </g>
        </g>
      </g>

      <g ref={outline} opacity="0" fill="none" stroke="#0a0a0a" strokeWidth={line} strokeLinejoin="miter">
        {MARK_LOOPS.map((d) => (
          <path key={d} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset="0" />
        ))}
      </g>
    </svg>
  );
}

/** Tween 0 → 1 over `duration` seconds, handing each value to `update`. */
function tween(
  running: AnimationPlaybackControls[],
  duration: number,
  update: (v: number) => void
): Promise<void> {
  const controls = animate(0, 1, { duration, ease: EASE, onUpdate: update });
  running.push(controls);
  return controls.then(() => {
    running.splice(running.indexOf(controls), 1);
  });
}

const wait = (seconds: number) => new Promise((r) => setTimeout(r, seconds * 1000));

/**
 * The redraw. Its timings follow the reference: about half a second to come
 * apart, a beat of nothing, then the line drawing back with the metal rising
 * in behind it as it closes.
 */
async function play(rect: SVGRectElement, lines: SVGGElement, running: AnimationPlaybackControls[]) {
  const top = -PAD;
  const span = MARK_HEIGHT + PAD * 2;
  const paths = Array.from(lines.querySelectorAll("path"));
  const metal = (gone: number) => rect.setAttribute("y", String(top + gone * span));
  const drawn = (amount: number) =>
    paths.forEach((p) => p.setAttribute("stroke-dashoffset", String(1 - amount)));
  const shown = (v: number) => lines.setAttribute("opacity", String(v));

  drawn(1);
  await Promise.all([
    tween(running, 0.15, shown),
    tween(running, 0.45, metal),
    tween(running, 0.5, (v) => drawn(1 - v)),
  ]);
  await wait(0.3);
  const drawing = tween(running, 0.65, drawn);
  await wait(0.45);
  await Promise.all([drawing, tween(running, 0.45, (v) => metal(1 - v))]);
  await tween(running, 0.2, (v) => shown(1 - v));
}

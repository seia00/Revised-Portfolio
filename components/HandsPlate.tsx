"use client";

import Image from "next/image";
import LiquidMetal from "./LiquidMetal";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import { scrollSpring } from "@/lib/motion";
import { WORDS } from "@/data/words";

/**
 * Where something sits on the plate, and when it arrives.
 *
 * Geometry is a percentage of the 1280x720 source, so the cut-out layers
 * reassemble into the original composition at any plate size and the readouts
 * stay pinned to the same bands of empty ground. `enter` is the scroll window
 * the piece travels across; `from` is the edge it travels in from.
 */
type Placement = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height?: number;
  readonly enter: readonly [number, number];
  readonly from: "left" | "right";
  /**
   * `top` below the md breakpoint, where the figure is rotated across the
   * middle of the plate. Values outside 0–100% put a readout above or below
   * the plate box, in the room a portrait screen has either side of it.
   */
  readonly smTop?: number;
};

type Layer = Placement & { readonly name: string; readonly height: number };

/**
 * The picture: hands first, then the instrument panels.
 *
 * Progress is measured from the moment the section appears, not from the moment
 * it is pinned (see `useScroll` below), and the plate fills the screen at about
 * 0.39. The first two windows are set against that: by the time the ground has
 * taken over, the left hand has landed and the right is still visibly crossing
 * to meet it, so the reader arrives at a picture already in motion rather than
 * at an empty field, and nothing has to tell them to keep going.
 */
const LAYERS: readonly Layer[] = [
  { name: "hand-left",  left: 0,      top: 28.75,  width: 51.563, height: 42.778, enter: [0.05, 0.34], from: "left" },
  { name: "hand-right", left: 51.563, top: 30.694, width: 48.438, height: 42.361, enter: [0.12, 0.43], from: "right" },
  { name: "residue",    left: 1.25,   top: 30.833, width: 8.516,  height: 6.806,  enter: [0.4, 0.54],  from: "left" },
  { name: "latency",    left: 36.719, top: 25.972, width: 12.578, height: 18.333, enter: [0.46, 0.6],  from: "left" },
  { name: "echo",       left: 55.625, top: 67.083, width: 10,     height: 10.972, enter: [0.52, 0.66], from: "right" },
  { name: "corner",     left: 89.531, top: 55.972, width: 9.531,  height: 12.5,   enter: [0.58, 0.72], from: "right" },
] as const;

/**
 * The verdict: the three words land last, in the bands of empty ground above
 * and below the hands, so they read as what the instruments in the picture
 * resolved to rather than as a caption parked underneath it. Positions are
 * clear of every panel, and each one still enters off the plate — see
 * `offstageX`, which is why they carry an explicit width.
 */
const READOUTS: readonly Placement[] = [
  { left: 3.5, top: 4,  width: 44, smTop: -86, enter: [0.64, 0.78], from: "left" },
  { left: 60,  top: 4,  width: 36, smTop: -86, enter: [0.7, 0.84],  from: "right" },
  { left: 31,  top: 82, width: 38, smTop: 170, enter: [0.76, 0.9],  from: "left" },
] as const;

/** Clearance past the plate edge, in plate widths, so nothing starts on screen. */
const OFFSTAGE = 6;

/**
 * How far off the plate a piece starts, expressed in its own width because that
 * is what a percentage `x` transform resolves against.
 */
function offstageX(at: Placement): number {
  const travel =
    at.from === "left" ? -(at.left + at.width + OFFSTAGE) : 100 - at.left + OFFSTAGE;
  return (travel / at.width) * 100;
}

/**
 * The second chapter: the two hands, their instrument panels and the three
 * words fly in from the edges and lock into place as the page is scrolled. The
 * plate is pinned while that happens, so the assembly reads as one held shot
 * rather than something passing by.
 */
export default function HandsPlate() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Progress opens the moment the section's top clears the bottom of the
  // viewport, so the pieces are already travelling while the ground is still
  // rising into view. Pinning starts later, once the section reaches the top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  // Damped, so a piece carries a little weight into its slot and comes to rest
  // a beat after the scroll does, instead of stopping dead with the wheel.
  const progress = useSpring(scrollYProgress, scrollSpring);
  const still = reduced === true;

  return (
    <section
      ref={ref}
      id="hands"
      aria-label="Two hands, reaching"
      className="relative h-[260svh] bg-plate"
    >
      <div className="sticky top-0 h-svh overflow-hidden flex items-center justify-center">
        <LiquidMetal />
        <div className="hands-plate relative">
          <div className="hands-figure">
            {LAYERS.map((layer) => (
              <Entering key={layer.name} at={layer} progress={progress} still={still}>
                <Image
                  src={`/hands/${layer.name}.png`}
                  alt=""
                  fill
                  // The source is dithered pixel art: re-encoding softens the
                  // dither and the slices only come to ~150 KB together, so
                  // they ship untouched and scale up with hard pixel edges.
                  unoptimized
                  className="object-contain [image-rendering:pixelated]"
                />
              </Entering>
            ))}
          </div>

          {READOUTS.map((at, i) => (
            <Entering key={WORDS[i].word} at={at} progress={progress} still={still}>
              <span
                aria-hidden
                className="plate-tag hidden md:flex items-center gap-[1cqw] mb-[1.2cqw] font-mono uppercase text-ink-3"
              >
                Adj_0{i + 1}
                <span className="h-px flex-1 bg-edge-2" />
              </span>
              <span className={`plate-word block text-ink ${WORDS[i].style}`}>
                {WORDS[i].word}
              </span>
            </Entering>
          ))}
        </div>
      </div>
    </section>
  );
}

function Entering({
  at,
  progress,
  still,
  children,
}: {
  at: Placement;
  progress: MotionValue<number>;
  still: boolean;
  children: React.ReactNode;
}) {
  const [start, end] = at.enter;
  const x = useTransform(progress, [start, end], [`${offstageX(at)}%`, "0%"]);

  // `top` is handed to CSS as a custom property rather than set outright,
  // because a readout sits outside the plate box on a phone and an inline
  // value cannot carry a breakpoint. MotionStyle has no slot for custom
  // properties, hence the assertion.
  const style = {
    left: `${at.left}%`,
    width: `${at.width}%`,
    "--top": `${at.top}%`,
    ...(at.smTop === undefined ? null : { "--sm-top": `${at.smTop}%` }),
    ...(at.height === undefined ? null : { height: `${at.height}%` }),
    ...(still ? null : { x }),
  } as MotionStyle;

  return (
    <motion.div className="plate-item absolute" style={style}>
      {children}
    </motion.div>
  );
}

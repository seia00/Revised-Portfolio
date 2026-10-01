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
  type MotionValue,
} from "framer-motion";
import { scrollSpring } from "@/lib/motion";

/**
 * A layer cut out of `geometric-x-24-landscape-1280x720.png`.
 *
 * Geometry is the layer's bounding box as a percentage of the 1280x720 source,
 * so the pieces reassemble into the original composition at any plate size.
 * `enter` is the scroll window the piece travels across, and `from` is the edge
 * it travels in from.
 */
type Layer = {
  readonly name: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly enter: readonly [number, number];
  readonly from: "left" | "right";
};

/**
 * Hands first, then the instrument panels — in the order they settle.
 *
 * Progress is measured from the moment the section appears, not from the moment
 * it is pinned (see `useScroll` below), and the plate fills the screen at about
 * 0.45. The first two windows are set against that: by the time the ground has
 * taken over, the left hand has landed and the right is still visibly crossing
 * to meet it, so the reader arrives at a picture already in motion rather than
 * at an empty field, and nothing has to tell them to keep going.
 */
const LAYERS: readonly Layer[] = [
  { name: "hand-left",  left: 0,      top: 28.75,  width: 51.563, height: 42.778, enter: [0.06, 0.4],   from: "left" },
  { name: "hand-right", left: 51.563, top: 30.694, width: 48.438, height: 42.361, enter: [0.14, 0.5],   from: "right" },
  { name: "residue",    left: 1.25,   top: 30.833, width: 8.516,  height: 6.806,  enter: [0.46, 0.62],  from: "left" },
  { name: "latency",    left: 36.719, top: 25.972, width: 12.578, height: 18.333, enter: [0.54, 0.7],   from: "left" },
  { name: "echo",       left: 55.625, top: 67.083, width: 10,     height: 10.972, enter: [0.62, 0.78],  from: "right" },
  { name: "corner",     left: 89.531, top: 55.972, width: 9.531,  height: 12.5,   enter: [0.7, 0.86],   from: "right" },
] as const;

/** Clearance past the plate edge, in plate widths, so nothing starts on screen. */
const OFFSTAGE = 6;

/**
 * How far off the plate a piece starts, expressed in its own width because that
 * is what a percentage `x` transform resolves against.
 */
function offstageX(layer: Layer): number {
  const travel =
    layer.from === "left"
      ? -(layer.left + layer.width + OFFSTAGE)
      : 100 - layer.left + OFFSTAGE;
  return (travel / layer.width) * 100;
}

/**
 * The second chapter: the two hands and their instrument panels fly in from the
 * edges and lock into place as the page is scrolled. The plate is pinned while
 * that happens, so the assembly reads as one held shot rather than something
 * passing by.
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

  return (
    <section
      ref={ref}
      id="hands"
      aria-label="Two hands, reaching"
      className="relative h-[220svh] bg-plate"
    >
      <div className="sticky top-0 h-svh overflow-hidden flex items-center justify-center">
        <LiquidMetal />
        <div className="hands-plate relative">
          {LAYERS.map((layer) => (
            <Piece
              key={layer.name}
              layer={layer}
              progress={progress}
              still={reduced === true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Piece({
  layer,
  progress,
  still,
}: {
  layer: Layer;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const [start, end] = layer.enter;
  const x = useTransform(progress, [start, end], [`${offstageX(layer)}%`, "0%"]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${layer.left}%`,
        top: `${layer.top}%`,
        width: `${layer.width}%`,
        height: `${layer.height}%`,
        ...(still ? null : { x }),
      }}
    >
      <Image
        src={`/hands/${layer.name}.png`}
        alt=""
        fill
        // The source is dithered pixel art: re-encoding softens the dither and
        // the slices only come to ~150 KB together, so they ship untouched and
        // scale up with hard pixel edges.
        unoptimized
        className="object-contain [image-rendering:pixelated]"
      />
    </motion.div>
  );
}

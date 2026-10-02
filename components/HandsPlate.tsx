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
import { NIGHTFALL, scrollSpring } from "@/lib/motion";
import { useScrollStops } from "@/lib/scrollStops";
import { WORDS, type Word } from "@/data/words";

/** A scroll window, as a pair of section progress values. */
type Window = readonly [number, number];

/**
 * One cut-out piece of the picture, and when it arrives.
 *
 * Geometry is a percentage of the 1280x720 source, so the layers reassemble
 * into the original composition at any plate size. `enter` is the scroll window
 * the piece travels across; `from` is the edge it travels in from.
 */
type Layer = {
  readonly name: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly enter: Window;
  readonly from: "left" | "right";
};

/**
 * The section's height, in screens. Progress runs across all of it (see
 * `useScroll` below), and the plate is pinned from the end of the first —
 * so the first screen is the plate rising into view, and the rest is the
 * pinned shot. It ends just past the stop on the words, so the river takes
 * over as soon as the reader moves on from them.
 */
const SCREENS = 2.1;

/** Section progress after `screens` of scrolling. */
const at = (screens: number) => screens / SCREENS;

/**
 * The picture: hands first, then the instrument panels.
 *
 * Progress is measured from the moment the section appears, not from the moment
 * it is pinned, and the plate fills the screen one screen in. The hands are set
 * against that: the left lands as the ground takes over and the right is still
 * crossing to meet it, so the reader arrives at a picture already in motion
 * rather than at an empty field. The panels follow in quick succession once
 * the plate is pinned.
 */
const LAYERS: readonly Layer[] = [
  { name: "hand-left",  left: 0,      top: 28.75,  width: 51.563, height: 42.778, enter: [at(0.15), at(1)],     from: "left" },
  { name: "hand-right", left: 51.563, top: 30.694, width: 48.438, height: 42.361, enter: [at(0.3), at(1.15)],   from: "right" },
  { name: "residue",    left: 1.25,   top: 30.833, width: 8.516,  height: 6.806,  enter: [at(1.125), at(1.3)],  from: "left" },
  { name: "latency",    left: 36.719, top: 25.972, width: 12.578, height: 18.333, enter: [at(1.2), at(1.375)],  from: "left" },
  { name: "echo",       left: 55.625, top: 67.083, width: 10,     height: 10.972, enter: [at(1.275), at(1.45)], from: "right" },
  { name: "corner",     left: 89.531, top: 55.972, width: 9.531,  height: 12.5,   enter: [at(1.35), at(1.525)], from: "right" },
];

/**
 * When each of the three words reads out, once the picture is together. They
 * overlap, so the line builds as one gesture rather than three separate ones.
 */
const READOUTS: readonly Window[] = [
  [at(1.65), at(1.85)],
  [at(1.725), at(1.925)],
  [at(1.8), at(2)],
];

/**
 * Where the page comes to rest: once on the finished picture, and once on the
 * three words. The stop on the words is their stillness; past it the plate
 * lets go straight away rather than holding an empty beat.
 */
const STOPS = [1.575, 2.05] as const;

/** The outline filters and their rim widths in px — see `Hollow`. */
const HOLLOW = [
  ["plate-hollow-sm", 1],
  ["plate-hollow-lg", 2],
] as const;

/** How much of a readout's window its rule takes to draw across. */
const RULE_SHARE = 0.55;

/** Clearance past the plate edge, in plate widths, so nothing starts on screen. */
const OFFSTAGE = 6;

/**
 * How far off the plate a piece starts, expressed in its own width because that
 * is what a percentage `x` transform resolves against.
 */
function offstageX(at: Layer): number {
  const travel =
    at.from === "left" ? -(at.left + at.width + OFFSTAGE) : 100 - at.left + OFFSTAGE;
  return (travel / at.width) * 100;
}

/**
 * The second chapter: the two hands and their instrument panels fly in from the
 * edges and lock into place as the page is scrolled, and then the three words
 * read out as one ruled line. The plate is pinned while that happens, so the
 * assembly reads as one held shot rather than something passing by.
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

  // On the way out the plate goes dark in step with the river's ground rising
  // under it (see NIGHTFALL), so the two chapters meet in the dark rather than
  // along a grey edge. This screen is the river's first, so the two match.
  const { scrollYProgress: leaving } = useScroll({
    target: ref,
    offset: ["end end", "end start"],
  });
  const exit = useSpring(leaving, scrollSpring);
  const dusk = useTransform(exit, [0, NIGHTFALL], [0, 1]);

  // Progress 0 is the section's top at the foot of the viewport, and the run
  // is the section's own height, so a stop `n` screens in sits here.
  useScrollStops(() => {
    const el = ref.current;
    if (!el) return [];
    const appears = el.getBoundingClientRect().top + window.scrollY - window.innerHeight;
    const screen = el.offsetHeight / SCREENS;
    return STOPS.map((screens) => appears + screens * screen);
  });

  return (
    <section
      ref={ref}
      id="hands"
      aria-label="Two hands, reaching"
      className="relative bg-plate"
      style={{ height: `${SCREENS * 100}svh` }}
    >
      {/* Below md the words stack under the picture, so the pair is centred in
          the room left under the header rather than in the whole screen. */}
      <div className="sticky top-0 h-svh overflow-hidden flex items-center justify-center pt-16 md:pt-0">
        <LiquidMetal />
        <div className="hands-stage relative">
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
          </div>

          <Hollow />
          <ol aria-label="In three words" className="plate-readouts">
            {WORDS.map((word, i) => (
              <Readout
                key={word.word}
                word={word}
                index={i}
                enter={READOUTS[i]}
                progress={progress}
                still={still}
              />
            ))}
          </ol>
        </div>

        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none bg-[#07080a]"
          style={{ opacity: dusk }}
        />
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
  at: Layer;
  progress: MotionValue<number>;
  still: boolean;
  children: React.ReactNode;
}) {
  const [start, end] = at.enter;
  const x = useTransform(progress, [start, end], [`${offstageX(at)}%`, "0%"]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${at.left}%`,
        top: `${at.top}%`,
        width: `${at.width}%`,
        height: `${at.height}%`,
        ...(still ? null : { x }),
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The outline treatment, cut from the solid word rather than stroked onto it.
 *
 * A text stroke traces every contour in the font, and a variable font keeps its
 * glyphs as overlapping pieces, so a stroked D shows its stem through its bowl.
 * Eroding the filled shape and keeping only the rim outlines what is actually
 * drawn instead. Two weights, picked in CSS, so the rim keeps pace with the type.
 */
function Hollow() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      {HOLLOW.map(([id, radius]) => (
        <filter key={id} id={id} colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius={radius} result="inner" />
          <feComposite in="SourceGraphic" in2="inner" operator="out" />
        </filter>
      ))}
    </svg>
  );
}

/**
 * One word of the three: a hairline draws across, then the word rises up out
 * of it, as if the rule were the edge it had been waiting behind.
 */
function Readout({
  word,
  index,
  enter,
  progress,
  still,
}: {
  word: Word;
  index: number;
  enter: Window;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const [start, end] = enter;
  const ruled = start + (end - start) * RULE_SHARE;

  const rule = useTransform(progress, [start, ruled], [0, 1]);
  const tag = useTransform(progress, [start, ruled], [0, 1]);
  const rise = useTransform(progress, [start, end], ["120%", "0%"]);

  return (
    <li className="plate-readout">
      <motion.span
        aria-hidden
        className="plate-rule bg-ink/40"
        style={still ? undefined : { scaleX: rule }}
      />
      <motion.span
        aria-hidden
        className="plate-tag font-mono uppercase text-ink-2"
        style={still ? undefined : { opacity: tag }}
      >
        Adj_0{index + 1}
      </motion.span>
      <span className="plate-word">
        <motion.span
          className={`block text-ink ${word.style}`}
          style={still ? undefined : { y: rise }}
        >
          {word.word}
        </motion.span>
      </span>
    </li>
  );
}

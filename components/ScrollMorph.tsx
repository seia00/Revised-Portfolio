"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useSlowZones } from "@/lib/slowZones";
import { PROJECTS, type Project } from "@/data/projects";
import { Serif } from "./ornaments";

type Phase = "scatter" | "line" | "circle";

type Target = {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scale: number;
  readonly opacity: number;
};

/** A scroll window, as a pair of section progress values. Mutable, because
 *  that is the input range type `useTransform` takes. */
type Span = [number, number];

/** The section's height in screens; everything past the first is pinned. */
const SCREENS = 4.5;

/** Circle to arc. It waits a beat first, so the circle registers before it breaks. */
const MORPH: Span = [0.1, 0.32];

/** The arc turning, which carries each project across the apex in turn. */
const TURN: Span = [0.34, 0.96];

/** When the arrival plays, in ms after the section comes into view. */
const LINE_AT = 500;
const CIRCLE_AT = 2500;

/** How far the arc follows the pointer either way, in px. */
const PARALLAX = 100;

const CARD_RATIO = 85 / 60;
const BREAKPOINT = 768;
const COUNT = PROJECTS.length;

/** A card travelling to its next position: slow, so it carries some weight. */
const CARD_SPRING = { type: "spring", stiffness: 40, damping: 15 } as const;
const FLIP_SPRING = { type: "spring", stiffness: 260, damping: 20 } as const;

const lerp = (from: number, to: number, t: number) => from * (1 - t) + to * t;
const radians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * A fixed pseudo-random value in [0, 1) for a card and a channel. Integer
 * hashing rather than `Math.random`, so the server and the browser agree on
 * where each card starts and the markup hydrates cleanly.
 */
function noise(index: number, channel: number): number {
  let h = Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(channel + 1, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Where each card waits, invisible, before the arrival. */
const SCATTER: readonly Target[] = PROJECTS.map((_, i) => ({
  x: (noise(i, 1) - 0.5) * 1500,
  y: (noise(i, 2) - 0.5) * 1000,
  rotation: (noise(i, 3) - 0.5) * 180,
  scale: 0.6,
  opacity: 0,
}));

type Layout = ReturnType<typeof layoutFor>;

/**
 * How many cards in from either end the turn starts and stops: the third card
 * at the apex to begin with and the third from last to end on (second, on a
 * phone, where fewer fit), so both flanks stay filled and every card crosses
 * the middle once.
 */
const insetFor = (narrow: boolean) => (narrow ? 1 : 2);

/**
 * The progress values the scroll slows through: the ring, then every point at
 * which a card stands at the apex of the arch, so the turn eases past one
 * project at a time.
 */
function momentsFor(narrow: boolean): number[] {
  const turns = Math.max(1, COUNT - 1 - 2 * insetFor(narrow));
  const [from, to] = TURN;
  const apexes = Array.from({ length: turns + 1 }, (_, k) => from + (k / turns) * (to - from));
  return [0, ...apexes];
}

/** The geometry of every phase at a given stage size. */
function layoutFor(width: number, height: number) {
  const narrow = width < BREAKPOINT;
  const cardW = narrow ? 60 : 92;
  const arcScale = 1.8;
  const arcRadius = Math.min(width, height * 1.5) * (narrow ? 1.4 : 1.1);
  // Neighbours on the arc sit 1.6 card widths apart, centre to centre — the
  // spacing the original design reached with twenty cards — at any count.
  const step = ((cardW * arcScale * 1.6) / arcRadius) * (180 / Math.PI);
  const inset = insetFor(narrow);

  return {
    cardW,
    cardH: cardW * CARD_RATIO,
    arcScale,
    arcRadius,
    arcApexY: height * (narrow ? 0.16 : 0.22),
    circleRadius: Math.min(Math.min(width, height) * 0.35, 350),
    lineGap: cardW + 12,
    step,
    sweep: Math.max(0, (COUNT - 1) / 2 - inset) * step,
  };
}

function targetFor(
  i: number,
  phase: Phase,
  layout: Layout,
  morph: number,
  turn: number,
  parallax: number
): Target {
  if (phase === "scatter") return SCATTER[i];

  if (phase === "line") {
    return { x: (i - (COUNT - 1) / 2) * layout.lineGap, y: 0, rotation: 0, scale: 1, opacity: 1 };
  }

  const circleAngle = (i / COUNT) * 360;
  const circle = {
    x: Math.cos(radians(circleAngle)) * layout.circleRadius,
    y: Math.sin(radians(circleAngle)) * layout.circleRadius,
    rotation: circleAngle + 90,
  };

  // A rainbow arch, convex up, its apex below the middle of the stage.
  const arcAngle =
    -90 + (i - (COUNT - 1) / 2) * layout.step + lerp(layout.sweep, -layout.sweep, turn);
  const arc = {
    x: Math.cos(radians(arcAngle)) * layout.arcRadius + parallax,
    y: Math.sin(radians(arcAngle)) * layout.arcRadius + layout.arcApexY + layout.arcRadius,
    rotation: arcAngle + 90,
  };

  return {
    x: lerp(circle.x, arc.x, morph),
    y: lerp(circle.y, arc.y, morph),
    rotation: lerp(circle.rotation, arc.rotation, morph),
    scale: lerp(1, layout.arcScale, morph),
    opacity: 1,
  };
}

/**
 * The work, as a deck of cards.
 *
 * On arrival the cards fly in from nowhere, fall into a line, then close into a
 * ring around the title. Scrolling breaks the ring open into an arch along the
 * foot of the screen, and scrolling on turns the arch, carrying each project
 * across the top of it. The stage is pinned throughout, so all of it is driven
 * by the page's own scroll: nothing here takes the wheel over.
 */
export default function ScrollMorph() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const still = reduced === true;

  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height }
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The arrival is timed rather than scrolled, and starts once the stage is
  // coming into view — by the time it is pinned the ring is closing.
  const arrived = useInView(stage, { once: true, amount: 0.3 });
  const [phase, setPhase] = useState<Phase>("scatter");
  useEffect(() => {
    if (!arrived) return;
    const toLine = window.setTimeout(() => setPhase("line"), LINE_AT);
    const toCircle = window.setTimeout(() => setPhase("circle"), CIRCLE_AT);
    return () => {
      window.clearTimeout(toLine);
      window.clearTimeout(toCircle);
    };
  }, [arrived]);
  const shown: Phase = still ? "circle" : phase;

  // Read straight off the scroll: Lenis is already easing it, and every card
  // springs to its target on top of that.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const morphProgress = useTransform(scrollYProgress, MORPH, [0, 1]);
  const turnProgress = useTransform(scrollYProgress, TURN, [0, 1]);

  useSlowZones(() => {
    const el = ref.current;
    if (!el) return [];
    const top = el.getBoundingClientRect().top + window.scrollY;
    const run = el.offsetHeight - window.innerHeight;
    return momentsFor(window.innerWidth < BREAKPOINT).map((p) => top + p * run);
  });

  const pointer = useMotionValue(0);
  const drift = useSpring(pointer, { stiffness: 30, damping: 20 });

  const [morph, setMorph] = useState(0);
  const [turn, setTurn] = useState(0);
  const [parallax, setParallax] = useState(0);
  useMotionValueEvent(morphProgress, "change", setMorph);
  useMotionValueEvent(turnProgress, "change", setTurn);
  useMotionValueEvent(drift, "change", setParallax);

  const copyOpacity = useTransform(morphProgress, [0.8, 1], [0, 1]);
  const copyY = useTransform(morphProgress, [0.8, 1], [20, 0]);

  function track(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
  }

  // Before the stage is measured, lay out for a typical desktop; every card is
  // invisible until the arrival anyway.
  const layout = layoutFor(size.width || 1280, size.height || 800);
  const titled = shown === "circle" && morph < 0.5;
  const fade = still ? { duration: 0 } : { duration: 1 };

  return (
    <section
      ref={ref}
      id="work"
      aria-label="Selected work"
      className="relative bg-field"
      style={{ height: `${SCREENS * 100}svh` }}
    >
      <div
        ref={stage}
        onPointerMove={track}
        className="sticky top-0 h-svh overflow-hidden"
      >
        {/* The title the ring closes around. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={
              titled
                ? { opacity: 1 - morph * 2, y: 0, filter: "blur(0px)" }
                : { opacity: 0, filter: "blur(10px)" }
            }
            transition={fade}
            className="max-w-[9ch] md:max-w-none font-sans font-semibold uppercase tracking-[-0.04em] leading-[0.9] text-ink text-[26px] md:text-[44px]"
          >
            Things I&apos;ve <Serif>built.</Serif>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={titled ? { opacity: 0.5 - morph } : { opacity: 0 }}
            transition={still ? fade : { ...fade, delay: 0.2 }}
            className="mt-4 font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-ink-2"
          >
            Scroll to explore
          </motion.p>
        </div>

        {/* What the arch is, once it has formed. */}
        <motion.div
          style={{ opacity: copyOpacity, y: copyY }}
          className="pointer-events-none absolute inset-x-0 top-[calc(64px+6svh)] z-10 flex flex-col items-center text-center px-6"
        >
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-ink-3">
            § 03 — Work
          </p>
          <h2 className="mt-5 font-sans font-semibold uppercase tracking-[-0.045em] leading-[0.88] text-ink text-[clamp(40px,6vw,88px)]">
            Selected <Serif>work.</Serif>
          </h2>
          <p className="mt-5 max-w-lg text-balance text-[14px] md:text-[15px] leading-[1.6] text-ink-2">
            Platforms, products and a few experiments.{" "}
            <span className="hidden md:inline">Hover</span>
            <span className="md:hidden">Tap</span> a card to turn it over.
          </p>
        </motion.div>

        <ul aria-label="Projects" className="absolute inset-0">
          {PROJECTS.map((project, i) => (
            <Card
              key={project.slug}
              project={project}
              index={i}
              target={targetFor(i, shown, layout, morph, turn, parallax * PARALLAX)}
              width={layout.cardW}
              height={layout.cardH}
              still={still}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * One project. The screenshot is on the front; the back carries its name. It
 * turns over under the pointer, on keyboard focus, or with a tap on a screen
 * that has no pointer to hover with.
 */
function Card({
  project,
  index,
  target,
  width,
  height,
  still,
}: {
  project: Project;
  index: number;
  target: Target;
  width: number;
  height: number;
  still: boolean;
}) {
  const [turned, setTurned] = useState(false);

  return (
    <motion.li
      className="morph-card"
      initial={false}
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={still ? { duration: 0 } : CARD_SPRING}
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2 }}
    >
      <motion.button
        type="button"
        aria-label={`${project.name}: ${project.kind}`}
        aria-pressed={turned}
        className="morph-flip group"
        animate={{ rotateY: turned ? 180 : 0 }}
        whileHover={{ rotateY: 180 }}
        whileFocus={{ rotateY: 180 }}
        transition={FLIP_SPRING}
        onTap={(event) => {
          // A mouse already turns the card by hovering it.
          if (event instanceof PointerEvent && event.pointerType === "mouse") return;
          setTurned((current) => !current);
        }}
      >
        <span className="morph-face bg-field-3">
          <Image
            src={`/projects/${project.slug}.webp`}
            alt=""
            fill
            sizes="(max-width: 767px) 110px, 170px"
            className="object-cover object-top"
          />
          <span className="absolute inset-0 bg-ink/10 transition-colors group-hover:bg-transparent" />
        </span>
        <span className="morph-face morph-back bg-ink text-field">
          <span className="morph-back-inner">
            <span className="morph-index font-mono uppercase tracking-[0.2em] text-field/55">
              Nº {String(index + 1).padStart(2, "0")}
            </span>
            <span className="morph-name font-sans font-semibold uppercase tracking-[-0.03em]">
              {project.name}
            </span>
            <span className="morph-kind text-field/70">{project.kind}</span>
          </span>
        </span>
      </motion.button>
    </motion.li>
  );
}

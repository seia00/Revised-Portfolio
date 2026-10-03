"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { easeOutExpo, NIGHTFALL, scrollSpring } from "@/lib/motion";
import { useSlowZones } from "@/lib/slowZones";
import { bankHalfWidth, createRiverRenderer, type RiverRenderer } from "./river/riverRenderer";
import { TIMELINE } from "@/data/timeline";
import { Serif } from "./ornaments";

/* ── The shape of the chapter ──────────────────────────────────────────────
   The section is measured in screens: a little over half of overture (the
   title, then the light opening under it), a little over a screen per
   milestone, and one to run out in. The overture is short because the dark
   arrives early: the hands plate goes out as this rises (see NIGHTFALL), so
   the title can rest before the section has risen all the way. The extra is what keeps it a story rather than a ride: the
   river takes longer over each bend, so it swings bank to bank more gently,
   and the milestones either side of the one being read sit fully off screen.

   The river runs *down* it, not across. The path is laid out in the section's
   own coordinates rather than inside the viewport, so it is not a picture of a
   river that sits still while the page moves past — it is the course itself,
   and scrolling carries the reader down it.                                */

const OVERTURE = 0.6;
const CODA = 1;
const CHAPTERS = TIMELINE.length;
/** Screens of river per milestone. */
const SPAN = 1.125;
const SCREENS = OVERTURE + CHAPTERS * SPAN + CODA;

/** Section progress after `screens` of scrolling. */
const at = (screens: number) => screens / SCREENS;

/** Where the light opens, measured down the section in screens. */
const SOURCE_Y = 0.65;

/**
 * Where the river ends.
 *
 * Half a screen short of the bottom, because the head of the current is held
 * at the middle of the viewport the whole way down — so the furthest it can
 * ever reach is the middle of the last screen. Ending the course exactly there
 * means the river is complete at the moment the section is, with no dark tail
 * left undrawn behind it.
 */
const MOUTH_Y = SCREENS - 0.5;

/** Section-y of milestone `i`, in screens: the middle of its own stretch. */
const bendY = (i: number) => OVERTURE + (i + 0.5) * SPAN;

/**
 * Section-y of the overture's title and of the closing line, in screens. The
 * title sits high, so it is centred — and the scroll slows over it — while the top
 * of the section is still a little way down the screen, over the plate gone
 * dark above it.
 */
const TITLE_Y = 0.25;
const CODA_Y = SCREENS - 0.32;

/**
 * How far the river wanders as it descends, as fractions of the section width.
 *
 * On a wide screen it meanders properly from bank to bank and the text sits in
 * the bend it has just left, so the reader crosses the water at every chapter.
 * A phone has no room for that: the course drops to a rail down the left and
 * the text runs beside it.
 */
type Course = {
  readonly source: number;
  readonly bends: readonly number[];
  readonly mouth: number;
  /** Where that bend's card sits, given the bend's own x. */
  readonly card: (x: number) => { left: number; width: number };
};

const WIDE: Course = {
  source: 0.5,
  bends: [0.32, 0.68, 0.3, 0.7],
  mouth: 0.5,
  card: (x) =>
    x < 0.5 ? { left: x + 0.09, width: 0.44 } : { left: x - 0.53, width: 0.44 },
};

const NARROW: Course = {
  source: 0.17,
  bends: [0.11, 0.2, 0.11, 0.2],
  mouth: 0.16,
  card: () => ({ left: 0.3, width: 0.67 }),
};

/** Length of the bright head of the current, as a fraction of the river. */
const HEAD = 0.045;

/**
 * How wide the river grows by its mouth, as a bank half-width in px. It rises
 * from a trickle at the source; a phone gets a narrower river to match its
 * narrower course.
 */
const WIDEST = { wide: 30, narrow: 22 } as const;

/** Points sampled along the course, for the river's ribbon and the draw. */
const SAMPLES = 600;

/** Sharper than this costs fill rate the river does not need. */
const MAX_DPR = 2;

/**
 * Which milestone the reader is standing in, or -1 during the overture.
 *
 * Progress 0 is the section's top at the foot of the viewport, so the middle of
 * the viewport is half a screen short of `SCREENS * progress` down the section.
 */
function chapterAt(progress: number): number {
  const depth = SCREENS * progress - 0.5;
  if (depth < bendY(0) - SPAN / 2) return -1;
  const i = Math.round((depth - bendY(0)) / SPAN);
  return Math.min(CHAPTERS - 1, Math.max(0, i));
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * A smooth curve through every one of `points`, as a cubic path.
 *
 * Catmull-Rom, so the curve passes *through* its control points rather than
 * being pulled towards them. That is the whole reason for it here: the bends
 * are also where the markers and the text are anchored, and they have to be on
 * the water, not near it.
 */
function smoothPath(points: readonly (readonly [number, number])[]): string {
  if (points.length < 2) return "";
  const at = (i: number) => points[Math.min(points.length - 1, Math.max(0, i))];
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}

/**
 * How far along the river a given depth is, as a fraction of its length.
 *
 * The course is always descending, so its sampled y values are sorted and a
 * depth can be binary-searched straight into an arc position. This is what
 * keeps the head of the light pinned to the middle of the screen: a meander
 * is longer than the drop it covers, and by a different amount in every bend,
 * so reading the draw off height alone would let the head drift out of the
 * bends by the better part of a screen.
 */
function arcAtDepth(ys: Float64Array, y: number): number {
  const last = ys.length - 1;
  if (y <= ys[0]) return 0;
  if (y >= ys[last]) return 1;
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ys[mid] <= y) lo = mid;
    else hi = mid;
  }
  const span = ys[hi] - ys[lo];
  return (lo + (span === 0 ? 0 : (y - ys[lo]) / span)) / last;
}

/** Rise and settle, used by every milestone card. */
const CARD = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: easeOutExpo },
  },
};

const CARD_VIEWPORT = { once: true, margin: "-20% 0px -20% 0px" } as const;

/**
 * The second chapter: the panel darkens into smoke, a light opens inside it,
 * and that light runs away downwards as a river the four milestones are moored
 * along.
 *
 * The dark and the smoke are pinned — they are the room the chapter happens
 * in. The river is not: it is laid out down the full height of the section and
 * scrolls with the page, so the reader descends the course rather than watching
 * it go by. The head of the current is held at the middle of the viewport the
 * whole way, which is what makes the two read as the same motion.
 */
export default function RiverLife() {
  const ref = useRef<HTMLElement>(null);
  const measure = useRef<SVGPathElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<RiverRenderer | null>(null);
  // The sampled course and its length, kept for the renderer, which may be
  // created before or after the course is first measured.
  const sampled = useRef<{ points: Float32Array; length: number; widest: number } | null>(null);
  const reduced = useReducedMotion();
  const still = reduced === true;
  // Redrawn from Lenis's own scroll event as well as on every frame, so the
  // river is never a frame behind the cards and markers scrolling with the page.
  const lenis = useLenis(() => renderer.current?.draw());
  const [active, setActive] = useState(-1);

  // The course is drawn in the section's own pixels rather than in a scaled
  // viewBox: the section is about six screens tall and one wide, so any fixed
  // viewBox would have to be stretched to fit, and a stretched viewBox gives
  // a stroke that is thicker across than it is down.
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      setBox((current) => {
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        return current.w === w && current.h === h ? current : { w, h };
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const course = box.w >= 768 ? WIDE : NARROW;
  const screenPx = box.h / SCREENS;

  const path = useMemo(() => {
    if (box.w === 0 || box.h === 0) return "";
    const points: [number, number][] = [
      [course.source * box.w, SOURCE_Y * screenPx],
      ...course.bends.map(
        (x, i) => [x * box.w, bendY(i) * screenPx] as [number, number],
      ),
      [course.mouth * box.w, MOUTH_Y * screenPx],
    ];
    return smoothPath(points);
  }, [box.w, box.h, course, screenPx]);

  // Sampled once per shape: the depths, so the draw can be read off depth, and
  // the points, which the river's ribbon is laid along. 600 samples over six
  // and a half screens is finer than a pixel at any size this runs at.
  const [depths, setDepths] = useState<Float64Array | null>(null);

  useEffect(() => {
    const el = measure.current;
    if (!el || path === "") {
      setDepths(null);
      return;
    }
    const total = el.getTotalLength();
    if (!total) {
      setDepths(null);
      return;
    }
    const ys = new Float64Array(SAMPLES + 1);
    const points = new Float32Array((SAMPLES + 1) * 2);
    for (let i = 0; i <= SAMPLES; i++) {
      const at = el.getPointAtLength((i / SAMPLES) * total);
      ys[i] = at.y;
      points[i * 2] = at.x;
      points[i * 2 + 1] = at.y;
    }
    const widest = box.w >= 768 ? WIDEST.wide : WIDEST.narrow;
    sampled.current = { points, length: total, widest };
    renderer.current?.setCourse(points, total, widest);
    setDepths(ys);
  }, [path, box.w]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const progress = useSpring(scrollYProgress, scrollSpring);

  useMotionValueEvent(progress, "change", (p) => {
    const next = chapterAt(p);
    setActive((current) => (next === current ? current : next));
  });

  // The panel does not cut to black, it goes out: the grey of the plate above
  // drains as the section rises, so the two chapters read as one move. The
  // plate darkens by the same measure, so the seam between them never shows.
  const dark = useTransform(progress, [0, at(NIGHTFALL)], [0, 1]);
  // The smoke lightens the room, so it waits until the room's top edge has
  // all but left the screen: until then the dark above and below it match,
  // and the title is read on one unbroken black.
  const smoke = useTransform(progress, [at(0.85), at(1.35)], [0, 1]);
  const title = useTransform(progress, [at(0.2), at(0.64)], [0, 1]);

  // The light: a bloom that opens in the dark at the head of the course, then
  // falls back to a trace once the current is running — it is the source the
  // river came out of, not a second light competing with its head.
  const dawn = useTransform(progress, [at(0.6), at(1.19), at(1.9)], [0, 1, 0.13]);
  // Opens out evenly as it brightens: a round glow, not drawn out along the
  // course.
  const dawnSize = useTransform(progress, [at(0.83), at(1.79)], [0.34, 0.8]);

  // The head of the current sits at the middle of the viewport, always, so
  // scrolling down the page *is* travelling down the river.
  const draw = useTransform(progress, (p) => {
    if (screenPx === 0) return 0;
    const headDepth = (SCREENS * p - 0.5) * screenPx;
    if (depths) return clamp01(arcAtDepth(depths, headDepth));
    const from = SOURCE_Y * screenPx;
    return clamp01((headDepth - from) / ((MOUTH_Y - SOURCE_Y) * screenPx));
  });
  const head = useTransform(draw, (v) => Math.max(0, v - HEAD));

  // The river itself: a ribbon of moving light laid along the course, drawn in
  // the pinned room behind the cards. The SVG line below stays as the fallback
  // for a browser without WebGL.
  useEffect(() => {
    const section = ref.current;
    const el = canvas.current;
    if (!section || !el) return;

    const created = createRiverRenderer(
      el,
      () => ({
        offset: el.getBoundingClientRect().top - section.getBoundingClientRect().top,
        head: still ? Number.MAX_SAFE_INTEGER : draw.get() * (sampled.current?.length ?? 0),
      }),
      {
        calm: still,
        onLost: () => {
          section.dataset.river = "svg";
          renderer.current = null;
        },
      }
    );
    if (!created) {
      section.dataset.river = "svg";
      return;
    }
    section.dataset.river = "webgl";
    renderer.current = created;
    if (sampled.current) {
      const { points, length, widest } = sampled.current;
      created.setCourse(points, length, widest);
    }

    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      created.resize(width, height, Math.min(window.devicePixelRatio || 1, MAX_DPR));
    });
    resize.observe(el);

    // Only flowing while the section is on screen.
    const visible = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) created.start();
      else created.stop();
    });
    visible.observe(section);

    return () => {
      resize.disconnect();
      visible.disconnect();
      created.destroy();
      renderer.current = null;
    };
  }, [still, draw]);

  // A specular highlight that follows the cursor across the dark, so the room
  // answers the reader even when the page is still. Mouse only — there is no
  // hover on a touch screen, and nothing here depends on it.
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const cursorX = useSpring(rawX, { stiffness: 90, damping: 22 });
  const cursorY = useSpring(rawY, { stiffness: 90, damping: 22 });
  const cursorLeft = useTransform(cursorX, (v) => `${v * 100}%`);
  const cursorTop = useTransform(cursorY, (v) => `${v * 100}%`);
  const [lit, setLit] = useState(false);

  function trackPointer(event: React.PointerEvent<HTMLElement>) {
    if (still || event.pointerType !== "mouse") return;
    rawX.set(event.clientX / window.innerWidth);
    rawY.set(event.clientY / window.innerHeight);
    if (!lit) setLit(true);
  }

  // Lands the bend in the middle of the screen, which is where the head of
  // the current is held — so arriving by click and arriving by scrolling put
  // the reader in exactly the same place. Computed off the section rather than
  // off the card, because every id on the page carries a `scroll-margin-top`
  // for the fixed header that would push the frame down by its height.
  function goToChapter(i: number) {
    const target = centred(bendY(i));
    if (target === null) return;
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  /** The scroll position that puts section-y `screens` mid-viewport. */
  function centred(screens: number): number | null {
    const el = ref.current;
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return top + screens * (el.offsetHeight / SCREENS) - window.innerHeight / 2;
  }

  // The scroll slows over the title, every milestone, and the closing line —
  // the last at the very end of the section, where the river has just run out.
  useSlowZones(() => {
    const el = ref.current;
    if (!el) return [];
    const top = el.getBoundingClientRect().top + window.scrollY;
    const chapters = TIMELINE.map((_, i) => centred(bendY(i)) ?? 0);
    return [
      centred(TITLE_Y) ?? top,
      ...chapters,
      top + el.offsetHeight - window.innerHeight,
    ];
  });

  return (
    <section
      ref={ref}
      id="life"
      aria-label="My life, thus far"
      onPointerMove={trackPointer}
      onPointerLeave={() => setLit(false)}
      // `clip` rather than `hidden`: it keeps the glow off the chapters either
      // side without making the section a scroll container, which would stop
      // the dark below from sticking.
      className="relative overflow-clip"
      style={{ height: `${SCREENS * 100}svh` }}
    >
      {/* ── The room: pinned, because the dark does not move ── */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* The plate's grey, going dark over it — the same black, by the
            same measure, as the overlay going out on the plate above. Only
            light changes here, not position, so it runs with motion reduced
            too: otherwise the hand-off would show its seam. */}
        <div aria-hidden className="absolute inset-0 bg-plate">
          <motion.div
            className="absolute inset-0 bg-[#07080a]"
            style={{ opacity: dark }}
          />
        </div>

        <motion.div
          aria-hidden
          className="river-smoke"
          style={{ opacity: smoke }}
        >
          <span />
          <span />
          <span />
        </motion.div>

        <canvas ref={canvas} aria-hidden className="river-canvas" />

        {!still && (
          <motion.div
            aria-hidden
            className="river-cursor"
            style={{ left: cursorLeft, top: cursorTop, opacity: lit ? 1 : 0 }}
          />
        )}

        <div aria-hidden className="river-vignette" />
      </div>

      {/* ── The course: laid down the whole section, so it scrolls ── */}
      <div className="river-course">
        <motion.span
          aria-hidden
          className="river-dawn"
          style={{
            left: `${course.source * 100}%`,
            top: `${(SOURCE_Y / SCREENS) * 100}%`,
            ...(still
              ? { opacity: 0.13, scale: 0.8 }
              : { opacity: dawn, scale: dawnSize }),
          }}
        />

        {path !== "" && (
          <svg
            viewBox={`0 0 ${box.w} ${box.h}`}
            className="river-svg"
            aria-hidden
          >
            <path ref={measure} className="river-gauge" d={path} />
            <g className="river-light">
              <RiverLight
                path={path}
                draw={still ? undefined : draw}
                head={head}
              />
            </g>
          </svg>
        )}

        {course.bends.map((x, i) => (
          <Bend
            key={TIMELINE[i].age}
            index={i}
            x={x}
            y={bendY(i)}
            river={
              depths
                ? bankHalfWidth(
                    arcAtDepth(depths, bendY(i) * screenPx),
                    box.w >= 768 ? WIDEST.wide : WIDEST.narrow
                  )
                : 0
            }
            labelSide={course.card(x).left > x ? "left" : "right"}
            reach={still ? undefined : draw}
            active={active === i}
            onSelect={goToChapter}
          />
        ))}

        {/* The overture, in the screen above the source. */}
        <div
          className="river-overture"
          style={{ top: `${(TITLE_Y / SCREENS) * 100}%` }}
        >
          <motion.div style={still ? undefined : { opacity: title }}>
            <p className="font-mono text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-snow/40">
              § 02 — Life
            </p>
            <h2 className="mt-7 font-sans font-semibold uppercase tracking-[-0.045em] leading-[0.88] text-snow text-[clamp(44px,8.5vw,128px)]">
              My life, <Serif>thus far.</Serif>
            </h2>
            <p className="mt-7 font-serif italic text-snow/55 text-lg md:text-2xl">
              Four turning points, one current.
            </p>
          </motion.div>
        </div>

        {TIMELINE.map((m, i) => {
          const place = course.card(course.bends[i]);
          return (
            <div
              key={m.age}
              id={`life-${i}`}
              data-active={active === i}
              className="river-card"
              style={{
                left: `${place.left * 100}%`,
                width: `${place.width * 100}%`,
                top: `${(bendY(i) / SCREENS) * 100}%`,
              }}
            >
              <motion.article
                variants={CARD}
                initial={still ? false : "hidden"}
                whileInView="visible"
                viewport={CARD_VIEWPORT}
              >
                <div className="flex items-baseline justify-between gap-4 font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-snow/40">
                  <span>
                    0{i + 1} — {m.stage}
                  </span>
                  <span className="text-right">{m.place}</span>
                </div>

                <span aria-hidden className="river-rule" />

                <div className="mt-6 md:mt-7 flex items-start gap-4 md:gap-7">
                  <span
                    aria-hidden
                    className="river-age font-serif leading-[0.7] tabular-nums text-[clamp(52px,6vw,112px)]"
                  >
                    {String(m.age).padStart(2, "0")}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-sans font-semibold tracking-[-0.03em] text-snow leading-[1.05] text-[clamp(22px,2.5vw,36px)]">
                      {m.title}
                    </h3>
                    <p className="mt-4 text-snow/55 leading-[1.7] text-[14px] md:text-[16px]">
                      {m.body}
                    </p>
                  </div>
                </div>
              </motion.article>
            </div>
          );
        })}

        <div
          className="river-coda"
          style={{ top: `${(CODA_Y / SCREENS) * 100}%` }}
        >
          <motion.p
            className="font-serif italic text-snow/70 text-center text-[clamp(24px,3.6vw,52px)] leading-[1.15]"
            initial={still ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-25% 0px -15% 0px" }}
            transition={{ duration: 1.2, ease: easeOutExpo }}
          >
            and it is still moving.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/**
 * The river as a line of light, for a browser without WebGL: one curve,
 * stroked several times over.
 *
 * `pathLength` is Framer's normalised draw — 0 is nothing, 1 is the whole
 * river — so halo, bed and core all extend from a single value, and the head
 * is the same thing offset to sit at the frontier.
 *
 * Every one of them is handed a MotionValue, including the two that never
 * change. Framer only rewrites `pathLength` into a dash pattern when it finds
 * a MotionValue there; given a plain number it passes it through as a CSS
 * property, which is not one, and the path quietly renders at full length.
 *
 * The bloom is stacked strokes rather than a blur filter: the dash pattern
 * changes on every frame, and a filter would have to re-rasterise the full
 * course along with it.
 */
function RiverLight({
  path,
  draw,
  head,
}: {
  path: string;
  draw?: MotionValue<number>;
  head: MotionValue<number>;
}) {
  const whole = useMotionValue(1);
  const wakeLength = useMotionValue(HEAD);
  const headLength = useMotionValue(HEAD * 0.4);
  const length = draw ?? whole;

  return (
    <>
      <motion.path
        d={path}
        className="river-halo"
        style={{ pathLength: length }}
      />
      <motion.path
        d={path}
        className="river-bed"
        style={{ pathLength: length }}
      />
      <motion.path
        d={path}
        className="river-core"
        style={{ pathLength: length }}
      />
      {draw !== undefined && (
        <>
          <motion.path
            d={path}
            className="river-wake"
            style={{ pathLength: wakeLength, pathOffset: head }}
          />
          <motion.path
            d={path}
            className="river-head"
            style={{ pathLength: headLength, pathOffset: head }}
          />
        </>
      )}
    </>
  );
}

/**
 * A bend in the river, which is also the way into its chapter.
 *
 * It surfaces as the light arrives at it, so the course is never given away
 * ahead of the telling: at the overture the panel is empty dark, and each
 * marker appears only once the current has reached that far down.
 */
function Bend({
  index,
  x,
  y,
  river,
  labelSide,
  reach,
  active,
  onSelect,
}: {
  index: number;
  x: number;
  y: number;
  /** The river's bank half-width at this bend, px, which the label clears. */
  river: number;
  labelSide: "left" | "right";
  reach?: MotionValue<number>;
  active: boolean;
  onSelect: (index: number) => void;
}) {
  const arrived = useMotionValue(1);
  const here = (y - SOURCE_Y) / (MOUTH_Y - SOURCE_Y);
  const surfaced = useTransform(reach ?? arrived, [here - 0.08, here], [0, 1]);
  const milestone = TIMELINE[index];

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(index)}
      data-active={active}
      data-label={labelSide}
      aria-label={`Age ${milestone.age} — ${milestone.title}`}
      className="river-bend"
      style={
        {
          left: `${x * 100}%`,
          top: `${(y / SCREENS) * 100}%`,
          opacity: surfaced,
          "--clear": `${Math.max(river - 6, -2)}px`,
        } as MotionStyle
      }
    >
      <span className="river-bend-dot" />
      <span className="river-bend-label font-mono text-[10px] tracking-[0.18em] uppercase whitespace-nowrap">
        <span className="tabular-nums">
          {String(milestone.age).padStart(2, "0")}
        </span>
        <span className="hidden md:inline"> — {milestone.stage}</span>
      </span>
    </motion.button>
  );
}

"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { easeOutExpo, scrollSpring } from "@/lib/motion";
import { TIMELINE } from "@/data/timeline";
import { Serif } from "./ornaments";

/**
 * The river, drawn in a 1000x400 box.
 *
 * `.river-field` is given that same aspect ratio, so the curve scales
 * uniformly and a percentage measured against the box lands exactly on the
 * path — which is how the bend markers below are placed without ever having to
 * ask the browser where the curve actually went.
 */
const RIVER =
  "M0 206C48 206 76 174 120 174S332 232 380 232S582 170 630 170S832 228 880 228S968 198 1000 198";

/**
 * The four bends, one per milestone: where the light passes through, and where
 * that chapter's text hangs off it.
 *
 * `x`/`y` are percentages of the river box. `side` is which bank the text sits
 * on — they alternate, so the eye crosses the water at every chapter instead of
 * running down one margin. `cardX`/`cardW` march the text left to right with
 * the current; below the md breakpoint the river is lifted into the top third
 * and the text simply stacks underneath it.
 */
const BENDS = [
  { x: 12, y: 43.5, side: "below", cardX: "4%", cardW: "34%" },
  { x: 38, y: 58, side: "above", cardX: "27%", cardW: "34%" },
  { x: 63, y: 42.5, side: "below", cardX: "46%", cardW: "34%" },
  { x: 88, y: 57, side: "above", cardX: "62%", cardW: "34%" },
] as const;

/* ── Timing ────────────────────────────────────────────────────────────────
   The section is measured in screens: one of overture (the panel darkening,
   then the light opening in it), one per milestone, and one to resolve back
   into paper.

   Scroll is tracked `start end` → `end end`, so progress opens the moment the
   section's top clears the bottom of the viewport and closes when its bottom
   reaches that same line. The run is therefore exactly the section's height,
   and one screen is one `STEP` of it.                                      */

const OVERTURE = 1;
const CODA = 1;
const CHAPTERS = TIMELINE.length;
const SCREENS = OVERTURE + CHAPTERS + CODA;
const STEP = 1 / SCREENS;

/**
 * Progress at which milestone `i` fills the viewport.
 *
 * Each block is exactly one screen tall, so it lands square when the section
 * has travelled its own offset plus the one screen of lead-in that progress
 * opens with.
 */
const centreOf = (i: number) => (OVERTURE + i + 1) * STEP;

/**
 * The window the light is drawn across, solved so its head arrives at each
 * bend exactly as that bend's chapter reaches the screen. Two unknowns, two
 * anchors — the first bend and the last.
 */
const SPAN =
  (centreOf(CHAPTERS - 1) - centreOf(0)) /
  ((BENDS[CHAPTERS - 1].x - BENDS[0].x) / 100);
const DRAW_FROM = centreOf(0) - (BENDS[0].x / 100) * SPAN;
const DRAW_TO = DRAW_FROM + SPAN;

/** Length of the bright head of the current, as a fraction of the river. */
const HEAD = 0.055;

/** Which milestone the reader is standing in, or -1 during the overture. */
function chapterAt(progress: number): number {
  const first = centreOf(0);
  if (progress < first - STEP / 2) return -1;
  const i = Math.round((progress - first) / STEP);
  return Math.min(CHAPTERS - 1, Math.max(0, i));
}

/** Rise and settle, used by every milestone card. */
const CARD = {
  hidden: { opacity: 0, y: 46 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: easeOutExpo },
  },
};

/** How far either side of the middle a card counts as arrived. */
const CARD_VIEWPORT = { once: true, margin: "-25% 0px -25% 0px" } as const;

/**
 * The second chapter: the panel darkens into smoke, a light opens inside it,
 * and that light draws itself across the screen as a river the four milestones
 * hang off.
 *
 * The stage is pinned for the whole section and the text is pulled back over
 * it, so the river is one continuous shot rather than five separate ones, and
 * the reader is always standing at the head of the current.
 */
export default function RiverLife() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const still = reduced === true;
  const lenis = useLenis();
  const [active, setActive] = useState(-1);

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
  // drains as the section rises, so the two chapters read as one move.
  // The first screen is the section rising into view, so the grey is spent by
  // the time it pins: the reader arrives at a panel that has already gone out,
  // not one that cuts to black under them.
  const ground = useTransform(progress, [0, 0.13], ["#c8cac8", "#07080a"]);
  const smoke = useTransform(progress, [0.02, 0.15], [0, 1]);
  const title = useTransform(progress, [0.07, 0.18], [0, 1]);

  // The light: a bloom that opens in the dark once the panel has settled, then
  // flattens and stretches as the river takes it over — the same light the
  // whole way through, not a second one.
  // Falls back to a trace once the river is running: it is the source the
  // current came out of, not a second light competing with its head.
  const dawn = useTransform(progress, [0.15, 0.3, 0.56], [0, 1, 0.14]);
  const dawnX = useTransform(progress, [0.22, 0.38], [0.3, 2.9]);
  const dawnY = useTransform(progress, [0.22, 0.38], [0.3, 0.22]);

  const draw = useTransform(progress, [DRAW_FROM, DRAW_TO], [0, 1]);
  const head = useTransform(draw, (v) => Math.max(0, v - HEAD));

  // A specular highlight that follows the cursor across the stage, so the
  // surface answers the reader even when the page is still. Mouse only — there
  // is no hover on a touch screen, and nothing here depends on it.
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const cursorX = useSpring(rawX, { stiffness: 90, damping: 22 });
  const cursorY = useSpring(rawY, { stiffness: 90, damping: 22 });
  const cursorLeft = useTransform(cursorX, (v) => `${v * 100}%`);
  const cursorTop = useTransform(cursorY, (v) => `${v * 100}%`);
  const [lit, setLit] = useState(false);

  function trackPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (still || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    rawX.set((event.clientX - box.left) / box.width);
    rawY.set((event.clientY - box.top) / box.height);
    if (!lit) setLit(true);
  }

  // Scrolled to an absolute offset rather than to the element, because every
  // id on the page carries a `scroll-margin-top` for the fixed header and that
  // would land each chapter 64px below the frame it was composed for. These
  // blocks are full-screen shots: their top belongs at the top.
  function goToChapter(i: number) {
    const el = document.getElementById(`life-${i}`);
    if (!el) return;
    const target = el.getBoundingClientRect().top + window.scrollY;
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <section
      ref={ref}
      id="life"
      aria-label="My life, thus far"
      className="relative"
      // Stated rather than left to the blocks below so the timing constants
      // above and the markup can never drift apart.
      style={{ height: `${SCREENS * 100}svh` }}
    >
      {/* ── The stage, pinned for the whole chapter ── */}
      <div
        onPointerMove={trackPointer}
        onPointerLeave={() => setLit(false)}
        className="sticky top-0 h-svh overflow-hidden"
      >
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={still ? { backgroundColor: "#07080a" } : { backgroundColor: ground }}
        />

        <motion.div
          aria-hidden
          className="river-smoke"
          style={still ? undefined : { opacity: smoke }}
        >
          <span />
          <span />
          <span />
        </motion.div>

        {!still && (
          <motion.div
            aria-hidden
            className="river-cursor"
            style={{ left: cursorLeft, top: cursorTop, opacity: lit ? 1 : 0 }}
          />
        )}

        <div className="river-field">
          <motion.span
            aria-hidden
            className="river-dawn"
            style={
              still
                ? { opacity: 0.45, scaleX: 2.9, scaleY: 0.22 }
                : { opacity: dawn, scaleX: dawnX, scaleY: dawnY }
            }
          />

          <RiverLight draw={still ? undefined : draw} head={head} />

          {BENDS.map((bend, i) => (
            <Bend
              key={TIMELINE[i].age}
              index={i}
              bend={bend}
              reach={still ? undefined : draw}
              active={active === i}
              onSelect={goToChapter}
            />
          ))}
        </div>

        <div aria-hidden className="river-vignette" />
      </div>

      {/* ── The text, carried over the stage ──
          Transparent to the pointer so the bends underneath stay reachable;
          each card takes its own events back. */}
      <div className="relative -mt-[100svh] pointer-events-none">
        <div className="h-svh flex flex-col items-center justify-center text-center px-6">
          <motion.div style={still ? undefined : { opacity: title }}>
            <p className="font-mono text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-field/40">
              § 02 — Life
            </p>
            <h2 className="mt-7 font-sans font-semibold uppercase tracking-[-0.045em] leading-[0.88] text-field text-[clamp(44px,8.5vw,128px)]">
              My life, <Serif>thus far.</Serif>
            </h2>
            <p className="mt-7 font-serif italic text-field/55 text-lg md:text-2xl">
              Four turning points, one current.
            </p>
          </motion.div>
        </div>

        {TIMELINE.map((m, i) => (
          <article key={m.age} id={`life-${i}`} className="relative h-svh">
            <motion.div
              variants={CARD}
              initial={still ? false : "hidden"}
              whileInView="visible"
              viewport={CARD_VIEWPORT}
              data-side={BENDS[i].side}
              data-active={active === i}
              style={
                { "--x": BENDS[i].cardX, "--w": BENDS[i].cardW } as React.CSSProperties
              }
              className="river-card pointer-events-auto"
            >
              <div className="flex items-baseline justify-between gap-4 font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-field/40">
                <span>
                  0{i + 1} — {m.stage}
                </span>
                <span className="text-right">{m.place}</span>
              </div>

              <span aria-hidden className="river-rule" />

              <div className="mt-7 flex items-start gap-5 md:gap-7">
                <span
                  aria-hidden
                  className="river-age font-serif leading-[0.7] tabular-nums text-[clamp(60px,6.6vw,116px)]"
                >
                  {String(m.age).padStart(2, "0")}
                </span>
                <div className="pt-1">
                  <h3 className="font-sans font-semibold tracking-[-0.03em] text-field leading-[1.05] text-[clamp(24px,2.6vw,38px)]">
                    {m.title}
                  </h3>
                  <p className="mt-4 text-field/55 leading-[1.7] text-[14px] md:text-[16px]">
                    {m.body}
                  </p>
                </div>
              </div>
            </motion.div>
          </article>
        ))}

        <div className="relative h-svh flex items-start justify-center px-6 pt-[41svh] md:pt-[24svh]">
          <motion.p
            className="relative z-10 font-serif italic text-field/70 text-center text-[clamp(26px,4vw,56px)] leading-[1.15]"
            initial={still ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30% 0px -20% 0px" }}
            transition={{ duration: 1.2, ease: easeOutExpo }}
          >
            and it is still moving.
          </motion.p>
          {/* The river runs out into paper, so the next chapter is not a cut. */}
          <div aria-hidden className="river-wash" />
        </div>
      </div>
    </section>
  );
}

/**
 * The light itself: one curve, drawn several times over.
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
 * width along with it.
 */
function RiverLight({
  draw,
  head,
}: {
  draw?: MotionValue<number>;
  head: MotionValue<number>;
}) {
  const whole = useMotionValue(1);
  const wakeLength = useMotionValue(HEAD);
  const headLength = useMotionValue(HEAD * 0.4);
  const length = draw ?? whole;

  return (
    <svg viewBox="0 0 1000 400" className="river-svg" aria-hidden>
      <motion.path d={RIVER} className="river-halo" style={{ pathLength: length }} />
      <motion.path d={RIVER} className="river-bed" style={{ pathLength: length }} />
      <motion.path d={RIVER} className="river-core" style={{ pathLength: length }} />
      {draw !== undefined && (
        <>
          <motion.path
            d={RIVER}
            className="river-wake"
            style={{ pathLength: wakeLength, pathOffset: head }}
          />
          <motion.path
            d={RIVER}
            className="river-head"
            style={{ pathLength: headLength, pathOffset: head }}
          />
        </>
      )}
    </svg>
  );
}

/**
 * A bend in the river, which is also the way into its chapter.
 *
 * It surfaces as the light arrives at it, so the course is never spoiled ahead
 * of the telling — at the overture the panel is empty dark, and each marker
 * appears only once the current has reached that far.
 */
function Bend({
  index,
  bend,
  reach,
  active,
  onSelect,
}: {
  index: number;
  bend: (typeof BENDS)[number];
  reach?: MotionValue<number>;
  active: boolean;
  onSelect: (index: number) => void;
}) {
  const arrived = useMotionValue(1);
  const here = bend.x / 100;
  const surfaced = useTransform(reach ?? arrived, [here - 0.09, here], [0, 1]);
  const milestone = TIMELINE[index];

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(index)}
      data-active={active}
      aria-label={`Age ${milestone.age} — ${milestone.title}`}
      className="river-bend"
      style={{ left: `${bend.x}%`, top: `${bend.y}%`, opacity: surfaced }}
    >
      <span className="river-bend-dot" />
      <span className="river-bend-label font-mono text-[10px] tracking-[0.18em] uppercase whitespace-nowrap">
        <span className="tabular-nums">{String(milestone.age).padStart(2, "0")}</span>
        <span className="hidden md:inline"> — {milestone.stage}</span>
      </span>
    </motion.button>
  );
}

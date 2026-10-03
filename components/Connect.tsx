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
import IdleFigure from "./IdleFigure";

const EMAIL = "seiafunayama@gmail.com";

/** The ways in, in the order the figure points them out. */
const CONTACTS = [
  { title: "Email", handle: EMAIL, href: `mailto:${EMAIL}`, external: false },
  {
    title: "LinkedIn",
    handle: "Seia Funayama",
    href: "https://www.linkedin.com/in/seiafunayama/",
    external: true,
  },
  {
    title: "Instagram",
    handle: "@seiafunayama",
    href: "https://instagram.com/seiafunayama",
    external: true,
  },
] as const;

/**
 * The chapter's height, in screens. The first is the scene rising into view;
 * for the rest it is pinned, and the scroll drives the camera.
 */
const SCREENS = 2;

/** Chapter progress after `screens` of scrolling. */
const at = (screens: number) => screens / SCREENS;

/** The header gets out of the way once the scene has most of the screen. */
const CLOSE_FROM = at(0.75);

/**
 * The pull-back. It starts a little before the scene pins and runs straight
 * on from there, so the camera is moving from the first turn of the wheel —
 * there is no held beat to scroll through before it goes.
 */
const PULL = [at(0.85), at(1.55)] as const;

/** The header returns partway through the pull-back. */
const HEADER_BACK = at(1.25);

/** The details arrive one after another as the camera settles. */
const DETAILS_FROM = at(1.15);
const DETAIL_STAGGER = at(0.07);
const DETAIL_SPAN = at(0.2);

/** The leader lines draw out from the fingertip once the camera is still. */
const LEADERS_FROM = at(1.55);
const LEADER_STAGGER = at(0.05);
const LEADER_SPAN = at(0.22);

/**
 * Where things are in the frame, as fractions of it, read off the frames
 * themselves. The figure runs off the foot of the frame from its crown's tips
 * 37.3% down, and spans 32.5–69.5% across; its crown fills 47.5–69.5% across
 * and 37.3–70% down; the hand points right, its fingertip — still in every
 * frame — at 65.05% across and 81.5% down.
 */
const FIGURE = { top: 0.373, left: 0.325, right: 0.695 } as const;
const CROWN = { left: 0.475, right: 0.695, top: 0.373, bottom: 0.7 } as const;
const TIP = { x: 0.6505, y: 0.815 } as const;
const ASPECT = 16 / 9;

/**
 * Pointing, on a wide screen: the figure stands as tall as the screen allows
 * under the header (`top`, px), its back on the left edge, and the contacts
 * are listed where its hand points — no narrower than `list`, `fan` px on
 * from the fingertip, `pad` px from the right edge, `clear` px from the text
 * above and below. The leader lines start `gap` px off the fingertip, so they
 * never touch the figure.
 */
const POINTING = { top: 104, list: 340, fan: 96, pad: 64, clear: 28, gap: 14 } as const;

/**
 * Stacked, on a phone or a portrait screen: the figure fills what the details
 * leave below them, `gap` px under them, and never less than `least` of the
 * screen's height; wider than the screen, it keeps its crown and hand `edge`
 * px inside the right edge and lets its back go.
 */
const STACKED = { gap: 20, edge: 8, least: 0.4 } as const;

/** Close up, the crown fills the screen — as wide, or most of it tall. */
const CLOSE = { wide: 1.1, tall: 0.7 } as const;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type Point = { x: number; y: number };

/** The shot for the current screen, all in px on the stage. */
type Shot = {
  /** The frame, pulled back: its left edge and its height. Its foot is the stage's. */
  left: number;
  height: number;
  /** The camera's pivot, the foot of the frame at its middle. */
  origin: Point;
  /** The crown's middle, pulled back, and where it starts close up. */
  crown: Point;
  start: Point;
  /** How much closer than pulled back the camera starts. */
  close: number;
  /** From the fingertip to the top rule of each contact, when pointing. */
  leaders: { from: Point; to: Point[] } | null;
};

/**
 * Frame the figure for the screen and the details, and lay the contacts out
 * where it points. Which layout the details are in is the stylesheet's call
 * (see .ending-details); this reads it rather than repeating the breakpoint.
 */
function frameShot(stage: HTMLElement, details: HTMLElement, contacts: HTMLElement): Shot {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const layout = getComputedStyle(details).getPropertyValue("--ending-layout").trim();
  const figureHeight = 1 - FIGURE.top;

  let frame: number;
  let left: number;
  let leaders: Shot["leaders"] = null;

  if (layout === "pointing") {
    // As tall as fits under the header, unless that leaves the list too
    // little room to the right of the hand.
    const reach = (TIP.x - FIGURE.left) * ASPECT;
    frame = Math.min(
      (height - POINTING.top) / figureHeight,
      (width - POINTING.pad - POINTING.list - POINTING.fan - POINTING.gap) / reach
    );
    const frameWidth = frame * ASPECT;
    left = -FIGURE.left * frameWidth;
    const from = {
      x: left + TIP.x * frameWidth + POINTING.gap,
      y: height - frame + TIP.y * frame,
    };

    // The list starts where the fan lands. Its height depends on its width,
    // so it is placed across first and measured, then set so its rules
    // straddle the fingertip and the middle line runs level.
    const listLeft = from.x + POINTING.fan;
    details.style.setProperty("--contacts-left", `${listLeft}px`);
    const rows = Array.from(contacts.children) as HTMLElement[];
    const rules = rows.map((row) => row.offsetTop);
    const status = details.querySelector<HTMLElement>(".ending-status");
    const fine = details.querySelector<HTMLElement>(".ending-fine");
    const least = status ? status.offsetTop + status.offsetHeight + POINTING.clear : 0;
    const most = (fine ? fine.offsetTop : height) - POINTING.clear - contacts.offsetHeight;
    const centred = from.y - (rules[0] + rules[rules.length - 1]) / 2;
    const listTop = Math.max(least, Math.min(most, centred));
    details.style.setProperty("--contacts-top", `${listTop}px`);
    // Half a px down, onto the middle of each 1px rule.
    leaders = { from, to: rules.map((y) => ({ x: listLeft, y: listTop + y + 0.5 })) };
  } else {
    let band = 0;
    for (const el of Array.from(details.children) as HTMLElement[]) {
      band = Math.max(band, el.offsetTop + el.offsetHeight);
    }
    frame = Math.max(
      (height - band - STACKED.gap) / figureHeight,
      (STACKED.least * height) / figureHeight
    );
    const frameWidth = frame * ASPECT;
    const span = (FIGURE.right - FIGURE.left) * frameWidth;
    left =
      span <= width - 2 * STACKED.edge
        ? width / 2 - ((FIGURE.left + FIGURE.right) / 2) * frameWidth
        : width - STACKED.edge - FIGURE.right * frameWidth;
  }

  const frameWidth = frame * ASPECT;
  const crown = {
    x: left + ((CROWN.left + CROWN.right) / 2) * frameWidth,
    y: height - frame + ((CROWN.top + CROWN.bottom) / 2) * frame,
  };
  const close = Math.max(
    1,
    Math.min(
      (CLOSE.wide * width) / ((CROWN.right - CROWN.left) * frameWidth),
      (CLOSE.tall * height) / ((CROWN.bottom - CROWN.top) * frame)
    )
  );
  return {
    left,
    height: frame,
    origin: { x: left + frameWidth / 2, y: height },
    crown,
    // Centred across, and never above where it ends up, so the frame's foot
    // stays below the screen's all the way back.
    start: { x: width / 2, y: Math.max(crown.y, height / 2) },
    close,
    leaders,
  };
}

/**
 * Where the camera is, `p` of the way back. It pulls back in steps of equal
 * ratio, so it seems to move at one speed, while the crown travels steadily
 * from the middle of the screen to its place.
 */
function cameraAt(shot: Shot, p: number) {
  const scale = shot.close ** (1 - p);
  const tx = shot.start.x + (shot.crown.x - shot.start.x) * p;
  const ty = shot.start.y + (shot.crown.y - shot.start.y) * p;
  return {
    scale,
    x: tx - shot.origin.x - scale * (shot.crown.x - shot.origin.x),
    y: ty - shot.origin.y - scale * (shot.crown.y - shot.origin.y),
  };
}

/**
 * The last chapter: the idle figure, and the ways to get in touch.
 *
 * It rises into view close up, the crown filling the screen and the header
 * gone, and the camera pulls back as soon as the reader carries on — the
 * whole frame, never the figure apart from it. On a wide screen it settles
 * with the figure standing tall on the left, its hand pointing out the
 * contacts listed to the right, a leader line running from the fingertip to
 * each; on a phone the contacts stack under the header and the figure fills
 * the screen below them.
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
  const contacts = useRef<HTMLUListElement>(null);
  const [shot, setShot] = useState<Shot | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const progress = useSpring(scrollYProgress, scrollSpring);

  useEffect(() => {
    const s = stage.current;
    const d = details.current;
    const c = contacts.current;
    if (!s || !d || !c) return;
    const measure = () => setShot(frameShot(s, d, c));
    measure();
    // The stage for the screen, the details for the fonts arriving.
    const observer = new ResizeObserver(measure);
    observer.observe(s);
    observer.observe(d);
    observer.observe(c);
    return () => observer.disconnect();
  }, []);

  const pull = useTransform(progress, [PULL[0], PULL[1]], [0, 1], { ease: easeInOutCubic });
  const scale = useTransform(pull, (p) => (shot ? cameraAt(shot, p).scale : 1));
  const x = useTransform(pull, (p) => (shot ? cameraAt(shot, p).x : 0));
  const y = useTransform(pull, (p) => (shot ? cameraAt(shot, p).y : 0));

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
            left: shot ? `${shot.left}px` : undefined,
            height: shot ? `${shot.height}px` : undefined,
            ...(still ? null : { x, y, scale, originX: 0.5, originY: 1 }),
          }}
        >
          <IdleFigure />
        </motion.div>

        {shot?.leaders && (
          <svg aria-hidden className="ending-leaders">
            {shot.leaders.to.map((to, i) => (
              <Leader
                key={i}
                from={shot.leaders!.from}
                to={to}
                index={i}
                progress={progress}
                still={still}
              />
            ))}
          </svg>
        )}

        <div ref={details} className="ending-details">
          <Reveal index={0} progress={progress} still={still} className="ending-status">
            <p className="ending-label">§ 05 — Contact</p>
            <p>DMs open</p>
            <p>Tokyo / UTC+9</p>
            <p className="ending-colophon">Set in Instrument Serif, Inter Tight &amp; JetBrains Mono</p>
          </Reveal>

          <ul ref={contacts} className="ending-contacts">
            {CONTACTS.map((c, i) => (
              <Contact key={c.title} contact={c} index={i} progress={progress} still={still} />
            ))}
          </ul>

          <Reveal index={4} progress={progress} still={still} className="ending-fine">
            <p>© 2026 Seia Funayama</p>
            <button onClick={backToTop} className="ending-link cursor-pointer uppercase">
              Back to top ↑
            </button>
          </Reveal>
        </div>
      </div>
    </footer>
  );
}

/**
 * A block of the details rising into place on its turn. Out of sight until
 * then, so nothing hidden can be tabbed to.
 */
function useReveal(progress: MotionValue<number>, index: number, still: boolean) {
  const start = DETAILS_FROM + index * DETAIL_STAGGER;
  const end = start + DETAIL_SPAN;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [24, 0]);
  const visibility = useTransform(opacity, (o) => (o > 0.01 ? "visible" : "hidden"));
  return still ? undefined : { opacity, y, visibility };
}

function Reveal({
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
  const style = useReveal(progress, index, still);
  return (
    <motion.div className={className} style={style}>
      {children}
    </motion.div>
  );
}

/** One way in: a ruled row, its leader line joining the rule at its left end. */
function Contact({
  contact,
  index,
  progress,
  still,
}: {
  contact: (typeof CONTACTS)[number];
  index: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const style = useReveal(progress, index + 1, still);
  return (
    <motion.li className="ending-contact" style={style}>
      <a
        href={contact.href}
        target={contact.external ? "_blank" : undefined}
        rel={contact.external ? "noopener noreferrer" : undefined}
        className="ending-contact-link group"
      >
        <span className="ending-contact-n">0{index + 1}</span>
        <span className="ending-contact-title">{contact.title}</span>
        <span className="ending-contact-handle">
          {contact.handle}
          <Arrow />
        </span>
      </a>
    </motion.li>
  );
}

/** A leader line drawn out from the fingertip to one contact's rule. */
function Leader({
  from,
  to,
  index,
  progress,
  still,
}: {
  from: Point;
  to: Point;
  index: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const start = LEADERS_FROM + index * LEADER_STAGGER;
  const draw = useTransform(progress, [start, start + LEADER_SPAN], [0, 1]);
  return (
    <motion.line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      style={still ? undefined : { pathLength: draw }}
    />
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="ending-contact-arrow" aria-hidden>
      <path d="M3 12h17M14 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

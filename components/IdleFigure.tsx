"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme, type Theme } from "@/lib/theme";

/** The idle loop: sixteen frames at 12fps, then straight back to the first. */
const FRAME_COUNT = 16;
const FRAME_MS = 1000 / 12;

/** How far ahead of the screen the frames start loading. */
const PRELOAD_MARGIN = "150% 0px";

/**
 * The frames, as supplied, in order: lossless WebP re-encodes of the original
 * 1920x1080 PNGs. Every pixel is the same, at a third of the weight, which
 * matters with two full sets to preload.
 */
function framesOf(theme: Theme): readonly string[] {
  return Array.from(
    { length: FRAME_COUNT },
    (_, i) => `/idle/${theme}/frame_${String(i + 1).padStart(2, "0")}.webp`
  );
}

const FRAMES: Record<Theme, readonly string[]> = {
  light: framesOf("light"),
  dark: framesOf("dark"),
};

/** Decoded frames, held on to so the browser keeps them ready to swap in. */
const held: HTMLImageElement[] = [];
const sets = new Map<Theme, Promise<boolean>>();

/**
 * Load and decode a whole set, once. Resolves false if any frame failed, and
 * forgets the attempt so the next one starts afresh.
 */
function preload(theme: Theme): Promise<boolean> {
  const pending = sets.get(theme);
  if (pending) return pending;
  const set = Promise.all(
    FRAMES[theme].map((src) => {
      const img = new Image();
      img.src = src;
      held.push(img);
      return img.decode().then(
        () => true,
        () => false
      );
    })
  ).then((decoded) => {
    const whole = decoded.every(Boolean);
    if (!whole) sets.delete(theme);
    return whole;
  });
  sets.set(theme, set);
  return set;
}

/**
 * The idle figure: a pre-rendered sprite loop, played back exactly as drawn.
 *
 * The motion is all in the frames, so this only ever shows one of them at a
 * time, unaltered — one <img>, its source stepped on a clock every 83ms, 16
 * back to 01 like any other step. No easing, fades or filters, and the frames
 * are scaled with hard pixel edges wherever they are shown.
 *
 * Both sets, light and dark, are loaded and decoded before the loop starts, so
 * it never stutters and a theme switch carries on from the same frame in the
 * other set. It plays only while on screen, and holds frame 01 with motion
 * reduced. The frame lives in this component's own state, so its tick never
 * reaches anything else on the page.
 */
function IdleFigure() {
  const theme = useTheme();
  const still = useReducedMotion() === true;
  const img = useRef<HTMLImageElement>(null);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState<Record<Theme, boolean>>({ light: false, dark: false });
  const [frame, setFrame] = useState(0);
  const shown = useRef(0);

  useEffect(() => {
    const el = img.current;
    if (!el) return;
    const reach = new IntersectionObserver(([e]) => setNear(e.isIntersecting), {
      rootMargin: PRELOAD_MARGIN,
    });
    const view = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    reach.observe(el);
    view.observe(el);
    return () => {
      reach.disconnect();
      view.disconnect();
    };
  }, []);

  // The set on show first, then the other, so a switch of theme is instant.
  useEffect(() => {
    if (!near || still) return;
    let live = true;
    const other: Theme = theme === "dark" ? "light" : "dark";
    void (async () => {
      for (const set of [theme, other]) {
        const whole = await preload(set);
        if (!live) return;
        if (whole) setReady((r) => (r[set] ? r : { ...r, [set]: true }));
      }
    })();
    return () => {
      live = false;
    };
  }, [near, still, theme]);

  const playing = !still && onScreen && ready[theme];

  // A clock, not a CSS animation: the frame is read off the time elapsed, so
  // the loop keeps its pace exactly, and picks up from the frame it paused on.
  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - shown.current * FRAME_MS;
    let raf = requestAnimationFrame(function tick(now) {
      const next = Math.floor((now - start) / FRAME_MS) % FRAME_COUNT;
      if (next !== shown.current) {
        shown.current = next;
        setFrame(next);
      }
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    // A plain <img>: the frames are swapped in as they are, and the image
    // optimiser would re-encode the artwork.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={img}
      src={FRAMES[theme][still ? 0 : frame]}
      alt=""
      width={1920}
      height={1080}
      loading="lazy"
      draggable={false}
      className="idle-figure"
    />
  );
}

export default memo(IdleFigure);

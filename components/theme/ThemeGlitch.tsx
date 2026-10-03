"use client";

import { useEffect, useRef } from "react";
import { registerThemeTransition, type Theme } from "@/lib/theme";
import { MARK_HEIGHT, MARK_PATH, MARK_WIDTH } from "../logo/mark";
import { makeStatic, type StaticPalette } from "./staticNoise";

/** One beat of the glitch, in ms: two frames at 60Hz, so it stutters like a bad signal. */
const BEAT = 34;

/** How many beats each part takes: tearing in, covering, rolling off. */
const TEAR = 6;
const COVER = 4;
const ROLL = 6;

/** The static's resolution across, in pixels; it is scaled up blocky to fill the screen. */
const STATIC_WIDTH = 420;
const STATIC_FRAMES = 6;

/**
 * Going dark, the signal bleeds: the static runs red and its fringes are all
 * reds, each beat picking its own — bright ones laid over the static as
 * light, deep ones pressed into it as stain (see globals.css). Going light,
 * the fringes are the usual red and cyan, set in CSS.
 */
const BRIGHT_REDS = [
  "rgba(255, 26, 38, 0.6)",
  "rgba(232, 18, 52, 0.6)",
  "rgba(255, 64, 40, 0.55)",
] as const;
const BLOOD_REDS = [
  "rgba(138, 3, 3, 0.92)",
  "rgba(112, 0, 12, 0.92)",
  "rgba(86, 0, 4, 0.92)",
  "rgba(164, 10, 22, 0.88)",
] as const;

type Layers = {
  root: HTMLDivElement;
  snow: HTMLCanvasElement;
  /** The two coloured fringes, pulled either way off each band. */
  lead: HTMLDivElement;
  trail: HTMLDivElement;
  mark: HTMLDivElement;
};

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const either = () => (Math.random() < 0.5 ? -1 : 1);
const pick = <T,>(from: readonly T[]) => from[Math.floor(Math.random() * from.length)];
const beat = () => new Promise((r) => setTimeout(r, BEAT));

/**
 * The theme switch, played as a channel losing its signal: bands of static
 * tear across the page with their colours pulled apart, the static takes the
 * whole screen — the theme changes underneath it, and the mark flickers
 * through — then it rolls up off the new page. Into the dark it all runs red.
 *
 * Kept to two changes of the whole screen, in and out, and no full-screen
 * colour flashes: the flicker is all in the static's grain, which holds its
 * average brightness.
 */
export default function ThemeGlitch() {
  const root = useRef<HTMLDivElement>(null);
  const snow = useRef<HTMLCanvasElement>(null);
  const lead = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layers = {
      root: root.current,
      snow: snow.current,
      lead: lead.current,
      trail: trail.current,
      mark: mark.current,
    };
    if (Object.values(layers).some((el) => el === null)) return;
    const ready = layers as Layers;
    // Make the static while the page is idle, so the first switch starts
    // the moment it is pressed.
    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const pending = idle(() => {
      prepare(ready.snow, "grey");
      prepare(ready.snow, "blood");
    });
    const unregister = registerThemeTransition((swap, to) => play(ready, swap, to));
    return () => {
      cancel(pending);
      unregister();
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="theme-glitch">
      <canvas ref={snow} className="theme-glitch-snow" />
      <div ref={lead} className="theme-glitch-lead" />
      <div ref={trail} className="theme-glitch-trail" />
      <div ref={mark} className="theme-glitch-mark">
        <svg viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`}>
          <path d={MARK_PATH} fillRule="evenodd" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}

const reels: Partial<Record<StaticPalette, ImageData[]>> = {};

/** Make the static in `palette` at the screen's current proportions, unless it already fits. */
function prepare(snow: HTMLCanvasElement, palette: StaticPalette): ImageData[] | null {
  const ctx = snow.getContext("2d");
  if (!ctx) return null;
  const height = Math.round((STATIC_WIDTH * window.innerHeight) / window.innerWidth);
  if (snow.width !== STATIC_WIDTH || snow.height !== height) {
    snow.width = STATIC_WIDTH;
    snow.height = height;
  }
  const reel = reels[palette];
  if (reel && reel[0].height === height) return reel;
  const made = makeStatic(ctx, STATIC_WIDTH, height, STATIC_FRAMES, palette);
  reels[palette] = made;
  return made;
}

async function play(layers: Layers, swap: () => void, to: Theme): Promise<void> {
  const { root, snow, lead, trail, mark } = layers;
  const bleeding = to === "dark";
  const ctx = snow.getContext("2d");
  const reel = prepare(snow, bleeding ? "blood" : "grey");
  if (!ctx || !reel) {
    swap();
    return;
  }
  const grain = () => ctx.putImageData(reel[Math.floor(Math.random() * reel.length)], 0, 0);

  /** Show `el` only between `top`% and `bottom`% down the screen, pushed `dx` px sideways. */
  const band = (el: HTMLElement, top: number, bottom: number, dx: number, on = true) => {
    el.style.opacity = on ? "1" : "0";
    el.style.clipPath = `inset(${top}% 0 ${100 - bottom}% 0)`;
    el.style.transform = `translate3d(${dx}px, 0, 0)`;
  };
  /**
   * The colour fringes on a band, flickering: one pulled one way and up a
   * little, the other the other way and down, so they show as separate edges
   * rather than mixing back together.
   */
  const fringe = (top: number, bottom: number) => {
    const pull = rand(9, 16) * either();
    const lift = rand(0.8, 2.2);
    const lit = Math.random() < 0.75;
    if (bleeding) {
      lead.style.backgroundColor = pick(BRIGHT_REDS);
      trail.style.backgroundColor = pick(BLOOD_REDS);
    }
    band(lead, Math.max(0, top - lift), bottom - lift, pull, lit);
    band(trail, top + lift, Math.min(100, bottom + lift), -pull, lit);
  };

  root.dataset.on = "";
  root.dataset.to = to;

  // Tearing in: a band of static somewhere new on every beat.
  for (let i = 0; i < TEAR; i++) {
    grain();
    const top = rand(0, 86);
    const bottom = Math.min(100, top + rand(4, 18));
    band(snow, top, bottom, rand(5, 12) * either());
    fringe(top, bottom);
    await beat();
  }

  // Covered: the theme changes out of sight, and the mark flickers through.
  for (let i = 0; i < COVER; i++) {
    grain();
    band(snow, 0, 100, rand(0, 4) * either());
    if (i === 0) swap();
    const top = rand(10, 80);
    fringe(top, top + rand(3, 9));
    mark.style.opacity = i === 0 || i === 2 ? "1" : "0.35";
    mark.style.transform = `translate3d(${rand(2, 7) * either()}px, 0, 0)`;
    await beat();
  }
  mark.style.opacity = "0";

  // Rolling off: the static lifts from the bottom, its lower edge ragged.
  for (let i = 1; i <= ROLL; i++) {
    grain();
    const edge = Math.max(0, 100 - (i / ROLL) * 100 + rand(-4, 4));
    band(snow, 0, edge, rand(3, 10) * either());
    fringe(Math.max(0, edge - rand(3, 8)), edge);
    await beat();
  }

  for (const el of [snow, lead, trail, mark]) {
    el.style.opacity = "0";
    el.style.clipPath = "";
    el.style.transform = "";
    el.style.backgroundColor = "";
  }
  delete root.dataset.on;
  delete root.dataset.to;
}

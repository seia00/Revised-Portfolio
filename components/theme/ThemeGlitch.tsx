"use client";

import { useEffect, useRef } from "react";
import { registerThemeTransition } from "@/lib/theme";
import { MARK_HEIGHT, MARK_PATH, MARK_WIDTH } from "../logo/mark";
import { makeStatic } from "./staticNoise";

/** One beat of the glitch, in ms: two frames at 60Hz, so it stutters like a bad signal. */
const BEAT = 34;

/** How many beats each part takes: tearing in, covering, rolling off. */
const TEAR = 6;
const COVER = 4;
const ROLL = 6;

/** The static's resolution across, in pixels; it is scaled up blocky to fill the screen. */
const STATIC_WIDTH = 420;
const STATIC_FRAMES = 6;

type Layers = {
  root: HTMLDivElement;
  snow: HTMLCanvasElement;
  red: HTMLDivElement;
  cyan: HTMLDivElement;
  mark: HTMLDivElement;
};

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const either = () => (Math.random() < 0.5 ? -1 : 1);
const beat = () => new Promise((r) => setTimeout(r, BEAT));

/**
 * The theme switch, played as a channel losing its signal: bands of static
 * tear across the page with their red and cyan pulled apart, the static takes
 * the whole screen — the theme changes underneath it, and the mark flickers
 * through — then it rolls up off the new page.
 *
 * Kept to two changes of the whole screen, in and out, and no full-screen
 * colour flashes: the flicker is all in the static's grain, which holds its
 * average brightness.
 */
export default function ThemeGlitch() {
  const root = useRef<HTMLDivElement>(null);
  const snow = useRef<HTMLCanvasElement>(null);
  const red = useRef<HTMLDivElement>(null);
  const cyan = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layers = {
      root: root.current,
      snow: snow.current,
      red: red.current,
      cyan: cyan.current,
      mark: mark.current,
    };
    if (Object.values(layers).some((el) => el === null)) return;
    const ready = layers as Layers;
    // Make the static while the page is idle, so the first switch starts
    // the moment it is pressed.
    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const pending = idle(() => prepare(ready.snow));
    const unregister = registerThemeTransition((swap) => play(ready, swap));
    return () => {
      cancel(pending);
      unregister();
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="theme-glitch">
      <canvas ref={snow} className="theme-glitch-snow" />
      <div ref={red} className="theme-glitch-red" />
      <div ref={cyan} className="theme-glitch-cyan" />
      <div ref={mark} className="theme-glitch-mark">
        <svg viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`}>
          <path d={MARK_PATH} fillRule="evenodd" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}

let frames: ImageData[] | null = null;

/** Make the static at the screen's current proportions, unless it already fits. */
function prepare(snow: HTMLCanvasElement): ImageData[] | null {
  const ctx = snow.getContext("2d");
  if (!ctx) return null;
  const height = Math.round((STATIC_WIDTH * window.innerHeight) / window.innerWidth);
  if (!frames || frames[0].height !== height) {
    snow.width = STATIC_WIDTH;
    snow.height = height;
    frames = makeStatic(ctx, STATIC_WIDTH, height, STATIC_FRAMES);
  }
  return frames;
}

async function play(layers: Layers, swap: () => void): Promise<void> {
  const { root, snow, red, cyan, mark } = layers;
  const ctx = snow.getContext("2d");
  const reel = prepare(snow);
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
   * The colour fringes on a band, flickering: red pulled one way and up a
   * little, cyan the other way and down, so they show as separate edges
   * rather than mixing back to grey.
   */
  const fringe = (top: number, bottom: number) => {
    const pull = rand(9, 16) * either();
    const lift = rand(0.8, 2.2);
    const lit = Math.random() < 0.75;
    band(red, Math.max(0, top - lift), bottom - lift, pull, lit);
    band(cyan, top + lift, Math.min(100, bottom + lift), -pull, lit);
  };

  root.dataset.on = "";

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

  for (const el of [snow, red, cyan, mark]) {
    el.style.opacity = "0";
    el.style.clipPath = "";
    el.style.transform = "";
  }
  delete root.dataset.on;
}

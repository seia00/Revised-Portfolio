/**
 * Boot signalling between the loading screen and the components it waits on.
 *
 * Two one-shot signals, each with a module-level latch so a late subscriber
 * still fires immediately:
 *
 *   scene  — the Spline hero has finished booting (or has opted out: poster
 *            mode, or the canvas is display:none on mobile). The loader waits
 *            on this so the 3D scene is painted before the curtain lifts.
 *   reveal — the loading screen has finished and the page is visible. The
 *            hero holds its entrance animation until this fires so the
 *            cascade isn't wasted behind the curtain.
 */

type Signal = "scene" | "reveal";

const fired: Record<Signal, boolean> = { scene: false, reveal: false };
const waiting: Record<Signal, Set<() => void>> = {
  scene: new Set(),
  reveal: new Set(),
};

export function signal(name: Signal) {
  if (fired[name]) return;
  fired[name] = true;
  for (const cb of waiting[name]) cb();
  waiting[name].clear();
}

export function hasFired(name: Signal) {
  return fired[name];
}

/** Subscribe to a signal. Returns an unsubscribe function. */
export function onSignal(name: Signal, cb: () => void) {
  if (fired[name]) {
    cb();
    return () => {};
  }
  waiting[name].add(cb);
  return () => {
    waiting[name].delete(cb);
  };
}

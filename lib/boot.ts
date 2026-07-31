/**
 * Boot signalling between the loading screen and the page beneath it.
 *
 * One signal, with a module-level latch so a late subscriber still fires
 * immediately:
 *
 *   reveal — the loading screen has finished and the page is visible. The
 *            hero holds its entrance animation until this fires so the
 *            cascade isn't wasted behind the curtain.
 *
 * There used to be two more ("scene", "stage") coordinating the curtain with
 * the Spline hero's WebGL boot. The hero is a CSS emblem now — nothing heavy
 * to wait on, nothing to hold back — so the curtain just runs its own clock.
 */

type Signal = "reveal";

const fired: Record<Signal, boolean> = { reveal: false };
const waiting: Record<Signal, Set<() => void>> = { reveal: new Set() };

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

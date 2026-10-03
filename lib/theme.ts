import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./themeScript";

export type Theme = "light" | "dark";

/** Fired on window whenever the theme changes. */
const CHANGE = "themechange";

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  if (theme === "dark") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked (a private window): the choice lasts for this visit.
  }
  window.dispatchEvent(new Event(CHANGE));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE, onChange);
  return () => window.removeEventListener(CHANGE, onChange);
}

/** The current theme. Light on the server, which has no way to know. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "light");
}

/**
 * Plays the switch over the page and calls `swap` at the moment the page is
 * fully covered, so the change of theme itself is never seen. `to` is the
 * theme it is switching to.
 */
export type ThemeTransition = (swap: () => void, to: Theme) => Promise<void>;

let transition: ThemeTransition | null = null;
let switching = false;

/** Install the transition the switch plays. Returns a function that removes it. */
export function registerThemeTransition(play: ThemeTransition): () => void {
  transition = play;
  return () => {
    if (transition === play) transition = null;
  };
}

/**
 * Flip to the other theme, behind the transition if there is one. With
 * motion reduced it simply changes. A switch while one is playing is ignored.
 */
export async function switchTheme(): Promise<void> {
  if (switching) return;
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || !transition) {
    setTheme(next);
    return;
  }
  switching = true;
  try {
    await transition(() => setTheme(next), next);
  } finally {
    switching = false;
  }
}

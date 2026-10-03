/**
 * The part of the theme the server needs: where the choice is stored, and the
 * script that applies it. Kept apart from lib/theme, which is client-only.
 */

/** Where the reader's choice is kept between visits. */
export const THEME_KEY = "theme";

/**
 * Runs in <head> before the first paint, so a returning reader who chose the
 * dark theme never sees a flash of the light one. A plain string because it
 * has to run before any bundle has loaded; light needs nothing set.
 */
export const THEME_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

"use client";

import { switchTheme, useTheme } from "@/lib/theme";

/**
 * The switch between the light and dark themes: a half-filled disc that turns
 * over, light side to dark, after louisraille.fr's. A fill slides in behind
 * it on hover, inverting it, so it reads as a control before it is pressed.
 */
export default function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => void switchTheme()}
      aria-label={`Switch to the ${next} theme`}
      className="theme-toggle"
    >
      <span aria-hidden className="theme-toggle-disc" />
    </button>
  );
}

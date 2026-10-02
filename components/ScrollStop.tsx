"use client";

import { useRef } from "react";
import { useScrollStops } from "@/lib/scrollStops";

/** The fixed header, plus a little air, so the page rests just below it. */
const CLEARANCE = 64 + 40;

/**
 * A stop at this point in the page: the scroll comes to rest with it just
 * under the header. Placed at the head of an ordinary section, so a fling out
 * of the chapter above lands on the section's title rather than in its middle.
 */
export default function ScrollStop() {
  const ref = useRef<HTMLSpanElement>(null);

  useScrollStops(() => {
    const el = ref.current;
    if (!el) return [];
    return [el.getBoundingClientRect().top + window.scrollY - CLEARANCE];
  });

  return <span ref={ref} aria-hidden className="block h-0" />;
}

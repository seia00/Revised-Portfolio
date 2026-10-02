"use client";

import { useRef } from "react";
import { useSlowZones } from "@/lib/slowZones";

/** The fixed header, plus a little air, so the moment is just below it. */
const CLEARANCE = 64 + 40;

/**
 * A slow zone at this point in the page, centred where it sits just under the
 * header. Placed at the head of an ordinary section, so the scroll eases as
 * the section's title arrives rather than carrying straight past it.
 */
export default function SlowZone() {
  const ref = useRef<HTMLSpanElement>(null);

  useSlowZones(() => {
    const el = ref.current;
    if (!el) return [];
    return [el.getBoundingClientRect().top + window.scrollY - CLEARANCE];
  });

  return <span ref={ref} aria-hidden className="block h-0" />;
}

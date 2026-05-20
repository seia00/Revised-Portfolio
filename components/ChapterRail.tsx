"use client";

import { useEffect, useState } from "react";

const CHAPTERS = [
  { id: "hero",       label: "Origin",     numeral: "I"   },
  { id: "manifesto",  label: "Manifesto",  numeral: "II"  },
  { id: "timeline",   label: "Life",       numeral: "III" },
  { id: "activities", label: "Activities", numeral: "IV"  },
  { id: "friction",   label: "Friction",   numeral: "V"   },
  { id: "connect",    label: "Connect",    numeral: "VI"  },
] as const;

export default function ChapterRail() {
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const els = CHAPTERS
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hide during Timeline (internal overlay handles UI) and Manifesto
  // (cinematic section — rail would compete with the centered text).
  const hidden = active === "timeline" || active === "manifesto";

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Chapter navigation"
      className={`fixed top-6 right-6 md:top-8 md:right-8 z-40 hidden md:flex flex-col gap-3 transition-opacity duration-300 ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {CHAPTERS.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => scrollTo(c.id)}
            className="group flex items-center gap-3 cursor-pointer"
            aria-current={isActive ? "true" : undefined}
            aria-label={`Jump to chapter ${c.numeral} — ${c.label}`}
          >
            {/* accent bar — visible only on active */}
            <span
              aria-hidden
              className={`h-px transition-all duration-300 ${
                isActive
                  ? "w-4 bg-electric-soft"
                  : "w-2 bg-fog-4 group-hover:w-3 group-hover:bg-fog-3"
              }`}
            />
            {/* numeral */}
            <span
              className={`font-jetbrains text-[10px] tracking-[0.22em] uppercase tabular-nums transition-colors duration-200 ${
                isActive ? "text-fog" : "text-fog-4 group-hover:text-fog-2"
              }`}
            >
              {c.numeral.padEnd(3, " ")}
            </span>
            {/* label */}
            <span
              className={`font-jetbrains text-[10px] tracking-[0.22em] uppercase transition-colors duration-200 ${
                isActive ? "text-fog-2" : "text-fog-4 group-hover:text-fog-3"
              }`}
            >
              {c.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

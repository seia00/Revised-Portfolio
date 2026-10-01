"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { id: "hero", label: "Home" },
  { id: "words", label: "About" },
  { id: "timeline", label: "Life" },
  { id: "activities", label: "Now" },
  { id: "connect", label: "Contact" },
] as const;

export default function Nav() {
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-10 lg:px-16 py-5 md:py-6 bg-field/80 backdrop-blur-sm border-b border-edge">
      <button
        onClick={() => scrollTo("hero")}
        className="font-syne font-extrabold uppercase tracking-tighter text-ink text-base cursor-pointer"
        aria-label="Back to top"
      >
        SF<span className="text-ink-3">.</span>
      </button>

      <nav aria-label="Section navigation" className="hidden md:flex items-center gap-7">
        {LINKS.map((l) => (
          <button
            key={l.id}
            onClick={() => scrollTo(l.id)}
            aria-current={active === l.id ? "true" : undefined}
            className={`font-jetbrains text-[11px] tracking-[0.2em] uppercase transition-colors cursor-pointer ${
              active === l.id ? "text-ink" : "text-ink-3 hover:text-ink"
            }`}
          >
            {l.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

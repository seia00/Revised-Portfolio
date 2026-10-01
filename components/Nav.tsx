"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { id: "hero", label: "Index" },
  { id: "words", label: "About" },
  { id: "timeline", label: "Life" },
  { id: "activities", label: "Now" },
  { id: "connect", label: "Contact" },
] as const;

const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
});

export default function Nav() {
  const [active, setActive] = useState<string>("hero");
  // Null until mounted so server and client render the same markup.
  const [time, setTime] = useState<string | null>(null);

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

  useEffect(() => {
    const tick = () => setTime(clock.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 15_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 bg-field/85 backdrop-blur-md border-b border-edge">
      <div className="h-full grid grid-cols-2 md:grid-cols-3 items-center px-5 md:px-10">
        <button
          onClick={() => scrollTo("hero")}
          className="justify-self-start flex items-baseline gap-3 cursor-pointer"
          aria-label="Back to top"
        >
          <span className="font-serif italic text-[26px] leading-none text-ink">SF</span>
          <span className="hidden lg:inline font-mono text-[10px] tracking-[0.2em] uppercase text-ink-3">
            Seia Funayama
          </span>
        </button>

        <nav
          aria-label="Section navigation"
          className="hidden md:flex justify-self-center items-center gap-6 lg:gap-8"
        >
          {LINKS.map((l, i) => {
            const isActive = active === l.id;
            return (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                aria-current={isActive ? "true" : undefined}
                className={`group flex items-start gap-1 cursor-pointer transition-colors ${
                  isActive ? "text-ink" : "text-ink-3 hover:text-ink"
                }`}
              >
                <span className="font-mono text-[8px] tracking-[0.1em] leading-none pt-0.5">
                  0{i}
                </span>
                <span
                  className={`font-sans text-[12px] font-medium tracking-[0.14em] uppercase leading-none ${
                    isActive ? "underline underline-offset-[6px] decoration-1" : ""
                  }`}
                >
                  {l.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="justify-self-end flex items-center gap-2 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-ink-3">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-ink animate-ping opacity-40" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-ink" />
          </span>
          <span>Chiba</span>
          <span className="text-ink tabular-nums">{time ?? "--:--"}</span>
          <span>JST</span>
        </div>
      </div>
    </header>
  );
}

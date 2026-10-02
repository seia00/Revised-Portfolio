"use client";

import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { reveal, revealViewport } from "@/lib/motion";
import { SectionHeader, Serif } from "./ornaments";

const CHANNELS = [
  {
    n: "01",
    title: "Instagram",
    handle: "@seiafunayama",
    href: "https://instagram.com/seiafunayama",
    external: true,
  },
  {
    n: "02",
    title: "Email",
    handle: "seiafunayama@gmail.com",
    href: "mailto:seiafunayama@gmail.com",
    external: false,
  },
  {
    n: "03",
    title: "LinkedIn",
    handle: "Seia Funayama",
    href: "https://www.linkedin.com/in/seiafunayama/",
    external: true,
  },
];

export default function Connect() {
  const lenis = useLenis();

  return (
    <footer
      id="connect"
      aria-label="How to connect"
      className="relative px-5 md:px-10 lg:px-16 pt-28 md:pt-40 pb-10"
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="05" label="Contact" aside="DMs open">
          How to <Serif>connect.</Serif>
        </SectionHeader>

        <ul className="border-t border-ink">
          {CHANNELS.map((c, i) => (
            <motion.li
              key={c.n}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
              custom={i}
              className="border-b border-ink"
            >
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="group grid grid-cols-12 items-center gap-x-4 gap-y-2 py-7 md:py-9 px-1 md:px-4 transition-colors duration-300 hover:bg-ink hover:text-field"
              >
                <span className="col-span-2 md:col-span-1 font-mono text-[11px] tracking-[0.15em] text-ink-3 group-hover:text-field/60">
                  {c.n}
                </span>
                <span className="col-span-8 md:col-span-5 font-serif text-[clamp(40px,6vw,88px)] leading-none tracking-[-0.02em] group-hover:italic">
                  {c.title}
                </span>
                <span className="col-span-2 md:col-span-1 md:col-start-12 md:row-start-1 justify-self-end">
                  <Arrow />
                </span>
                <span className="col-span-10 col-start-3 md:col-span-5 md:col-start-7 md:row-start-1 font-mono text-[12px] md:text-[13px] text-ink-3 group-hover:text-field/70 break-all">
                  {c.handle}
                </span>
              </a>
            </motion.li>
          ))}
        </ul>

        <p
          aria-hidden
          className="mt-24 md:mt-36 font-serif italic text-ink text-center whitespace-nowrap leading-[0.9] tracking-[-0.03em] text-[clamp(56px,14.5vw,232px)]"
        >
          Seia Funayama
        </p>

        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-edge pt-5 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-ink-3">
          <span>© 2026 Seia Funayama</span>
          <span className="md:text-center">Set in Instrument Serif, Inter Tight &amp; JetBrains Mono</span>
          <button
            onClick={() =>
              lenis
                ? lenis.scrollTo(0)
                : window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="md:justify-self-end text-left uppercase tracking-[0.18em] hover:text-ink transition-colors cursor-pointer"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 md:w-8 md:h-8 -rotate-45 transition-transform duration-300 group-hover:rotate-0"
      aria-hidden
    >
      <path d="M3 12h17M14 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

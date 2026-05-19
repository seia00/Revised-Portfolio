"use client";

import { motion } from "framer-motion";

interface Social {
  label: string;
  handle: string;
  href: string;
}

const SOCIALS: Social[] = [
  { label: "Twitter", handle: "@seiafunayama", href: "https://twitter.com/seiafunayama" },
  { label: "Instagram", handle: "@seiafunayama", href: "https://instagram.com/seiafunayama" },
  { label: "Email", handle: "Funayamad31@gmail.com", href: "mailto:Funayamad31@gmail.com" },
  { label: "GitHub", handle: "seia00", href: "https://github.com/seia00" },
  { label: "LinkedIn", handle: "Seia Funayama", href: "https://linkedin.com/in/seiafunayama" },
  { label: "Discord", handle: "sei_a000", href: "#" },
];

export default function Footer() {
  return (
    <footer
      id="connect"
      aria-label="Connect"
      className="relative px-6 md:px-10 lg:px-16 pt-32 pb-16 font-inter"
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-3 mb-6">
          ◇ Chapter v / connect
        </p>
        <h2 className="font-inter font-light text-fog leading-[1.02] tracking-[-0.025em] text-[clamp(46px,7vw,84px)] mb-16 max-w-[820px]">
          Let&apos;s
          <br />
          <span className="text-fog/40">connect.</span>
        </h2>

        {/* social dock */}
        <ul className="flex flex-wrap gap-3 md:gap-4 mb-20">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <motion.a
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-center gap-3 px-5 py-3.5 border border-edge rounded-full bg-ink-2/40 backdrop-blur hover:border-edge-2 transition-colors"
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-fog-4 group-hover:bg-electric group-hover:shadow-[0_0_10px_rgba(91,141,255,0.8)] transition-all" />
                <span className="font-jetbrains text-[10px] tracking-[0.2em] uppercase text-fog-3 group-hover:text-fog-2 transition-colors">
                  {s.label}
                </span>
                <span className="font-inter text-[13.5px] text-fog group-hover:text-electric-soft transition-colors">
                  {s.handle}
                </span>
              </motion.a>
            </li>
          ))}
        </ul>

        {/* baseline */}
        <div className="pt-8 border-t border-edge flex flex-wrap items-center justify-between gap-3">
          <span className="font-jetbrains text-[11px] tracking-[0.18em] uppercase text-fog-4">
            Seia Funayama · MMXXVI
          </span>
          <span className="font-jetbrains text-[11px] tracking-[0.18em] uppercase text-fog-4">
            Built with intent · Next.js · Framer Motion
          </span>
        </div>
      </div>
    </footer>
  );
}

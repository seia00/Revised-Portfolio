"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Social {
  label: string;
  handle: string;
  href: string | null;
  cta: "PRESS" | "COPY";
}

const SOCIALS: Social[] = [
  { label: "TWITTER",   handle: "@seiafunayama",           href: "https://twitter.com/seiafunayama",      cta: "PRESS" },
  { label: "INSTAGRAM", handle: "@seiafunayama",           href: "https://instagram.com/seiafunayama",    cta: "PRESS" },
  { label: "EMAIL",     handle: "seiafunayama@gmail.com",  href: "mailto:seiafunayama@gmail.com",         cta: "PRESS" },
  { label: "EMAIL · ALT", handle: "Funayamad31@gmail.com", href: "mailto:Funayamad31@gmail.com",          cta: "PRESS" },
  { label: "GITHUB",    handle: "seia00",                  href: "https://github.com/seia00",             cta: "PRESS" },
  { label: "LINKEDIN",  handle: "Seia Funayama",           href: "https://www.linkedin.com/in/seiafunayama/", cta: "PRESS" },
  { label: "DISCORD",   handle: "sei_a000",                href: null,                                    cta: "COPY"  },
];

export default function Footer() {
  return (
    <footer
      id="connect"
      aria-label="Connect"
      className="relative px-6 md:px-10 lg:px-16 pt-32 pb-16 font-vt323 text-fog overflow-hidden"
    >
      {/* CRT scanline overlay — purely decorative */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none crt-scanlines opacity-50"
      />

      <div className="relative max-w-[1100px] mx-auto">
        {/* Tiny pixel eyebrow */}
        <p className="font-8bit text-[13px] tracking-[0.2em] text-electric-soft mb-8">
          [ CHAPTER · VI ] &gt;&gt; CONNECT
        </p>

        {/* Pixel-bordered headline cartridge */}
        <div className="border-2 border-fog/80 p-6 md:p-10 mb-8 relative">
          {/* corner notches */}
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />

          <h2 className="font-vt323 text-fog leading-[0.9] tracking-tight text-[clamp(64px,12vw,160px)]">
            LET&apos;S CONNECT
            <span aria-hidden className="blink text-flame">_</span>
          </h2>
          <p className="font-8bit text-[13px] md:text-[14px] tracking-[0.18em] text-fog-3 mt-6">
            * PRESS START TO PLAY
          </p>
        </div>

        {/* The "menu" — one row per social, gamified */}
        <ul className="border-2 border-fog/80 divide-y-2 divide-fog/30">
          {SOCIALS.map((s) => (
            <SocialRow key={s.label} social={s} />
          ))}
        </ul>

        {/* Lower HUD strip */}
        <div className="mt-8 border-2 border-fog/40 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="font-8bit text-[13px] tracking-[0.18em] text-fog-3">
            * P1 · SEIA FUNAYAMA · MMXXVI
          </span>
          <span className="font-8bit text-[13px] tracking-[0.18em] text-fog-3">
            HI-SCORE: <span className="text-flame">∞</span>
          </span>
        </div>

        {/* Build credit, retro terminal */}
        <p className="font-vt323 text-fog-3 text-base mt-6 flex items-center gap-2">
          <span aria-hidden className="text-electric-soft">$</span>
          built with intent · next.js · framer motion
          <span aria-hidden className="blink text-electric-soft">▮</span>
        </p>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function SocialRow({ social }: { social: Social }) {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (social.cta === "COPY") {
      navigator.clipboard
        .writeText(social.handle)
        .then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => {});
    }
  };

  const inner = (
    <>
      {/* Cursor — heart on hover (Undertale menu selector) */}
      <span
        aria-hidden
        className={`text-xl md:text-2xl w-5 text-center transition-colors ${
          hover ? "text-flame" : "text-transparent"
        }`}
      >
        ♥
      </span>

      {/* Asterisk — Undertale narration prefix */}
      <span
        aria-hidden
        className={`font-8bit text-xl md:text-2xl leading-none transition-colors ${
          hover ? "text-flame" : "text-fog-2"
        }`}
      >
        *
      </span>

      {/* Label + handle — stacked on mobile so the handle isn't squashed
          to 0px by the flex layout; side-by-side on md+. */}
      <span className="flex flex-col md:flex-row md:items-baseline md:gap-5 flex-1 min-w-0">
        <span className="font-8bit text-[11px] md:text-[15px] tracking-[0.18em] text-fog group-hover:text-flame transition-colors md:min-w-[150px]">
          {social.label}
        </span>
        <span className="font-vt323 text-fog-2 text-base md:text-2xl flex-1 min-w-0 truncate group-hover:text-fog transition-colors">
          {social.handle}
        </span>
      </span>

      {/* CTA chip — [ PRESS ] or [ COPY ] */}
      <motion.span
        animate={hover ? { x: 2 } : { x: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={`font-8bit text-[12px] md:text-[13px] tracking-[0.15em] px-3 py-2 border-2 shrink-0 ${
          hover
            ? "border-flame text-flame bg-flame/10"
            : "border-fog-4 text-fog-3"
        }`}
      >
        [ {copied ? "OK!" : social.cta} ]
      </motion.span>
    </>
  );

  const baseClass =
    "group flex items-center gap-3 md:gap-5 px-4 md:px-6 py-4 md:py-5 hover:bg-flame/[0.05] transition-colors w-full text-left";

  if (social.href) {
    return (
      <li>
        <a
          href={social.href}
          target={social.href.startsWith("http") ? "_blank" : undefined}
          rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`${baseClass} cursor-pointer`}
        >
          {inner}
        </a>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`${baseClass} cursor-pointer`}
        aria-label={`Copy ${social.label} handle ${social.handle}`}
      >
        {inner}
      </button>
    </li>
  );
}

/* Corner notch — tiny stepped square in each corner of the cartridge */
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "-top-1.5 -left-1.5",
    tr: "-top-1.5 -right-1.5",
    bl: "-bottom-1.5 -left-1.5",
    br: "-bottom-1.5 -right-1.5",
  } as const;
  return (
    <span
      aria-hidden
      className={`absolute ${map[pos]} w-3 h-3 bg-flame`}
    />
  );
}

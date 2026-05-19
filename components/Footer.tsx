"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Social {
  label: string;
  handle: string;
  href: string | null; // null = no live URL yet (Discord)
  status?: "soon";
}

const SOCIALS: Social[] = [
  {
    label: "Twitter",
    handle: "@seiafunayama",
    href: "https://twitter.com/seiafunayama",
  },
  {
    label: "Instagram",
    handle: "@seiafunayama",
    href: "https://instagram.com/seiafunayama",
  },
  {
    label: "Email",
    handle: "Funayamad31@gmail.com",
    href: "mailto:Funayamad31@gmail.com",
  },
  {
    label: "GitHub",
    handle: "seia00",
    href: "https://github.com/seia00",
  },
  {
    label: "LinkedIn",
    handle: "Seia Funayama",
    href: "https://linkedin.com/in/seiafunayama",
  },
  {
    label: "Discord",
    handle: "sei_a000",
    href: null,
    status: "soon",
  },
];

export default function Footer() {
  return (
    <footer
      id="connect"
      aria-label="Connect"
      className="relative px-5 sm:px-8 md:px-10 lg:px-16 pt-24 md:pt-32 pb-12 md:pb-16 font-inter"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <p className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-fog-3 mb-5 md:mb-6">
          ◇ Chapter v / connect
        </p>
        <h2 className="font-inter font-light text-fog leading-[1.02] tracking-[-0.025em] text-[clamp(44px,7vw,84px)] mb-14 md:mb-20 max-w-[820px]">
          Let&apos;s
          <br />
          <span className="text-fog/40">connect.</span>
        </h2>

        {/* Editorial social list — one row per platform, label left / handle right */}
        <ul className="border-y border-edge mb-16 md:mb-20">
          {SOCIALS.map((s) => (
            <SocialRow key={s.label} social={s} />
          ))}
        </ul>

        {/* Baseline footer — clean two-column on desktop, stacked on mobile */}
        <div className="pt-8 md:pt-10 border-t border-edge flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <span className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-fog-4">
            © Seia Funayama · MMXXVI
          </span>
          <span className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-fog-4">
            Built with intent · Next.js · Framer Motion
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function SocialRow({ social }: { social: Social }) {
  const [copied, setCopied] = useState(false);

  // Discord row is non-linkable but click-to-copy
  const handleDiscordCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(social.handle)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };

  const isClickable = !!social.href || social.status === "soon";

  const rowInner = (
    <>
      {/* Platform — left */}
      <span className="font-jetbrains text-[11px] md:text-[12px] tracking-[0.22em] uppercase text-fog-3 group-hover:text-fog-2 transition-colors">
        {social.label}
      </span>

      {/* Handle + arrow — right */}
      <span className="flex items-center gap-3 min-w-0">
        {social.status === "soon" && !copied && (
          <span className="font-jetbrains text-[9.5px] tracking-[0.18em] uppercase text-fog-4 px-2 py-1 border border-edge rounded">
            click to copy
          </span>
        )}
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-jetbrains text-[9.5px] tracking-[0.18em] uppercase text-electric-soft"
          >
            ✓ copied
          </motion.span>
        )}
        <span className="font-inter text-fog text-[14px] md:text-[15px] truncate group-hover:text-electric-soft transition-colors">
          {social.handle}
        </span>
        {social.href && (
          <span
            aria-hidden
            className="text-fog-3 text-base leading-none transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fog"
          >
            ↗
          </span>
        )}
      </span>
    </>
  );

  // Common row styling — generous touch target, divider via parent
  const rowClass =
    "group flex items-center justify-between gap-4 py-5 md:py-6 px-1 border-b border-edge last:border-b-0 transition-colors hover:bg-edge/30";

  if (social.href) {
    return (
      <li>
        <a
          href={social.href}
          target={social.href.startsWith("http") ? "_blank" : undefined}
          rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
          className={`${rowClass} cursor-pointer`}
        >
          {rowInner}
        </a>
      </li>
    );
  }

  if (social.status === "soon") {
    return (
      <li>
        <button
          type="button"
          onClick={handleDiscordCopy}
          className={`${rowClass} w-full text-left cursor-pointer`}
          aria-label={`Copy ${social.label} handle ${social.handle}`}
        >
          {rowInner}
        </button>
      </li>
    );
  }

  return (
    <li className={rowClass}>
      {rowInner}
    </li>
  );
}

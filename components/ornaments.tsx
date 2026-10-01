"use client";

import { motion } from "framer-motion";
import { reveal, revealViewport, staggerParent } from "@/lib/motion";

export function Star({ className = "w-2.5 h-2.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={`shrink-0 ${className}`} aria-hidden>
      <path
        d="M5 0C5.6 3.4 6.6 4.4 10 5C6.6 5.6 5.6 6.6 5 10C4.4 6.6 3.4 5.6 0 5C3.4 4.4 4.4 3.4 5 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Printer's crop marks on the four corners of the nearest positioned box. */
export function CropMarks() {
  const base = "absolute w-4 h-4 border-ink";
  return (
    <div aria-hidden className="pointer-events-none">
      <span className={`${base} top-0 left-0 border-t border-l`} />
      <span className={`${base} top-0 right-0 border-t border-r`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

/** Registration target — a circle with a crosshair. */
export function Registration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`w-5 h-5 text-ink ${className}`} aria-hidden>
      <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M10 0V20M0 10H20" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

/** Italic serif accent inside a sans headline. */
export function Serif({ children }: { children: React.ReactNode }) {
  return (
    <em className="font-serif italic font-normal normal-case tracking-[-0.01em]">{children}</em>
  );
}

export function SectionHeader({
  index,
  label,
  aside,
  children,
}: {
  index: string;
  label: string;
  aside?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={staggerParent}
      className="border-t border-ink pt-4 mb-16 md:mb-24"
    >
      <motion.div
        variants={reveal}
        className="flex items-baseline justify-between gap-4 font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-ink-3"
      >
        <span>
          § {index} — {label}
        </span>
        {aside && <span className="text-right">{aside}</span>}
      </motion.div>
      {children && (
        <motion.h2
          variants={reveal}
          className="mt-10 md:mt-14 font-sans font-semibold uppercase tracking-[-0.045em] leading-[0.88] text-ink text-[clamp(48px,8.5vw,128px)]"
        >
          {children}
        </motion.h2>
      )}
    </motion.div>
  );
}

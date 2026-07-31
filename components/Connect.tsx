"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/**
 * How To Connect — final chapter.
 *
 * Inherits the Friction section's visual system: harsh grid backdrop,
 * violently large Anton headline, slabby /0X items with corner stamps,
 * and the one-time entrance shake. Each item is a real link; hovering
 * an item replays the shake on that card only.
 */

const CHANNELS = [
  {
    n: "01",
    title: "INSTAGRAM",
    handle: "@seiafunayama",
    href: "https://instagram.com/seiafunayama",
    external: true,
  },
  {
    n: "02",
    title: "EMAIL",
    handle: "seiafunayama@gmail.com",
    href: "mailto:seiafunayama@gmail.com",
    external: false,
  },
  {
    n: "03",
    title: "LINKEDIN",
    handle: "Seia Funayama",
    href: "https://www.linkedin.com/in/seiafunayama/",
    external: true,
  },
];

export default function Connect() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-30% 0px -30% 0px", once: true });
  const [shaking, setShaking] = useState(false);

  // Trigger the shake exactly once when the section first enters the viewport.
  useEffect(() => {
    if (!inView) return;
    setShaking(true);
    const t = window.setTimeout(() => setShaking(false), 600);
    return () => window.clearTimeout(t);
  }, [inView]);

  return (
    <footer
      ref={ref}
      id="connect"
      aria-label="How to connect"
      className={`relative px-6 md:px-10 lg:px-16 py-40 md:py-56 overflow-hidden ${
        shaking ? "friction-shake" : ""
      }`}
    >
      {/* harsh grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 23px, rgba(255,255,255,0.5) 23px 24px), repeating-linear-gradient(90deg, transparent 0 23px, rgba(255,255,255,0.5) 23px 24px)",
        }}
      />

      {/* tape strip top-left */}
      <div
        aria-hidden
        className="absolute -left-6 top-32 rotate-[-4deg] bg-flame text-ink font-anton uppercase tracking-[0.18em] text-[11px] px-6 py-1.5 select-none"
      >
        ※ Signal open · reach out ※
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* heading — VIOLENTLY large Anton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45 }}
          className="mb-28 md:mb-40"
        >
          <p className="font-jetbrains text-[11px] tracking-[0.24em] uppercase text-flame mb-6">
            /// Chapter v — how to connect
          </p>
          <h2 className="font-anton uppercase text-fog leading-[0.78] tracking-[-0.01em] text-[clamp(44px,14vw,260px)]">
            How to
            <br />
            <span className="text-flame">connect.</span>
          </h2>
        </motion.div>

        {/* channels — slabby, hard-edged link cards */}
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y-2 border-fog">
          {CHANNELS.map((c, idx) => (
            <motion.li
              key={c.n}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.15 + idx * 0.12,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={
                idx !== CHANNELS.length - 1
                  ? "border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-fog"
                  : ""
              }
            >
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="connect-item relative block p-8 md:p-10 h-full"
              >
                <span className="font-anton uppercase block text-flame text-5xl md:text-6xl leading-none mb-6 tracking-tighter">
                  /{c.n}
                </span>
                <h3 className="font-anton uppercase text-fog text-3xl md:text-4xl leading-[0.95] mb-5 tracking-[-0.005em]">
                  {c.title}
                </h3>
                <p className="font-jetbrains text-fog-2 text-[13px] leading-[1.65] max-w-[280px] break-words">
                  {c.handle}
                </p>

                {/* corner stamp */}
                <span
                  aria-hidden
                  className="absolute top-3 right-3 font-jetbrains text-[9px] tracking-[0.18em] uppercase text-fog-4"
                >
                  no.{c.n}
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

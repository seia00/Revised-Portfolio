"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const ITEMS = [
  {
    n: "01",
    title: "PEOPLE THAT ARE ALL TALK",
    body: "If you describe what you'll do more than you do it, the equation is broken.",
  },
  {
    n: "02",
    title: "PHONIES",
    body: "Holden Caulfield was onto something. You can spot it in the eyes before the mouth opens.",
  },
  {
    n: "03",
    title: "VEGETABLES",
    body: "Sorry.",
  },
];

export default function Friction() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-30% 0px -30% 0px", once: true });
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!inView) return;
    setShaking(true);
    const t = window.setTimeout(() => setShaking(false), 600);
    return () => window.clearTimeout(t);
  }, [inView]);

  return (
    <section
      ref={ref}
      id="friction"
      aria-label="What I don't like"
      className={`relative px-5 sm:px-8 md:px-10 lg:px-16 py-32 md:py-48 overflow-hidden ${
        shaking ? "friction-shake" : ""
      }`}
    >
      {/* Harsh repeating grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 23px, rgba(255,255,255,0.5) 23px 24px), repeating-linear-gradient(90deg, transparent 0 23px, rgba(255,255,255,0.5) 23px 24px)",
        }}
      />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Caution divider — styled as a proper section divider */}
        <div className="flex items-center gap-4 mb-12 md:mb-16">
          <span
            aria-hidden
            className="block h-px flex-1 bg-flame/40"
          />
          <span className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-flame whitespace-nowrap">
            ※ Caution · raw section ahead ※
          </span>
          <span aria-hidden className="block h-px flex-1 bg-flame/40" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45 }}
          className="mb-16 md:mb-24"
        >
          <p className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-flame mb-5 md:mb-6">
            /// Chapter iv — friction
          </p>
          <h2 className="font-anton uppercase text-fog leading-[0.84] tracking-[-0.005em] text-[clamp(56px,13vw,200px)]">
            Three things
            <br />
            <span className="text-flame">I&nbsp;cannot&nbsp;stand.</span>
          </h2>
        </motion.div>

        {/* Stacked full-width blocks — one per item */}
        <ul className="border-y-2 border-fog">
          {ITEMS.map((it, idx) => (
            <motion.li
              key={it.n}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.12 + idx * 0.1,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 md:gap-10 py-10 md:py-12 px-1 md:px-4 ${
                idx !== ITEMS.length - 1 ? "border-b-2 border-fog" : ""
              }`}
            >
              {/* Left — number label */}
              <span className="font-anton uppercase text-flame text-5xl md:text-6xl leading-none tracking-tighter">
                /{it.n}
              </span>

              {/* Right — title + body */}
              <div className="min-w-0">
                <h3 className="font-anton uppercase text-fog text-3xl md:text-5xl leading-[0.95] mb-4 md:mb-5 tracking-[-0.005em]">
                  {it.title}
                </h3>
                <p className="font-jetbrains text-fog-2 text-[13px] md:text-[14px] leading-[1.65] max-w-[420px]">
                  {it.body}
                </p>
              </div>

              {/* Bottom-right corner stamp — consistent position across all items */}
              <span
                aria-hidden
                className="absolute bottom-3 right-1 md:right-3 font-jetbrains text-[9px] tracking-[0.2em] uppercase text-fog-4"
              >
                no.{it.n}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

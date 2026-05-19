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

  // Trigger the shake exactly once when the section first enters the viewport.
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

      {/* red tape strip top-left */}
      <div
        aria-hidden
        className="absolute -left-6 top-32 rotate-[-4deg] bg-flame text-ink font-anton uppercase tracking-[0.18em] text-[11px] px-6 py-1.5 select-none"
      >
        ※ Caution · raw section ahead ※
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* heading — VIOLENTLY large Anton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45 }}
          className="mb-20 md:mb-28"
        >
          <p className="font-jetbrains text-[11px] tracking-[0.24em] uppercase text-flame mb-6">
            /// Chapter iv — friction
          </p>
          <h2 className="font-anton uppercase text-fog leading-[0.78] tracking-[-0.01em] text-[clamp(72px,16vw,260px)]">
            Three things
            <br />
            <span className="text-flame">I&nbsp;cannot&nbsp;stand.</span>
          </h2>
        </motion.div>

        {/* items — slabby, hard-edged cards with skewed accents */}
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y-2 border-fog">
          {ITEMS.map((it, idx) => (
            <motion.li
              key={it.n}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.15 + idx * 0.12,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative p-8 md:p-10 ${
                idx !== ITEMS.length - 1
                  ? "border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-fog"
                  : ""
              }`}
            >
              <span className="font-anton uppercase block text-flame text-5xl md:text-6xl leading-none mb-6 tracking-tighter">
                /{it.n}
              </span>
              <h3 className="font-anton uppercase text-fog text-3xl md:text-4xl leading-[0.95] mb-5 tracking-[-0.005em]">
                {it.title}
              </h3>
              <p className="font-jetbrains text-fog-2 text-[13px] leading-[1.65] max-w-[280px]">
                {it.body}
              </p>

              {/* corner stamp */}
              <span
                aria-hidden
                className="absolute top-3 right-3 font-jetbrains text-[9px] tracking-[0.18em] uppercase text-fog-4"
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

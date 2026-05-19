"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEBATE, YEARS_DESC, type Award } from "@/data/debate";

export default function DebateAccordion() {
  const [open, setOpen] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(YEARS_DESC.map((y, i) => [y, i === 0])) // most-recent year open
  );

  const toggle = (year: number) =>
    setOpen((prev) => ({ ...prev, [year]: !prev[year] }));

  return (
    <div className="border border-edge rounded-xl overflow-hidden bg-ink-2/40 backdrop-blur-sm">
      {YEARS_DESC.map((year) => {
        const items = DEBATE[year];
        const uniq = new Set(items.map((i) => i.tournament)).size;
        const isOpen = open[year];

        return (
          <div key={year} className="border-b border-edge last:border-b-0">
            {/* Year header — large, obvious "+" toggle */}
            <button
              onClick={() => toggle(year)}
              aria-expanded={isOpen}
              aria-controls={`debate-${year}-panel`}
              type="button"
              className="w-full flex items-center justify-between gap-4 px-5 md:px-7 py-5 md:py-6 text-left hover:bg-edge/40 transition-colors group cursor-pointer"
            >
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 min-w-0">
                <span className="font-syne font-bold text-fog text-2xl md:text-3xl tracking-tight">
                  {year}
                </span>
                <span className="font-jetbrains text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-fog-3">
                  {uniq} tournament{uniq !== 1 ? "s" : ""} · {items.length} results
                </span>
              </div>
              <motion.span
                aria-hidden
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="text-fog text-3xl leading-none font-thin shrink-0 group-hover:text-electric-soft"
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`debate-${year}-panel`}
                  role="region"
                  aria-label={`${year} debate results`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.4, delay: 0.1 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.35, ease: [0.7, 0, 0.84, 0] },
                      opacity: { duration: 0.2 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <ul className="divide-y divide-edge border-t border-edge">
                    {items.map((award, idx) => (
                      <AwardRow key={idx} award={award} />
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function AwardRow({ award }: { award: Award }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-start gap-4 px-5 md:px-7 py-4">
      <div className="min-w-0">
        {/* Tournament — primary, white */}
        <div className="font-inter font-medium text-fog text-[14.5px] leading-snug">
          {award.tournament}
        </div>
        {/* Award result — secondary line, brighter than before so it stands out */}
        <div className="font-inter font-normal text-fog-2 text-[13.5px] leading-snug mt-0.5">
          {award.award}
        </div>
      </div>
      <span
        className={`shrink-0 self-start mt-1 font-jetbrains text-[9.5px] tracking-[0.16em] uppercase px-2 py-1 rounded border whitespace-nowrap ${
          award.type === "team"
            ? "border-electric/30 text-electric-soft bg-electric/5"
            : "border-flame/30 text-flame bg-flame/5"
        }`}
      >
        {award.type === "team" ? "Team" : "Speaker"}
      </span>
    </li>
  );
}

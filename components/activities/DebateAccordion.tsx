"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEBATE, YEARS_DESC, type Award } from "@/data/debate";

export default function DebateAccordion() {
  const [open, setOpen] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(YEARS_DESC.map((y, i) => [y, i === 0])) // open most recent by default
  );

  const toggle = (year: number) =>
    setOpen((prev) => ({ ...prev, [year]: !prev[year] }));

  return (
    <div className="border border-edge rounded-xl overflow-hidden bg-ink-2/40 backdrop-blur-sm">
      {YEARS_DESC.map((year) => {
        const items = DEBATE[year];
        const uniqTournaments = new Set(items.map((i) => i.tournament)).size;
        const isOpen = open[year];

        return (
          <div key={year} className="border-b border-edge last:border-b-0">
            <button
              onClick={() => toggle(year)}
              aria-expanded={isOpen}
              aria-controls={`debate-${year}-panel`}
              className="w-full flex items-center justify-between gap-6 px-5 md:px-7 py-5 md:py-6 text-left hover:bg-edge/60 transition-colors group"
            >
              <div className="flex items-baseline gap-5">
                <span className="font-syne font-bold text-fog text-2xl md:text-3xl tracking-tight">
                  {year}
                </span>
                <span className="font-jetbrains text-[11px] tracking-[0.18em] uppercase text-fog-3">
                  {uniqTournaments} tournament{uniqTournaments !== 1 ? "s" : ""} ·{" "}
                  {items.length} results
                </span>
              </div>
              <motion.span
                aria-hidden
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="text-fog-2 text-2xl leading-none font-thin group-hover:text-fog"
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
    <li className="grid grid-cols-[1fr_auto] items-baseline gap-4 px-5 md:px-7 py-3.5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-inter font-medium text-fog text-[14.5px]">
          {award.tournament}
        </span>
        <span className="text-fog-3 text-[14px]">— {award.award}</span>
      </div>
      <span
        className={`font-jetbrains text-[9.5px] tracking-[0.16em] uppercase px-2 py-1 rounded border whitespace-nowrap ${
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

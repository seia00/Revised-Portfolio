"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProjectModal from "./ProjectModal";
import { PROJECTS } from "@/data/projects";

export default function ProgrammingCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
        className="group relative flex h-full flex-col border border-edge rounded-xl p-7 md:p-9 bg-field-2/40 backdrop-blur-sm overflow-hidden"
      >
        {/* faint number watermark */}
        <span
          aria-hidden
          className="absolute -bottom-8 -right-2 font-syne font-extrabold text-[200px] leading-none text-ink/[0.05] select-none"
        >
          /0
        </span>

        <header className="flex items-center justify-between mb-8">
          <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-ink-3">
            ◆ Programming · {PROJECTS.length} projects
          </span>
          <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-ember">
            archive
          </span>
        </header>

        {/* Holds 3xl until lg: md turns this into a two-column grid, so the
            card is at its *narrowest* exactly where md:text-4xl used to kick
            in — the headline overflowed and overflow-hidden clipped it. No
            nbsp either; it has to stay breakable at that width. */}
        <h3 className="font-syne font-extrabold uppercase tracking-[-0.025em] text-ink text-3xl lg:text-4xl leading-[0.95] mb-5">
          Code, shipped &amp;<br />
          in progress.
        </h3>

        <p className="font-inter text-ink-2 text-[14.5px] leading-[1.7] max-w-[440px] mb-9">
          A small but deliberate stack of tools — AI for debaters, an
          open-source motion archive, and the infrastructure under
          things like EN2U.
        </p>

        {/* mt-auto pins the CTA to the card floor, so this card and the NPO
            card beside it share a baseline however their copy lengths differ. */}
        <button
          onClick={() => setOpen(true)}
          className="relative mt-auto self-start inline-flex items-center gap-3 font-jetbrains text-[11px] tracking-[0.2em] uppercase text-ink px-5 py-3.5 border border-edge-2 rounded-full hover:border-ember hover:text-ember transition-colors"
        >
          <span>Click to view projects</span>
          <span
            aria-hidden
            className="block w-1.5 h-1.5 rounded-full bg-ember shadow-[0_0_10px_rgba(178,58,0,0.55)]"
          />
        </button>
      </motion.div>

      <ProjectModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

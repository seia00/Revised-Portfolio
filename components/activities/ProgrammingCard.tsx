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
        className="group relative border border-edge rounded-xl p-7 md:p-9 bg-ink-2/40 backdrop-blur-sm overflow-hidden h-full flex flex-col"
      >
        {/* Header — two clearly separated elements */}
        <header className="flex items-center justify-between gap-4 mb-7 md:mb-8">
          <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-fog-3">
            ◆ Programming
          </span>
          <span className="font-jetbrains text-[10px] tracking-[0.22em] uppercase text-electric-soft">
            {PROJECTS.length} projects · archive
          </span>
        </header>

        <h3 className="font-syne font-extrabold uppercase tracking-[-0.025em] text-fog text-3xl md:text-4xl leading-[0.95] mb-5">
          Code, shipped &amp;
          <br />
          in&nbsp;progress.
        </h3>

        <p className="font-inter text-fog-2 text-[14.5px] leading-[1.7] max-w-[440px] mb-9 flex-1">
          A small but deliberate stack of tools — AI for debaters, an
          open-source motion archive, and the infrastructure under things like
          EN2U.
        </p>

        {/* Clear CTA button */}
        <button
          onClick={() => setOpen(true)}
          type="button"
          className="self-start inline-flex items-center gap-3 font-jetbrains text-[11px] tracking-[0.2em] uppercase text-fog px-5 py-3.5 border border-edge-2 rounded-full hover:border-electric hover:text-electric-soft transition-colors cursor-pointer"
        >
          <span>Click to view projects</span>
          <span
            aria-hidden
            className="block w-1.5 h-1.5 rounded-full bg-electric shadow-[0_0_10px_rgba(91,141,255,0.8)]"
          />
        </button>
      </motion.div>

      <ProjectModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

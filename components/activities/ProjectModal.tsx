"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS, type Project } from "@/data/projects";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProjectModal({ open, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Programming projects"
          className="fixed inset-0 z-[80] flex"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          />

          {/* Cinematic curtain wipe — top + bottom plates that slide off */}
          <motion.div
            aria-hidden
            variants={{
              hidden: { y: "0%" },
              visible: { y: "-100%" },
            }}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.16, 1], delay: 0.05 }}
            className="absolute inset-x-0 top-0 h-1/2 bg-field z-10"
          />
          <motion.div
            aria-hidden
            variants={{
              hidden: { y: "0%" },
              visible: { y: "100%" },
            }}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.16, 1], delay: 0.05 }}
            className="absolute inset-x-0 bottom-0 h-1/2 bg-field z-10"
          />

          {/* Content */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.65, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 w-full h-full overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close projects view"
              className="fixed top-6 right-6 md:top-8 md:right-8 z-30 w-11 h-11 flex items-center justify-center rounded-full border border-edge bg-field-2/80 backdrop-blur text-ink-2 hover:text-ink hover:border-edge-2 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 pt-24 md:pt-32 pb-24">
              <div className="mb-14 md:mb-20">
                <p className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-electric-deep mb-5">
                  /// Project archive
                </p>
                <h2 className="font-syne font-extrabold uppercase tracking-[-0.03em] text-ink text-[clamp(48px,8vw,112px)] leading-[0.88]">
                  Things I&apos;ve built.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-edge border border-edge rounded-xl overflow-hidden">
                {PROJECTS.map((p, idx) => (
                  <ProjectCard key={p.id} project={p} index={idx} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.7 + index * 0.08,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="bg-field p-7 md:p-9 flex flex-col gap-5 hover:bg-field-2 transition-colors"
    >
      <header className="flex items-baseline justify-between gap-4">
        <span className="font-jetbrains text-[10px] tracking-[0.18em] uppercase text-ink-3">
          /{String(index + 1).padStart(2, "0")} · {project.category}
        </span>
        <span
          className={`font-jetbrains text-[9.5px] tracking-[0.18em] uppercase px-2 py-0.5 rounded border ${
            project.status === "shipped"
              ? "border-electric-deep/40 text-electric-deep bg-electric-deep/8"
              : project.status === "building"
              ? "border-edge-2 text-ink bg-ink/[0.06]"
              : "border-edge-2 text-ink-2"
          }`}
        >
          {project.status}
        </span>
      </header>

      <h3 className="font-syne font-bold uppercase tracking-[-0.02em] text-ink text-2xl md:text-3xl leading-tight">
        {project.title}
      </h3>

      <p className="font-inter text-ink-2 text-[14.5px] leading-[1.65]">
        {project.description}
      </p>

      <ul className="flex flex-wrap gap-1.5 mt-1">
        {project.stack.map((s) => (
          <li
            key={s}
            className="font-jetbrains text-[10px] text-ink-3 px-2 py-1 border border-edge rounded"
          >
            {s}
          </li>
        ))}
      </ul>

      {project.link && (
        <a
          href={project.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-2 font-jetbrains text-[11px] tracking-[0.16em] uppercase text-ink hover:text-electric-deep transition-colors"
        >
          {project.link.label}
          <span aria-hidden>↗</span>
        </a>
      )}
    </motion.article>
  );
}

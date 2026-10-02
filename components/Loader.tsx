"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";

/** How long the mark is held before the panels part, in ms. */
const HOLD = 1250;
/** How long the panels take to clear the viewport, in seconds. */
const PART = 0.85;

/**
 * The title card. Two black panels meet at the middle of the screen, each
 * holding one half of the mark, so the logo prints once and then splits along
 * the join as the panels withdraw — the same fracture the hero is built on.
 *
 * It is rendered on the server so there is no flash of hero before it covers,
 * and `.loader` is hidden outright under `prefers-reduced-motion`.
 */
export default function Loader() {
  const [parting, setParting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Under reduced motion `.loader` is display:none, so there is nothing to
    // hold open and nothing to hold the page still for — it just retires.
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    if (!quiet) root.classList.add("is-loading");

    const part = window.setTimeout(() => {
      root.classList.remove("is-loading");
      setParting(true);
    }, quiet ? 0 : HOLD);
    const finish = window.setTimeout(
      () => setDone(true),
      quiet ? 0 : HOLD + PART * 1000
    );

    return () => {
      root.classList.remove("is-loading");
      window.clearTimeout(part);
      window.clearTimeout(finish);
    };
  }, []);

  if (done) return null;

  return (
    <div aria-hidden className="loader fixed inset-0 z-[100] pointer-events-none">
      <Panel half="top" parting={parting} />
      <Panel half="bottom" parting={parting} />
    </div>
  );
}

/**
 * Each panel covers half the viewport and clips a full-viewport layer with the
 * mark centred in it, so the two halves line up into one logo along the join.
 */
function Panel({ half, parting }: { half: "top" | "bottom"; parting: boolean }) {
  const isTop = half === "top";
  return (
    <motion.div
      className={`absolute inset-x-0 h-1/2 overflow-hidden bg-ink ${isTop ? "top-0" : "bottom-0"}`}
      animate={{ y: parting ? (isTop ? "-100%" : "100%") : "0%" }}
      transition={{ duration: PART, ease: easeOutExpo }}
    >
      <div
        className={`absolute inset-x-0 h-svh flex items-center justify-center ${isTop ? "top-0" : "bottom-0"}`}
      >
        <div className="loader-mark">
          <Image
            src="/logo.png"
            alt=""
            width={851}
            height={523}
            sizes="(max-width: 767px) 50vw, 320px"
            loading="eager"
            fetchPriority="high"
            className="w-full h-auto"
          />
          <span className="loader-mark-metal" />
        </div>
      </div>

      {!isTop && (
        <div className="absolute inset-x-0 bottom-0 h-svh flex flex-col items-center justify-end pb-10 md:pb-14 gap-4">
          <span className="loader-rule block h-px w-[clamp(120px,22vw,260px)] bg-field/35 origin-left" />
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-field/55">
            Seia Funayama
          </span>
        </div>
      )}
    </motion.div>
  );
}

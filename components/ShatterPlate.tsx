"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { easeOutExpo, scrollSpring } from "@/lib/motion";

/** How much ink the plate lays down. Any heavier and the name stops reading. */
const INK = 0.72;

/**
 * The hero centrepiece — the shatter photograph printed as ink on paper.
 *
 * The source is a near-black image, so it is run as a negative: `grayscale →
 * invert` turns the bright fractures and data stipple into black marks and the
 * black field into paper, and `multiply` then drops that paper away so only the
 * marks land on the page. The result overprints the column guides rather than
 * covering them, which is why it sits underneath everything else in the frame.
 */
export default function ShatterPlate() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Drifts at roughly a fifth of scroll speed, and is gone before the marquee.
  // Sprung first so the plate lags the page slightly and settles on its own.
  const eased = useSpring(scrollYProgress, scrollSpring);
  const y = useTransform(eased, [0, 1], ["0%", "16%"]);
  const fade = useTransform(eased, [0, 0.8], [1, 0]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="shatter-plate absolute inset-0 overflow-hidden"
      style={reduced ? undefined : { y, opacity: fade }}
    >
      <motion.div
        className="shatter-ink absolute inset-0"
        initial={reduced ? false : { opacity: 0, scale: 1.12 }}
        animate={{ opacity: INK, scale: 1 }}
        transition={{ duration: 2.4, ease: easeOutExpo, delay: 0.15 }}
      >
        {/* `sizes` runs past 100vw on purpose: the plate is scaled up well
            beyond its box, and a viewport-width source would land as mush once
            the contrast filter is applied to it. */}
        <Image
          src="/shatter.png"
          alt=""
          fill
          sizes="(max-width: 767px) 240vw, 160vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover shatter-frame"
        />
      </motion.div>
    </motion.div>
  );
}

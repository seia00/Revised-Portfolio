"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/motion";

const CHANNELS = [
  {
    n: "01",
    title: "Instagram",
    handle: "@seiafunayama",
    href: "https://instagram.com/seiafunayama",
    external: true,
  },
  {
    n: "02",
    title: "Email",
    handle: "seiafunayama@gmail.com",
    href: "mailto:seiafunayama@gmail.com",
    external: false,
  },
  {
    n: "03",
    title: "LinkedIn",
    handle: "Seia Funayama",
    href: "https://www.linkedin.com/in/seiafunayama/",
    external: true,
  },
];

export default function Connect() {
  return (
    <footer
      id="connect"
      aria-label="How to connect"
      className="relative px-6 md:px-10 lg:px-16 py-32 md:py-44"
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={staggerParent}
          className="mb-20 md:mb-28 max-w-[640px]"
        >
          <motion.p
            variants={fadeUp}
            className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-ink-3 mb-6"
          >
            Get in touch
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-syne font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink text-[clamp(36px,6vw,72px)]"
          >
            How to connect.
          </motion.h2>
        </motion.div>

        <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-edge">
          {CHANNELS.map((c, idx) => (
            <motion.li
              key={c.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="border-r border-b border-edge"
            >
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="group block p-8 md:p-10 h-full transition-colors hover:bg-field-2"
              >
                <span className="font-jetbrains text-ink-3 text-sm block mb-6">/{c.n}</span>
                <h3 className="font-syne font-extrabold uppercase text-ink text-2xl md:text-3xl mb-4 tracking-[-0.015em] group-hover:underline underline-offset-4">
                  {c.title}
                </h3>
                <p className="font-jetbrains text-ink-3 text-[13px] leading-[1.65] break-words">
                  {c.handle}
                </p>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch-primary devices — they don't have a hover cursor.
    if (window.matchMedia("(hover: none)").matches) return;

    document.documentElement.classList.add("cursor-shuriken-active");

    const el = wrapRef.current;
    if (!el) return;

    // Direct DOM update on mousemove — avoid React re-renders per pixel.
    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    const onDown = () => el.classList.add("cursor-shuriken-press");
    const onUp = () => el.classList.remove("cursor-shuriken-press");

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.classList.remove("cursor-shuriken-active");
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="cursor-shuriken-wrap fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block"
      style={{ willChange: "transform" }}
    >
      <div className="cursor-shuriken-center">
        <svg
          width="34"
          height="34"
          viewBox="-50 -50 100 100"
          className="cursor-shuriken-spin"
        >
          <defs>
            <filter id="shuriken-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* 4-blade shuriken */}
          <path
            d="M 0,-44 L 10,-10 L 44,0 L 10,10 L 0,44 L -10,10 L -44,0 L -10,-10 Z"
            fill="#e6e8ec"
            stroke="#06070a"
            strokeWidth="3"
            strokeLinejoin="miter"
            filter="url(#shuriken-glow)"
          />
          {/* Hub */}
          <circle r="6" fill="#06070a" />
          <circle r="2" fill="#5b8dff" />
        </svg>
      </div>
    </div>
  );
}

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
          width="36"
          height="36"
          viewBox="-50 -50 100 100"
          className="cursor-shuriken-spin"
        >
          <defs>
            {/* Silver gradient — light top-left → dark bottom-right.
                Rotates with the shape; reads as light catching the metal
                as the shuriken spins. */}
            <linearGradient
              id="shuriken-silver"
              x1="-50"
              y1="-50"
              x2="50"
              y2="50"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%"   stopColor="#fbfcfd" />
              <stop offset="28%"  stopColor="#d8dbe0" />
              <stop offset="55%"  stopColor="#9ea2aa" />
              <stop offset="80%"  stopColor="#6c6f78" />
              <stop offset="100%" stopColor="#3b3e46" />
            </linearGradient>

            {/* Hub: tiny radial for a slight bulge */}
            <radialGradient id="shuriken-hub" cx="0.35" cy="0.35" r="0.75">
              <stop offset="0%"  stopColor="#4a4d55" />
              <stop offset="100%" stopColor="#1a1d23" />
            </radialGradient>

            <filter id="shuriken-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0.6" dy="1.2" stdDeviation="1.4" floodColor="#000" floodOpacity="0.55" />
            </filter>
          </defs>

          <g filter="url(#shuriken-shadow)">
            {/* Main body — silver fill */}
            <path
              d="M 0,-44 L 10,-10 L 44,0 L 10,10 L 0,44 L -10,10 L -44,0 L -10,-10 Z"
              fill="url(#shuriken-silver)"
              stroke="#15171c"
              strokeWidth="2"
              strokeLinejoin="miter"
            />

            {/* Ridge lines — the 3D crease down the center of each blade */}
            <g stroke="#2b2e36" strokeWidth="1.2" strokeLinecap="butt" opacity="0.95">
              <line x1="0"   y1="-42" x2="0"   y2="-4" />
              <line x1="42"  y1="0"   x2="4"   y2="0"  />
              <line x1="0"   y1="42"  x2="0"   y2="4"  />
              <line x1="-42" y1="0"   x2="-4"  y2="0"  />
            </g>

            {/* Highlight slivers — bevel catches light on one side of each ridge */}
            <g stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" opacity="0.7">
              <line x1="2"   y1="-38" x2="2"   y2="-6"  />
              <line x1="38"  y1="2"   x2="6"   y2="2"   />
              <line x1="-2"  y1="38"  x2="-2"  y2="6"   />
              <line x1="-38" y1="-2"  x2="-6"  y2="-2"  />
            </g>

            {/* Hub */}
            <circle r="6" fill="url(#shuriken-hub)" stroke="#0f1115" strokeWidth="0.8" />
            <circle r="2.4" fill="#5b8dff" />
            <circle cx="-0.7" cy="-0.7" r="0.9" fill="#cfddff" />
          </g>
        </svg>
      </div>
    </div>
  );
}

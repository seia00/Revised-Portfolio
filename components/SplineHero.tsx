"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";

// Lazy-load Spline so the ~MB-sized three.js runtime doesn't block initial
// page render. Server-side rendering is disabled because Spline draws on a
// WebGL canvas that only exists in the browser.
const Spline = dynamic(() => import("@splinetool/react-spline/next"), {
  ssr: false,
  loading: () => <Skeleton />,
});

export default function SplineHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [ready, setReady] = useState(false);

  // Defer mount until the wrapper is near the viewport AND the browser is
  // idle — keeps the text content as the LCP, then loads the canvas.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let cancelled = false;
    const mount = () => { if (!cancelled) setShouldMount(true); };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          // Wait for an idle frame after intersection so the first paint
          // of text is unblocked.
          if ("requestIdleCallback" in window) {
            (window as Window).requestIdleCallback(mount, { timeout: 1200 });
          } else {
            setTimeout(mount, 400);
          }
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);

    return () => { cancelled = true; io.disconnect(); };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full"
      aria-hidden
    >
      {shouldMount && (
        <Suspense fallback={<Skeleton />}>
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          >
            <Spline
              scene="/spline/seia-hero.splinecode"
              onLoad={() => setReady(true)}
            />
          </div>
        </Suspense>
      )}
      {!ready && <Skeleton />}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-br from-electric/10 via-transparent to-flame/[0.04] blur-3xl" />
    </div>
  );
}

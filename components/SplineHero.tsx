"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";

// Lazy-load Spline so the ~MB-sized three.js runtime doesn't block initial
// page render. Server-side rendering is disabled because Spline draws on a
// WebGL canvas that only exists in the browser.
const Spline = dynamic(() => import("@splinetool/react-spline"), {
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
      className="relative w-full h-full overflow-hidden"
      aria-hidden
    >
      {shouldMount && (
        <Suspense fallback={<Skeleton />}>
          {/* Oversize the canvas so the scene's camera renders the object
              larger in the visible (clipped) viewport. Width/height > 100%
              means the WebGL framebuffer is bigger and the 3D content
              appears proportionally larger inside the hero crop. */}
          <div
            className={`absolute transition-opacity duration-700 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            style={{
              top: "-60%",
              left: "-60%",
              width: "220%",
              height: "220%",
            }}
          >
            <Spline
              scene="/spline/seia-hero.splinecode"
              onLoad={(app) => {
                // The scene's default camera framing renders the object
                // tiny; zoom in via the Spline runtime API for impact.
                app.setZoom?.(2.5);
                setReady(true);
              }}
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

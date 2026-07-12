"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Application } from "@splinetool/runtime";

// Lazy-load Spline so the ~MB-sized three.js runtime doesn't block initial
// page render. Server-side rendering is disabled because Spline draws on a
// WebGL canvas that only exists in the browser.
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <Skeleton />,
});

// The canvas renders at this fraction of the hero's size and is CSS-upscaled
// to fill. The Spline runtime renders at an internal 2× pixel ratio, so 0.5
// yields a buffer that exactly matches CSS pixels on a standard display —
// no visible loss, half the shaded pixels. Behind the 30% dark overlay the
// difference is invisible even on retina.
const RENDER_SCALE = 0.5;

// Camera zoom. The scene's default framing renders the object tiny; this
// value is tuned so the orbital geometry fills the hero like the approved
// design (previously achieved with a wasteful 220% canvas crop).
const ZOOM = 5.5;

type Mode = "pending" | "live" | "poster";

export default function SplineHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const inViewRef = useRef(true);
  const [mode, setMode] = useState<Mode>("pending");
  const [ready, setReady] = useState(false);

  // Decide poster vs live once, then defer the runtime mount until the
  // wrapper is near the viewport AND the browser is idle — keeps text as
  // the LCP and the WebGL boot off the critical path.
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const weakDevice =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4;

    if (weakDevice) {
      // Static poster: identical look, zero GPU, and the ~1MB runtime
      // chunk is never downloaded.
      setMode("poster");
      return;
    }

    const el = wrapRef.current;
    if (!el) return;

    let cancelled = false;
    const mount = () => { if (!cancelled) setMode("live"); };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(mount, { timeout: 1200 });
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

  // Set by the lifecycle effect below; called from onLoad so a late-booting
  // runtime immediately adopts the current visibility state.
  const syncRef = useRef<(() => void) | null>(null);

  // Render-loop lifecycle: stop the WebGL loop whenever the hero is
  // off-screen or the tab is hidden. The hero occupies the first ~900px of
  // a ~17,000px page, so this zeroes GPU cost for most of a visit.
  useEffect(() => {
    if (mode !== "live") return;
    const el = wrapRef.current;
    if (!el) return;

    const sync = () => {
      const app = appRef.current;
      if (!app) return;
      const active =
        inViewRef.current && document.visibilityState === "visible";
      if (active) app.play();
      else app.stop();
    };
    // Expose so onLoad can run the initial sync once the app exists.
    syncRef.current = sync;

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      syncRef.current = null;
    };
  }, [mode]);

  // Release the WebGL context on unmount (also stops HMR leaks in dev).
  useEffect(() => {
    return () => {
      appRef.current?.dispose();
      appRef.current = null;
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full overflow-hidden"
      aria-hidden
    >
      {mode === "poster" && (
        <img
          src="/spline/seia-hero-poster.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      )}

      {mode === "live" && (
        <Suspense fallback={<Skeleton />}>
          {/* Reduced-resolution render target, CSS-upscaled to fill. */}
          <div
            className={`absolute top-0 left-0 origin-top-left transition-opacity duration-700 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            style={{
              width: `${RENDER_SCALE * 100}%`,
              height: `${RENDER_SCALE * 100}%`,
              transform: `scale(${1 / RENDER_SCALE})`,
            }}
          >
            <Spline
              scene="/spline/seia-hero.splinecode"
              renderOnDemand
              onLoad={(app: Application) => {
                appRef.current = app;
                if (process.env.NODE_ENV === "development") {
                  // Dev-only handle for zoom tuning / lifecycle probing.
                  (window as unknown as { __splineApp?: Application }).__splineApp = app;
                }
                app.setZoom(ZOOM);
                setReady(true);
                // Apply current visibility state (user may have scrolled
                // past the hero before the runtime finished booting).
                syncRef.current?.();
              }}
            />
          </div>
        </Suspense>
      )}

      {mode !== "poster" && !ready && <Skeleton />}
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

"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "hidden" | "prompt" | "playing" | "dismissed";

export default function MusicPrompt() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase("prompt"), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      const a = audioRef.current;
      if (a && a.duration) setProgress(a.currentTime / a.duration);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  function play() {
    if (!audioRef.current) {
      audioRef.current = new Audio("/swim.mp3");
      audioRef.current.loop = true;
    }
    audioRef.current.play().catch(() => {});
    setPhase("playing");
  }

  function togglePlayPause() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }

  function dismiss() {
    audioRef.current?.pause();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("dismissed");
  }

  if (phase === "hidden" || phase === "dismissed") return null;

  if (phase === "prompt") {
    return (
      <div
        className="fixed bottom-6 left-6 z-50 animate-slide-up"
        style={{ animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="relative w-[300px] rounded-lg border border-edge-2 bg-ink-2 p-5 shadow-2xl">
          {/* dismiss */}
          <button
            onClick={() => setPhase("dismissed")}
            className="absolute top-3 right-3 text-fog-3 hover:text-fog transition-colors leading-none text-base"
            aria-label="Dismiss"
          >
            ×
          </button>

          {/* quote */}
          <p className="font-playfair italic text-fog text-[13px] leading-snug mb-3 pr-4">
            "What someone listens to says as much about them as what they make."
          </p>

          {/* track info */}
          <p className="font-jetbrains text-[9px] tracking-widest uppercase text-fog-3 mb-4">
            swim — BTS
          </p>

          {/* actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={play}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-electric/10 border border-electric/20 text-electric-soft font-jetbrains text-[9px] tracking-widest uppercase hover:bg-electric/20 transition-colors"
            >
              <PlayIcon /> Play
            </button>
            <button
              onClick={() => setPhase("dismissed")}
              className="font-jetbrains text-[9px] tracking-widest uppercase text-fog-3 hover:text-fog transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // playing — minimal persistent player
  const a = audioRef.current;
  const isPaused = a ? a.paused : false;

  return (
    <div
      className="fixed bottom-6 left-6 z-50"
      style={{ animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center gap-3 rounded-full border border-edge-2 bg-ink-2 px-4 py-2.5 shadow-2xl">
        {/* play / pause */}
        <button
          onClick={togglePlayPause}
          className="text-electric-soft hover:text-electric transition-colors"
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </button>

        {/* label */}
        <div className="flex flex-col gap-0.5">
          <span className="font-jetbrains text-[8px] tracking-widest uppercase text-fog-2">
            swim — BTS
          </span>
          {/* progress bar */}
          <div className="w-24 h-px bg-edge-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-electric/60 transition-all duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* close */}
        <button
          onClick={dismiss}
          className="text-fog-3 hover:text-fog transition-colors text-base leading-none ml-1"
          aria-label="Stop"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
      <path d="M0 0.5L10 5.5L0 10.5V0.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
      <rect x="0" y="0" width="3" height="11" rx="1" />
      <rect x="6" y="0" width="3" height="11" rx="1" />
    </svg>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "hidden" | "prompt" | "playing" | "dismissed";

export default function MusicPrompt() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Open the prompt shortly after mount.
  useEffect(() => {
    const t = setTimeout(() => setPhase("prompt"), 800);
    return () => clearTimeout(t);
  }, []);

  // Lock body scroll while the modal prompt is open.
  useEffect(() => {
    if (phase !== "prompt") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [phase]);

  // Escape closes the prompt.
  useEffect(() => {
    if (phase !== "prompt") return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPhase("dismissed"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // Track audio progress while playing.
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
    setPaused(false);
    setPhase("playing");
  }

  function togglePlayPause() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play().catch(() => {}); setPaused(false); }
    else          { a.pause(); setPaused(true); }
  }

  function dismissPlayer() {
    audioRef.current?.pause();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("dismissed");
  }

  if (phase === "hidden" || phase === "dismissed") return null;

  if (phase === "prompt") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Music invitation"
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
      >
        <style>{`
          @keyframes mp-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes mp-card-in {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-ink/85 backdrop-blur-md"
          style={{ animation: "mp-backdrop-in 0.4s ease-out both" }}
        />

        {/* Card */}
        <div
          className="relative w-full max-w-[460px] rounded-xl border border-edge-2 bg-ink-2 p-8 md:p-10 shadow-2xl"
          style={{ animation: "mp-card-in 0.55s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {/* Eyebrow */}
          <p className="font-jetbrains text-[10px] tracking-[0.24em] uppercase text-fog-3 mb-6">
            ◣ Now playing
          </p>

          {/* Quote */}
          <p className="font-playfair italic text-fog text-[19px] md:text-[21px] leading-[1.45] mb-7">
            &ldquo;What someone listens to says as much about them as what they make.&rdquo;
          </p>

          {/* Track row: equalizer + title */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-edge">
            <Equalizer playing />
            <span className="font-jetbrains text-[11px] tracking-[0.22em] uppercase text-fog-2">
              swim — BTS
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button
              onClick={play}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-md bg-electric text-ink font-jetbrains text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-electric-soft transition-colors cursor-pointer"
            >
              <PlayIcon /> Play swim
            </button>
            <button
              onClick={() => setPhase("dismissed")}
              className="font-jetbrains text-[10px] tracking-[0.2em] uppercase text-fog-3 hover:text-fog transition-colors cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing — persistent bottom-left pill
  return (
    <div
      className="fixed bottom-6 left-6 z-40"
      style={{ animation: "mp-pill-in 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <style>{`
        @keyframes mp-pill-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center gap-3 rounded-full border border-edge-2 bg-ink-2/95 backdrop-blur-sm px-4 py-2.5 shadow-2xl">
        {/* Equalizer doubles as play/pause button */}
        <button
          onClick={togglePlayPause}
          className="relative flex items-center justify-center cursor-pointer group"
          aria-label={paused ? "Play" : "Pause"}
        >
          <Equalizer playing={!paused} />
          {paused && (
            <span className="absolute inset-0 flex items-center justify-center text-electric-soft">
              <PlayIcon />
            </span>
          )}
        </button>

        {/* Label + progress */}
        <div className="flex flex-col gap-1">
          <span className="font-jetbrains text-[8px] tracking-[0.22em] uppercase text-fog-2">
            swim — BTS
          </span>
          <div className="w-24 h-px bg-edge-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-electric/70"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Close */}
        <button
          onClick={dismissPlayer}
          className="text-fog-3 hover:text-fog transition-colors text-base leading-none ml-1 cursor-pointer"
          aria-label="Close player"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-end gap-[3px] h-4 w-[22px] ${playing ? "" : "eq-paused"}`}
    >
      <span className="eq-bar eq-bar-1 w-[3px] h-full bg-electric-soft rounded-sm" />
      <span className="eq-bar eq-bar-2 w-[3px] h-full bg-electric-soft rounded-sm" />
      <span className="eq-bar eq-bar-3 w-[3px] h-full bg-electric-soft rounded-sm" />
      <span className="eq-bar eq-bar-4 w-[3px] h-full bg-electric-soft rounded-sm" />
    </span>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor" aria-hidden>
      <path d="M0 0.5L10 5.5L0 10.5V0.5Z" />
    </svg>
  );
}

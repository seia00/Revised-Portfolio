"use client";

import { useEffect, useRef } from "react";

const HOVER_SELECTOR = 'a, button, [role="button"], .cursor-pointer';

export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    document.documentElement.classList.add("cursor-ring-active");

    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const hoverable = !!t?.closest(HOVER_SELECTOR);
      el.classList.toggle("cursor-ring-hover", hoverable);
    };
    const onDown = () => el.classList.add("cursor-ring-press");
    const onUp = () => el.classList.remove("cursor-ring-press");
    const onLeave = () => el.classList.add("cursor-ring-hidden");
    const onEnter = () => el.classList.remove("cursor-ring-hidden");

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("cursor-ring-active");
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="cursor-ring-wrap fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block"
      style={{ willChange: "transform" }}
    >
      <div className="cursor-ring-dot" />
    </div>
  );
}

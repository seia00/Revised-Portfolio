import { useEffect, useState } from "react";

/** How long the page has to be still before the indicator withdraws, in ms. */
const IDLE = 1400;

/** Within this many px of the top, the page is "at rest" and nothing shows. */
const TOP = 24;

/**
 * Whether the reader is scrolling right now.
 *
 * True from the first scroll event away from the top of the page, and false
 * again once the page has been still for a moment — so the indicator is there
 * while the reader is moving and out of the way while they read. Programmatic
 * scrolls (a nav jump, the back-to-top glide) count: the page is moving.
 */
export function useScrollActivity(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    function onScroll() {
      window.clearTimeout(timer);
      if (window.scrollY <= TOP) {
        setActive(false);
        return;
      }
      setActive(true);
      timer = window.setTimeout(() => setActive(false), IDLE);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  return active;
}

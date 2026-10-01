import { Star } from "./ornaments";

const ITEMS = ["Relentless", "Curious", "Driven", "Developer", "Debater", "Founder"];

export default function Marquee() {
  return (
    <div aria-hidden className="bg-ink text-field overflow-hidden py-4 md:py-5">
      <div className="marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center shrink-0">
            {ITEMS.map((t, i) => (
              <span key={t} className="flex items-center">
                <span
                  className={
                    i % 2
                      ? "font-serif italic text-3xl md:text-5xl px-6 md:px-10 leading-none"
                      : "font-sans font-semibold uppercase tracking-[-0.03em] text-2xl md:text-4xl px-6 md:px-10 leading-none"
                  }
                >
                  {t}
                </span>
                <Star className="w-3 h-3 md:w-4 md:h-4" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

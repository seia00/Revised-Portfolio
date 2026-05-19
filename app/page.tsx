import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Activities from "@/components/Activities";
import Friction from "@/components/Friction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />

      <ChapterDivider label="Chapter ii" />
      <Timeline />

      <ChapterDivider label="Chapter iii" />
      <Activities />

      <ChapterDivider label="Chapter iv" tone="warn" />
      <Friction />

      <ChapterDivider label="Chapter v" />
      <Footer />
    </main>
  );
}

/**
 * Slim section divider — a horizontal line with a small chapter chip on top.
 * Used between every chapter. Lives in the same horizontal container as the
 * surrounding sections so it lines up cleanly.
 */
function ChapterDivider({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "warn";
}) {
  return (
    <div
      aria-hidden
      className="px-5 sm:px-8 md:px-10 lg:px-16"
    >
      <div className="relative h-px bg-edge max-w-[1200px] mx-auto">
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 pr-3 pl-0 py-1 font-jetbrains text-[9.5px] tracking-[0.22em] uppercase bg-ink ${
            tone === "warn" ? "text-flame" : "text-fog-3"
          }`}
        >
          ※ {label}
        </span>
      </div>
    </div>
  );
}

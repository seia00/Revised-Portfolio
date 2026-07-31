import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Activities from "@/components/Activities";
import Manifesto from "@/components/Manifesto";
import Connect from "@/components/Connect";

export default function Home() {
  return (
    <main className="relative">
      <Hero />

      {/* divider — subtle vertical accent between chapters */}
      <Divider label="Chapter ii" />
      <Manifesto />

      <Divider label="Chapter iii" />
      <Timeline />

      <Divider label="Chapter iv" />
      <Activities />

      <Divider label="Chapter v" tone="warn" />
      <Connect />
    </main>
  );
}

function Divider({ label, tone = "default" }: { label: string; tone?: "default" | "warn" }) {
  return (
    <div
      aria-hidden
      className="relative h-px bg-edge mx-6 md:mx-10 lg:mx-16 max-w-[1200px] xl:mx-auto"
    >
      <span
        className={`absolute -top-2 left-0 px-2 py-1 -translate-y-1/2 font-jetbrains text-[9.5px] tracking-[0.22em] uppercase bg-field ${
          tone === "warn" ? "text-electric-deep" : "text-ink-3"
        }`}
      >
        ※ {label}
      </span>
    </div>
  );
}

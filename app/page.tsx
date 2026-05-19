import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Activities from "@/components/Activities";
import Friction from "@/components/Friction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />

      {/* divider — subtle vertical accent between chapters */}
      <Divider label="Chapter ii" />
      <Timeline />

      <Divider label="Chapter iii" />
      <Activities />

      <Divider label="Chapter iv" tone="warn" />
      <Friction />

      <Divider label="Chapter v" />
      <Footer />
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
        className={`absolute -top-2 left-0 px-2 py-1 -translate-y-1/2 font-jetbrains text-[9.5px] tracking-[0.22em] uppercase bg-ink ${
          tone === "warn" ? "text-flame" : "text-fog-3"
        }`}
      >
        ※ {label}
      </span>
    </div>
  );
}

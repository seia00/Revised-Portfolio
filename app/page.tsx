import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ThreeWords from "@/components/ThreeWords";
import Timeline from "@/components/Timeline";
import Activities from "@/components/Activities";
import Connect from "@/components/Connect";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Marquee />
      <ThreeWords />
      <Timeline />
      <Activities />
      <Connect />
    </main>
  );
}

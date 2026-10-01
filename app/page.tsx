import Hero from "@/components/Hero";
import HandsPlate from "@/components/HandsPlate";
import Marquee from "@/components/Marquee";
import ThreeWords from "@/components/ThreeWords";
import Timeline from "@/components/Timeline";
import Activities from "@/components/Activities";
import Connect from "@/components/Connect";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <HandsPlate />
      <Marquee />
      <ThreeWords />
      <Timeline />
      <Activities />
      <Connect />
    </main>
  );
}

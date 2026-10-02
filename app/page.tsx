import Hero from "@/components/Hero";
import HandsPlate from "@/components/HandsPlate";
import RiverLife from "@/components/RiverLife";
import Marquee from "@/components/Marquee";
import Activities from "@/components/Activities";
import Connect from "@/components/Connect";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <HandsPlate />
      <RiverLife />
      <Marquee />
      <Activities />
      <Connect />
    </main>
  );
}

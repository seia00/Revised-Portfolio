import Hero from "@/components/Hero";
import ThreeWords from "@/components/ThreeWords";
import Timeline from "@/components/Timeline";
import Activities from "@/components/Activities";
import Connect from "@/components/Connect";

export default function Home() {
  return (
    <main className="relative pt-[73px]">
      <Hero />
      <Divider />
      <ThreeWords />
      <Divider />
      <Timeline />
      <Divider />
      <Activities />
      <Divider />
      <Connect />
    </main>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      className="h-px bg-edge mx-6 md:mx-10 lg:mx-16 max-w-[1200px] xl:mx-auto"
    />
  );
}

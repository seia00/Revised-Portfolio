import type { Metadata } from "next";
import {
  Syne,
  Playfair_Display,
  Inter,
  JetBrains_Mono,
  Anton,
  Space_Grotesk,
  Great_Vibes,
} from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen";
import ChapterRail from "@/components/ChapterRail";
import CustomCursor from "@/components/CustomCursor";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Loading-screen wordmark only. `display: block` rather than `swap` — the
// curtain animation is measured against this face, so a fallback flash would
// mis-park the sliding letters.
const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
  display: "block",
});

export const metadata: Metadata = {
  title: "Seia Funayama",
  description:
    "Debater, developer, founder. Building things at the intersection of language, intelligence, and impact.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${playfair.variable} ${inter.variable} ${jetbrains.variable} ${anton.variable} ${spaceGrotesk.variable} ${greatVibes.variable}`}
    >
      <body className="min-h-screen bg-field text-ink antialiased font-inter selection:bg-electric-deep selection:text-acid">
        <LoadingScreen />
        {children}
        <ChapterRail />
        <CustomCursor />
      </body>
    </html>
  );
}

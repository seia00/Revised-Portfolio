import type { Metadata } from "next";
import {
  Syne,
  Playfair_Display,
  Inter,
  JetBrains_Mono,
  Anton,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import MusicPrompt from "@/components/MusicPrompt";
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
      className={`${syne.variable} ${playfair.variable} ${inter.variable} ${jetbrains.variable} ${anton.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen bg-ink text-fog antialiased font-inter selection:bg-electric/30 selection:text-white">
        {children}
        <ChapterRail />
        <MusicPrompt />
        <CustomCursor />
      </body>
    </html>
  );
}

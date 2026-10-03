import type { Metadata } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import ScrollIndicator from "@/components/scroll-indicator/ScrollIndicator";
import Loader from "@/components/Loader";
import SmoothScroll from "@/components/SmoothScroll";
import ThemeGlitch from "@/components/theme/ThemeGlitch";
import { THEME_SCRIPT } from "@/lib/themeScript";

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seia Funayama",
  description:
    "Developer, debater, founder. Building things at the intersection of language, intelligence, and impact.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The theme script may set data-theme on <html> before React arrives, so
    // its attributes are allowed to differ from the server's.
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* A fixed string of our own, not user input. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-field text-ink antialiased font-sans selection:bg-ink selection:text-field">
        <SmoothScroll />
        <Loader />
        <Nav />
        <ScrollIndicator />
        <ThemeGlitch />
        {children}
      </body>
    </html>
  );
}

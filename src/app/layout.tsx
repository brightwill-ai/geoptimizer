import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, Inter } from "next/font/google";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-instrument-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BrightWill — Get Found by AI",
  description:
    "Generative Engine Optimization for local businesses. Get your restaurant or business recommended by ChatGPT, Claude, and other AI assistants.",
  keywords: [
    "GEO",
    "Generative Engine Optimization",
    "AI recommendations",
    "local business",
    "restaurant marketing",
    "AI SEO",
  ],
};

import { CursorTrail } from "@/components/ui/cursor-trail";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} ${instrumentSerif.variable} ${inter.variable} antialiased`}>
        <CursorTrail />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

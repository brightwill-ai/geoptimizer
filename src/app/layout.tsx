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
    "Audit how ChatGPT, Claude, and Gemini see your business. Free AI Visibility Score in 30 seconds — no signup required.",
  keywords: [
    "GEO",
    "Generative Engine Optimization",
    "AI recommendations",
    "AI visibility",
    "ChatGPT business",
    "AI SEO",
    "AI search optimization",
  ],
  openGraph: {
    title: "BrightWill — Get Found by AI",
    description: "Audit how ChatGPT, Claude, and Gemini see your business. Free AI Visibility Score in 30 seconds.",
    url: "https://brightwill.ai",
    siteName: "BrightWill",
    images: [
      {
        url: "https://brightwill.ai/logo.png",
        width: 512,
        height: 512,
        alt: "BrightWill — AI Visibility Audit",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrightWill — Get Found by AI",
    description: "Audit how ChatGPT, Claude, and Gemini see your business. Free AI Visibility Score in 30 seconds.",
    images: ["https://brightwill.ai/logo.png"],
  },
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

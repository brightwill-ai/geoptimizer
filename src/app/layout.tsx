import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visibly — Get Found by AI",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

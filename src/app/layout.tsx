import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// V2 design base: Sora display / Inter body / JetBrains Mono — the Second
// version's measured type system (README: "Sora/Inter/JetBrains Mono").
const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ZERO FLARE — Flame Evidence Lab · NASA Microgravity Combustion Intelligence",
  description:
    "An AI-first scientific research environment for NASA microgravity combustion evidence: discover 24 PSI investigations, compare conditions through a comparability gate, query recovered datasets, run physics calculations, evaluate validated models and export cited evidence packets. Built by the Zero Flare mission team.",
  keywords: [
    "NASA", "microgravity combustion", "fire safety", "Space Apps", "FLEX", "SAFFIRE", "BASS", "SAME", "ACME", "PSI", "prevention", "detection", "suppression", "ZERO FLARE", "CIR-1",
  ],
  authors: [{ name: "Zero Flare Mission Team" }],
  openGraph: {
    title: "ZERO FLARE — Flame Evidence Lab",
    description: "AI-powered fire-safety insights from NASA microgravity combustion data.",
    siteName: "Flame Evidence Lab",
    type: "website",
  },
  icons: {
    icon: [{ url: "/brand/zero-flare-favicon-256.png", type: "image/png" }],
    apple: [{ url: "/brand/zero-flare-favicon-256.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#030b26",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

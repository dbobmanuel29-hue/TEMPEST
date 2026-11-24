import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";
import { IMG } from "@/lib/media";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", weight: ["500", "700", "800", "900"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const siteUrl = process.env.APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Tempest Barber Lounge — Look Sharp. Feel Powerful.", template: "%s · Tempest Barber Lounge" },
  description: "Premium grooming. Modern styles. Unmatched confidence. Book your appointment online at Tempest Barber Lounge.",
  openGraph: {
    type: "website",
    siteName: "Tempest Barber Lounge",
    title: "Tempest Barber Lounge — Look Sharp. Feel Powerful.",
    description: "Premium grooming. Modern styles. Unmatched confidence.",
    images: [{ url: IMG.hero, width: 1100, height: 1400, alt: "Tempest Barber Lounge" }],
  },
  twitter: { card: "summary_large_image", title: "Tempest Barber Lounge", description: "Look sharp. Feel powerful." },
};

export const viewport: Viewport = { themeColor: "#30201D" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-screen antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-cobalt focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react"
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";
import SentryClientInit from "@/components/SentryClientInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HControl",
  description: "Sistema de gestión hotelera multi-tenant",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: { url: "/hcontrol.png", type: "image/png" },
    apple: { url: "/icons/icon-192.svg", sizes: "192x192" },
  },
  appleWebApp: {
    capable: true,
    title: "HControl",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-bold">
          Saltar al contenido principal
        </a>
        <div id="main-content" className="flex-1 flex flex-col">
          {children}
        </div>
        <Analytics />
        <PWARegister />
        <SentryClientInit />
        <Toaster richColors />
      </body>
    </html>
  );
}

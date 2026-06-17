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
        {children}
        <Analytics />
        <PWARegister />
        <SentryClientInit />
        <Toaster richColors />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0f23",
};

export const metadata: Metadata = {
  title: "QR Carne Tracker",
  description: "Sistema de registro y venta de carne mediante QR codes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QR Carne Tracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-gray-950 text-white font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}

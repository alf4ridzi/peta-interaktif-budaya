import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peta Interaktif Budaya Nusantara — Atlas Warisan Budaya Indonesia",
  description:
    "Jelajahi kekayaan budaya 34 provinsi, 514 kabupaten/kota, dan kecamatan di Indonesia: Bahasa Daerah, Alat Musik Tradisional, Makanan Khas, Pakaian Adat, Tarian, serta Kuis Budaya Interaktif.",
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "../components/whatsAppButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Tabassum Attar | Artisanal Luxury Fragrances",
  description: "Pure Hydro-Distillations & Artisanal Non-Alcoholic Perfumes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#0b0c10] text-[#fbf8f2]`}>
        {children}
        {/* Floating WhatsApp Button */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
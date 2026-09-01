import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tabassum Attar | Luxury Pure Non-Alcoholic Perfume Oils',
  description: 'Pure aged Dehn Al Oudh, Royal Mukhallats, and Artisanal Attars handcrafted with rare natural ingredients.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0c10] text-[#f5efe6] min-h-screen antialiased selection:bg-[#c69e2a] selection:text-black">
        {children}
      </body>
    </html>
  );
}
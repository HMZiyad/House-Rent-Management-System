import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });
const bengali = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali']
});

export const metadata: Metadata = {
  title: "House Rental Manager",
  description: "Manage tenants and bills efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${bengali.className} min-h-screen pb-20 md:pb-0 transition-colors duration-300`}>
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

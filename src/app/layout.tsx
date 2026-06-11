import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import LayoutContent from "./LayoutContent";
import "./globals.css";

// Premium Editorial Serif Font
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Modern Clean Sans-Serif Font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tripti Maakan | Professional Model Portfolio",
  description: "High-fashion modelling portfolio, runway gallery, commercial video reel, and editorial updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-luxury-white">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}

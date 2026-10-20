import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Dancing_Script } from "next/font/google";
import { brand } from "@/lib/brand";
import { StoreHydrator } from "@/components/store-hydrator";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const dancing = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });

export const metadata: Metadata = {
  title: { default: `${brand.name} — ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
};

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${jetbrains.variable} ${dancing.variable} antialiased`}>
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}

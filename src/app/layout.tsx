import type { Metadata, Viewport } from "next";
import { Syne, Space_Grotesk, Be_Vietnam_Pro } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-syne" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space-grotesk" });
const beVietnam = Be_Vietnam_Pro({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-be-vietnam" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "DROPLY — 소셜 아트 드롭", template: "%s · DROPLY" },
  description: "신진 작가와 Gen Z 컬렉터가 작품을 발견하고, 정해진 시간에 드롭하며, 경매·정찰제로 거래하는 힙한 아트 플랫폼.",
  applicationName: "DROPLY",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "DROPLY — 소셜 아트 드롭",
    description: "발견 × 커뮤니티 × 한정 드롭",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#131313",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`dark ${syne.variable} ${spaceGrotesk.variable} ${beVietnam.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        />
      </head>
      <body className="bg-background text-on-background font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

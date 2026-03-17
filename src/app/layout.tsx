import type { Metadata, Viewport } from "next";
import "./globals.css";
import { publicAppUrl, serviceDescription, serviceName, serviceTagline } from "../lib/brand";
import { AuthProvider } from "@/components/AuthProvider";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export const viewport: Viewport = {
  themeColor: "#3B82F6",
};

export const metadata: Metadata = {
  metadataBase: new URL(publicAppUrl),
  verification: {
    google: "z9fmLLrMUf4oGBlCqiq54cKHHdDuf2KzA97u83eWZ1s",
  },
  title: `${serviceName} | ${serviceTagline}`,
  description: serviceDescription,
  keywords: [
    "証明写真",
    "スマホ",
    "AI",
    "パスポート写真",
    "履歴書写真",
    "証明写真アプリ",
    "証明写真 スマホ",
    "就活 証明写真",
    "証明写真 自宅",
    "証明写真 無料",
    "AI証明写真",
    "就活 証明写真 スマホ",
    "パスポート 証明写真 スマホ",
    "マイナンバー 証明写真",
    "証明写真 作り方",
    "証明写真 コンビニ",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: `${serviceName} | ${serviceTagline}`,
    description: serviceDescription,
    type: "website",
    images: [
      {
        url: "/ogp.svg",
        width: 1200,
        height: 630,
        alt: serviceName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${serviceName} | ${serviceTagline}`,
    description: serviceDescription,
    images: ["/ogp.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <PWAInstallBanner />
      </body>
    </html>
  );
}

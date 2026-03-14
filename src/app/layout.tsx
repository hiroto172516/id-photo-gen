import type { Metadata } from "next";
import "./globals.css";
import { serviceDescription, serviceName, serviceTagline } from "../lib/brand";

export const metadata: Metadata = {
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
  ],
  icons: {
    icon: "/favicon.svg",
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
      <body>{children}</body>
    </html>
  );
}

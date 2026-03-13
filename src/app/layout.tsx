import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "スマホで証明写真 | AI証明写真メーカー",
  description: "スマホで撮って、AIが証明写真に仕上げます。背景変更・スーツ着せ替え対応。パスポート・履歴書・マイナンバーカードの証明写真をスマホだけで作成。",
  keywords: ["証明写真", "スマホ", "AI", "パスポート写真", "履歴書写真", "証明写真アプリ"],
  openGraph: {
    title: "スマホで証明写真 | AI証明写真メーカー",
    description: "スマホで撮って、AIが証明写真に仕上げます。背景変更・スーツ着せ替え対応。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

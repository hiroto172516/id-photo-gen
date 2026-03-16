"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pwa-install-banner-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7日間

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent)
  );
}

function isInStandaloneMode(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true))
  );
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const dismissedAt = parseInt(raw, 10);
    return Date.now() - dismissedAt < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function saveDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage が使えない環境では無視
  }
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // インストール済み or 非表示期間中はスキップ
    if (isInStandaloneMode() || isDismissed()) return;

    if (isIOS()) {
      // iOS: 3秒後にガイドを表示
      const timer = setTimeout(() => {
        setShowIOSGuide(true);
        setVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome: beforeinstallprompt をキャッチ
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    saveDismissed();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-200">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        aria-label="閉じる"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {/* アプリアイコン */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold text-lg">
          S
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">スマ撮り証明写真</p>

          {showIOSGuide ? (
            <p className="text-xs text-gray-600 mt-0.5">
              Safariの
              <span className="inline-flex items-center mx-0.5">
                <svg
                  className="h-4 w-4 inline text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684 6.632 3.316m-6.632-6 6.632-3.316m0 0a3 3 0 1 0 5.367-2.684 3 3 0 0 0-5.367 2.684Zm0 9.316a3 3 0 1 0 5.368 2.684A3 3 0 0 0 15.316 19Z"
                  />
                </svg>
              </span>
              共有 → 「ホーム画面に追加」でインストール
            </p>
          ) : (
            <p className="text-xs text-gray-600 mt-0.5">
              ホーム画面に追加してオフラインでも使えます
            </p>
          )}
        </div>

        {!showIOSGuide && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="flex-shrink-0 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 active:bg-blue-700 transition-colors"
          >
            追加
          </button>
        )}
      </div>
    </div>
  );
}

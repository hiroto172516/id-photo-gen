"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function AuthCallbackStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConfigured, isLoading, session } = useAuth();
  const hasRedirectedRef = useRef(false);

  const errorDescription = searchParams.get("error_description");
  const errorCode = searchParams.get("error_code");

  useEffect(() => {
    if (hasRedirectedRef.current) {
      return;
    }

    if (!isConfigured || isLoading || !session) {
      return;
    }

    hasRedirectedRef.current = true;
    const timer = window.setTimeout(() => {
      router.replace("/auth?status=authenticated");
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [isConfigured, isLoading, router, session]);

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-blue-600">
        Auth Callback
      </p>

      {!isConfigured ? (
        <>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            Supabase が未設定です
          </h1>
          <p className="mt-4 text-sm leading-8 text-slate-500">
            `.env.local` に Supabase の URL と anon key を設定してから、もう一度認証を試してください。
          </p>
        </>
      ) : errorDescription || errorCode ? (
        <>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            認証に失敗しました
          </h1>
          <p className="mt-4 text-sm leading-8 text-rose-600">
            {errorDescription ?? errorCode}
          </p>
        </>
      ) : isLoading ? (
        <>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            セッションを確認しています
          </h1>
          <p className="mt-4 text-sm leading-8 text-slate-500">
            メールまたは Google から戻った直後の状態を確認しています。
          </p>
        </>
      ) : session ? (
        <>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            認証が完了しました
          </h1>
          <p className="mt-4 text-sm leading-8 text-slate-500">
            このまま認証画面へ戻ります。戻らない場合は下のリンクを使ってください。
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            セッションが見つかりません
          </h1>
          <p className="mt-4 text-sm leading-8 text-slate-500">
            メールリンクの期限切れ、または OAuth 設定不足の可能性があります。
          </p>
        </>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/auth"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          認証画面へ戻る
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          LPへ戻る
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useAuth } from "@/components/AuthProvider";
import { serviceName } from "@/lib/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type AuthMode = "login" | "signup";

type FeedbackState = {
  kind: "idle" | "success" | "error";
  message?: string;
};

const modeCopy = {
  login: {
    eyebrow: "Login",
    title: "ログインリンクをメールで受け取る",
    description:
      "登録済みメールアドレスにログインリンクを送信します。パスワードは使いません。",
    buttonLabel: "ログインリンクを送る",
    successMessage:
      "ログインリンクを送信しました。メールの確認後、この画面に戻ります。",
  },
  signup: {
    eyebrow: "Sign Up",
    title: "新規登録リンクをメールで受け取る",
    description:
      "新規ユーザー向けの確認リンクを送信します。認証後は先行ユーザー画面に入れます。",
    buttonLabel: "新規登録リンクを送る",
    successMessage:
      "新規登録リンクを送信しました。メールの確認後、この画面に戻ります。",
  },
} as const;

function getRedirectUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URL("/auth/callback", window.location.origin).toString();
}

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const { isConfigured, isLoading, session, user, signOut } = useAuth();

  const currentCopy = useMemo(() => modeCopy[mode], [mode]);

  const handleEmailAuth = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback({ kind: "idle" });

    startTransition(async () => {
      if (!isConfigured) {
        setFeedback({
          kind: "error",
          message:
            "Supabase の環境変数が未設定です。`.env.local` と Supabase 設定を先に完了してください。",
        });
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setFeedback({
          kind: "error",
          message: "Supabase クライアントの初期化に失敗しました。",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: getRedirectUrl(),
          shouldCreateUser: mode === "signup",
        },
      });

      if (error) {
        setFeedback({
          kind: "error",
          message: error.message,
        });
        return;
      }

      setFeedback({
        kind: "success",
        message: currentCopy.successMessage,
      });
    });
  };

  const handleGoogleAuth = () => {
    setFeedback({ kind: "idle" });

    startTransition(async () => {
      if (!isConfigured) {
        setFeedback({
          kind: "error",
          message:
            "Google OAuth は Supabase の URL / anon key 設定後に有効になります。",
        });
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setFeedback({
          kind: "error",
          message: "Supabase クライアントの初期化に失敗しました。",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        setFeedback({
          kind: "error",
          message: error.message,
        });
      }
    });
  };

  const handleSignOut = () => {
    setFeedback({ kind: "idle" });

    startTransition(async () => {
      const result = await signOut();

      if (result.error) {
        setFeedback({
          kind: "error",
          message: result.error,
        });
        return;
      }

      setFeedback({
        kind: "success",
        message: "サインアウトしました。",
      });
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950 p-7 text-white shadow-[0_24px_90px_rgba(15,23,42,0.36)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
          Account
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          {serviceName} にログイン
        </h1>
        <p className="mt-5 text-sm leading-8 text-slate-300">
          ログインすると、加工した証明写真の履歴が保存され、AI
          スーツ着せ替えなどの有料機能をご利用いただけます。
        </p>

        <ul className="mt-8 space-y-3 text-sm leading-7 text-slate-200">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-sky-300">✓</span>
            加工履歴の保存
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-sky-300">✓</span>
            AI スーツ着せ替え（300円 / 回）
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-sky-300">✓</span>
            透かしなし高解像度ダウンロード
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            LPに戻る
          </Link>
          <Link
            href="/shoot"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
          >
            ログインせずに試す
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {currentCopy.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {currentCopy.title}
            </h2>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
            {isConfigured ? "Supabase 設定あり" : "Supabase 未設定"}
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          {currentCopy.description}
        </p>

        <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            新規登録
          </button>
        </div>

        {session && user ? (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Authenticated
            </p>
            <h3 className="mt-2 text-xl font-bold text-emerald-950">
              認証済みです
            </h3>
            <p className="mt-3 text-sm leading-7 text-emerald-900">
              {user.email ?? "メールアドレス不明"}
            </p>
            <p className="mt-2 text-sm leading-7 text-emerald-800">
              証明写真の作成や AI スーツ着せ替えをご利用いただけます。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/shoot"
                className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                証明写真を作る →
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isPending}
                className="rounded-full border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                サインアウト
              </button>
            </div>
          </div>
        ) : (
          <>
            <form className="mt-8 space-y-4" onSubmit={handleEmailAuth} noValidate>
              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  メールアドレス
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isPending || isLoading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || isLoading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "送信中..." : currentCopy.buttonLabel}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isPending || isLoading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">
                G
              </span>
              Google で続ける
            </button>
          </>
        )}

        {feedback.kind !== "idle" ? (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${
              feedback.kind === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}
      </section>
    </div>
  );
}

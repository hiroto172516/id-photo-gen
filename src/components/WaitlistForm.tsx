"use client";

import { useState, useTransition } from "react";
import { serviceName } from "@/lib/brand";

type FormState = {
  kind: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: string[];
};

const initialState: FormState = { kind: "idle" };

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState(initialState);

    startTransition(async () => {
      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const payload = (await response.json()) as {
          ok: boolean;
          message: string;
          fieldErrors?: { email?: string[] };
        };

        if (!response.ok || !payload.ok) {
          setState({
            kind: "error",
            message: payload.message,
            fieldErrors: payload.fieldErrors?.email,
          });
          return;
        }

        setState({
          kind: "success",
          message: payload.message,
        });
        setEmail("");
      } catch {
        setState({
          kind: "error",
          message:
            "送信に失敗しました。時間をおいて再度お試しください。",
        });
      }
    });
  };

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
        事前登録フォーム
      </p>
      <h3 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
        メールアドレスだけで登録できます
      </h3>
      <p className="mt-3 text-sm leading-7 text-zinc-500">
        リリース時の案内だけを送る前提です。開発中のため、送信先が未設定の本番環境では受付準備中の表示になります。
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="waitlist-email"
            className="mb-2 block text-sm font-semibold text-zinc-700"
          >
            メールアドレス
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
          />
          {state.fieldErrors?.length ? (
            <p className="mt-2 text-sm text-rose-600">{state.fieldErrors[0]}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "送信中..." : "事前登録する"}
        </button>
      </form>

      {state.kind !== "idle" ? (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${
            state.kind === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <p className="mt-5 text-xs leading-6 text-zinc-400">
        送信すると、{`「${serviceName}」`} の公開連絡を受け取ることに同意したものとみなします。
      </p>
    </div>
  );
}

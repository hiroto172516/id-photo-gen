"use client";

import { useState, useTransition } from "react";
import {
  feedbackCategories,
  type FeedbackCategory,
  type FeedbackInput,
} from "@/lib/feedback";

type FormState = {
  kind: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof FeedbackInput, string[]>>;
};

type ShootFeedbackFormProps = {
  context: Omit<FeedbackInput, "category" | "rating" | "message" | "email">;
  onSubmitted: () => void;
};

const initialState: FormState = { kind: "idle" };

export function ShootFeedbackForm({ context, onSubmitted }: ShootFeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>("ux");
  const [rating, setRating] = useState("4");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState(initialState);

    startTransition(async () => {
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...context,
            category,
            rating: Number(rating),
            message,
            email,
          }),
        });

        const payload = (await response.json()) as {
          ok: boolean;
          message: string;
          fieldErrors?: Partial<Record<keyof FeedbackInput, string[]>>;
        };

        if (!response.ok || !payload.ok) {
          setState({
            kind: "error",
            message: payload.message,
            fieldErrors: payload.fieldErrors,
          });
          return;
        }

        setState({
          kind: "success",
          message: payload.message,
        });
        setCategory("ux");
        setRating("4");
        setMessage("");
        setEmail("");
        onSubmitted();
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
    <section
      data-testid="feedback-form"
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">使ってみた感想を送る</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            初期バグ修正と使い勝手改善の参考にします。自由記述は任意ではなく、10文字以上でお願いします。
          </p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
          βフィードバック
        </span>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
              カテゴリ
            </span>
            <select
              data-testid="feedback-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
              disabled={isPending}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {feedbackCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {state.fieldErrors?.category?.length ? (
              <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.category[0]}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
              満足度
            </span>
            <select
              data-testid="feedback-rating"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              disabled={isPending}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="5">5: とても満足</option>
              <option value="4">4: 概ね満足</option>
              <option value="3">3: ふつう</option>
              <option value="2">2: やや不満</option>
              <option value="1">1: 不満</option>
            </select>
            {state.fieldErrors?.rating?.length ? (
              <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.rating[0]}</p>
            ) : null}
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
            感想
          </span>
          <textarea
            data-testid="feedback-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isPending}
            rows={5}
            placeholder="使いやすかった点、困った点、追加してほしい機能を教えてください。"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {state.fieldErrors?.message?.length ? (
            <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.message[0]}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
            メールアドレス
          </span>
          <input
            data-testid="feedback-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            placeholder="返信が必要な場合のみ入力してください"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-2 text-xs text-zinc-500">
            任意入力です。返信が必要な場合だけ使います。
          </p>
          {state.fieldErrors?.email?.length ? (
            <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.email[0]}</p>
          ) : null}
        </label>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-6 text-zinc-500">
          現在の送信内容には、選択中の規格、背景設定、顔検出フォールバックの有無など改善に必要な技術情報だけを含めます。
        </div>

        <button
          type="submit"
          data-testid="feedback-submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "送信中..." : "フィードバックを送る"}
        </button>
      </form>

      {state.kind !== "idle" ? (
        <div
          data-testid={state.kind === "success" ? "feedback-success" : "feedback-error"}
          className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${
            state.kind === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}
    </section>
  );
}

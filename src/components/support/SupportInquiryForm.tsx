"use client";

import { useMemo, useState, useTransition } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  supportCategories,
  type SupportCategory,
  type SupportInquiryInput,
} from "@/lib/support";

type FormState = {
  kind: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof SupportInquiryInput, string[]>>;
};

type SupportInquiryFormProps = {
  initialCategory?: SupportCategory;
  initialPagePath?: string;
  initialStripeSessionId?: string;
  initialPaymentIntentId?: string;
};

const initialState: FormState = { kind: "idle" };

export function SupportInquiryForm({
  initialCategory = "general",
  initialPagePath = "/support",
  initialStripeSessionId = "",
  initialPaymentIntentId = "",
}: SupportInquiryFormProps) {
  const [category, setCategory] = useState<SupportCategory>(initialCategory);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pagePath, setPagePath] = useState(initialPagePath);
  const [stripeSessionId, setStripeSessionId] = useState(initialStripeSessionId);
  const [paymentIntentId, setPaymentIntentId] = useState(initialPaymentIntentId);
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();

  const requiresPaymentReference = useMemo(() => {
    return category === "payment_error" || category === "refund_request";
  }, [category]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState(initialState);

    startTransition(async () => {
      try {
        const response = await fetch("/api/support", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category,
            email,
            message,
            pagePath,
            stripeSessionId,
            paymentIntentId,
          }),
        });

        const payload = (await response.json()) as {
          ok: boolean;
          message: string;
          fieldErrors?: Partial<Record<keyof SupportInquiryInput, string[]>>;
        };

        if (!response.ok || !payload.ok) {
          setState({
            kind: "error",
            message: payload.message,
            fieldErrors: payload.fieldErrors,
          });
          return;
        }

        trackEvent("support_submitted", { category, page_path: pagePath });
        if (category === "refund_request") {
          trackEvent("refund_requested", { page_path: pagePath });
        }

        setState({
          kind: "success",
          message: payload.message,
        });
        setMessage("");
        if (!requiresPaymentReference) {
          setStripeSessionId("");
          setPaymentIntentId("");
        }
      } catch {
        setState({
          kind: "error",
          message: "送信に失敗しました。時間をおいて再度お試しください。",
        });
      }
    });
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-950/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">問い合わせフォーム</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            返信が必要な内容はメールアドレスを正しく入力してください。決済トラブル時は Stripe のセッションIDか決済IDも添えてください。
          </p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
          初期運用
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
              カテゴリ
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as SupportCategory)}
              disabled={isPending}
              data-testid="support-category"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {supportCategories.map((item) => (
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
              返信先メールアドレス
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isPending}
              data-testid="support-email"
              placeholder="project@example.com"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {state.fieldErrors?.email?.length ? (
              <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.email[0]}</p>
            ) : null}
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
            問い合わせ内容
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isPending}
            rows={6}
            data-testid="support-message"
            placeholder="発生した状況、試したこと、利用端末、希望する対応をできるだけ具体的に記載してください。"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {state.fieldErrors?.message?.length ? (
            <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.message[0]}</p>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
              対象ページ
            </span>
            <input
              value={pagePath}
              onChange={(event) => setPagePath(event.target.value)}
              disabled={isPending}
              data-testid="support-page-path"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {state.fieldErrors?.pagePath?.length ? (
              <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.pagePath[0]}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
              Stripe セッションID
            </span>
            <input
              value={stripeSessionId}
              onChange={(event) => setStripeSessionId(event.target.value)}
              disabled={isPending}
              data-testid="support-session-id"
              placeholder="cs_live_xxx / cs_test_xxx"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {state.fieldErrors?.stripeSessionId?.length ? (
              <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.stripeSessionId[0]}</p>
            ) : null}
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
            Stripe 決済ID
          </span>
          <input
            value={paymentIntentId}
            onChange={(event) => setPaymentIntentId(event.target.value)}
            disabled={isPending}
            data-testid="support-payment-intent-id"
            placeholder="pi_xxx"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-2 text-xs text-zinc-500">
            {requiresPaymentReference
              ? "決済エラー・返金相談では、セッションIDか決済IDのどちらかを入力してください。"
              : "通常の問い合わせでは空欄でも問題ありません。"}
          </p>
        </label>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-6 text-zinc-500">
          返金対象は、決済済みなのに機能が解放されない、二重決済、明確なシステム障害などサービス不備が確認できるケースに限ります。
        </div>

        <button
          type="submit"
          disabled={isPending}
          data-testid="support-submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "送信中..." : "問い合わせを送る"}
        </button>
      </form>

      {state.kind !== "idle" ? (
        <div
          data-testid={state.kind === "success" ? "support-success" : "support-error"}
          className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-7 ${
            state.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}
    </section>
  );
}

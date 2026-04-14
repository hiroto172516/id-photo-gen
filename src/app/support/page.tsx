import type { Metadata } from "next";
import Link from "next/link";
import { LegalLinks } from "@/components/LegalLinks";
import { SupportInquiryForm } from "@/components/support/SupportInquiryForm";
import { publicAppUrl, serviceName, supportEmail } from "@/lib/brand";
import type { SupportCategory } from "@/lib/support";

export const metadata: Metadata = {
  title: `お問い合わせ | ${serviceName}`,
  description:
    "スマ撮り証明写真のお問い合わせ窓口です。決済エラー、返金相談、不具合報告、一般的な問い合わせを受け付けます。",
  alternates: {
    canonical: `${publicAppUrl}/support`,
  },
};

const allowedCategories = new Set<SupportCategory>([
  "general",
  "payment_error",
  "refund_request",
  "account",
  "privacy",
  "bug",
]);

const faqItems = [
  {
    title: "決済完了後に AI 機能が解放されません",
    body:
      "決済直後は Stripe Webhook の反映に数十秒かかることがあります。数分待っても解放されない場合は、このページからセッションID付きでご連絡ください。",
  },
  {
    title: "返金対象になるケース",
    body:
      "決済済みなのにAI機能が使えない、二重決済が発生した、明確なシステム障害で利用できなかった場合を返金対象として確認します。",
  },
  {
    title: "返金対象にならないケース",
    body:
      "仕上がりの好み、自己都合キャンセル、提出先規定との不一致など、サービス不備ではない理由は返金対象外です。",
  },
];

type SupportPageProps = {
  searchParams?: Promise<{
    category?: string;
    from?: string;
    session_id?: string;
    payment_intent_id?: string;
  }>;
};

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const params = (await searchParams) ?? {};
  const initialCategory = allowedCategories.has(params.category as SupportCategory)
    ? (params.category as SupportCategory)
    : "general";
  const initialPagePath = params.from ? `/${params.from.replace(/^\/+/, "")}` : "/support";

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
              S
            </div>
            <span className="text-sm font-bold">{serviceName}</span>
          </Link>
          <Link
            href="/shoot"
            className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            /shoot へ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <nav className="mb-6 text-xs text-zinc-400" aria-label="パンくずリスト">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-zinc-600">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-500">お問い合わせ</li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="text-sm font-semibold text-blue-600">Support</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">お問い合わせ</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-600">
            決済トラブル、不具合、アカウント、個人情報、返金相談を受け付けます。初期運用では内容を手動で確認し、
            必要に応じて <a className="font-semibold text-blue-600" href={`mailto:${supportEmail}`}>{supportEmail}</a> から返信します。
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SupportInquiryForm
            initialCategory={initialCategory}
            initialPagePath={initialPagePath}
            initialStripeSessionId={params.session_id ?? ""}
            initialPaymentIntentId={params.payment_intent_id ?? ""}
          />

          <div className="space-y-6">
            <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-zinc-900">対応方針</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
                <li>決済エラーは Stripe セッションIDまたは決済IDを添えて送ってください。</li>
                <li>返金はサービス不備が確認できる場合に限って個別対応します。</li>
                <li>通常は 1〜2 営業日以内を目安に確認します。</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
              <h2 className="text-lg font-bold text-zinc-900">よくある問い合わせ</h2>
              <div className="mt-4 space-y-4">
                {faqItems.map((item) => (
                  <article key={item.title}>
                    <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-zinc-600">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-8 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 {serviceName}. All rights reserved.</p>
          <LegalLinks className="flex items-center gap-4" linkClassName="hover:text-zinc-600" />
        </div>
      </footer>
    </div>
  );
}

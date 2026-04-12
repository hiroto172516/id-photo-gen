import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLinks } from '@/components/LegalLinks';
import { publicAppUrl, serviceName } from '@/lib/brand';

export const metadata: Metadata = {
  title: `特定商取引法に基づく表記 | ${serviceName}`,
  description:
    'スマ撮り証明写真の特定商取引法に基づく表記です。販売事業者、価格、支払方法、提供時期、返品条件を掲載しています。',
  alternates: {
    canonical: `${publicAppUrl}/commercial-transactions`,
  },
};

const sections = [
  { label: '販売事業者名', value: '小堀裕斗' },
  { label: '運営責任者名', value: '小堀裕斗' },
  { label: '所在地', value: '東京都府中市分梅町1-5-2-1-201' },
  { label: '電話番号', value: '080-4096-6615' },
  { label: '問い合わせ先メールアドレス', value: 'project.hiroto172516@gmail.com' },
  { label: '問い合わせ受付時間', value: '平日9:00〜21:00' },
  { label: '販売価格', value: 'AIスーツ着せ替え 1回300円（税込）' },
  { label: '販売価格以外に必要な費用', value: '通信料のみ' },
  { label: '支払方法', value: 'クレジットカード（Stripe）' },
  { label: '支払時期', value: '購入時に即時決済' },
  { label: '提供時期', value: '決済完了後すぐに利用可能' },
  { label: '返品・キャンセル条件', value: 'お客様都合による返品は不可' },
  { label: '動作環境', value: '最新の Chrome / Safari 推奨' },
];

export default function CommercialTransactionsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
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

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <nav className="mb-6 text-xs text-zinc-400" aria-label="パンくずリスト">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-zinc-600">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-500">特定商取引法に基づく表記</li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="text-sm font-semibold text-blue-600">Legal</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            特定商取引法に基づく表記
          </h1>
          <p className="mt-4 text-base leading-8 text-zinc-600">
            {serviceName} の有料機能に関する販売条件を、特定商取引法に基づいて記載しています。
            現時点の販売対象は AIスーツ着せ替えの単発課金です。
          </p>
        </header>

        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          {sections.map((section, index) => (
            <div
              key={section.label}
              className={`grid gap-2 px-6 py-5 sm:grid-cols-[220px_minmax(0,1fr)] ${
                index === sections.length - 1 ? '' : 'border-b border-zinc-100'
              }`}
            >
              <h2 className="text-sm font-semibold text-zinc-900">{section.label}</h2>
              <p className="text-sm leading-7 text-zinc-600">{section.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-xl font-bold text-zinc-900">補足</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-600">
            月額サブスクリプション等の継続課金機能を将来提供する場合は、販売条件が確定した時点で本ページを更新します。
          </p>
        </section>
      </main>

      <footer className="border-t border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-8 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 {serviceName}. All rights reserved.</p>
          <LegalLinks className="flex items-center gap-4" linkClassName="hover:text-zinc-600" />
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLinks } from '@/components/LegalLinks';
import { publicAppUrl, serviceName, supportEmail } from '@/lib/brand';

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${serviceName}`,
  description:
    'スマ撮り証明写真のプライバシーポリシーです。取得する情報、利用目的、外部サービス、保存期間、ユーザーの権利について説明します。',
  alternates: {
    canonical: `${publicAppUrl}/privacy`,
  },
};

const sections = [
  {
    title: '1. 取得する情報',
    body: [
      '本サービスでは、ユーザーがアップロードまたは撮影した画像、選択した規格、背景設定、ダウンロードや共有に関連する操作情報を取り扱います。',
      'ログイン機能を利用する場合は、認証に必要なメールアドレスや外部認証プロバイダに紐づく識別情報を取得することがあります。',
      'ブラウザやサーバーの標準ログとして、IPアドレス、User-Agent、アクセス時刻、エラー情報等を取得する場合があります。',
    ],
  },
  {
    title: '2. 利用目的',
    body: [
      '証明写真の加工、L版レイアウト生成、アップロード、ダウンロードなど本サービスの提供のため',
      '障害調査、セキュリティ対策、レート制限、不正利用対策のため',
      '機能改善、操作性改善、公開中β版の品質向上のため',
    ],
  },
  {
    title: '3. 画像データの保存期間',
    body: [
      'アップロードされた画像は一時保存され、自動削除の対象になります。',
      '無料β版ではおおむね24時間以内の削除を前提に運用していますが、削除ジョブの実行時刻により前後する場合があります。',
      'ユーザーが端末へ保存した画像は、ユーザー自身の管理下にあります。',
    ],
  },
  {
    title: '4. 外部サービスの利用',
    body: [
      '本サービスでは、認証や一時保存、配信、ホスティングのために Supabase、Vercel などの外部サービスを利用しています。',
      '背景除去や顔検出では、ブラウザ上で MediaPipe や WebAssembly モデル資産を読み込むことがあります。',
      'これらのサービスにより、技術的に必要な範囲で通信情報が処理される場合があります。',
    ],
  },
  {
    title: '5. Cookie等の利用',
    body: [
      '本サービスは、ログイン状態やPWA表示制御など、体験維持に必要な範囲でブラウザストレージを利用します。',
      '広告目的のトラッキングCookieは導入していませんが、利用状況の把握と改善のために Vercel Analytics および Google Analytics を利用する場合があります。',
      'Google Analytics は測定IDが設定された環境でのみ有効化し、ページ表示や主要操作の集計に利用します。',
    ],
  },
  {
    title: '6. 第三者提供',
    body: [
      '法令に基づく場合を除き、ユーザー情報を販売または不必要に第三者へ提供しません。',
      'ただし、本サービス提供に必要な委託先やインフラ事業者に対して、処理上必要な範囲で情報を預託する場合があります。',
    ],
  },
  {
    title: '7. セキュリティ',
    body: [
      '画像や認証情報の取り扱いには、公開環境の設定、署名付きアップロード、保存期限管理など、合理的な安全対策を講じます。',
      'ただし、インターネット通信およびクラウドサービスの性質上、完全な安全性を保証するものではありません。',
    ],
  },
  {
    title: '8. ユーザーの権利',
    body: [
      'ユーザーは、本サービスの利用を中止し、必要な画像を自身で保存した上で削除時刻を待つことができます。',
      '認証情報や保存データに関する問い合わせは、運営者が合理的に対応可能な範囲で受け付けます。',
    ],
  },
  {
    title: '9. 改定',
    body: [
      '本ポリシーは、法令変更やサービス改善に応じて改定することがあります。',
      '重要な変更は、本ページへの掲載によって周知します。',
    ],
  },
];

export default function PrivacyPage() {
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
            <li className="text-zinc-500">プライバシーポリシー</li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="text-sm font-semibold text-blue-600">Privacy</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">プライバシーポリシー</h1>
          <p className="mt-4 text-base leading-8 text-zinc-600">
            {serviceName} は、無料β版の運用に必要な範囲で情報を取り扱います。本ページでは、取得する情報、その利用目的、保存期間、外部サービス利用について説明します。
          </p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
              <h2 className="text-xl font-bold text-zinc-900">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-bold text-zinc-900">お問い合わせ</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              個人情報の取り扱いに関する問い合わせは、
              <Link href="/support" className="font-semibold text-blue-600 underline underline-offset-2">
                お問い合わせフォーム
              </Link>
              または
              <a href={`mailto:${supportEmail}`} className="font-semibold text-blue-600 underline underline-offset-2">
                {supportEmail}
              </a>
              で受け付けます。
            </p>
          </section>
        </div>
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

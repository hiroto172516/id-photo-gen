import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLinks } from '@/components/LegalLinks';
import { publicAppUrl, serviceName, socialHandles } from '@/lib/brand';

export const metadata: Metadata = {
  title: `利用規約 | ${serviceName}`,
  description:
    'スマ撮り証明写真の利用規約です。無料β版の利用条件、禁止事項、画像データの扱い、免責事項などを掲載しています。',
  alternates: {
    canonical: `${publicAppUrl}/terms`,
  },
};

const sections = [
  {
    title: '1. 適用',
    body: [
      `${serviceName}（以下「本サービス」）の利用条件は、本利用規約に定めます。`,
      'ユーザーは、本サービスを利用した時点で本規約に同意したものとみなします。',
    ],
  },
  {
    title: '2. サービス内容',
    body: [
      '本サービスは、ユーザーがアップロードまたは撮影した写真を、証明写真向けに加工するための無料β版Webサービスです。',
      '背景変更、サイズ調整、L版レイアウト生成、画像ダウンロードなどの機能を提供します。',
      '本サービスは開発中のため、機能追加、変更、停止が予告なく行われる場合があります。',
    ],
  },
  {
    title: '3. ユーザーがアップロードする画像',
    body: [
      'ユーザーは、自身が利用権限を有する画像のみをアップロードまたは撮影に利用してください。',
      '第三者の肖像権、著作権、プライバシーその他の権利を侵害する画像の利用は禁止します。',
      'アップロードされた画像は、加工処理および一時保存の目的で取り扱います。',
    ],
  },
  {
    title: '4. 保存期間と削除',
    body: [
      '本サービスでアップロードされた画像は一時保存され、自動削除の対象になります。',
      '現在の無料β版では、保存後おおむね24時間以内の削除を前提に運用していますが、実際の削除タイミングはバッチ実行時刻の影響を受ける場合があります。',
      'ユーザーは、必要な画像を自身の端末へ保存した上で利用してください。',
    ],
  },
  {
    title: '5. 禁止事項',
    body: [
      '法令または公序良俗に反する行為',
      '他者になりすます行為、または虚偽情報を用いる行為',
      '本サービスや関連システムへの過度な負荷、スクレイピング、脆弱性探索、リバースエンジニアリングなど運営を妨げる行為',
      '公的提出用として不適切な加工を意図的に行う行為、または提出先の規定に反する利用',
      '本サービスを通じて取得した一時URLやデータを不正に第三者へ共有する行為',
    ],
  },
  {
    title: '6. 免責',
    body: [
      '本サービスは、提出先での受理、審査通過、印刷結果、色味、トリミングの適合性を保証するものではありません。',
      'パスポート、ビザ、マイナンバーカード等の公的用途では、最終的に各提出先の最新要件をユーザー自身で確認してください。',
      '本サービスの利用により生じた損害について、運営者に故意または重過失がある場合を除き責任を負いません。',
    ],
  },
  {
    title: '7. サービス変更・停止',
    body: [
      '運営者は、保守、障害対応、法令対応、改善その他の理由により、本サービスの全部または一部を変更、停止、終了できます。',
      '無料β版のため、予告なく仕様変更や公開停止を行う場合があります。',
    ],
  },
  {
    title: '8. 規約変更',
    body: [
      '本規約は、必要に応じて改定することがあります。',
      '改定後の規約は、本ページへ掲載した時点から効力を生じます。',
    ],
  },
  {
    title: '9. 準拠法・管轄',
    body: [
      '本規約は日本法に準拠します。',
      '本サービスに関して紛争が生じた場合、運営者所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。',
    ],
  },
];

export default function TermsPage() {
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
            <li className="text-zinc-500">利用規約</li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="text-sm font-semibold text-blue-600">Legal</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">利用規約</h1>
          <p className="mt-4 text-base leading-8 text-zinc-600">
            本ページは、{serviceName} の無料β版の利用条件を示すものです。証明写真の提出可否や審査通過は提出先の規定に依存するため、
            最終確認はユーザー自身で行ってください。
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
              本規約や本サービスに関する問い合わせは、X アカウント{' '}
              <a
                href={`https://x.com/${socialHandles.x.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-600 underline underline-offset-2"
              >
                {socialHandles.x}
              </a>{' '}
              宛の DM で受け付けます。
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLinks } from '@/components/LegalLinks';
import { serviceName } from '@/lib/brand';

export const metadata: Metadata = {
  title: '証明写真をスマホで撮る方法【2026年最新版】 | スマ撮り証明写真',
  description:
    'スマホで証明写真を撮る方法を、準備・撮影手順・失敗例・サイズ規格・補正の考え方までまとめて解説。履歴書やパスポート用途で失敗しないポイントを確認できます。',
  keywords: ['証明写真', 'スマホ', '撮り方', '履歴書 写真', 'パスポート 写真', 'セルフ証明写真'],
  openGraph: {
    title: '証明写真をスマホで撮る方法【2026年最新版】',
    description: 'スマホ証明写真の準備・撮影手順・サイズ規格・NG例をまとめて解説。',
    type: 'article',
    publishedTime: '2026-03-15T00:00:00+09:00',
    modifiedTime: '2026-03-16T00:00:00+09:00',
    authors: [serviceName],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '証明写真をスマホで撮る方法【2026年最新版】',
  description:
    'スマホで証明写真を撮る方法を、準備・撮影手順・失敗例・補正・サイズ規格までまとめて解説。',
  datePublished: '2026-03-15T00:00:00+09:00',
  dateModified: '2026-03-16T00:00:00+09:00',
  author: {
    '@type': 'Organization',
    name: serviceName,
  },
  publisher: {
    '@type': 'Organization',
    name: serviceName,
  },
  inLanguage: 'ja',
};

const sizes = [
  { name: 'パスポート', size: '35×45mm', note: '顔の占める割合 70〜80%' },
  { name: '履歴書（一般）', size: '30×40mm', note: '会社指定がある場合は要確認' },
  { name: 'マイナンバーカード', size: '35×45mm', note: '背景は無地・無模様' },
  { name: '運転免許証', size: '24×30mm', note: '申請書類の指定に従う' },
  { name: '米国ビザ', size: '51×51mm', note: '正方形・6か月以内撮影' },
  { name: '中国ビザ', size: '33×48mm', note: '白背景・無地' },
];

export default function HowToTakeIdPhotoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white text-zinc-900">
        {/* ヘッダー */}
        <header className="sticky top-0 z-50 border-b border-zinc-100/80 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                S
              </div>
              <span className="text-sm font-bold">{serviceName}</span>
            </Link>
            <Link
              href="/shoot"
              className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              無料で試す（β）
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          {/* パンくず */}
          <nav className="mb-6 text-xs text-zinc-400" aria-label="パンくずリスト">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-zinc-600">ホーム</Link></li>
              <li>/</li>
              <li className="text-zinc-500">証明写真をスマホで撮る方法</li>
            </ol>
          </nav>

          {/* 記事ヘッダー */}
          <header className="mb-10">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              証明写真をスマホで撮る方法<br />
              <span className="text-blue-600">【2026年最新版】</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-500">
              証明写真は、光と背景と構図を押さえればスマホでもかなり安定して撮れます。
              ただし「それっぽく写る」だけでは不十分で、提出先の規格に合うことが重要です。
              このページでは、撮影前の準備、失敗しやすいポイント、サイズ規格、撮影後の補正の考え方までまとめます。
            </p>
            <div className="mt-4 text-xs text-zinc-400">
              公開日：2026年3月15日 ／ 更新日：2026年3月16日 ／ カテゴリ：証明写真の撮り方
            </div>
          </header>

          {/* 目次 */}
          <nav className="mb-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-5" aria-label="目次">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">目次</p>
            <ol className="space-y-1.5 text-sm">
              {[
                ['1', 'スマホで証明写真は撮れるのか'],
                ['2', '撮影前の準備（光・背景・服装）'],
                ['3', 'スマホで証明写真を撮る手順'],
                ['4', '失敗しやすい例とNG加工'],
                ['5', '撮影後の補正とサイズ調整'],
                ['6', '規格サイズ一覧（パスポート・履歴書など）'],
                ['7', '自宅で仕上げる方法とまとめ'],
              ].map(([num, title]) => (
                <li key={num}>
                  <a href={`#section-${num}`} className="flex items-start gap-2 text-blue-600 hover:underline">
                    <span className="font-mono text-zinc-400">{num}.</span>
                    {title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* 本文 */}
          <div className="prose-zinc space-y-12 text-base leading-8">

            {/* セクション1 */}
            <section id="section-1">
              <h2 className="mb-4 text-2xl font-bold">1. スマホで証明写真は撮れるのか</h2>
              <p className="text-zinc-600">
                結論から言うと、<strong>スマホでも証明写真は十分撮れます。</strong>
                最近のスマホカメラは解像度が高く、明るい環境で固定して撮れば、
                履歴書やエントリーシート用途で困らない品質を確保しやすくなっています。
              </p>
              <p className="mt-4 text-zinc-600">
                ただし、写真館との違いは「撮影環境を自分で整える必要がある」ことです。
                とくにパスポートやマイナンバーカードのような公的用途では、
                背景、顔の向き、余白、影、過度な加工が不備になることがあります。
                「撮れた写真」ではなく「提出できる写真」を目指す前提で進める必要があります。
              </p>
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
                スマホ撮影が向いている人: 自宅で撮り直したい人、写真館へ行く時間を省きたい人、複数枚試してベストな1枚を選びたい人。
              </div>
            </section>

            {/* セクション2 */}
            <section id="section-2">
              <h2 className="mb-4 text-2xl font-bold">2. 撮影前の準備（光・背景・服装）</h2>

              <h3 className="mb-2 mt-6 text-lg font-semibold">光の確保</h3>
              <ul className="list-none space-y-2 text-zinc-600">
                {[
                  '窓際の自然光が最も均一で影が出にくい',
                  '逆光（窓を背にする）は顔が暗くなるので避ける',
                  '室内照明のみの場合は顔の正面から当てる',
                  'リングライトがあると影がさらに減らせる',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="mb-2 mt-6 text-lg font-semibold">背景の作り方</h3>
              <ul className="list-none space-y-2 text-zinc-600">
                {[
                  '白・グレー・ライトブルーの無地壁が理想',
                  '白い大きな模造紙やシーツを壁に貼るだけでOK',
                  '柄物・暗い壁は審査で弾かれるリスクがある',
                  'AIによる背景除去サービスも活用できる（規格によって要確認）',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="mb-2 mt-6 text-lg font-semibold">服装・身だしなみ</h3>
              <ul className="list-none space-y-2 text-zinc-600">
                {[
                  '就職・転職用途はスーツ着用が標準',
                  'パスポートは私服でも可（派手すぎない清潔感が重要）',
                  '白い服は白背景と同化するため避ける',
                  '眼鏡は反射が出やすく、最近は申請書類でNG扱いも増えている',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="mb-2 mt-6 text-lg font-semibold">用意しておくと失敗しにくいもの</h3>
              <ul className="list-none space-y-2 text-zinc-600">
                {[
                  'スマホを固定するスタンドや三脚',
                  'セルフタイマー、またはBluetoothシャッター',
                  '背景用の白い布や模造紙',
                  '撮影後に構図を確認するための大きめの画面',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* セクション3 */}
            <section id="section-3">
              <h2 className="mb-4 text-2xl font-bold">3. スマホで証明写真を撮る手順</h2>
              <ol className="space-y-4 text-zinc-600">
                {[
                  { step: 'Step 1', title: 'スマホを固定する', desc: '手持ちでは傾きやブレが出る。スタンドか三脚を使う。' },
                  { step: 'Step 2', title: 'カメラの高さを目線に合わせる', desc: '上から撮ると顔が細く、下から撮ると輪郭が強く見える。' },
                  { step: 'Step 3', title: '顔と肩がまっすぐ入る位置に立つ', desc: '身体を斜めにせず、肩のラインを水平に近づける。' },
                  { step: 'Step 4', title: 'タイマーで複数枚撮る', desc: '3秒から10秒で撮影し、目線や口元が自然な写真を選ぶ。' },
                  { step: 'Step 5', title: '背景・回転・サイズを整える', desc: '撮影後は傾きや向きを直し、用途に応じたサイズで仕上げる。' },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {step.replace('Step ', '')}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-800">{title}</p>
                      <p className="mt-0.5 text-sm">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
                前面カメラは見た目を確認しやすい一方で、端末によってはミラー表示になります。保存時に正しい向きへ補正されるかも確認しておくと安全です。
              </div>
            </section>

            {/* セクション4 */}
            <section id="section-4">
              <h2 className="mb-4 text-2xl font-bold">4. 失敗しやすい例とNG加工</h2>
              <p className="text-zinc-600">
                スマホ撮影で多い失敗は、画質不足よりも「構図」「背景」「加工のやりすぎ」です。証明写真に許される補正範囲は提出先によって異なりますが、一般的に以下は審査落ちの原因になります。
              </p>
              <ul className="mt-4 list-none space-y-2 text-zinc-600">
                {[
                  '背景に家具やカーテンの柄が映り込んでいる',
                  '顔や肩に強い影が入っている',
                  'カメラが斜めで顔の中心がずれている',
                  '頭頂部や顎先が切れ、余白バランスが崩れている',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 font-bold text-amber-500">!</span>
                    {item}
                  </li>
                ))}
              </ul>
              <ul className="mt-4 list-none space-y-2 text-zinc-600">
                {[
                  '顔の輪郭・目・鼻・口の形状を変えるレタッチ',
                  '美肌フィルターによる過度な肌のなめらか化',
                  '目を大きく見せるアプリ加工',
                  'スタンプ・テキスト・枠などの合成',
                  '白目の赤みを超えたホワイト加工',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 font-bold text-red-400">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-zinc-600">
                一方で、明るさ・コントラストの微調整、写真の回転補正、背景を無地に整える処理、
                規格サイズへのトリミングは多くの用途で実務上必要になります。
                基準は「本人確認を妨げないこと」です。
              </p>
            </section>

            {/* セクション5 */}
            <section id="section-5">
              <h2 className="mb-4 text-2xl font-bold">5. 撮影後の補正とサイズ調整</h2>
              <p className="text-zinc-600">
                撮影直後の画像は、見た目が問題なくても、スマホの保存向きや画像サイズのままだと後工程で扱いにくいことがあります。
                最低限、以下の3点は確認しておくとスムーズです。
              </p>
              <ol className="mt-4 space-y-4 text-zinc-600">
                {[
                  { title: '向きの補正', desc: 'iPhone などでは見た目は正しくても EXIF 情報で回転が保持されていることがあり、Web上で横倒しになる場合がある。' },
                  { title: 'リサイズ', desc: '数MBを超える元画像は扱いが重くなる。長辺を適切なサイズに揃えるとプレビューやアップロードが安定する。' },
                  { title: '最終トリミング', desc: '提出先ごとの規格に合わせて頭上・左右余白を整える。自動処理でも最後の目視確認は必要。' },
                ].map(({ title, desc }, index) => (
                  <li key={title} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-800">{title}</p>
                      <p className="mt-0.5 text-sm">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-zinc-600">
                当サービスのβ版では、アップロード画像のプレビュー表示に加え、向き補正と扱いやすいサイズへの調整、
                さらにブラウザからのアップロード保存まで試せるように段階的に整備しています。
              </p>
            </section>

            {/* セクション6 */}
            <section id="section-6">
              <h2 className="mb-4 text-2xl font-bold">6. 規格サイズ一覧</h2>
              <p className="mb-4 text-zinc-600">
                用途別の主なサイズをまとめました。申請書類によって細則があるため、
                必ず公式サイトで最新の規格を確認してください。
              </p>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                      <th className="px-4 py-3 font-semibold text-zinc-700">用途</th>
                      <th className="px-4 py-3 font-semibold text-zinc-700">サイズ</th>
                      <th className="px-4 py-3 font-semibold text-zinc-700">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size, i) => (
                      <tr key={size.name} className={i !== sizes.length - 1 ? 'border-b border-zinc-100' : ''}>
                        <td className="px-4 py-3 font-medium text-zinc-800">{size.name}</td>
                        <td className="px-4 py-3 font-mono text-zinc-600">{size.size}</td>
                        <td className="px-4 py-3 text-zinc-500">{size.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* セクション7 — CTA */}
            <section id="section-7">
              <h2 className="mb-4 text-2xl font-bold">7. 自宅で仕上げる方法とまとめ</h2>
              <p className="text-zinc-600">
                自宅でのスマホ撮影でも、環境づくりと最終補正を丁寧に行えば、かなり実用的な証明写真を作れます。
                とくに重要なのは、撮る前に光と背景を整えること、撮った後に向きとサイズを確認することです。
              </p>
              <p className="mt-4 text-zinc-600">
                {serviceName}は、スマホで撮った写真をブラウザ上で証明写真向けに整えるサービスとして開発を進めています。
                現在はβ版として、撮影とアップロード、補正後プレビューの確認、保存先へのアップロード完了まで無料で試せます。
              </p>
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
                β版でできること:
                <br />
                スマホ撮影または既存写真のアップロード、向き補正、長辺1600pxへのリサイズ、署名付きURL経由での安全なアップロード保存。
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shoot"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg"
                >
                  無料で試す（β版）
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/#waitlist"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
                >
                  正式公開の通知を受け取る
                </Link>
              </div>
              <ul className="mt-4 list-none space-y-2 text-zinc-600">
                {[
                  '均一な明るさ（自然光 or 正面照明）を確保する',
                  '背景は無地の白・グレー系を用意する',
                  'スタンド＋タイマーで構図とブレを安定させる',
                  '加工は向き補正・サイズ調整・軽微な明るさ補正に留める',
                  '提出先の規格サイズを事前に確認する',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-zinc-600">
                撮影から補正まで一度流してみると、どこで失敗しやすいかが見えます。
                まずは{serviceName}のβ版で手元の写真を試し、提出先に合わせた仕上げの感覚をつかんでください。
              </p>
            </section>
          </div>
        </main>

        {/* フッター */}
        <footer className="border-t border-zinc-100 bg-zinc-50/50">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-8 text-center text-xs text-zinc-400">
            <p>&copy; 2026 {serviceName}. All rights reserved.</p>
            <Link href="/" className="inline-block hover:text-zinc-600">
              ← ホームへ戻る
            </Link>
            <LegalLinks
              className="flex items-center justify-center gap-4"
              linkClassName="hover:text-zinc-600"
            />
          </div>
        </footer>
      </div>
    </>
  );
}

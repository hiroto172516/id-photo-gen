import Link from "next/link";
import { serviceName } from "../lib/brand";

/* ──────────────────── データ ──────────────────── */

const features = [
  {
    title: "スマホで撮影するだけ",
    description:
      "専用アプリ不要。ブラウザからそのまま撮影・アップロードできます。",
    icon: "📱",
    accent: "from-sky-400 to-blue-500",
  },
  {
    title: "AIが自動で仕上げ",
    description:
      "顔の位置を自動検出し、規格に合わせてトリミング。背景も自動で白に変更。",
    icon: "✨",
    accent: "from-violet-400 to-indigo-500",
  },
  {
    title: "スーツ着せ替え",
    description:
      "私服で撮影OK。AIがスーツ姿に変換します。就活・転職写真にも対応。",
    icon: "👔",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    title: "各種サイズ対応",
    description:
      "パスポート・履歴書・マイナンバーカード・ビザなど各規格に対応。",
    icon: "📐",
    accent: "from-amber-400 to-orange-500",
  },
];

const steps = [
  {
    step: "1",
    title: "写真を撮影",
    description: "スマホで正面から撮影するだけ",
  },
  {
    step: "2",
    title: "AIが自動加工",
    description: "背景除去・トリミング・補正",
  },
  {
    step: "3",
    title: "ダウンロード",
    description: "印刷用の高品質データを取得",
  },
];

const sizes = [
  { name: "パスポート", size: "35×45mm", popular: true },
  { name: "履歴書", size: "30×40mm", popular: true },
  { name: "マイナンバーカード", size: "35×45mm", popular: false },
  { name: "運転免許証", size: "24×30mm", popular: false },
  { name: "ビザ（米国）", size: "51×51mm", popular: false },
];

const trustBadges = [
  { label: "写真館品質", icon: "🏆" },
  { label: "30秒で完成", icon: "⚡" },
  { label: "登録不要", icon: "🔓" },
  { label: "スマホ対応", icon: "📱" },
];

/* ──────────────── ビフォーアフター ──────────────── */

function BeforeAfterMock() {
  return (
    <div className="relative mx-auto mt-16 flex w-full max-w-2xl flex-col items-center gap-6 sm:flex-row sm:gap-0">
      {/* Before */}
      <div className="group relative z-10 w-52 shrink-0 sm:w-56">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-zinc-300 to-zinc-400 opacity-30 blur-md transition-all group-hover:opacity-50" />
        <div className="relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-lg">
          {/* 写真モック */}
          <div className="relative aspect-[3/4] bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
            {/* 背景：部屋 */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-sky-100 to-sky-50" />
            <div className="absolute bottom-0 left-2 h-2/5 w-6 rounded-t-sm bg-amber-200/60" />
            <div className="absolute bottom-0 right-3 h-1/3 w-8 rounded-t-sm bg-amber-200/40" />
            {/* 人物シルエット */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <div className="relative">
                {/* 服（私服Tシャツ） */}
                <div className="absolute -bottom-4 left-1/2 h-20 w-28 -translate-x-1/2 rounded-t-3xl bg-gradient-to-b from-rose-400 to-rose-500" />
                {/* 首 */}
                <div className="absolute -bottom-1 left-1/2 h-5 w-6 -translate-x-1/2 rounded-sm bg-gradient-to-b from-amber-200 to-amber-300" />
                {/* 頭 */}
                <div className="relative mx-auto h-24 w-20 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 shadow-inner">
                  {/* 髪 */}
                  <div className="absolute -top-1 inset-x-0 h-12 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-700" />
                  {/* 目 */}
                  <div className="absolute top-12 left-4 h-2 w-3 rounded-full bg-zinc-800" />
                  <div className="absolute top-12 right-4 h-2 w-3 rounded-full bg-zinc-800" />
                  {/* 口 */}
                  <div className="absolute top-17 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-full bg-rose-300" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-400">
            私服で撮影
          </div>
        </div>
      </div>

      {/* 矢印 */}
      <div className="z-20 flex shrink-0 items-center justify-center sm:mx-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 sm:h-16 sm:w-16">
          <svg
            className="h-6 w-6 text-white sm:h-7 sm:w-7 rotate-90 sm:rotate-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>

      {/* After */}
      <div className="group relative z-10 w-52 shrink-0 sm:w-56">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 opacity-30 blur-md transition-all group-hover:opacity-50" />
        <div className="relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-lg ring-1 ring-blue-500/10">
          {/* 証明写真モック */}
          <div className="relative aspect-[3/4] bg-gradient-to-b from-sky-50 to-white">
            {/* クリーンな背景 */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white" />
            {/* 人物シルエット */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <div className="relative">
                {/* スーツ */}
                <div className="absolute -bottom-4 left-1/2 h-20 w-28 -translate-x-1/2 rounded-t-3xl bg-gradient-to-b from-zinc-700 to-zinc-800">
                  {/* ラペル */}
                  <div className="absolute top-2 left-3 h-10 w-4 -rotate-12 bg-zinc-600/50" />
                  <div className="absolute top-2 right-3 h-10 w-4 rotate-12 bg-zinc-600/50" />
                  {/* シャツ */}
                  <div className="absolute top-0 left-1/2 h-8 w-6 -translate-x-1/2 bg-white" />
                </div>
                {/* 首 */}
                <div className="absolute -bottom-1 left-1/2 h-5 w-6 -translate-x-1/2 rounded-sm bg-gradient-to-b from-amber-200 to-amber-300" />
                {/* 頭 */}
                <div className="relative mx-auto h-24 w-20 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 shadow-inner">
                  {/* 髪 */}
                  <div className="absolute -top-1 inset-x-0 h-12 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-700" />
                  {/* 目 */}
                  <div className="absolute top-12 left-4 h-2 w-3 rounded-full bg-zinc-800" />
                  <div className="absolute top-12 right-4 h-2 w-3 rounded-full bg-zinc-800" />
                  {/* 口 */}
                  <div className="absolute top-17 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-full bg-rose-300" />
                </div>
              </div>
            </div>
            {/* 規格ガイド線 */}
            <div className="absolute inset-4 rounded border border-dashed border-blue-300/40" />
          </div>
          <div className="bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-blue-600">
            AI加工後 ✓
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── メインページ ──────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-zinc-100/80 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
              S
            </div>
            <span className="text-base font-bold tracking-tight">
              {serviceName}
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <a
              href="#features"
              className="hidden rounded-lg px-3 py-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 sm:inline-block"
            >
              機能
            </a>
            <a
              href="#pricing"
              className="hidden rounded-lg px-3 py-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 sm:inline-block"
            >
              料金
            </a>
            <Link
              href="/app"
              className="ml-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              無料で試す
            </Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-50/80 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          {/* バッジ */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
              登録不要・無料で使えます
            </div>
          </div>

          <h1 className="mx-auto max-w-3xl text-center text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            スマホで撮って、
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
              AIが証明写真に仕上げます
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-zinc-500 sm:text-lg">
            写真館に行かなくても、コンビニで印刷しなくても。
            <br className="hidden sm:inline" />
            スマホひとつで証明写真が完成します。
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/app"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              無料で証明写真を作る
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-base font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]"
            >
              使い方を見る
            </a>
          </div>

          {/* 信頼バッジ */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 text-sm text-zinc-400"
              >
                <span className="text-base">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          {/* ビフォーアフター */}
          <BeforeAfterMock />
        </div>
      </section>

      {/* 使い方 */}
      <section
        id="how-it-works"
        className="relative border-t border-zinc-100 bg-zinc-50/70"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              かんたん3ステップ
            </h2>
          </div>

          <div className="relative mt-16 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {/* コネクター線 */}
            <div className="pointer-events-none absolute top-10 hidden h-px w-full sm:block">
              <div className="mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
            </div>

            {steps.map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
                    {s.step}
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 機能 */}
      <section id="features" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              主な機能
            </h2>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-7 transition-all hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50"
              >
                {/* アクセントグラデーション */}
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${f.accent} opacity-[0.07] transition-all group-hover:opacity-[0.12] group-hover:scale-150`}
                />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-2xl">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 対応サイズ */}
      <section className="border-t border-zinc-100 bg-zinc-50/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Sizes
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              対応サイズ
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-lg gap-3">
            {sizes.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white px-5 py-3.5 transition-all hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-800">{s.name}</span>
                  {s.popular && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      人気
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm text-zinc-400">
                  {s.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section id="pricing" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              料金プラン
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2">
            {/* 無料プラン */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <h3 className="text-lg font-bold text-zinc-800">無料プラン</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold tracking-tight">
                  ¥0
                </span>
              </p>
              <p className="mt-1 text-sm text-zinc-400">ずっと無料</p>
              <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  背景色の変更
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  自動トリミング
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  各種サイズに対応
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  透かし付きプレビュー
                </li>
              </ul>
              <Link
                href="/app"
                className="mt-8 block rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-center text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-100"
              >
                無料で始める
              </Link>
            </div>

            {/* プレミアムプラン */}
            <div className="relative rounded-2xl border-2 border-blue-500/80 bg-white p-8 shadow-xl shadow-blue-500/10">
              {/* おすすめバッジ */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-bold text-white shadow-md shadow-blue-500/30">
                  おすすめ
                </span>
              </div>

              <h3 className="text-lg font-bold text-blue-600">プレミアム</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold tracking-tight">
                  ¥300
                </span>
                <span className="ml-1 text-sm font-normal text-zinc-400">
                  / 枚
                </span>
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                必要なときだけ
              </p>
              <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  無料プランの全機能
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-semibold text-zinc-800">
                    AIスーツ着せ替え
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-semibold text-zinc-800">
                    高解像度ダウンロード
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-semibold text-zinc-800">
                    透かしなし
                  </span>
                </li>
              </ul>
              <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/35">
                近日公開
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            今すぐ証明写真を作りましょう
          </h2>
          <p className="mt-4 text-base text-blue-200">
            登録不要・無料で始められます
          </p>
          <Link
            href="/app"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl active:scale-[0.98]"
          >
            無料で証明写真を作る
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                S
              </div>
              <span className="text-sm font-semibold">{serviceName}</span>
            </div>
            <p className="text-xs text-zinc-400">
              &copy; 2026 {serviceName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

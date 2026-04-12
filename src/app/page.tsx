import Link from "next/link";
import { LegalLinks } from "@/components/LegalLinks";
import { WaitlistForm } from "@/components/WaitlistForm";
import { serviceName } from "../lib/brand";

const benefits = [
  "機能追加や改善の案内を受け取れる",
  "無料β版の更新情報をすぐ確認できる",
  "AIスーツ着せ替えの提供開始もまとめて受け取れる",
];

const features = [
  {
    title: "スマホで撮るだけ",
    description:
      "専用アプリなし。ブラウザから撮影して、そのまま証明写真用に整えます。",
    icon: "📱",
    accent: "from-sky-400 to-blue-500",
  },
  {
    title: "AIで規格に合わせる",
    description:
      "顔位置の調整、背景の白化、サイズ合わせを自動で進める想定です。",
    icon: "✨",
    accent: "from-violet-400 to-indigo-500",
  },
  {
    title: "私服から整える",
    description:
      "将来的に AI スーツ着せ替えへ対応し、就活や転職でも使いやすくします。",
    icon: "👔",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    title: "自宅でやり直せる",
    description:
      "写真館に行かずに、納得いくまで撮り直して仕上がりを確認できます。",
    icon: "🏠",
    accent: "from-amber-400 to-orange-500",
  },
];

const steps = [
  {
    step: "1",
    title: "スマホで撮影",
    description: "明るい場所で正面から撮るだけ。特別な機材は不要です。",
  },
  {
    step: "2",
    title: "AIで整える",
    description: "背景、トリミング、サイズ調整をブラウザで完結させます。",
  },
  {
    step: "3",
    title: "印刷用に出力",
    description: "履歴書やパスポートに使いやすいデータとして保存できます。",
  },
];

const sizes = [
  { name: "パスポート", size: "35×45mm", popular: true },
  { name: "履歴書", size: "30×40mm", popular: true },
  { name: "マイナンバーカード", size: "35×45mm", popular: false },
  { name: "運転免許証", size: "24×30mm", popular: false },
  { name: "米国ビザ", size: "51×51mm", popular: false },
];

const trustBadges = [
  { label: "スマホ完結", icon: "📱" },
  { label: "自宅で撮り直し", icon: "🔁" },
  { label: "就活にも対応予定", icon: "💼" },
  { label: "無料β公開中", icon: "🚀" },
];

const freePlanItems = [
  "背景色の変更",
  "自動トリミング",
  "各種サイズ対応",
  "コンビニ印刷向けレイアウト",
];

const premiumPlanItems = [
  "無料公開機能の全て",
  "AIスーツ着せ替え",
  "高解像度ダウンロード",
  "透かしなしの出力",
];

const faqItems = [
  {
    question: "どんな用途を想定していますか？",
    answer:
      "履歴書、就活、転職、パスポート、マイナンバーカードなどの証明写真用途を想定しています。",
  },
  {
    question: "私服で撮っても使えますか？",
    answer:
      "はい。無料範囲では背景変更とサイズ調整、有料機能では AI スーツ着せ替えを想定しています。",
  },
  {
    question: "提出先で AI 加工が禁止されている場合は？",
    answer:
      "提出先のルールを必ず確認してください。本人確認を妨げる過度な加工は想定していません。",
  },
];

function CheckIcon({ accent = "text-zinc-400" }: { accent?: string }) {
  return (
    <svg
      className={`mt-0.5 h-4 w-4 shrink-0 ${accent}`}
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
  );
}

function BeforeAfterMock() {
  return (
    <div className="relative mx-auto mt-16 flex w-full max-w-2xl flex-col items-center gap-6 sm:flex-row sm:gap-0">
      <div className="group relative z-10 w-52 shrink-0 sm:w-56">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-zinc-300 to-zinc-400 opacity-30 blur-md transition-all group-hover:opacity-50" />
        <div className="relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-lg">
          <div className="relative aspect-[3/4] bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-sky-100 to-sky-50" />
            <div className="absolute bottom-0 left-2 h-2/5 w-6 rounded-t-sm bg-amber-200/60" />
            <div className="absolute bottom-0 right-3 h-1/3 w-8 rounded-t-sm bg-amber-200/40" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <div className="relative">
                <div className="absolute -bottom-4 left-1/2 h-20 w-28 -translate-x-1/2 rounded-t-3xl bg-gradient-to-b from-rose-400 to-rose-500" />
                <div className="absolute -bottom-1 left-1/2 h-5 w-6 -translate-x-1/2 rounded-sm bg-gradient-to-b from-amber-200 to-amber-300" />
                <div className="relative mx-auto h-24 w-20 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 shadow-inner">
                  <div className="absolute inset-x-0 -top-1 h-12 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-700" />
                  <div className="absolute left-4 top-12 h-2 w-3 rounded-full bg-zinc-800" />
                  <div className="absolute right-4 top-12 h-2 w-3 rounded-full bg-zinc-800" />
                  <div className="absolute left-1/2 top-17 h-1.5 w-4 -translate-x-1/2 rounded-full bg-rose-300" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-400">
            私服で撮影
          </div>
        </div>
      </div>

      <div className="z-20 flex shrink-0 items-center justify-center sm:mx-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 sm:h-16 sm:w-16">
          <svg
            className="h-6 w-6 rotate-90 text-white sm:h-7 sm:w-7 sm:rotate-0"
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

      <div className="group relative z-10 w-52 shrink-0 sm:w-56">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 opacity-30 blur-md transition-all group-hover:opacity-50" />
        <div className="relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-lg ring-1 ring-blue-500/10">
          <div className="relative aspect-[3/4] bg-gradient-to-b from-sky-50 to-white">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <div className="relative">
                <div className="absolute -bottom-4 left-1/2 h-20 w-28 -translate-x-1/2 rounded-t-3xl bg-gradient-to-b from-zinc-700 to-zinc-800">
                  <div className="absolute left-3 top-2 h-10 w-4 -rotate-12 bg-zinc-600/50" />
                  <div className="absolute right-3 top-2 h-10 w-4 rotate-12 bg-zinc-600/50" />
                  <div className="absolute left-1/2 top-0 h-8 w-6 -translate-x-1/2 bg-white" />
                </div>
                <div className="absolute -bottom-1 left-1/2 h-5 w-6 -translate-x-1/2 rounded-sm bg-gradient-to-b from-amber-200 to-amber-300" />
                <div className="relative mx-auto h-24 w-20 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 shadow-inner">
                  <div className="absolute inset-x-0 -top-1 h-12 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-700" />
                  <div className="absolute left-4 top-12 h-2 w-3 rounded-full bg-zinc-800" />
                  <div className="absolute right-4 top-12 h-2 w-3 rounded-full bg-zinc-800" />
                  <div className="absolute left-1/2 top-17 h-1.5 w-4 -translate-x-1/2 rounded-full bg-rose-300" />
                </div>
              </div>
            </div>
            <div className="absolute inset-4 rounded border border-dashed border-blue-300/40" />
          </div>
          <div className="bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-blue-600">
            AIで証明写真化
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
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
            <Link
              href="/auth"
              className="hidden rounded-lg px-3 py-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 sm:inline-block"
            >
              ログイン
            </Link>
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
              公開予定
            </a>
            <Link
              href="/shoot"
              className="hidden rounded-lg px-3 py-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 sm:inline-block"
            >
              試してみる（β）
            </Link>
            <a
              href="#waitlist"
              className="ml-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              事前登録する
            </a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-50/80 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
              無料β公開中。ブラウザからそのまま試せます
            </div>
          </div>

          <h1 className="mx-auto max-w-4xl text-center text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            スマホで撮って、
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
              AIが証明写真に仕上げる
            </span>
            <br />
            Webサービスを無料β公開中です
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-zinc-500 sm:text-lg">
            写真館に行かず、私服の1枚から証明写真を整える体験を公開しています。
            <br className="hidden sm:inline" />
            今は無料β版で背景変更、サイズ調整、L版レイアウト保存まで試せます。登録しておくと AI スーツ着せ替えの開始も受け取れます。
          </p>

          <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-7 text-zinc-400">
            先行ユーザー向けの認証導線は
            {" "}
            <Link href="/auth" className="font-semibold text-blue-600 underline-offset-4 hover:underline">
              `/auth`
            </Link>
            {" "}
            で確認できます。
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/shoot"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              無料β版を試す
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

          <BeforeAfterMock />
        </div>
      </section>

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
              公開時に目指している体験
            </h2>
          </div>

          <div className="relative mt-16 grid gap-8 sm:grid-cols-3 sm:gap-6">
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

      <section id="features" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              価値として届けたいこと
            </h2>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-7 transition-all hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50"
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${feature.accent} opacity-[0.07] transition-all group-hover:scale-150 group-hover:opacity-[0.12]`}
                />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Sizes
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              想定している対応サイズ
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-lg gap-3">
            {sizes.map((size) => (
              <div
                key={size.name}
                className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white px-5 py-3.5 transition-all hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-800">{size.name}</span>
                  {size.popular ? (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      人気
                    </span>
                  ) : null}
                </div>
                <span className="font-mono text-sm text-zinc-400">
                  {size.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              シンプルな料金プラン
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
              証明写真の基本機能は無料。AI
              スーツ着せ替えは1回300円で今すぐご利用いただけます。
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <h3 className="text-lg font-bold text-zinc-800">無料β版</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold tracking-tight">
                  ¥0
                </span>
              </p>
              <p className="mt-1 text-sm text-zinc-400">現在利用可能</p>
              <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                {freePlanItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                className="mt-8 block rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-center text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-100"
              >
                更新通知を受け取る
              </a>
            </div>

            <div className="relative rounded-2xl border-2 border-blue-500/80 bg-white p-8 shadow-xl shadow-blue-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-bold text-white shadow-md shadow-blue-500/30">
                  NEW
                </span>
              </div>

              <h3 className="text-lg font-bold text-blue-600">プレミアム</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold tracking-tight">
                  ¥300
                </span>
                <span className="ml-1 text-sm font-normal text-zinc-400">
                  / 回
                </span>
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                AIスーツ着せ替え（24時間有効）
              </p>
              <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                {premiumPlanItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckIcon accent="text-blue-500" />
                    <span className="font-semibold text-zinc-800">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/shoot"
                className="mt-8 block rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/35"
              >
                今すぐ使う
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="border-t border-zinc-100 bg-zinc-950">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
              Waitlist
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              正式公開をメールで受け取る
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-zinc-300">
              無料β版はすでに使えます。機能追加や改善のお知らせをメールでも受け取れます。
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-7 text-zinc-200">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckIcon accent="text-blue-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/20 sm:p-8">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              よくある前提
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <h3 className="text-base font-bold text-zinc-900">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-500">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            写真館に行かずに、スマホで整える体験を作っています
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-blue-100">
            無料β版は現在公開中です。新機能の案内や AI スーツ着せ替えの開始を受け取りたい場合は登録してください。
          </p>
          <a
            href="#waitlist"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl active:scale-[0.98]"
          >
            事前登録する
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
          </a>
        </div>
      </section>

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
            <LegalLinks
              className="flex items-center gap-4 text-xs text-zinc-400"
              linkClassName="hover:text-zinc-600"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

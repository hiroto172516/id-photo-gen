import Link from "next/link";

const features = [
  {
    title: "スマホで撮影するだけ",
    description: "専用アプリ不要。ブラウザからそのまま撮影・アップロードできます。",
    icon: "📱",
  },
  {
    title: "AIが自動で仕上げ",
    description: "顔の位置を自動検出し、規格に合わせてトリミング。背景も自動で白に変更。",
    icon: "✨",
  },
  {
    title: "スーツ着せ替え",
    description: "私服で撮影OK。AIがスーツ姿に変換します。就活・転職写真にも対応。",
    icon: "👔",
  },
  {
    title: "各種サイズ対応",
    description: "パスポート・履歴書・マイナンバーカード・ビザなど各規格に対応。",
    icon: "📐",
  },
];

const steps = [
  { step: "1", title: "写真を撮影", description: "スマホで正面から撮影" },
  { step: "2", title: "AIが自動加工", description: "背景除去・トリミング" },
  { step: "3", title: "ダウンロード", description: "印刷用データを取得" },
];

const sizes = [
  { name: "パスポート", size: "35×45mm" },
  { name: "履歴書", size: "30×40mm" },
  { name: "マイナンバーカード", size: "35×45mm" },
  { name: "運転免許証", size: "24×30mm" },
  { name: "ビザ（米国）", size: "51×51mm" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">
            AI証明写真メーカー
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#features" className="text-zinc-600 hover:text-zinc-900">
              機能
            </a>
            <a href="#pricing" className="text-zinc-600 hover:text-zinc-900">
              料金
            </a>
            <Link
              href="/app"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              無料で試す
            </Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          スマホで撮って、
          <br />
          <span className="text-blue-600">AIが証明写真に仕上げます</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
          写真館に行かなくても、コンビニで印刷しなくても。
          <br />
          スマホひとつで証明写真が完成します。
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/app"
            className="rounded-full bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700"
          >
            無料で証明写真を作る
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-zinc-300 px-8 py-3 text-lg font-medium text-zinc-700 hover:bg-zinc-50"
          >
            使い方を見る
          </a>
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          登録不要・無料で背景変更とトリミングが使えます
        </p>
      </section>

      {/* 使い方 */}
      <section id="how-it-works" className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold">かんたん3ステップ</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-zinc-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 機能 */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold">主な機能</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-200 p-6"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-zinc-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 対応サイズ */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold">対応サイズ</h2>
          <div className="mx-auto mt-12 grid max-w-md gap-3">
            {sizes.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-3"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-zinc-500">{s.size}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-bold">料金プラン</h2>
          <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 p-8">
              <h3 className="text-xl font-bold">無料プラン</h3>
              <p className="mt-2 text-4xl font-bold">
                ¥0
              </p>
              <ul className="mt-6 space-y-3 text-left text-zinc-600">
                <li>- 背景色の変更</li>
                <li>- 自動トリミング</li>
                <li>- 各種サイズに対応</li>
                <li>- 透かし付きプレビュー</li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-blue-600 p-8">
              <h3 className="text-xl font-bold text-blue-600">プレミアム</h3>
              <p className="mt-2 text-4xl font-bold">
                ¥300<span className="text-base font-normal text-zinc-500">/枚</span>
              </p>
              <ul className="mt-6 space-y-3 text-left text-zinc-600">
                <li>- 無料プランの全機能</li>
                <li>- AIスーツ着せ替え</li>
                <li>- 高解像度ダウンロード</li>
                <li>- 透かしなし</li>
              </ul>
              <p className="mt-4 text-sm text-zinc-400">近日公開</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20 text-center text-white">
        <h2 className="text-3xl font-bold">今すぐ証明写真を作りましょう</h2>
        <p className="mt-4 text-blue-100">登録不要・無料で始められます</p>
        <Link
          href="/app"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-lg font-medium text-blue-600 hover:bg-blue-50"
        >
          無料で証明写真を作る
        </Link>
      </section>

      {/* フッター */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-zinc-400">
          <p>&copy; 2026 AI証明写真メーカー. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

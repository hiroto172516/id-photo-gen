import Link from "next/link";
import {
  serviceDescription,
  serviceName,
  serviceTagline,
  socialHandles,
  socialProfiles,
} from "../../lib/brand";

const platforms = [
  {
    name: "X",
    handle: socialHandles.x,
    bio: socialProfiles.shortBio,
    note: "固定投稿とLPリンクを設定して公開",
  },
  {
    name: "Instagram",
    handle: socialHandles.instagram,
    bio: socialProfiles.longBio,
    note: "プロフィール文を長めに設定し、リール導線を確保",
  },
  {
    name: "TikTok",
    handle: socialHandles.tiktok,
    bio: socialProfiles.tiktokBio,
    note: "短い自己紹介文にして動画投稿を優先",
  },
];

const checklist = [
  "表示名を「スマ撮り証明写真」に統一",
  "IDを @sumatori_id で揃える",
  "プロフィール画像は当面サービス名のテキストロゴで運用",
  "リンク先は LP https://app-six-ochre-65.vercel.app を設定",
  "初回固定投稿に開発中であることと提供予定機能を明記",
];

export default function SocialKitPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#eff6ff_100%)] text-slate-900">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Day1 Social Kit
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {serviceName} のSNS開設素材
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            {serviceTagline}
            <br />
            X / Instagram / TikTokの初期設定に必要な文面とチェックリストをまとめています。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              LPに戻る
            </Link>
            <a
              href="https://app-six-ochre-65.vercel.app"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              公開中のLPを開く
            </a>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {platforms.map((platform) => (
            <article
              key={platform.name}
              className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                {platform.name}
              </p>
              <h2 className="mt-3 text-2xl font-bold">{platform.handle}</h2>
              <p className="mt-5 text-sm font-semibold text-slate-500">プロフィール文</p>
              <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {platform.bio}
              </p>
              <p className="mt-5 text-sm font-semibold text-slate-500">設定メモ</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{platform.note}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Fixed Post
            </p>
            <h2 className="mt-3 text-2xl font-bold">固定投稿文</h2>
            <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-8 text-slate-700">
              {socialProfiles.pinnedPost}
            </p>
            <p className="mt-5 text-sm leading-7 text-slate-500">
              補足: プロフィールリンクにはLPを設定し、投稿末尾に「開発中」「近日公開」を入れると期待値を揃えやすいです。
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Checklist
            </p>
            <h2 className="mt-3 text-2xl font-bold">開設時チェック</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-slate-400">
              サービス説明:
              {" "}
              {serviceDescription}
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import {
  launchAnnouncementCopies,
  productHuntCopy,
  publicAppUrl,
  serviceDescription,
  serviceName,
  serviceTagline,
  socialHandles,
  socialProfiles,
  socialShareCopies,
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
  `リンク先は ${publicAppUrl}/shoot を設定`,
  "無料β公開中の文言と公開機能を固定投稿で明記",
];

export default function SocialKitPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#eff6ff_100%)] text-slate-900">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Day21 Launch Kit
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {serviceName} の公開運用素材
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            {serviceTagline}
            <br />
            X / Instagram / TikTok の公開告知文面、Product Hunt 投稿メモ、公開後の確認事項をまとめています。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              LPに戻る
            </Link>
            <a
              href={publicAppUrl}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              公開中の本番URLを開く
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
              補足: プロフィールリンクは `/shoot` へ寄せ、投稿末尾は「無料β公開中」で統一します。
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

        <section className="mt-10 rounded-3xl border border-blue-100 bg-blue-50/80 p-7 shadow-[0_20px_60px_rgba(59,130,246,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
            Release Copies
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">無料β公開の共有文面</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <article className="rounded-2xl bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">X 投稿案</p>
              <p className="mt-3 text-sm leading-8 text-slate-700">{launchAnnouncementCopies.x}</p>
            </article>
            <article className="rounded-2xl bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">Instagram 投稿案</p>
              <p className="mt-3 text-sm leading-8 text-slate-700">{launchAnnouncementCopies.instagram}</p>
            </article>
            <article className="rounded-2xl bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">TikTok 投稿案</p>
              <p className="mt-3 text-sm leading-8 text-slate-700">{launchAnnouncementCopies.tiktok}</p>
            </article>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Product Hunt
            </p>
            <h2 className="mt-3 text-2xl font-bold">投稿準備メモ</h2>
            <p className="mt-5 text-sm font-semibold text-slate-500">Tagline</p>
            <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {productHuntCopy.tagline}
            </p>
            <p className="mt-5 text-sm font-semibold text-slate-500">Short description</p>
            <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {productHuntCopy.shortDescription}
            </p>
            <p className="mt-5 text-sm font-semibold text-slate-500">First comment</p>
            <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {productHuntCopy.firstComment}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Search Console
            </p>
            <h2 className="mt-3 text-2xl font-bold">手動登録メモ</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <li>プロパティ URL: {publicAppUrl}</li>
              <li>送信する sitemap: {publicAppUrl}/sitemap.xml</li>
              <li>robots 確認: {publicAppUrl}/robots.txt</li>
              <li>優先登録ページ: `/`, `/shoot`, ブログ記事, `/terms`, `/privacy`</li>
            </ul>
            <p className="mt-6 text-sm leading-7 text-slate-400">
              詳細手順は repo ルートの `day21_launch_ops.md` に記録しています。
            </p>
          </article>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Legacy Copies
          </p>
          <h2 className="mt-3 text-2xl font-bold">途中経過の共有文面</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">X 投稿案</p>
              <p className="mt-3 text-sm leading-8 text-slate-700">{socialShareCopies.x}</p>
            </article>
            <article className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Instagram 投稿案</p>
              <p className="mt-3 text-sm leading-8 text-slate-700">{socialShareCopies.instagram}</p>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}

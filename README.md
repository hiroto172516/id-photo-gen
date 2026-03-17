# スマ撮り証明写真

Next.js / Remotionで構築している証明写真Webサービスのプロトタイプです。

## 開発開始

まず依存関係をインストールします。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開くとLPが表示されます。

## 主なページ

- `/` : ランディングページ
- `/auth` : メール認証 / Google OAuth の確認画面
- `/auth/callback` : 認証後のコールバック画面
- `/remotion/social-promo` : 15秒のSNS向けショート動画プレビュー
- `/social-kit` : X / Instagram / TikTok 用の初期設定素材まとめ

## ブランディング素材

- サービス名: `スマ撮り証明写真`
- SNSハンドル: `@sumatori_id`
- SNS文面: [../day1_social_setup.md](../day1_social_setup.md)

## デプロイ先

- 公開LP: `https://app-six-ochre-65.vercel.app`

## 追加の環境変数

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 を有効化する場合のみ設定

## 補足

- Day1のSNSタスクは、外部サービス上でのアカウント作成のみ手動対応が必要です。
- リポジトリ内の素材は `/social-kit` と `day1_social_setup.md` に集約しています。
- Day4 の認証設定手順は `../day4_auth_setup.md` に整理します。
- Day23〜25 のフィードバック保存は `app/supabase/feedback_entries.sql` を Supabase SQL Editor で手動適用する前提です。

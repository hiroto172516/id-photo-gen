-- AIスーツ着せ替えの決済履歴テーブル
-- Supabase Dashboard → SQL Editor で実行してください

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed' | 'failed'
  amount INTEGER NOT NULL DEFAULT 300,     -- 円
  expires_at TIMESTAMPTZ NOT NULL,         -- completed から24h後に自動設定
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: ユーザーは自分の支払いのみ参照可能
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- インデックス: ユーザーごとの有効な支払いを高速検索
CREATE INDEX IF NOT EXISTS payments_user_status_expires
  ON public.payments (user_id, status, expires_at);

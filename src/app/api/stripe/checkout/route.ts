import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripeServerClient } from '@/lib/stripe';

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripe || !priceId) {
    return NextResponse.json(
      { ok: false, message: 'Stripe が設定されていません。' },
      { status: 503 },
    );
  }

  // ユーザー認証確認
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!accessToken) {
    return NextResponse.json(
      { ok: false, message: 'ログインが必要です。' },
      { status: 401 },
    );
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: 'データベースが設定されていません。' },
      { status: 503 },
    );
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) {
    return NextResponse.json(
      { ok: false, message: 'ログインセッションが無効です。再度ログインしてください。' },
      { status: 401 },
    );
  }

  // すでに有効な決済があれば Checkout をスキップ
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (existingPayment) {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/shoot?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shoot?payment=cancelled`,
    payment_intent_data: {
      metadata: { user_id: user.id },
    },
    metadata: { user_id: user.id },
    locale: 'ja',
  });

  // pending レコードを挿入
  await supabase.from('payments').insert({
    user_id: user.id,
    stripe_session_id: session.id,
    status: 'pending',
    amount: 300,
    // pending 中は expires_at を一時的に遠い未来にセット（webhook で上書き）
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30分後（webhook前の仮値）
  });

  return NextResponse.json({ ok: true, url: session.url });
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripeServerClient } from '@/lib/stripe';
import type Stripe from 'stripe';

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!accessToken) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  // payments テーブルで completed レコードを確認
  const { data: payment } = await supabase
    .from('payments')
    .select('expires_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();

  if (payment) {
    return NextResponse.json({
      hasAccess: true,
      expiresAt: payment.expires_at as string,
    });
  }

  // Webhook 未着時のフォールバック:
  // ?session_id が渡された場合は Stripe に直接確認して payments を補完する
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (sessionId) {
    const stripe = getStripeServerClient();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (
          session.payment_status === 'paid' &&
          session.metadata?.user_id === user.id
        ) {
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          const paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null;

          // payments テーブルを補完（Webhook が後で届いても上書き可能なよう upsert）
          await supabase
            .from('payments')
            .upsert(
              {
                user_id: user.id,
                stripe_session_id: session.id,
                stripe_payment_intent_id: paymentIntentId,
                status: 'completed',
                amount: 300,
                expires_at: expiresAt,
              },
              { onConflict: 'stripe_session_id' },
            );

          return NextResponse.json({ hasAccess: true, expiresAt });
        }
      } catch {
        // Stripe API エラーは無視してアクセス拒否
      }
    }
  }

  return NextResponse.json({ hasAccess: false, expiresAt: null });
}

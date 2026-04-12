import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripeServerClient } from '@/lib/stripe';
import type Stripe from 'stripe';

// Next.js App Router では raw body が必要なため bodyParser を無効化
export const runtime = 'nodejs';

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ received: false }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (!userId || !session.id) {
      return NextResponse.json({ received: true });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ received: false }, { status: 503 });
    }

    // 決済完了: status を completed に更新し、24h のアクセス権を付与
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('payments')
      .update({
        status: 'completed',
        stripe_payment_intent_id: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
        expires_at: expiresAt,
      })
      .eq('stripe_session_id', session.id);
  }

  return NextResponse.json({ received: true });
}

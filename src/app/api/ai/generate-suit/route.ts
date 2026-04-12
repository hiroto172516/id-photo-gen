import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { consumeFixedWindowRateLimit, pruneExpiredRateLimitEntries } from '@/lib/rateLimit';
import { generateSuitPhoto } from '@/lib/geminiGeneration';

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyPayment(accessToken: string): Promise<boolean> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return false;

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return false;

  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  return Boolean(payment);
}

const MAX_BASE64_LENGTH = Math.ceil((5 * 1024 * 1024 * 4) / 3);

const requestSchema = z.object({
  imageBase64: z.string().min(1).max(MAX_BASE64_LENGTH, '画像データが大きすぎます（5MB上限）'),
  imageMimeType: z.enum(['image/jpeg', 'image/png']),
  gender: z.enum(['male', 'female']),
  suitColor: z.enum(['black', 'navy', 'gray']),
  innerColor: z.enum(['white-shirt', 'white-blouse']),
});

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(',');
    if (firstIp?.trim()) {
      return firstIp.trim();
    }
  }

  return request.headers.get('cf-connecting-ip') ?? request.headers.get('x-real-ip') ?? 'anonymous';
}

export async function POST(request: Request) {
  // 決済チェック（Supabase が設定されている場合のみ強制）
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, message: 'ログインが必要です。', code: 'unauthorized' },
        { status: 401 },
      );
    }

    const paid = await verifyPayment(accessToken);
    if (!paid) {
      return NextResponse.json(
        {
          ok: false,
          message: 'AIスーツ着せ替えには決済が必要です。',
          code: 'payment_required',
        },
        { status: 402 },
      );
    }
  }

  pruneExpiredRateLimitEntries();

  const rateLimit = consumeFixedWindowRateLimit({
    key: `ai-generate-suit:${getClientIp(request)}`,
    limit: 3,
    windowMs: 60000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: '短時間にリクエストが集中しています。しばらく待ってから再度お試しください。',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
        },
      }
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? 'リクエストの形式が正しくありません。',
      },
      { status: 400 }
    );
  }

  const result = await generateSuitPhoto(parsed.data);

  if (result.ok) {
    return NextResponse.json(
      {
        ok: true,
        imageBase64: result.imageBase64,
        imageMimeType: result.imageMimeType,
        qualityScore: result.qualityScore,
      },
      { status: 200 }
    );
  }

  if (result.reason === 'unconfigured') {
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
      },
      { status: 503 }
    );
  }

  if (result.reason === 'content_filtered' || result.reason === 'quality_rejected') {
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
      },
      { status: 422 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message: result.message,
    },
    { status: 500 }
  );
}

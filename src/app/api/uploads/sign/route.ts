import { NextResponse } from 'next/server';
import {
  createSignedUploadTarget,
  isStorageConfigured,
} from '@/lib/storage';
import { consumeFixedWindowRateLimit, pruneExpiredRateLimitEntries } from '@/lib/rateLimit';
import {
  getUploadExpiryDate,
  getUploadRateLimitMaxRequests,
  getUploadRateLimitWindowMs,
  validateSignedUploadRequest,
} from '@/lib/uploadPolicy';

function getClientIp(request: Request) {
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
  pruneExpiredRateLimitEntries();

  const rateLimit = consumeFixedWindowRateLimit({
    key: `upload-sign:${getClientIp(request)}`,
    limit: getUploadRateLimitMaxRequests(),
    windowMs: getUploadRateLimitWindowMs(),
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
  const parsed = validateSignedUploadRequest(body);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.message,
      },
      { status: 400 }
    );
  }

  const expiresAt = getUploadExpiryDate();
  const result = await createSignedUploadTarget(expiresAt).catch(() => ({
    ok: false as const,
    status: 'failed' as const,
    message: 'アップロードURLの発行に失敗しました。',
  }));

  if (result.ok) {
    return NextResponse.json(
      {
        ok: true,
        bucket: result.bucket,
        objectPath: result.objectPath,
        path: result.path,
        token: result.token,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 }
    );
  }

  const status =
    process.env.NODE_ENV === 'production' && !isStorageConfigured()
      ? 503
      : result.status === 'unconfigured'
        ? 503
        : 500;

  return NextResponse.json(
    {
      ok: false,
      message: result.message,
    },
    { status }
  );
}

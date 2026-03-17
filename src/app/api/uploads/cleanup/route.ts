import { NextResponse } from 'next/server';
import { deleteExpiredUploadObjects, isStorageConfigured } from '@/lib/storage';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'クリーンアップ実行権限がありません。',
      },
      { status: 401 }
    );
  }

  const result = await deleteExpiredUploadObjects().catch(() => ({
    ok: false as const,
    status: 'failed' as const,
    message: '期限切れ画像のクリーンアップに失敗しました。',
  }));

  if (result.ok) {
    return NextResponse.json(
      {
        ok: true,
        deletedCount: result.deletedCount,
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

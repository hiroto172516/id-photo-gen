import { NextResponse } from 'next/server';
import {
  createSignedUploadTarget,
  getAllowedUploadMimeTypes,
  getMaxUploadFileSize,
  isStorageConfigured,
} from '@/lib/storage';

type UploadSignInput = {
  mimeType?: unknown;
  fileSize?: unknown;
};

function parseUploadSignInput(input: UploadSignInput) {
  const mimeType = typeof input.mimeType === 'string' ? input.mimeType.trim() : '';
  const fileSize = typeof input.fileSize === 'number' ? input.fileSize : Number(input.fileSize);

  if (!mimeType) {
    return {
      ok: false as const,
      message: 'ファイル形式を指定してください。',
    };
  }

  if (!getAllowedUploadMimeTypes().includes(mimeType as 'image/jpeg')) {
    return {
      ok: false as const,
      message: 'JPEG 形式の画像のみアップロードできます。',
    };
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > getMaxUploadFileSize()) {
    return {
      ok: false as const,
      message: 'アップロードする画像サイズが不正です。',
    };
  }

  return {
    ok: true as const,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as UploadSignInput | null;
  const parsed = parseUploadSignInput(body ?? {});

  if (!parsed.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.message,
      },
      { status: 400 }
    );
  }

  const result = await createSignedUploadTarget().catch(() => ({
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

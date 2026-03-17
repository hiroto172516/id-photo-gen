import { z } from 'zod';

const DEFAULT_STORAGE_BUCKET = 'uploads';
const DEFAULT_UPLOAD_TTL_HOURS = 24;
const DEFAULT_UPLOAD_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_UPLOAD_RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024;
const TEMP_UPLOAD_PREFIX = 'temporary';
const ALLOWED_UPLOAD_MIME_TYPES = ['image/jpeg'] as const;
const ALLOWED_SOURCE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const signedUploadRequestSchema = z.object({
  mimeType: z.enum(ALLOWED_UPLOAD_MIME_TYPES, {
    error: () => ({ message: 'JPEG 形式の画像のみアップロードできます。' }),
  }),
  fileSize: z
    .number({ error: () => ({ message: 'アップロードする画像サイズが不正です。' }) })
    .finite('アップロードする画像サイズが不正です。')
    .positive('アップロードする画像サイズが不正です。')
    .max(MAX_UPLOAD_FILE_SIZE, 'ファイルサイズは10MB以下にしてください。'),
});

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getStorageBucketDefaultName() {
  return DEFAULT_STORAGE_BUCKET;
}

export function getAllowedUploadMimeTypes() {
  return [...ALLOWED_UPLOAD_MIME_TYPES];
}

export function getAllowedSourceImageTypes() {
  return [...ALLOWED_SOURCE_IMAGE_TYPES];
}

export function getMaxUploadFileSize() {
  return MAX_UPLOAD_FILE_SIZE;
}

export function getTemporaryUploadPrefix() {
  return TEMP_UPLOAD_PREFIX;
}

export function getUploadTtlHours() {
  return parsePositiveInt(process.env.UPLOAD_TTL_HOURS, DEFAULT_UPLOAD_TTL_HOURS);
}

export function getUploadTtlMs() {
  return getUploadTtlHours() * 60 * 60 * 1000;
}

export function getUploadRateLimitWindowMs() {
  return parsePositiveInt(
    process.env.UPLOAD_RATE_LIMIT_WINDOW_MS,
    DEFAULT_UPLOAD_RATE_LIMIT_WINDOW_MS
  );
}

export function getUploadRateLimitMaxRequests() {
  return parsePositiveInt(
    process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS,
    DEFAULT_UPLOAD_RATE_LIMIT_MAX_REQUESTS
  );
}

export function getUploadExpiryDate(now = new Date()) {
  return new Date(now.getTime() + getUploadTtlMs());
}

export function buildTemporaryUploadObjectPath(expiresAt: Date) {
  const expiresAtUnix = Math.floor(expiresAt.getTime() / 1000);
  return `${TEMP_UPLOAD_PREFIX}/exp-${expiresAtUnix}-${crypto.randomUUID()}.jpg`;
}

export function getObjectExpiryDateFromPath(objectPath: string) {
  const prefix = `${TEMP_UPLOAD_PREFIX}/exp-`;

  if (!objectPath.startsWith(prefix)) {
    return null;
  }

  const fileName = objectPath.slice(prefix.length);
  const [expiresAtUnix] = fileName.split('-', 1);
  const parsed = Number.parseInt(expiresAtUnix, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return new Date(parsed * 1000);
}

export function validateSignedUploadRequest(input: unknown) {
  const parsed = signedUploadRequestSchema.safeParse({
    mimeType:
      typeof (input as { mimeType?: unknown } | null)?.mimeType === 'string'
        ? (input as { mimeType: string }).mimeType.trim()
        : '',
    fileSize:
      typeof (input as { fileSize?: unknown } | null)?.fileSize === 'number'
        ? (input as { fileSize: number }).fileSize
        : Number((input as { fileSize?: unknown } | null)?.fileSize),
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? 'アップロード条件の検証に失敗しました。',
    };
  }

  return {
    ok: true as const,
    value: parsed.data,
  };
}

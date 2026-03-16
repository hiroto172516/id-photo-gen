import { createClient } from '@supabase/supabase-js';

const DEFAULT_STORAGE_BUCKET = 'uploads';
const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg'] as const;

type StorageEnv = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
};

let ensureBucketPromise: Promise<void> | null = null;

function getStorageEnv(): StorageEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_STORAGE_BUCKET;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url,
    serviceRoleKey,
    bucket,
  };
}

function createStorageAdminClient(env: StorageEnv) {
  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function createObjectPath() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');

  return `${year}/${month}/${crypto.randomUUID()}.jpg`;
}

async function ensureBucketExists(env: StorageEnv) {
  if (ensureBucketPromise) {
    return ensureBucketPromise;
  }

  ensureBucketPromise = (async () => {
    const client = createStorageAdminClient(env);
    const { data, error } = await client.storage.listBuckets();

    if (error) {
      throw new Error('ストレージバケット一覧の取得に失敗しました');
    }

    const bucketExists = data.some((bucket) => bucket.id === env.bucket);

    if (bucketExists) {
      return;
    }

    const { error: createError } = await client.storage.createBucket(env.bucket, {
      public: false,
      allowedMimeTypes: [...ALLOWED_MIME_TYPES],
      fileSizeLimit: MAX_UPLOAD_FILE_SIZE,
    });

    if (createError) {
      throw new Error('ストレージバケットの作成に失敗しました');
    }
  })().catch((error) => {
    ensureBucketPromise = null;
    throw error;
  });

  return ensureBucketPromise;
}

export function isStorageConfigured() {
  return Boolean(getStorageEnv());
}

export function getStorageBucketName() {
  return getStorageEnv()?.bucket ?? DEFAULT_STORAGE_BUCKET;
}

export function getAllowedUploadMimeTypes() {
  return [...ALLOWED_MIME_TYPES];
}

export function getMaxUploadFileSize() {
  return MAX_UPLOAD_FILE_SIZE;
}

export async function createSignedUploadTarget() {
  const env = getStorageEnv();

  if (!env) {
    return {
      ok: false as const,
      status: 'unconfigured' as const,
      message: 'ストレージ設定が未完了のため、アップロードを開始できません。',
    };
  }

  await ensureBucketExists(env);

  const objectPath = createObjectPath();
  const client = createStorageAdminClient(env);
  const { data, error } = await client.storage
    .from(env.bucket)
    .createSignedUploadUrl(objectPath, {
      upsert: false,
    });

  if (error || !data) {
    return {
      ok: false as const,
      status: 'failed' as const,
      message: 'アップロードURLの発行に失敗しました。',
    };
  }

  return {
    ok: true as const,
    bucket: env.bucket,
    objectPath,
    token: data.token,
    path: data.path,
  };
}

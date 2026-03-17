import { createClient } from '@supabase/supabase-js';
import {
  buildTemporaryUploadObjectPath,
  getAllowedUploadMimeTypes,
  getMaxUploadFileSize,
  getObjectExpiryDateFromPath,
  getStorageBucketDefaultName,
  getTemporaryUploadPrefix,
} from '@/lib/uploadPolicy';

type StorageEnv = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
};

let ensureBucketPromise: Promise<void> | null = null;

function getStorageEnv(): StorageEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || getStorageBucketDefaultName();

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
      allowedMimeTypes: getAllowedUploadMimeTypes(),
      fileSizeLimit: getMaxUploadFileSize(),
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
  return getStorageEnv()?.bucket ?? getStorageBucketDefaultName();
}

export async function createSignedUploadTarget(expiresAt: Date) {
  const env = getStorageEnv();

  if (!env) {
    return {
      ok: false as const,
      status: 'unconfigured' as const,
      message: 'ストレージ設定が未完了のため、アップロードを開始できません。',
    };
  }

  await ensureBucketExists(env);

  const objectPath = buildTemporaryUploadObjectPath(expiresAt);
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

export async function deleteExpiredUploadObjects(before = new Date()) {
  const env = getStorageEnv();

  if (!env) {
    return {
      ok: false as const,
      status: 'unconfigured' as const,
      message: 'ストレージ設定が未完了のため、期限切れ画像を削除できません。',
    };
  }

  await ensureBucketExists(env);

  const client = createStorageAdminClient(env);
  const prefix = getTemporaryUploadPrefix();
  const expiredObjectPaths: string[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await client.storage.from(env.bucket).list(prefix, {
      limit,
      offset,
      sortBy: {
        column: 'name',
        order: 'asc',
      },
    });

    if (error) {
      return {
        ok: false as const,
        status: 'failed' as const,
        message: '期限切れ画像一覧の取得に失敗しました。',
      };
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      if (!item.name || item.id === null) {
        continue;
      }

      const objectPath = `${prefix}/${item.name}`;
      const expiresAt = getObjectExpiryDateFromPath(objectPath);

      if (expiresAt && expiresAt <= before) {
        expiredObjectPaths.push(objectPath);
      }
    }

    if (data.length < limit) {
      break;
    }

    offset += data.length;
  }

  if (expiredObjectPaths.length === 0) {
    return {
      ok: true as const,
      deletedCount: 0,
    };
  }

  const { error } = await client.storage.from(env.bucket).remove(expiredObjectPaths);

  if (error) {
    return {
      ok: false as const,
      status: 'failed' as const,
      message: '期限切れ画像の削除に失敗しました。',
    };
  }

  return {
    ok: true as const,
    deletedCount: expiredObjectPaths.length,
  };
}

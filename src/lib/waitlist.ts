import { z } from "zod";

const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "メールアドレスを入力してください。")
    .email("メールアドレスの形式が正しくありません。"),
});

type WaitlistSuccess =
  | {
      ok: true;
      status: "created";
      message: "事前登録ありがとうございます。公開時にご連絡します。";
    }
  | {
      ok: true;
      status: "exists";
      message: "すでに登録済みです。公開時にご連絡します。";
    };

type WaitlistError = {
  ok: false;
  message: string;
  fieldErrors?: {
    email?: string[];
  };
};

export type WaitlistResult = WaitlistSuccess | WaitlistError;

const createdMessage =
  "事前登録ありがとうございます。公開時にご連絡します。" as const;
const existsMessage =
  "すでに登録済みです。公開時にご連絡します。" as const;

export function parseWaitlistInput(input: unknown) {
  return waitlistSchema.safeParse(input);
}

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url,
    serviceRoleKey,
  };
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseEnv());
}

function isDuplicateError(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const maybeCode = "code" in payload ? payload.code : undefined;
  const maybeMessage = "message" in payload ? payload.message : undefined;

  return (
    maybeCode === "23505" ||
    (typeof maybeMessage === "string" && maybeMessage.includes("duplicate"))
  );
}

async function saveWaitlistEntryToSupabase(email: string) {
  const env = getSupabaseEnv();

  if (!env) {
    return {
      kind: "unconfigured" as const,
    };
  }

  const lookupResponse = await fetch(
    `${env.url}/rest/v1/waitlist_subscribers?select=email&email=eq.${encodeURIComponent(
      email,
    )}&limit=1`,
    {
      method: "GET",
      headers: {
        apikey: env.serviceRoleKey,
        Authorization: `Bearer ${env.serviceRoleKey}`,
      },
      cache: "no-store",
    },
  );

  if (!lookupResponse.ok) {
    return {
      kind: "failed" as const,
      message: "事前登録の確認に失敗しました。",
    };
  }

  const existingEntries = (await lookupResponse.json().catch(() => [])) as Array<{
    email: string;
  }>;

  if (existingEntries.length > 0) {
    return {
      kind: "exists" as const,
    };
  }

  const response = await fetch(
    `${env.url}/rest/v1/waitlist_subscribers`,
    {
      method: "POST",
      headers: {
        apikey: env.serviceRoleKey,
        Authorization: `Bearer ${env.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        {
          email,
          source: "lp_day3",
        },
      ]),
    },
  );

  if (response.ok) {
    return {
      kind: "created" as const,
    };
  }

  const errorPayload = await response.json().catch(() => null);

  if (isDuplicateError(errorPayload)) {
    return {
      kind: "exists" as const,
    };
  }

  return {
    kind: "failed" as const,
    message: "保存処理に失敗しました。",
  };
}

export async function saveWaitlistEntry(email: string): Promise<WaitlistResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const env = getSupabaseEnv();

  if (!env) {
    if (process.env.NODE_ENV === "development") {
      return {
        ok: true,
        status: "created",
        message: createdMessage,
      };
    }

    return {
      ok: false,
      message:
        "現在は受付準備中です。Supabase 設定後に登録できるようになります。",
    };
  }

  const result = await saveWaitlistEntryToSupabase(normalizedEmail);

  if (result.kind === "created") {
    return {
      ok: true,
      status: "created",
      message: createdMessage,
    };
  }

  if (result.kind === "exists") {
    return {
      ok: true,
      status: "exists",
      message: existsMessage,
    };
  }

  if (result.kind === "unconfigured") {
    return {
      ok: false,
      message:
        "現在は受付準備中です。Supabase 設定後に登録できるようになります。",
    };
  }

  return {
    ok: false,
    message: result.message,
  };
}

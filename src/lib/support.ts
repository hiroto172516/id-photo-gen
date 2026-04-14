import { z } from "zod";

export const supportCategories = [
  { id: "general", label: "一般的な問い合わせ" },
  { id: "payment_error", label: "決済エラー" },
  { id: "refund_request", label: "返金相談" },
  { id: "account", label: "ログイン・アカウント" },
  { id: "privacy", label: "個人情報・削除依頼" },
  { id: "bug", label: "不具合報告" },
] as const;

export type SupportCategory = (typeof supportCategories)[number]["id"];

export const supportCategoryValues = supportCategories.map((category) => category.id);

const supportSchema = z
  .object({
    category: z.enum(supportCategoryValues as [SupportCategory, ...SupportCategory[]], {
      error: "カテゴリを選択してください。",
    }),
    email: z
      .string()
      .trim()
      .min(1, "メールアドレスを入力してください。")
      .max(320, "メールアドレスが長すぎます。")
      .refine((value) => z.email().safeParse(value).success, {
        message: "メールアドレスの形式が正しくありません。",
      }),
    message: z
      .string()
      .trim()
      .min(20, "問い合わせ内容は20文字以上で入力してください。")
      .max(2000, "問い合わせ内容は2000文字以内で入力してください。"),
    pagePath: z.string().trim().min(1).max(200),
    stripeSessionId: z.string().trim().max(200).optional(),
    paymentIntentId: z.string().trim().max(200).optional(),
    userId: z.string().trim().max(200).optional(),
  })
  .superRefine((input, ctx) => {
    if (
      (input.category === "payment_error" || input.category === "refund_request") &&
      !input.stripeSessionId &&
      !input.paymentIntentId
    ) {
      ctx.addIssue({
        code: "custom",
        message: "決済トラブル時はセッションIDまたは決済IDを入力してください。",
        path: ["stripeSessionId"],
      });
    }
  });

export type SupportInquiryInput = z.infer<typeof supportSchema>;

export type SupportInquiryResult =
  | {
      ok: true;
      status: "created";
      message: "お問い合わせを受け付けました。内容を確認のうえ、必要に応じてメールでご連絡します。";
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<keyof SupportInquiryInput, string[]>>;
    };

const createdMessage =
  "お問い合わせを受け付けました。内容を確認のうえ、必要に応じてメールでご連絡します。" as const;

export function parseSupportInquiryInput(input: unknown) {
  return supportSchema.safeParse(input);
}

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

export function isSupportInquiryConfigured() {
  return Boolean(getSupabaseEnv());
}

async function saveSupportInquiryToSupabase(input: SupportInquiryInput) {
  const env = getSupabaseEnv();

  if (!env) {
    return { kind: "unconfigured" as const };
  }

  const response = await fetch(`${env.url}/rest/v1/support_inquiries`, {
    method: "POST",
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify([
      {
        category: input.category,
        status: "open",
        email: input.email,
        message: input.message,
        page_path: input.pagePath,
        stripe_session_id: input.stripeSessionId || null,
        stripe_payment_intent_id: input.paymentIntentId || null,
        user_id: input.userId || null,
      },
    ]),
  });

  if (response.ok) {
    return { kind: "created" as const };
  }

  return {
    kind: "failed" as const,
    message: "お問い合わせの保存に失敗しました。",
  };
}

export async function saveSupportInquiry(
  input: SupportInquiryInput,
): Promise<SupportInquiryResult> {
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
      message: "現在は問い合わせ受付の準備中です。時間をおいて再度お試しください。",
    };
  }

  const result = await saveSupportInquiryToSupabase(input);

  if (result.kind === "created") {
    return {
      ok: true,
      status: "created",
      message: createdMessage,
    };
  }

  if (result.kind === "unconfigured") {
    return {
      ok: false,
      message: "現在は問い合わせ受付の準備中です。時間をおいて再度お試しください。",
    };
  }

  if (process.env.NODE_ENV === "development") {
    return {
      ok: true,
      status: "created",
      message: createdMessage,
    };
  }

  return {
    ok: false,
    message: result.message,
  };
}

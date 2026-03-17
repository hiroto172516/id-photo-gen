import { z } from "zod";

export const feedbackCategories = [
  { id: "bug", label: "不具合" },
  { id: "ux", label: "使いにくさ" },
  { id: "request", label: "ほしい機能" },
  { id: "quality", label: "仕上がり" },
  { id: "other", label: "その他" },
] as const;

export type FeedbackCategory = (typeof feedbackCategories)[number]["id"];

export const feedbackCategoryValues = feedbackCategories.map((category) => category.id);

const feedbackSchema = z.object({
  category: z.enum(feedbackCategoryValues as [FeedbackCategory, ...FeedbackCategory[]], {
    error: "カテゴリを選択してください。",
  }),
  rating: z
    .number({
      error: "満足度を選択してください。",
    })
    .int("満足度を選択してください。")
    .min(1, "満足度を選択してください。")
    .max(5, "満足度を選択してください。"),
  message: z
    .string()
    .trim()
    .min(10, "感想は10文字以上で入力してください。")
    .max(1000, "感想は1000文字以内で入力してください。"),
  email: z
    .string()
    .trim()
    .max(320, "メールアドレスが長すぎます。")
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value.length === 0 || z.email().safeParse(value).success, {
      message: "メールアドレスの形式が正しくありません。",
    }),
  page: z.string().trim().min(1).max(100),
  specId: z.string().trim().min(1).max(100),
  backgroundPresetId: z.string().trim().min(1).max(100),
  backgroundLabel: z.string().trim().min(1).max(100),
  faceDetected: z.boolean(),
  usedFallbacks: z.array(z.string().trim().min(1).max(100)).max(5),
  sourceKind: z.enum(["camera", "file"]),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export type FeedbackResult =
  | {
      ok: true;
      status: "created";
      message: "フィードバックありがとうございます。改善の参考にします。";
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<keyof FeedbackInput, string[]>>;
    };

const createdMessage =
  "フィードバックありがとうございます。改善の参考にします。" as const;

export function parseFeedbackInput(input: unknown) {
  return feedbackSchema.safeParse(input);
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

export function isFeedbackStorageConfigured() {
  return Boolean(getSupabaseEnv());
}

async function saveFeedbackEntryToSupabase(input: FeedbackInput) {
  const env = getSupabaseEnv();

  if (!env) {
    return {
      kind: "unconfigured" as const,
    };
  }

  const response = await fetch(`${env.url}/rest/v1/feedback_entries`, {
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
        rating: input.rating,
        message: input.message,
        email: input.email || null,
        page_path: input.page,
        spec_id: input.specId,
        background_preset_id: input.backgroundPresetId,
        background_label: input.backgroundLabel,
        face_detected: input.faceDetected,
        used_fallbacks: input.usedFallbacks,
        source_kind: input.sourceKind,
      },
    ]),
  });

  if (response.ok) {
    return {
      kind: "created" as const,
    };
  }

  return {
    kind: "failed" as const,
    message: "フィードバックの保存に失敗しました。",
  };
}

export async function saveFeedbackEntry(input: FeedbackInput): Promise<FeedbackResult> {
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
        "現在はフィードバック受付の準備中です。時間をおいて再度お試しください。",
    };
  }

  const result = await saveFeedbackEntryToSupabase(input);

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
      message:
        "現在はフィードバック受付の準備中です。時間をおいて再度お試しください。",
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

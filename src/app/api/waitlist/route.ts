import { NextResponse } from "next/server";
import {
  isSupabaseConfigured,
  parseWaitlistInput,
  saveWaitlistEntry,
} from "@/lib/waitlist";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseWaitlistInput(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "入力内容を確認してください。",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const result = await saveWaitlistEntry(parsed.data.email);

  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  const status =
    process.env.NODE_ENV === "production" && !isSupabaseConfigured()
      ? 503
      : 500;

  return NextResponse.json(result, { status });
}

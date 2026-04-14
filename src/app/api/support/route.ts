import { NextResponse } from "next/server";
import {
  isSupportInquiryConfigured,
  parseSupportInquiryInput,
  saveSupportInquiry,
} from "@/lib/support";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseSupportInquiryInput(body);

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

  const result = await saveSupportInquiry(parsed.data);

  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  const status =
    process.env.NODE_ENV === "production" && !isSupportInquiryConfigured() ? 503 : 500;

  return NextResponse.json(result, { status });
}

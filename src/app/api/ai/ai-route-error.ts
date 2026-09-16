import { NextResponse } from "next/server";
import { aiErrorHttpStatus, toAiServiceError } from "@/services/ai/ai-error";

export function aiRouteError(error: unknown) {
  const failure = toAiServiceError(error);
  console.error("[Arya AI] generation failed", { code: failure.code, upstreamStatus: failure.upstreamStatus, requestId: failure.requestId ?? undefined });
  return NextResponse.json({ error: failure.message, code: failure.code }, { status: aiErrorHttpStatus(failure) });
}

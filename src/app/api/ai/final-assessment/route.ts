import { NextResponse } from "next/server";
import { z } from "zod";
import { aiService } from "@/services/ai/ai-service";
import { aiRouteError } from "../ai-route-error";

const source = z.object({ chapterId: z.string().min(1), title: z.string().trim().min(1).max(250), text: z.string().trim().min(80).max(120_000) });
const schema = z.object({ kind: z.enum(["generalReview", "quickReview", "flashcards", "quiz"]), sources: z.array(source).min(1).max(100) }).superRefine((value, ctx) => {
  if (value.sources.reduce((total, item) => total + item.text.length, 0) > 600_000) ctx.addIssue({ code: "custom", message: "O material da matéria excede o limite seguro para esta geração." });
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  try {
    if (parsed.data.kind === "quiz") {
      const originalText = parsed.data.sources.map((item) => `[${item.title}]\n${item.text}`).join("\n\n---\n\n");
      return NextResponse.json(await aiService.generateQuiz({ originalText, summary: "" }));
    }
    const content = await aiService.generateFinalArtifact({ kind: parsed.data.kind, sources: parsed.data.sources });
    return NextResponse.json({ content });
  } catch (error) {
    return aiRouteError(error);
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { aiService } from "@/services/ai/ai-service";
import { aiRouteError } from "../ai-route-error";

const requestSchema = z.object({
  type: z.enum(["summary", "flashcards", "quiz", "questions", "mind-map", "keywords", "explanation"]),
  text: z.string().trim().min(80, "Inclua pelo menos um pequeno trecho para a Arya estudar.").max(60_000, "O material excede o limite de 60.000 caracteres."),
  summaryStyle: z.enum(["short", "complete", "bullets", "notebook", "technical", "simple"]).optional(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });

  try {
    return NextResponse.json({ content: await aiService.generateArtifact(parsed.data) });
  } catch (error) { return aiRouteError(error); }
}

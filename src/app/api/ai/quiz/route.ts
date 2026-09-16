import { NextResponse } from "next/server";
import { z } from "zod";
import { aiService } from "@/services/ai/ai-service";
import { aiRouteError } from "../ai-route-error";

const schema = z.object({ originalText: z.string().trim().min(80, "Inclua mais conteúdo antes de preparar a avaliação.").max(60_000, "O conteúdo excede o limite de 60.000 caracteres."), summary: z.string().trim().max(30_000).optional().default("") });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 }); try { return NextResponse.json(await aiService.generateQuiz(parsed.data)); } catch (error) { return aiRouteError(error); } }

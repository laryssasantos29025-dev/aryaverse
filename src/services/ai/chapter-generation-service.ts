import "server-only";
import { APIError } from "openai";
import { buildSummaryPrompt, EXPLANATION_SYSTEM_PROMPT, FINAL_FLASHCARDS_PROMPT, FINAL_GENERAL_REVIEW_PROMPT, FINAL_QUICK_REVIEW_PROMPT, FLASHCARDS_SYSTEM_PROMPT, KEYWORDS_SYSTEM_PROMPT, MIND_MAP_SYSTEM_PROMPT, QUESTIONS_SYSTEM_PROMPT, QUIZ_DIVERSE_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } from "@/lib/prompts";
import type { ChapterArtifactType, QuizOption, QuizQuestionType, SummaryStyle } from "@/types/study-flow";
import { getOpenAIClient, getOpenAIModel } from "./openai-client";
import { validateGeneratedQuiz, validateRuntimeQuiz, type GeneratedQuizPayload } from "./quiz-validation";

const prompts: Record<ChapterArtifactType, string> = { summary: SUMMARY_SYSTEM_PROMPT, explanation: EXPLANATION_SYSTEM_PROMPT, flashcards: FLASHCARDS_SYSTEM_PROMPT, quiz: QUIZ_DIVERSE_SYSTEM_PROMPT, questions: QUESTIONS_SYSTEM_PROMPT, "mind-map": MIND_MAP_SYSTEM_PROMPT, keywords: KEYWORDS_SYSTEM_PROMPT };
export type GeneratedQuiz = { questions: { questionType: QuizQuestionType; question: string; options: Record<QuizOption, string>; correctAnswer: QuizOption; explanation: string; sourceText: string; sourceSection?: string; statements?: string[]; assertion?: string; reason?: string; reasonJustifies?: boolean; associationLeft?: { id: string; text: string }[]; associationRight?: { id: string; text: string }[]; scenario?: string }[] };

export async function generateChapterArtifact(input: { type: ChapterArtifactType; text: string; summaryStyle?: SummaryStyle }) {
  const client = getOpenAIClient(); const style = input.summaryStyle ?? "complete"; const sourceWords = countWords(input.text); const summaryTokens = Math.min(5_000, Math.max(1_700, Math.ceil(sourceWords * 0.58))); const instructions = input.type === "summary" ? buildSummaryPrompt(style, input.text.length) : prompts[input.type];
  const response = await client.responses.create({ model: getOpenAIModel(), instructions, input: `Tipo de resumo: ${style}.\n\nMaterial:\n${input.text}`, max_output_tokens: input.type === "summary" && style === "complete" ? summaryTokens : 2_000 });
  let content = response.output_text.trim(); if (!content) throw new Error("EMPTY_MODEL_RESPONSE");
  const minimumWords = Math.min(2_800, Math.max(300, Math.round(sourceWords * 0.12)));
  if (input.type === "summary" && style === "complete" && sourceWords >= 900 && countWords(content) < minimumWords) {
    const retry = await client.responses.create({ model: getOpenAIModel(), instructions: `${instructions}\n\nO rascunho anterior ficou curto para a densidade do material. Refaça o resumo do zero, cobrindo todos os conceitos necessários para revisão universitária sem inventar conteúdo.`, input: `Material:\n${input.text}`, max_output_tokens: summaryTokens });
    const revised = retry.output_text.trim(); if (revised) content = revised;
  }
  return content;
}

export async function generateQuiz(input: { originalText: string; summary: string }) {
  const material = `TEXTO ORIGINAL:\n${input.originalText}\n\nRESUMO:\n${input.summary || "Use somente o texto original."}`;
  const first = await request(QUIZ_DIVERSE_SYSTEM_PROMPT, material);
  const parsed = parse(first); if (parsed) return parsed;
  const repair = "O objeto anterior não passou na validação de diversidade ou estrutura. Corrija-o sem usar conteúdo externo: retorne JSON válido com 10 questões, A–E, uma correta, referências distintas e ao menos quatro questionType diferentes. Evite repetir o mesmo conceito. OBJETO:\n" + first.slice(0, 24000);
  const second = await request(repair, material);
  const corrected = parse(second); if (corrected) return corrected;
  if (process.env.NODE_ENV === "development") console.warn("[Arya Quiz] QUIZ_SCHEMA_INVALID", { first: describe(first), second: describe(second) });
  throw new Error("INVALID_QUIZ_RESPONSE");
}

export type FinalArtifactKind = "generalReview" | "quickReview" | "flashcards";

/**
 * Builds a subject-wide source without silently discarding later chapters.
 * Large subjects are condensed by source chunks before the final synthesis.
 */
export async function generateFinalArtifact(input: { kind: FinalArtifactKind; sources: { title: string; text: string }[] }) {
  const labeled = input.sources.map((source, index) => `CAPÍTULO ${index + 1}: ${source.title}\n${source.text.trim()}`).join("\n\n---\n\n");
  const material = labeled.length <= 48_000 ? labeled : await condenseSources(labeled);
  const instructions = input.kind === "generalReview" ? FINAL_GENERAL_REVIEW_PROMPT : input.kind === "quickReview" ? FINAL_QUICK_REVIEW_PROMPT : FINAL_FLASHCARDS_PROMPT;
  const response = await getOpenAIClient().responses.create({ model: getOpenAIModel(), instructions, input: `FONTES DA MATÉRIA:\n${material}`, max_output_tokens: input.kind === "generalReview" ? 5_500 : input.kind === "quickReview" ? 2_200 : 3_600 });
  const content = response.output_text.trim();
  if (!content) throw new Error("EMPTY_MODEL_RESPONSE");
  return content;
}

async function condenseSources(material: string) {
  const chunks = splitForSynthesis(material, 18_000);
  const client = getOpenAIClient();
  const condensed: string[] = [];
  for (const [index, chunk] of chunks.entries()) {
    const response = await client.responses.create({ model: getOpenAIModel(), instructions: `${SUMMARY_SYSTEM_PROMPT}\nEsta é uma etapa intermediária de síntese. Preserve todos os conceitos, autores, processos, comparações e referências importantes deste bloco para uma revisão final posterior.`, input: `BLOCO ${index + 1} DE ${chunks.length}:\n${chunk}`, max_output_tokens: 2_700 });
    const value = response.output_text.trim();
    if (!value) throw new Error("EMPTY_MODEL_RESPONSE");
    condensed.push(value);
  }
  return condensed.map((value, index) => `SÍNTESE DO BLOCO ${index + 1}:\n${value}`).join("\n\n---\n\n");
}

function splitForSynthesis(value: string, size: number) {
  const paragraphs = value.split(/\n{2,}/); const chunks: string[] = []; let current = "";
  for (const paragraph of paragraphs) {
    if (paragraph.length > size) {
      if (current) { chunks.push(current); current = ""; }
      for (let start = 0; start < paragraph.length; start += size) chunks.push(paragraph.slice(start, start + size));
    } else if ((current + "\n\n" + paragraph).length > size) { chunks.push(current); current = paragraph; } else current = current ? `${current}\n\n${paragraph}` : paragraph;
  }
  if (current) chunks.push(current); return chunks;
}

async function request(instructions: string, input: string) {
  const client = getOpenAIClient();
  try {
    const response = await client.responses.create({ model: getOpenAIModel(), instructions, input, max_output_tokens: 10_000, text: { format: { type: "json_schema", name: "aryaverse_quiz", strict: true, schema: openAiQuizSchema as never } } });
    if (process.env.NODE_ENV === "development") console.info("[Arya Quiz] OPENAI_RESPONSE " + JSON.stringify({ model: getOpenAIModel(), status: response.status, hasOutputText: Boolean(response.output_text), outputLength: response.output_text.length }));
    return response.output_text.trim();
  } catch (error) {
    if (process.env.NODE_ENV === "development" && error instanceof APIError) console.error("[Arya Quiz] OPENAI_REQUEST_FAILED", { model: getOpenAIModel(), status: error.status, code: error.code, type: error.type, message: error.message });
    throw error;
  }
}

function parse(raw: string): GeneratedQuiz | null {
  try {
    const result = validateRuntimeQuiz(normalizeRuntimePayload(JSON.parse(extractJson(raw))));
    if (!result.success) {
      if (process.env.NODE_ENV === "development") console.warn("[Arya Quiz] QUIZ_SCHEMA_INVALID " + JSON.stringify({ issues: result.error.issues.slice(0, 5).map((issue) => ({ path: issue.path.join("."), message: issue.message })) }));
      return null;
    }
    return { questions: result.data.questions.map((question, index) => normalizeQuestion(question, index)) };
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.warn("[Arya Quiz] JSON_PARSE_FAILED " + JSON.stringify({ message: error instanceof Error ? error.message : "unknown" }));
    return null;
  }
}

function normalizeQuestion(question: GeneratedQuizPayload["questions"][number], index: number) {
  const labels: QuizOption[] = ["A", "B", "C", "D", "E"];
  const desiredCorrect: QuizOption[] = ["C", "A", "E", "B", "D", "A", "D", "B", "E", "C"];
  const target = desiredCorrect[index]; const correctText = question.options.find((option) => option.label === question.correctAnswer)!.text; const remaining = question.options.filter((option) => option.label !== question.correctAnswer).map((option) => option.text);
  const choices = labels.map((label) => label === target ? [label, correctText] : [label, remaining.shift()!] as [QuizOption, string]);
  return { questionType: question.questionType, question: question.question, options: Object.fromEntries(choices) as Record<QuizOption, string>, correctAnswer: target, explanation: question.explanation, sourceText: question.sourceReference.text, sourceSection: question.sourceReference.section || undefined, statements: question.statements ?? undefined, assertion: question.assertion ?? undefined, reason: question.reason ?? undefined, reasonJustifies: question.reasonJustifies ?? undefined, associationLeft: question.associationLeft ?? undefined, associationRight: question.associationRight ?? undefined, scenario: question.scenario ?? undefined };
}

/** Normalizes model option labels by position while preserving its chosen answer. */
function normalizeRuntimePayload(value: unknown) {
  if (!value || typeof value !== "object" || !Array.isArray((value as { questions?: unknown }).questions)) return value;
  const labels: QuizOption[] = ["A", "B", "C", "D", "E"];
  return {
    ...(value as Record<string, unknown>),
    questions: (value as { questions: unknown[] }).questions.map((candidate, questionIndex) => {
      if (!candidate || typeof candidate !== "object") return candidate;
      const question = candidate as Record<string, unknown>;
      const inputOptions = Array.isArray(question.options)
        ? question.options
        : question.options && typeof question.options === "object"
          ? Object.entries(question.options as Record<string, unknown>).map(([label, text]) => ({ label, text }))
          : [];
      const correctIndex = inputOptions.findIndex((option) => option && typeof option === "object" && String((option as { label?: unknown }).label) === String(question.correctAnswer));
      const fallbackIndex = labels.indexOf(String(question.correctAnswer) as QuizOption);
      const source = question.sourceReference && typeof question.sourceReference === "object" ? question.sourceReference as Record<string, unknown> : {};
      const questionText = normalizeQuestionText(question, source, questionIndex);
      return {
        ...question,
        id: typeof question.id === "string" && question.id.trim() ? question.id : `q${questionIndex + 1}`,
        question: questionText,
        options: inputOptions.map((option, index) => ({ label: labels[index], text: typeof option === "object" && option !== null ? String((option as { text?: unknown }).text ?? "") : "" })),
        correctAnswer: labels[correctIndex >= 0 ? correctIndex : fallbackIndex >= 0 ? fallbackIndex : 0],
        sourceReference: {
          ...source,
          text: String(source.text ?? questionText ?? "Material do capítulo"),
          section: String(source.section ?? ""),
        },
        statements: normalizeStringList(question.statements),
        assertion: normalizeOptionalText(question.assertion),
        reason: normalizeOptionalText(question.reason),
        reasonJustifies: typeof question.reasonJustifies === "boolean" ? question.reasonJustifies : null,
        associationLeft: normalizeAssociationItems(question.associationLeft),
        associationRight: normalizeAssociationItems(question.associationRight),
        scenario: normalizeOptionalText(question.scenario, 20),
      };
    }),
  };
}

function normalizeOptionalText(value: unknown, minimum = 3) { const text = typeof value === "string" ? value.trim() : ""; return text.length >= minimum ? text : null; }
function normalizeStringList(value: unknown) { return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim().length >= 3) ? value.map((item) => String(item).trim()) : null; }
function normalizeAssociationItems(value: unknown) { return Array.isArray(value) && value.length > 0 && value.every((item) => item && typeof item === "object" && String((item as { id?: unknown }).id ?? "").trim() && String((item as { text?: unknown }).text ?? "").trim().length >= 3) ? value.map((item) => ({ id: String((item as { id: unknown }).id).trim(), text: String((item as { text: unknown }).text).trim() })) : null; }
function normalizeQuestionText(question: Record<string, unknown>, source: Record<string, unknown>, index: number) {
  const supplied = typeof question.question === "string" ? question.question.trim() : "";
  if (supplied.length >= 20) return supplied;
  const statements = Array.isArray(question.statements) ? question.statements.filter((item): item is string => typeof item === "string" && item.trim().length >= 3).join(" ") : "";
  const candidates = [question.scenario, question.assertion, statements, source.text].map((item) => typeof item === "string" ? item.trim() : "").filter((item) => item.length >= 20);
  return candidates[0] ?? `Analise o conceito apresentado no material para responder à questão ${index + 1}.`;
}

export function extractJson(raw: string) { const clean = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""); const start = clean.indexOf("{"); const end = clean.lastIndexOf("}"); if (start < 0 || end <= start) throw new Error("JSON_NOT_FOUND"); return clean.slice(start, end + 1); }
function countWords(value: string) { return value.trim().split(/\s+/).filter(Boolean).length; }
function describe(raw: string) { try { const data = JSON.parse(extractJson(raw)) as { questions?: unknown }; const validation = validateGeneratedQuiz(data); return { parseable: true, count: Array.isArray(data.questions) ? data.questions.length : 0, valid: validation.success, issues: validation.success ? [] : validation.error.issues.slice(0, 3).map((issue) => issue.message) }; } catch { return { parseable: false, length: raw.length }; } }

const typeEnum = ["multiple_choice", "statements", "true_false_sequence", "assertion_reason", "association", "application"];
const nullable = (schema: Record<string, unknown>) => ({ anyOf: [schema, { type: "null" }] });
const openAiQuizSchema = { type: "object", additionalProperties: false, required: ["questions"], properties: { questions: { type: "array", minItems: 10, maxItems: 10, items: { type: "object", additionalProperties: false, required: ["id", "questionType", "question", "options", "correctAnswer", "explanation", "sourceReference", "statements", "assertion", "reason", "reasonJustifies", "associationLeft", "associationRight", "scenario"], properties: { id: { type: "string" }, questionType: { type: "string", enum: typeEnum }, question: { type: "string" }, options: { type: "array", minItems: 5, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["label", "text"], properties: { label: { type: "string", enum: ["A", "B", "C", "D", "E"] }, text: { type: "string" } } } }, correctAnswer: { type: "string", enum: ["A", "B", "C", "D", "E"] }, explanation: { type: "string" }, sourceReference: { type: "object", additionalProperties: false, required: ["text", "section"], properties: { text: { type: "string" }, section: { type: "string" } } }, statements: nullable({ type: "array", items: { type: "string" } }), assertion: nullable({ type: "string" }), reason: nullable({ type: "string" }), reasonJustifies: nullable({ type: "boolean" }), associationLeft: nullable({ type: "array", items: { type: "object", additionalProperties: false, required: ["id", "text"], properties: { id: { type: "string" }, text: { type: "string" } } } }), associationRight: nullable({ type: "array", items: { type: "object", additionalProperties: false, required: ["id", "text"], properties: { id: { type: "string" }, text: { type: "string" } } } }), scenario: nullable({ type: "string" }) } } } } } as const;

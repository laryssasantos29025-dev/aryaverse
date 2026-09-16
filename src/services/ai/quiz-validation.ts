import { z } from "zod";

export const quizQuestionTypes = ["multiple_choice", "statements", "true_false_sequence", "assertion_reason", "association", "application"] as const;
export const quizOptionLabels = ["A", "B", "C", "D", "E"] as const;

const label = z.enum(quizOptionLabels);
const questionType = z.enum(quizQuestionTypes);
const associationItem = z.object({ id: z.string().trim().min(1), text: z.string().trim().min(3) });
const rawQuestion = z.object({
  id: z.string().trim().min(1),
  questionType,
  question: z.string().trim().min(20),
  options: z.array(z.object({ label, text: z.string().trim().min(1) })).length(5),
  correctAnswer: label,
  explanation: z.string().trim().min(8),
  sourceReference: z.object({ text: z.string().trim().min(3), section: z.string().trim() }),
  statements: z.array(z.string().trim().min(3)).nullable(),
  assertion: z.string().trim().min(3).nullable(),
  reason: z.string().trim().min(3).nullable(),
  reasonJustifies: z.boolean().nullable(),
  associationLeft: z.array(associationItem).nullable(),
  associationRight: z.array(associationItem).nullable(),
  scenario: z.string().trim().min(20).nullable(),
});

/**
 * This schema rejects broken quizzes, not valid quizzes merely because their
 * source citations use similar wording. Semantic quality is guided by the
 * prompt; the server only blocks objective structural problems here.
 */
export const generatedQuizSchema = z.object({ questions: z.array(rawQuestion).length(10) }).superRefine((payload, context) => {
  const questions = new Set<string>();
  const types = new Map<string, number>();
  payload.questions.forEach((question, index) => {
    const path = ["questions", index] as const;
    const key = normalize(question.question);
    if (questions.has(key)) issue(context, [...path, "question"], "Pergunta duplicada.");
    questions.add(key);
    const labels = question.options.map((option) => option.label).sort().join("");
    if (labels !== "ABCDE") issue(context, [...path, "options"], "As alternativas devem ser A, B, C, D e E.");
    if (new Set(question.options.map((option) => normalize(option.text))).size !== 5) issue(context, [...path, "options"], "Alternativas duplicadas.");
    if (!question.options.some((option) => option.label === question.correctAnswer)) issue(context, [...path, "correctAnswer"], "Resposta correta inexistente.");
    validateType(question, context, path);
    types.set(question.questionType, (types.get(question.questionType) ?? 0) + 1);
  });
  if (types.size < 4) issue(context, ["questions"], "A avaliação precisa variar ao menos quatro formatos de questão.");
  for (const [, count] of types) if (count > 4) issue(context, ["questions"], "Um formato foi repetido em excesso.");
  for (let first = 0; first < payload.questions.length; first += 1) for (let second = first + 1; second < payload.questions.length; second += 1) {
    if (similarity(normalize(payload.questions[first].question), normalize(payload.questions[second].question)) > 0.82) issue(context, ["questions", second, "question"], "Questões duplicadas ou praticamente idênticas.");
  }
});

export type GeneratedQuizPayload = z.infer<typeof generatedQuizSchema>;
export function validateGeneratedQuiz(value: unknown) { return generatedQuizSchema.safeParse(value); }

/**
 * The model is constrained to the complete JSON shape, but occasionally leaves
 * presentation-only fields empty. Runtime accepts that safe subset so a valid
 * ten-question assessment is never discarded; the strict schema above remains
 * available for fixtures and future quality checks.
 */
export function validateRuntimeQuiz(value: unknown) {
  return z.object({ questions: z.array(rawQuestion).length(10) }).superRefine((payload, context) => {
    const seen = new Set<string>();
    const types = new Set<string>();
    payload.questions.forEach((question, index) => {
      const path = ["questions", index] as const;
      const key = normalize(question.question);
      if (seen.has(key)) issue(context, [...path, "question"], "Pergunta duplicada.");
      seen.add(key); types.add(question.questionType);
      const labels = question.options.map((option) => option.label).sort().join("");
      if (labels !== "ABCDE") issue(context, [...path, "options"], "As alternativas devem ser A, B, C, D e E.");
      if (new Set(question.options.map((option) => normalize(option.text))).size !== 5) issue(context, [...path, "options"], "Alternativas duplicadas.");
    });
    if (types.size < 4) issue(context, ["questions"], "A avaliação precisa variar ao menos quatro formatos de questão.");
  }).safeParse(value);
}

function validateType(question: z.infer<typeof rawQuestion>, context: z.RefinementCtx, path: readonly (string | number)[]) {
  if ((question.questionType === "statements" || question.questionType === "true_false_sequence") && question.statements?.length !== 4) issue(context, [...path, "statements"], "Este formato exige quatro afirmativas.");
  if (question.questionType === "true_false_sequence" && !question.options.every((option) => validTrueFalseSequence(option.text))) issue(context, [...path, "options"], "Cada alternativa V/F deve conter quatro posições.");
  if (question.questionType === "assertion_reason" && (!question.assertion || !question.reason || question.reasonJustifies === null)) issue(context, [...path], "Asserção e razão exigem I, II e a relação entre elas.");
  if (question.questionType === "association") validateAssociation(question, context, path);
  if (question.questionType === "application" && !question.scenario) issue(context, [...path, "scenario"], "Aplicação exige uma situação-problema.");
}

function issue(context: z.RefinementCtx, path: (string | number)[], message: string) { context.addIssue({ code: "custom", path, message }); }
function validTrueFalseSequence(value: string) { const marks = value.toUpperCase().match(/[VF]/g) ?? []; return marks.length === 4 && new Set(marks).size === 2; }
function validateAssociation(question: z.infer<typeof rawQuestion>, context: z.RefinementCtx, path: readonly (string | number)[]) {
  const left = question.associationLeft; const right = question.associationRight;
  if (!left || !right || left.length < 3 || left.length !== right.length) { issue(context, [...path], "Associação exige dois conjuntos completos."); return; }
  const leftIds = new Set(left.map((item) => item.id)); const rightIds = new Set(right.map((item) => item.id));
  question.options.forEach((option, index) => {
    const pairs = [...option.text.matchAll(/(\d+)\s*[-–]\s*([A-Z])/g)];
    if (pairs.length !== left.length || new Set(pairs.map((pair) => pair[1])).size !== left.length || pairs.some((pair) => !leftIds.has(pair[1]) || !rightIds.has(pair[2]))) issue(context, [...path, "options", index], "Alternativa de associação inválida.");
  });
}
function normalize(value: string) { return value.toLocaleLowerCase("pt-BR").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim(); }
function similarity(first: string, second: string) { const ignored = new Set(["alternativa", "assinale", "conforme", "correta", "material", "questão", "resposta", "sobre", "capítulo", "considerando"]); const tokens = (value: string) => new Set(value.split(" ").filter((word) => word.length > 3 && !ignored.has(word))); const a = tokens(first); const b = tokens(second); const shared = [...a].filter((word) => b.has(word)).length; return shared / Math.max(1, Math.min(a.size, b.size)); }

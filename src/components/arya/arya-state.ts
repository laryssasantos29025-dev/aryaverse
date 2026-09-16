export type AryaState =
  | "idle"
  | "welcome"
  | "reading"
  | "thinking"
  | "explaining"
  | "celebrating"
  | "studying"
  | "resting"
  | "affection";

export type AryaEvent =
  | "EMPTY_LIBRARY"
  | "FIRST_SUBJECT_CREATED"
  | "SUMMARY_STARTED"
  | "SUMMARY_COMPLETED"
  | "EXPLANATION_STARTED"
  | "EXPLANATION_COMPLETED"
  | "FLASHCARDS_STARTED"
  | "FLASHCARDS_COMPLETED"
  | "QUIZ_GENERATION_STARTED"
  | "QUIZ_GENERATED"
  | "QUIZ_COMPLETED_HIGH"
  | "QUIZ_COMPLETED_MEDIUM"
  | "QUIZ_COMPLETED_LOW"
  | "MINDMAP_STARTED"
  | "MINDMAP_COMPLETED"
  | "KEYWORDS_STARTED"
  | "KEYWORDS_COMPLETED"
  | "ARYA_REQUEST_FAILED";

export type AryaAnnouncement = { state: AryaState; message?: string; duration?: number };
export type AryaVisualPreference = { quiet?: boolean; focus?: boolean };

const announcements: Record<AryaEvent, AryaAnnouncement> = {
  EMPTY_LIBRARY: { state: "welcome", message: "Sua biblioteca ainda está em branco. Quando quiser, começamos pelo primeiro livro." },
  FIRST_SUBJECT_CREATED: { state: "celebrating", message: "Seu primeiro livro já encontrou lugar na Biblioteca Viva.", duration: 3600 },
  SUMMARY_STARTED: { state: "reading", message: "Estou lendo seu material." },
  SUMMARY_COMPLETED: { state: "explaining", message: "Seu resumo está pronto.", duration: 4400 },
  EXPLANATION_STARTED: { state: "reading", message: "Estou lendo este trecho com atenção." },
  EXPLANATION_COMPLETED: { state: "explaining", message: "Pense assim…", duration: 4400 },
  FLASHCARDS_STARTED: { state: "studying", message: "Estou preparando seus flashcards." },
  FLASHCARDS_COMPLETED: { state: "idle" },
  QUIZ_GENERATION_STARTED: { state: "thinking", message: "Estou preparando sua avaliação." },
  QUIZ_GENERATED: { state: "idle" },
  QUIZ_COMPLETED_HIGH: { state: "celebrating", message: "Que resultado lindo. Você foi muito bem.", duration: 4200 },
  QUIZ_COMPLETED_MEDIUM: { state: "explaining", message: "Você está no caminho certo. Há alguns pontos que vale revisar.", duration: 4200 },
  QUIZ_COMPLETED_LOW: { state: "affection", message: "Vamos revisar com calma. Posso ajudar nos pontos mais difíceis.", duration: 4600 },
  MINDMAP_STARTED: { state: "thinking", message: "Estou organizando as ideias principais." },
  MINDMAP_COMPLETED: { state: "explaining", message: "Organizei as ideias principais para você.", duration: 4400 },
  KEYWORDS_STARTED: { state: "thinking", message: "Estou encontrando os conceitos essenciais." },
  KEYWORDS_COMPLETED: { state: "idle" },
  ARYA_REQUEST_FAILED: { state: "idle", message: "Não consegui preparar isso agora. Podemos tentar novamente.", duration: 4200 },
};

export function aryaAnnouncement(event: AryaEvent): AryaAnnouncement { return announcements[event]; }

export function emitAryaEvent(event: AryaEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AryaAnnouncement>("arya:state", { detail: aryaAnnouncement(event) }));
}

/** Ajusta somente a presença visual; não altera os estados semânticos da Arya. */
export function emitAryaVisualPreference(preference: AryaVisualPreference) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AryaVisualPreference>("arya:visual-preference", { detail: preference }));
}

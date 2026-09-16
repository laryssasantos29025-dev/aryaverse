import "server-only";

import { APIError } from "openai";

export type AiFailureCode = "OPENAI_NOT_CONFIGURED" | "OPENAI_INVALID_KEY" | "OPENAI_INSUFFICIENT_CREDITS" | "OPENAI_RATE_LIMITED" | "OPENAI_MODEL_UNAVAILABLE" | "OPENAI_INVALID_REQUEST" | "OPENAI_TIMEOUT" | "OPENAI_RESPONSE_INVALID" | "OPENAI_NETWORK_ERROR" | "OPENAI_INTERNAL_ERROR";

const messages: Record<AiFailureCode, string> = {
  OPENAI_NOT_CONFIGURED: "Arya ainda não está conectada à inteligência artificial. Em desenvolvimento, configure OPENAI_API_KEY em .env.local.",
  OPENAI_INVALID_KEY: "A chave de acesso da Arya não foi aceita. Revise OPENAI_API_KEY em .env.local.",
  OPENAI_INSUFFICIENT_CREDITS: "A conexão da Arya está ativa, mas a conta da API não possui créditos disponíveis. Adicione créditos no faturamento da OpenAI para continuar.",
  OPENAI_RATE_LIMITED: "Arya recebeu muitas solicitações em pouco tempo. Aguarde um instante e tente novamente.",
  OPENAI_MODEL_UNAVAILABLE: "O modelo configurado para Arya não está disponível. Revise OPENAI_MODEL em .env.local.",
  OPENAI_INVALID_REQUEST: "Arya não conseguiu processar este pedido. Revise o conteúdo e tente novamente.",
  OPENAI_TIMEOUT: "Arya demorou mais que o esperado para responder. Tente novamente.",
  OPENAI_RESPONSE_INVALID: "Não consegui montar a avaliação corretamente desta vez. Tente gerar novamente.",
  OPENAI_NETWORK_ERROR: "Não foi possível alcançar a inteligência artificial agora. Verifique a conexão e tente novamente.",
  OPENAI_INTERNAL_ERROR: "Não foi possível concluir a geração agora. Tente novamente.",
};

export class AiServiceError extends Error {
  constructor(public readonly code: AiFailureCode, public readonly upstreamStatus?: number, public readonly requestId?: string | null) {
    super(messages[code]);
    this.name = "AiServiceError";
  }
}

export function toAiServiceError(error: unknown): AiServiceError {
  if (error instanceof AiServiceError) return error;
  if (error instanceof DOMException && error.name === "AbortError") return new AiServiceError("OPENAI_TIMEOUT");
  if (error instanceof APIError) {
    const code = error.code ?? "";
    const type = error.type ?? "";
    if (error.status === 401) return new AiServiceError("OPENAI_INVALID_KEY", error.status, error.requestID);
    if (error.status === 429 && (type === "insufficient_quota" || code === "credit_balance_exhausted")) return new AiServiceError("OPENAI_INSUFFICIENT_CREDITS", error.status, error.requestID);
    if (error.status === 429) return new AiServiceError("OPENAI_RATE_LIMITED", error.status, error.requestID);
    if (code === "model_not_found" || error.status === 404) return new AiServiceError("OPENAI_MODEL_UNAVAILABLE", error.status, error.requestID);
    if (error.status === 400 || error.status === 422) return new AiServiceError("OPENAI_INVALID_REQUEST", error.status, error.requestID);
    return new AiServiceError("OPENAI_INTERNAL_ERROR", error.status, error.requestID);
  }
  if (error instanceof Error && (error.name === "APIConnectionError" || error.name === "APIConnectionTimeoutError")) return new AiServiceError("OPENAI_NETWORK_ERROR");
  if (error instanceof Error && error.message === "OPENAI_NOT_CONFIGURED") return new AiServiceError("OPENAI_NOT_CONFIGURED");
  if (error instanceof Error && (error.message === "EMPTY_MODEL_RESPONSE" || error.message === "INVALID_QUIZ_RESPONSE" || error.message.includes("JSON"))) return new AiServiceError("OPENAI_RESPONSE_INVALID");
  return new AiServiceError("OPENAI_INTERNAL_ERROR");
}

export function aiErrorHttpStatus(error: AiServiceError) {
  if (error.code === "OPENAI_NOT_CONFIGURED") return 503;
  if (error.code === "OPENAI_INSUFFICIENT_CREDITS" || error.code === "OPENAI_RATE_LIMITED") return 429;
  if (error.code === "OPENAI_INVALID_KEY") return 401;
  if (error.code === "OPENAI_MODEL_UNAVAILABLE" || error.code === "OPENAI_INVALID_REQUEST") return 400;
  if (error.code === "OPENAI_TIMEOUT") return 504;
  if (error.code === "OPENAI_NETWORK_ERROR") return 503;
  return 502;
}

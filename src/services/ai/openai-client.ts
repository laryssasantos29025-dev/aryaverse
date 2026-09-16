import "server-only";

import OpenAI from "openai";

export const AI_NOT_CONFIGURED_MESSAGE = "Arya ainda não está conectada à inteligência artificial. Em desenvolvimento, configure OPENAI_API_KEY em .env.local.";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_NOT_CONFIGURED");
  return new OpenAI({ apiKey });
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}

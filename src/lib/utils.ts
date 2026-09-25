import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function readApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("O servidor de IA retornou uma página de erro, não os dados do quiz. Confira OPENAI_API_KEY nas variáveis de ambiente da Netlify e publique um novo deploy.");
  }
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error("A resposta da IA veio em um formato inválido. Tente novamente.");
  }
}

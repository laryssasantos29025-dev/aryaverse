"use client";

import { Copy, Eye, Sparkles } from "lucide-react";
import type { ChapterArtifact, ChapterArtifactType } from "@/types/study-flow";
import { FlashcardDeck } from "./flashcard-deck";
import { MindMapWorkspace } from "./mind-map-workspace";

type Tool = Exclude<ChapterArtifactType, "summary" | "quiz">;
const labels: Record<Tool, { title: string; action: string; description: string }> = {
  flashcards: { title: "Flashcards", action: "Criar flashcards", description: "Vire um conceito de cada vez." },
  explanation: { title: "Explicação", action: "Explicar", description: "Uma leitura guiada e clara." },
  questions: { title: "Perguntas de revisão", action: "Gerar perguntas", description: "Recupere o que acabou de estudar." },
  "mind-map": { title: "Mapa mental", action: "Criar mapa mental", description: "Uma visão hierárquica do capítulo." },
  keywords: { title: "Palavras-chave", action: "Extrair palavras-chave", description: "O vocabulário essencial para revisar." },
};

export function ArtifactWorkspace({ type, artifacts, generating, onGenerate, onStatus }: { type: Tool; artifacts: ChapterArtifact[]; generating: boolean; onGenerate: () => void; onStatus: (message: string) => void }) {
  const meta = labels[type];
  const current = artifacts.at(-1);
  if (!current) return <section className="settings-surface mt-5 p-8 text-center"><Sparkles className="mx-auto text-[var(--glow)]" /><h2 className="mt-3 font-serif text-2xl">{meta.title}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{meta.description}</p><button onClick={onGenerate} disabled={generating} className="mt-5 rounded-full bg-[var(--button-primary)] px-5 py-2.5 text-sm font-semibold text-white">{generating ? "Arya está preparando..." : meta.action}</button></section>;
  if (type === "mind-map") return <MindMapWorkspace artifact={current} generating={generating} onGenerate={onGenerate} onStatus={onStatus} />;
  if (type === "flashcards") return <section className="settings-surface mt-5 p-6"><Header title={meta.title} onGenerate={onGenerate} generating={generating} copy={() => copy(current.content, onStatus)} /><FlashcardDeck artifact={current} onStatus={onStatus} /></section>;
  if (type === "questions") { const questions = current.content.split(/\n+/).map((line) => { const [question, answer] = line.split(/\s*\|\s*/); return { question: question.replace(/^Pergunta:\s*/i, "").trim(), answer: (answer ?? "").replace(/^Resposta sugerida:\s*/i, "").trim() }; }).filter((item) => item.question); return <section className="settings-surface mt-5 p-6"><Header title="Perguntas para estudar" onGenerate={onGenerate} generating={generating} copy={() => copy(current.content, onStatus)} /><p className="mt-2 text-sm text-[var(--text-secondary)]">Tente responder em voz alta ou por escrito antes de revelar a sugestão.</p><ol className="mt-6 space-y-3">{questions.map((item, index) => <li key={`${item.question}-${index}`} className="rounded-2xl bg-[var(--surface-soft)] p-5"><p className="font-medium"><span className="mr-3 text-[var(--accent-strong)]">{index + 1}.</span>{item.question}</p>{item.answer && <details className="mt-4"><summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]"><Eye size={15} />Revelar resposta sugerida</summary><p className="mt-3 border-t border-[var(--border)] pt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.answer}</p></details>}</li>)}</ol></section>; }
  if (type === "keywords") return <section className="settings-surface mt-5 p-6"><Header title={meta.title} onGenerate={onGenerate} generating={generating} copy={() => copy(current.content, onStatus)} /><div className="mt-6 flex flex-wrap gap-3">{current.content.split(/[\n,;]+/).map((word) => word.replace(/^[-*•\d.\s]+/, "").trim()).filter(Boolean).map((word) => <span key={word} className="rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">{word}</span>)}</div></section>;
  return <section className="settings-surface mt-5 p-6"><Header title={meta.title} onGenerate={onGenerate} generating={generating} copy={() => copy(current.content, onStatus)} /><div className="mt-6 whitespace-pre-wrap rounded-2xl bg-[var(--surface-soft)] p-5 leading-7">{current.content}</div></section>;
}

function Header({ title, onGenerate, generating, copy: copyAction }: { title: string; onGenerate: () => void; generating: boolean; copy: () => void }) { return <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-2xl">{title}</h2></div><div className="flex gap-2"><button onClick={copyAction} className="rounded-full border border-[var(--border-strong)] p-2" aria-label="Copiar"><Copy size={16} /></button><button onClick={onGenerate} disabled={generating} className="rounded-full bg-[var(--button-primary)] px-4 py-2 text-sm font-semibold text-white">{generating ? "Gerando..." : "Nova versão"}</button></div></header>; }
async function copy(value: string, onStatus: (message: string) => void) { await navigator.clipboard.writeText(value); onStatus("Material copiado."); }

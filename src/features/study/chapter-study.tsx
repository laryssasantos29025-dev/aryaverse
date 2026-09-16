"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Highlighter } from "lucide-react";
import { artifactRepository } from "@/services/repositories/artifact-repository";
import { chapterRepository } from "@/services/repositories/chapter-repository";
import { highlightRepository } from "@/services/repositories/highlight-repository";
import { historyRepository } from "@/services/repositories/history-repository";
import type { ActivityHistory, ChapterArtifact, ChapterArtifactType, ChapterRecord } from "@/types/study-flow";
import { ArtifactWorkspace } from "./artifact-workspace";
import { ChapterHistory } from "./chapter-history";
import { QuizWorkspace } from "./quiz-workspace";
import { SavedExplanations } from "./saved-explanations";
import { SummaryWorkspace } from "./summary-workspace";
import { emitAryaEvent } from "@/components/arya/arya-state";

const tabs: { id: "content" | ChapterArtifactType | "notes" | "history"; label: string }[] = [
  { id: "content", label: "Conteúdo" }, { id: "summary", label: "Resumo" }, { id: "flashcards", label: "Flashcards" }, { id: "quiz", label: "Quiz" }, { id: "questions", label: "Perguntas" }, { id: "mind-map", label: "Mapa Mental" }, { id: "keywords", label: "Palavras-chave" }, { id: "notes", label: "Anotações" }, { id: "history", label: "Histórico" },
];
const labels: Record<ChapterArtifactType, string> = { summary: "Resumo", flashcards: "Flashcards", quiz: "Quiz", questions: "Perguntas", "mind-map": "Mapa mental", keywords: "Palavras-chave", explanation: "Explicação" };

export function ChapterStudy({ subjectId, chapterId }: { subjectId: string; chapterId: string }) {
  const [chapter, setChapter] = useState<ChapterRecord | null>(() => chapterRepository.get(chapterId));
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("content");
  const [status, setStatus] = useState("Salvo");
  const [generating, setGenerating] = useState<ChapterArtifactType | null>(null);
  const [, refresh] = useState(0);
  const [selection, setSelection] = useState("");
  const [sourceFlash, setSourceFlash] = useState("");
  const sourceRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (!chapter) return; const timer = window.setTimeout(() => { chapterRepository.save(chapter); setStatus("Salvo"); }, 650); return () => window.clearTimeout(timer); }, [chapter]);
  useEffect(() => { if (!sourceFlash || !sourceRef.current) return; sourceRef.current.focus(); const timer = window.setTimeout(() => setSourceFlash(""), 2400); return () => window.clearTimeout(timer); }, [sourceFlash, tab]);
  if (!chapter) return <p className="text-[var(--text-secondary)]">Capítulo não encontrado.</p>;

  const summaries = artifactRepository.list(chapter.id, "summary"); const latestSummary = summaries.at(-1)?.content ?? "";
  const explanations = artifactRepository.list(chapter.id, "explanation");
  const artifacts = artifactRepository.list(chapter.id, tab === "content" || tab === "notes" || tab === "history" || tab === "quiz" || tab === "summary" ? undefined : tab);
  async function generate(type: ChapterArtifactType, text?: string, source?: Pick<ChapterArtifact, "sourceText" | "sourceArea">) {
    const currentChapter = chapter;
    const material = text ?? currentChapter?.originalText ?? "";
    if (!currentChapter || !material.trim()) return setStatus("Selecione ou adicione conteúdo antes de pedir ajuda à Arya.");
    setGenerating(type); setStatus(type === "explanation" ? "Arya está preparando uma explicação..." : "Arya está preparando seu material...");
    if (type === "summary") emitAryaEvent("SUMMARY_STARTED");
    else if (type === "explanation") emitAryaEvent("EXPLANATION_STARTED");
    else if (type === "flashcards") emitAryaEvent("FLASHCARDS_STARTED");
    else if (type === "mind-map") emitAryaEvent("MINDMAP_STARTED");
    else if (type === "keywords") emitAryaEvent("KEYWORDS_STARTED");
    try { const response = await fetch("/api/ai/chapter-artifact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, text: material, summaryStyle: currentChapter.summaryStyle }) }); const payload = await response.json() as { content?: string; error?: string }; if (!response.ok || !payload.content) throw new Error(payload.error ?? "Não foi possível gerar este material."); const saved = artifactRepository.save(currentChapter.id, type, payload.content, source); historyRepository.add(currentChapter.id, `${type}_created`, source?.sourceText ? "Explicação criada" : `${labels[type]} criado pela Arya`, { destination: type, resourceId: saved.id, sourceText: source?.sourceText }); refresh((value) => value + 1); setTab(type); setStatus("Geração salva no capítulo."); if (type === "summary") emitAryaEvent("SUMMARY_COMPLETED"); else if (type === "explanation") emitAryaEvent("EXPLANATION_COMPLETED"); else if (type === "flashcards") emitAryaEvent("FLASHCARDS_COMPLETED"); else if (type === "mind-map") emitAryaEvent("MINDMAP_COMPLETED"); else if (type === "keywords") emitAryaEvent("KEYWORDS_COMPLETED"); } catch (error) { emitAryaEvent("ARYA_REQUEST_FAILED"); setStatus(error instanceof Error ? error.message : "Não foi possível gerar este material."); } finally { setGenerating(null); }
  }
  function handleSelection(value: string, start: number, end: number) { setSelection(value.slice(start, end).trim()); }
  function openSource(item: ChapterArtifact) { setTab(item.sourceArea === "summary" ? "summary" : "content"); setSourceFlash(item.sourceText ?? ""); }
  function openHistory(item: ActivityHistory) { if (item.destination) setTab(item.destination); if (item.sourceText) setSourceFlash(item.sourceText); }
  return <div><Link href={`/biblioteca/${subjectId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]"><ArrowLeft size={16} />Voltar ao livro</Link><header className="settings-surface mt-5 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-[var(--accent)]">CAPÍTULO</p><h1 className="font-serif text-3xl">{chapter.title}</h1><p className="mt-1 text-xs text-[var(--text-muted)]">Última edição: {new Date(chapter.updatedAt).toLocaleString("pt-BR")}</p></div><span className="text-sm text-[var(--text-secondary)]" role="status">{status}</span></header><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => generate("summary")} disabled={generating !== null} className="rounded-full bg-[var(--button-primary)] px-4 py-2 text-sm font-semibold text-white">{generating === "summary" ? "Resumindo..." : "Resumir"}</button><button onClick={() => generate("explanation")} disabled={generating !== null} className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold">{generating === "explanation" ? "Explicando..." : "Explicar"}</button></div><nav className="chapter-tabs mt-5" aria-label="Áreas do capítulo">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`chapter-tab rounded-full ${tab === item.id ? "bg-[var(--button-primary)] text-white" : "bg-[var(--surface-soft)] text-[var(--text-secondary)]"}`}>{item.label}</button>)}</nav>{tab === "content" ? <section className="settings-surface mt-5 p-6"><textarea ref={sourceRef} value={chapter.originalText} onChange={(event) => { setStatus("Salvando..."); setChapter({ ...chapter, originalText: event.target.value }); }} onSelect={(event) => handleSelection(event.currentTarget.value, event.currentTarget.selectionStart, event.currentTarget.selectionEnd)} className={`min-h-96 w-full resize-y bg-transparent leading-7 outline-none ${sourceFlash ? "ring-2 ring-[var(--accent)]" : ""}`} aria-label="Conteúdo do capítulo" />{selection && <SelectionActions selection={selection} generating={generating !== null} onExplain={() => generate("explanation", selection, { sourceText: selection, sourceArea: "content" })} onSummarize={() => generate("summary", selection)} onFlashcard={() => generate("flashcards", selection, { sourceText: selection, sourceArea: "content" })} onHighlight={() => { highlightRepository.add({ chapterId: chapter.id, text: selection, color: "yellow" }); historyRepository.add(chapter.id, "highlight_created", "Marcador criado", { destination: "content", sourceText: selection }); setSelection(""); setStatus("Marcador salvo."); }} />}</section> : tab === "notes" ? <section className="settings-surface mt-5 p-6"><textarea value={chapter.notes ?? ""} onChange={(event) => { setStatus("Salvando..."); setChapter({ ...chapter, notes: event.target.value }); }} placeholder="Suas anotações para este capítulo" className="min-h-72 w-full resize-y bg-transparent leading-7 outline-none" aria-label="Anotações do capítulo" /></section> : tab === "summary" ? <SummaryWorkspace key={summaries.at(-1)?.id ?? "empty-summary"} chapterId={chapter.id} artifacts={summaries} onStatus={setStatus} onRegenerate={() => generate("summary")} generating={generating === "summary"} onExplainSelection={(text) => generate("explanation", text, { sourceText: text, sourceArea: "summary" })} /> : tab === "explanation" ? <SavedExplanations items={explanations} onRefresh={() => refresh((value) => value + 1)} onOpenSource={openSource} onStatus={setStatus} /> : tab === "quiz" ? <QuizWorkspace chapterId={chapter.id} originalText={chapter.originalText} summary={latestSummary} onStatus={setStatus} /> : tab === "history" ? <ChapterHistory chapterId={chapter.id} onOpen={openHistory} /> : <ArtifactWorkspace type={tab} artifacts={artifacts} generating={generating === tab} onGenerate={() => generate(tab)} onStatus={setStatus} />}</div>;
}

function SelectionActions({ selection, generating, onExplain, onSummarize, onFlashcard, onHighlight }: { selection: string; generating: boolean; onExplain: () => void; onSummarize: () => void; onFlashcard: () => void; onHighlight: () => void }) { return <aside className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><p className="line-clamp-2 text-sm text-[var(--text-secondary)]">“{selection}”</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={onExplain} disabled={generating} className="rounded-full bg-[var(--button-primary)] px-3 py-2 text-sm font-semibold text-white">✨ Explicar com Arya</button><button onClick={onSummarize} disabled={generating} className="rounded-full border border-[var(--border-strong)] px-3 py-2 text-sm font-semibold">📝 Resumir trecho</button><button onClick={onFlashcard} disabled={generating} className="rounded-full border border-[var(--border-strong)] px-3 py-2 text-sm font-semibold">🃏 Criar flashcard</button><button onClick={onHighlight} className="rounded-full border border-[var(--border-strong)] px-3 py-2 text-sm font-semibold"><Highlighter className="mr-1 inline" size={14} />Marcar</button></div></aside>; }

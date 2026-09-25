"use client";

import { useMemo, useState } from "react";
import { BookOpen, BrainCircuit, FileText, RefreshCw, Sparkles } from "lucide-react";
import { QuizWorkspace } from "@/features/study/quiz-workspace";
import { artifactRepository } from "@/services/repositories/artifact-repository";
import { bookAssessmentRepository } from "@/services/repositories/book-assessment-repository";
import { finalAssessmentRepository } from "@/services/repositories/final-assessment-repository";
import { subjectRepository } from "@/services/repositories/subject-repository";
import { readApiJson } from "@/lib/utils";
import { ensureSubjectHierarchy, normalBookSources, subjectSources } from "@/services/study-hierarchy";
import type { BookAssessmentRecord, FinalAssessmentRecord, Quiz } from "@/types/study-flow";

type ArtifactKind = "generalReview" | "quickReview" | "flashcards";
type Source = { chapterId: string; title: string; text: string };
type AssessmentRecord = FinalAssessmentRecord | BookAssessmentRecord;

export function FinalAssessmentWorkspace({ subjectId, bookId, scope = "subject" }: { subjectId: string; bookId?: string; scope?: "subject" | "book" }) {
  const [record, setRecord] = useState<AssessmentRecord>(() => scope === "book" && bookId ? bookAssessmentRepository.ensure(subjectId, bookId) : finalAssessmentRepository.ensure(subjectId));
  const [status, setStatus] = useState("");
  const [generating, setGenerating] = useState<ArtifactKind | null>(null);
  const subjectName = subjectRepository.get(subjectId)?.name ?? "esta matéria";
  const sources = useMemo<Source[]>(() => {
    const subject = subjectRepository.get(subjectId);
    if (subject) ensureSubjectHierarchy(subject);
    const chapters = scope === "book" && bookId ? normalBookSources(subjectId, bookId) : subjectSources(subjectId);
    return chapters.map((chapter) => {
      const summary = artifactRepository.list(chapter.id, "summary").at(-1)?.content ?? "";
      return { chapterId: chapter.id, title: chapter.title, text: [chapter.originalText, summary].filter(Boolean).join("\n\n") };
    }).filter((item) => item.text.trim().length > 0);
  }, [bookId, scope, subjectId]);
  const fingerprint = fingerprintSources(sources);
  const ready = sources.some((source) => source.text.trim().length >= 80);
  const stale = Boolean(record.sourceFingerprint && record.sourceFingerprint !== fingerprint);
  const isBookScope = scope === "book";

  const persist = (next: AssessmentRecord) => {
    const saved = isBookScope ? bookAssessmentRepository.save(next as BookAssessmentRecord) : finalAssessmentRepository.save(next as FinalAssessmentRecord);
    setRecord(saved); return saved;
  };

  async function generate(kind: ArtifactKind) {
    if (!ready || generating) return;
    setGenerating(kind);
    setStatus(kind === "generalReview" ? "Organizando os conteúdos..." : kind === "quickReview" ? "Preparando a revisão rápida..." : "Distribuindo os flashcards entre os conteúdos...");
    try {
      const response = await fetch("/api/ai/final-assessment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, sources }) });
      const payload = await readApiJson<{ content?: string; error?: string }>(response);
      if (!response.ok || !payload.content) throw new Error(payload.error ?? "Não consegui preparar este material agora.");
      persist({ ...record, [kind]: payload.content, sourceFingerprint: fingerprint });
      setStatus("Material preparado e salvo.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Não consegui preparar este material agora."); }
    finally { setGenerating(null); }
  }
  function saveQuiz(quiz: Quiz) { persist({ ...record, quiz, sourceFingerprint: fingerprint }); }

  return <div>
    <header className="mt-5 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
      <p className="text-sm font-semibold text-[var(--accent)]">✦ {isBookScope ? "AVALIAÇÃO DO LIVRO" : "LIVRO ESPECIAL"}</p>
      <h1 className="mt-2 font-serif text-3xl">{isBookScope ? "AVALIAÇÃO GERAL DO LIVRO" : "PROVA AVALIATIVA FINAL"}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{isBookScope ? "Será que aprendi este livro? As fontes desta avaliação são somente os capítulos deste livro." : `Estou preparada para a prova da matéria inteira? Este livro agrega, sem copiar, as fontes atuais de ${subjectName}.`}</p>
    </header>
    {!ready ? <EmptyAssessment isBookScope={isBookScope} /> : <>
      <p className="mt-5 text-sm text-[var(--text-secondary)]">{sources.length} fonte(s) disponível(is){stale ? " · há conteúdo novo para considerar" : " · materiais sincronizados"}.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <AssessmentCard icon={FileText} title="Revisão geral" content={record.generalReview} action="Atualizar revisão" loading={generating === "generalReview"} onAction={() => generate("generalReview")} />
        <AssessmentCard icon={BookOpen} title="Revisão rápida" content={record.quickReview} action="Preparar revisão rápida" loading={generating === "quickReview"} onAction={() => generate("quickReview")} />
        <AssessmentCard icon={BrainCircuit} title="Flashcards gerais" content={record.flashcards} action="Preparar 20 flashcards" loading={generating === "flashcards"} onAction={() => generate("flashcards")} />
      </div>
      <section className="settings-surface mt-5 p-6"><h2 className="font-serif text-2xl">{isBookScope ? "Avaliação geral do livro" : "Simulado final"}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Dez questões universitárias com referências para revisar depois.</p><QuizWorkspace chapterId={record.id} originalText="" summary="" initialQuiz={record.quiz} generationEndpoint="/api/ai/final-assessment" generationBody={() => ({ kind: "quiz", sources })} onQuizPrepared={saveQuiz} onStatus={setStatus} /></section>
      <PerformancePanel quiz={record.quiz} />
      {status && <p className="mt-4 text-sm text-[var(--text-secondary)]" role="status">{status}</p>}
    </>}
  </div>;
}

function EmptyAssessment({ isBookScope }: { isBookScope: boolean }) { return <section className="settings-surface mt-6 p-8 text-center"><Sparkles className="mx-auto text-[var(--glow)]" /><h2 className="mt-3 font-serif text-2xl">Esta avaliação será preparada aos poucos.</h2><p className="mx-auto mt-2 max-w-lg text-sm text-[var(--text-secondary)]">{isBookScope ? "Adicione conteúdo aos capítulos deste livro para liberar a avaliação acumulativa." : "Adicione conteúdo aos livros desta matéria para liberar revisão, flashcards e simulado final."}</p></section>; }
function AssessmentCard({ icon: Icon, title, content, action, loading, onAction }: { icon: typeof FileText; title: string; content?: string; action: string; loading: boolean; onAction: () => void }) { return <article className="settings-surface p-5"><Icon className="text-[var(--accent)]" size={20} /><h2 className="mt-4 font-serif text-xl">{title}</h2><p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">{content ?? "Ainda não gerado com as fontes atuais."}</p><button onClick={onAction} disabled={loading} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)] disabled:opacity-60"><RefreshCw size={14} className={loading ? "animate-spin" : ""} />{loading ? "Preparando..." : action}</button></article>; }
function PerformancePanel({ quiz }: { quiz?: Quiz }) { if (!quiz) return <section className="settings-surface mt-5 p-6"><h2 className="font-serif text-xl">Pontos que preciso revisar</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">Depois de concluir o simulado, seus erros e referências aparecerão aqui para orientar a revisão.</p></section>; return <section className="settings-surface mt-5 p-6"><h2 className="font-serif text-xl">Desempenho por conteúdo e questões erradas</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">A correção registra referências de cada questão. Use “Onde estudar isso” no resultado para retomar o capítulo de origem.</p></section>; }
function fingerprintSources(sources: Source[]) { let value = 2166136261; for (const source of sources) for (const char of `${source.chapterId}|${source.title}|${source.text}`) value = Math.imul(value ^ char.charCodeAt(0), 16777619); return `v1-${(value >>> 0).toString(36)}`; }

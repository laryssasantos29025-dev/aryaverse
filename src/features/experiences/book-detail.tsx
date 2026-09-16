"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BookOpen, FileText, Map, Plus, Sparkles } from "lucide-react";
import { NewStudyDialog } from "@/components/forms/new-study-dialog";
import { bookRepository } from "@/services/repositories/book-repository";
import { chapterRepository } from "@/services/repositories/chapter-repository";
import { FinalAssessmentWorkspace } from "@/features/study/final-assessment-workspace";

export function BookDetail({ subjectId, bookId }: { subjectId: string; bookId: string }) {
  const book = bookRepository.get(bookId);
  const [chapters, setChapters] = useState(() => book ? chapterRepository.listByBook(book.id) : []);
  const [dialogOpen, setDialogOpen] = useState(false);
  if (!book || book.subjectId !== subjectId) return <section className="settings-surface p-7"><p className="text-sm text-[var(--text-secondary)]">Este livro não foi encontrado.</p><Link href={`/biblioteca/${subjectId}`} className="mt-4 inline-flex text-sm font-semibold text-[var(--accent-strong)]">Voltar para a matéria</Link></section>;
  if (book.bookType === "final_assessment") return <FinalAssessmentWorkspace subjectId={subjectId} />;

  return <div className="book-study-page"><Link href={`/biblioteca/${subjectId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]"><ArrowLeft size={16} />Voltar para a matéria</Link><header className="book-study-header mt-6"><div><p className="text-sm font-semibold text-[var(--accent)]">LIVRO EM CULTIVO</p><h1>{book.title}</h1><p>Seu livro tem {chapters.length} capítulo{chapters.length === 1 ? "" : "s"} criado{chapters.length === 1 ? "" : "s"}.</p></div><button onClick={() => setDialogOpen(true)} className="book-study-primary-action"><Plus size={15} />Abrir novo capítulo</button></header><section className="book-study-chapters mt-6"><h2>Capítulos</h2><div className="mt-4 space-y-2">{chapters.length ? chapters.map((chapter, index) => <Link href={`/biblioteca/${subjectId}/capitulo/${chapter.id}`} key={chapter.id} className="book-study-chapter-row"><span>{index + 1}</span><strong>{chapter.title}</strong><BookOpen size={16} /></Link>) : <p className="rounded-2xl bg-[var(--surface-soft)] p-5 text-sm text-[var(--text-secondary)]">Este livro ainda não tem capítulos. Abra o primeiro quando estiver pronta.</p>}<Link href={`/biblioteca/${subjectId}/livro/${book.id}/avaliacao`} className="book-study-assessment-row"><span>✦</span><strong><small>AVALIAÇÃO GERAL DO LIVRO</small>Revisão e simulado acumulativos</strong><Sparkles size={16} /></Link></div></section><section className="book-study-arya-note mt-5"><Sparkles size={18} /><h2>Arya acompanha seu livro.</h2><p>Mais uma leitura breve pode aproximar você do próximo estágio de florescimento.</p></section><section className="mt-5 grid gap-3 sm:grid-cols-2"><StudyMetric icon={FileText} label="Resumos" value="Páginas escritas" /><StudyMetric icon={BookOpen} label="Avaliações" value="Em preparação" /><StudyMetric icon={Sparkles} label="Flashcards" value="Cartões de revisão" /><StudyMetric icon={Map} label="Mapas mentais" value="Conexões do livro" /></section>{dialogOpen && <NewStudyDialog subjectId={subjectId} bookId={book.id} onCreated={(chapter) => setChapters((current) => [chapter, ...current])} onClose={() => setDialogOpen(false)} />}</div>;
}

function StudyMetric({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) { return <article className="book-study-metric"><Icon size={17} /><strong>{label}</strong><span>{value}</span></article>; }

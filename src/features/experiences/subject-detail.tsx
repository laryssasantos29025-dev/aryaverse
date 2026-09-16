"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BookOpen, Plus, Sparkles } from "lucide-react";
import { bookRepository } from "@/services/repositories/book-repository";
import { chapterRepository } from "@/services/repositories/chapter-repository";
import { subjectRepository } from "@/services/repositories/subject-repository";
import { ensureSubjectHierarchy } from "@/services/study-hierarchy";
import type { StudyBookRecord } from "@/types/study-flow";

type SubjectDetailData = { name: string; description?: string };

export function SubjectDetail({ subject, subjectId }: { subject: SubjectDetailData; subjectId: string }) {
  // URLs antigas podem carregar o UUID como nome. A matéria persistida é a fonte de verdade.
  const subjectName = subjectRepository.get(subjectId)?.name ?? subject.name;
  const hierarchy = ensureSubjectHierarchy({ id: subjectId, name: subjectName });
  const [books, setBooks] = useState<StudyBookRecord[]>(() => hierarchy.normalBooks);

  const addBook = () => {
    const title = window.prompt("Nome do novo livro");
    if (!title?.trim()) return;
    bookRepository.createNormal(subjectId, title);
    setBooks(bookRepository.listNormal(subjectId));
  };

  return <div>
    <Link href="/biblioteca" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]"><ArrowLeft size={16} />Voltar para a Biblioteca</Link>
    <header className="mt-7 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_14px_35px_var(--shadow)]">
      <p className="text-sm font-semibold text-[var(--accent)]">MATÉRIA</p>
      <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="font-serif text-4xl font-semibold">{subjectName}</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Cada livro organiza uma parte da sua matéria. A prova final reúne todos eles.</p></div><button onClick={addBook} className="inline-flex items-center gap-2 rounded-full bg-[var(--button-primary)] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Novo livro</button></div>
    </header>

    <section className="mt-7">
      <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--accent)]">LIVROS DA MATÉRIA</p><h2 className="mt-1 font-serif text-2xl">Sua coleção de estudos</h2></div><span className="text-sm text-[var(--text-secondary)]">{books.length} livro{books.length === 1 ? "" : "s"} normal{books.length === 1 ? "" : "is"}</span></div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {books.map((book, index) => <BookCard key={book.id} subjectId={subjectId} book={book} index={index} />)}
        <FinalAssessmentBookCard subjectId={subjectId} book={hierarchy.finalBook} />
      </div>
    </section>
  </div>;
}

function BookCard({ subjectId, book, index }: { subjectId: string; book: StudyBookRecord; index: number }) {
  const chapters = chapterRepository.listByBook(book.id);
  return <Link href={`/biblioteca/${subjectId}/livro/${book.id}`} className="group relative min-h-56 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_14px_35px_var(--shadow)] transition hover:-translate-y-1"><div className="absolute inset-x-0 top-0 h-24 bg-[var(--surface-soft)] opacity-70" /><div className="relative"><BookOpen className="text-[var(--accent)]" size={25} /><p className="mt-8 text-xs font-semibold tracking-wide text-[var(--accent)]">LIVRO {index + 1}</p><h3 className="mt-2 font-serif text-2xl leading-tight">{book.title}</h3><p className="mt-3 text-sm text-[var(--text-secondary)]">{chapters.length} capítulo{chapters.length === 1 ? "" : "s"} · Abrir livro</p></div></Link>;
}

function FinalAssessmentBookCard({ subjectId, book }: { subjectId: string; book: StudyBookRecord }) {
  const sourceCount = chapterRepository.list(subjectId).filter((chapter) => chapter.bookId && chapter.bookId !== book.id).length;
  return <Link href={`/biblioteca/${subjectId}/livro/${book.id}`} className="subject-book-object subject-book-object-final" aria-label="Abrir Prova Avaliativa Final"><span className="subject-final-book-cover"><Image src="/illustrations/hero-golden-open-book.png" alt="Livro da Prova Avaliativa Final" fill sizes="(max-width: 640px) 45vw, 300px" className="object-contain" priority /><Sparkles className="subject-final-book-sparkle" size={22} /></span><span className="subject-book-label subject-final-book-label"><small>Avaliação Final</small><strong>PROVA AVALIATIVA FINAL</strong><em>{sourceCount} capítulo{sourceCount === 1 ? "" : "s"} da matéria</em></span></Link>;
}

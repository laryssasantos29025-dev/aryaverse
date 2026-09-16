"use client";

import type { ChapterRecord, StudyBookRecord, SubjectRecord } from "@/types/study-flow";
import { bookRepository } from "./repositories/book-repository";
import { chapterRepository } from "./repositories/chapter-repository";
import { bookAssessmentRepository } from "./repositories/book-assessment-repository";
import { finalAssessmentRepository } from "./repositories/final-assessment-repository";
import { chaptersForBook, chaptersForSubject } from "./study-hierarchy-utils";

export function ensureSubjectHierarchy(subject: Pick<SubjectRecord, "id" | "name">) {
  const legacyBook = bookRepository.ensureLegacyNormal(subject.id, subject.name);
  chapterRepository.migrateLegacyBook(subject.id, legacyBook.id);
  const legacyFinals = chapterRepository.list(subject.id).filter((chapter) => chapter.title.trim().toLocaleUpperCase("pt-BR") === "PROVA AVALIATIVA FINAL");
  legacyFinals.forEach((chapter) => {
    const assessment = bookAssessmentRepository.ensure(subject.id, chapter.bookId ?? legacyBook.id);
    if (!assessment.generalReview && chapter.originalText.trim()) bookAssessmentRepository.save({ ...assessment, generalReview: chapter.originalText });
    chapterRepository.remove(chapter.id);
  });
  const finalBook = bookRepository.ensureFinal(subject.id);
  finalAssessmentRepository.ensure(subject.id);
  return { normalBooks: bookRepository.listNormal(subject.id), finalBook };
}

export function normalBookSources(subjectId: string, bookId: string) {
  const book = bookRepository.get(bookId);
  if (!book || book.subjectId !== subjectId || book.bookType !== "normal") return [] as ChapterRecord[];
  return chaptersForBook(bookRepository.listNormal(subjectId), chapterRepository.list(subjectId), subjectId, book.id);
}

export function subjectSources(subjectId: string) {
  return chaptersForSubject(bookRepository.listNormal(subjectId), chapterRepository.list(subjectId), subjectId);
}

export function orderedBooks(subject: Pick<SubjectRecord, "id" | "name">): StudyBookRecord[] {
  const { normalBooks, finalBook } = ensureSubjectHierarchy(subject);
  return [...normalBooks, finalBook];
}

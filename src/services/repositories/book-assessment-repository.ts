"use client";

import type { BookAssessmentRecord } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";

const key = "aryaverse-book-assessments";
export const BOOK_ASSESSMENT_TITLE = "AVALIAÇÃO GERAL DO LIVRO" as const;

export const bookAssessmentRepository = {
  get: (bookId: string) => readCollection<BookAssessmentRecord>(key).find((item) => item.bookId === bookId) ?? null,
  ensure: (subjectId: string, bookId: string) => {
    const current = bookAssessmentRepository.get(bookId); if (current) return current;
    const now = new Date().toISOString(); const record: BookAssessmentRecord = { id: createId(), subjectId, bookId, title: BOOK_ASSESSMENT_TITLE, createdAt: now, updatedAt: now };
    writeCollection(key, [...readCollection<BookAssessmentRecord>(key), record]); return record;
  },
  save: (record: BookAssessmentRecord) => {
    const next = { ...record, title: BOOK_ASSESSMENT_TITLE, updatedAt: new Date().toISOString() };
    const all = readCollection<BookAssessmentRecord>(key);
    writeCollection(key, all.some((item) => item.id === record.id) ? all.map((item) => item.id === record.id ? next : item) : [...all, next]);
    return next;
  },
};

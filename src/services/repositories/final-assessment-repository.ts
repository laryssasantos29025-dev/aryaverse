"use client";

import type { FinalAssessmentRecord } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";
import { bookRepository } from "./book-repository";

const key = "aryaverse-final-assessments";
export const FINAL_ASSESSMENT_TITLE = "PROVA AVALIATIVA FINAL" as const;
export const finalAssessmentRepository = {
  get: (subjectId: string) => readCollection<FinalAssessmentRecord>(key).find((item) => item.subjectId === subjectId) ?? null,
  ensure: (subjectId: string) => {
    const finalBook = bookRepository.ensureFinal(subjectId);
    const current = finalAssessmentRepository.get(subjectId);
    if (current) {
      if (current.bookId === finalBook.id) return current;
      const migrated = { ...current, bookId: finalBook.id, title: FINAL_ASSESSMENT_TITLE, bookType: "final_assessment" as const };
      return finalAssessmentRepository.save(migrated);
    }
    const now = new Date().toISOString(); const record: FinalAssessmentRecord = { id: createId(), subjectId, bookId: finalBook.id, bookType: "final_assessment", title: FINAL_ASSESSMENT_TITLE, createdAt: now, updatedAt: now };
    writeCollection(key, [...readCollection<FinalAssessmentRecord>(key), record]); return record;
  },
  save: (record: FinalAssessmentRecord) => { const next = { ...record, title: FINAL_ASSESSMENT_TITLE, bookType: "final_assessment" as const, updatedAt: new Date().toISOString() }; const all = readCollection<FinalAssessmentRecord>(key); writeCollection(key, all.some((item) => item.id === record.id) ? all.map((item) => item.id === record.id ? next : item) : [...all, next]); return next; },
};

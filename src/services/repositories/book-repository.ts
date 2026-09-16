"use client";

import type { StudyBookRecord } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";

const key = "aryaverse-study-books";
const FINAL_TITLE = "PROVA AVALIATIVA FINAL";

type BookInput = Omit<StudyBookRecord, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string };

function write(records: StudyBookRecord[]) { writeCollection(key, records); }

export const bookRepository = {
  list: (subjectId: string) => readCollection<StudyBookRecord>(key).filter((book) => book.subjectId === subjectId),
  listNormal: (subjectId: string) => bookRepository.list(subjectId).filter((book) => book.bookType === "normal"),
  get: (id: string) => readCollection<StudyBookRecord>(key).find((book) => book.id === id) ?? null,
  save: (input: BookInput) => {
    const now = new Date().toISOString();
    const record: StudyBookRecord = { ...input, id: input.id ?? createId(), createdAt: input.createdAt ?? now, updatedAt: now };
    const all = readCollection<StudyBookRecord>(key);
    write(all.some((book) => book.id === record.id) ? all.map((book) => book.id === record.id ? record : book) : [...all, record]);
    return record;
  },
  createNormal: (subjectId: string, title: string) => bookRepository.save({ subjectId, title: title.trim(), bookType: "normal" }),
  ensureFinal: (subjectId: string) => {
    const current = bookRepository.list(subjectId).find((book) => book.bookType === "final_assessment");
    return current ?? bookRepository.save({ subjectId, title: FINAL_TITLE, bookType: "final_assessment" });
  },
  ensureLegacyNormal: (subjectId: string, title: string) => {
    const current = bookRepository.listNormal(subjectId)[0];
    return current ?? bookRepository.save({ id: `legacy-book-${subjectId}`, subjectId, title, bookType: "normal" });
  },
  remove: (id: string) => {
    const book = bookRepository.get(id);
    if (!book || book.bookType === "final_assessment") return false;
    write(readCollection<StudyBookRecord>(key).filter((item) => item.id !== id));
    return true;
  },
};

export const FINAL_ASSESSMENT_BOOK_TITLE = FINAL_TITLE;

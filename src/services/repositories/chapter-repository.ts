"use client";

import type { ChapterRecord } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";
const key = "aryaverse-chapters";
type ChapterInput = Omit<ChapterRecord, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string };
export const chapterRepository = {
  list: (subjectId: string) => readCollection<ChapterRecord>(key).filter((item) => item.subjectId === subjectId),
  listByBook: (bookId: string) => readCollection<ChapterRecord>(key).filter((item) => item.bookId === bookId),
  get: (id: string) => readCollection<ChapterRecord>(key).find((item) => item.id === id) ?? null,
  remove: (id: string) => {
    const all = readCollection<ChapterRecord>(key);
    const next = all.filter((chapter) => chapter.id !== id);
    if (next.length !== all.length) writeCollection(key, next);
    return next.length !== all.length;
  },
  migrateLegacyBook: (subjectId: string, bookId: string) => {
    const all = readCollection<ChapterRecord>(key);
    const next = all.map((chapter) => chapter.subjectId === subjectId && !chapter.bookId ? { ...chapter, bookId } : chapter);
    if (next.some((chapter, index) => chapter !== all[index])) writeCollection(key, next);
    return next.filter((chapter) => chapter.subjectId === subjectId && chapter.bookId === bookId);
  },
  save: (chapter: ChapterInput) => { const now = new Date().toISOString(); const items = readCollection<ChapterRecord>(key); const record: ChapterRecord = { ...chapter, id: chapter.id ?? createId(), createdAt: chapter.createdAt ?? now, updatedAt: now }; const next = items.some((item) => item.id === record.id) ? items.map((item) => item.id === record.id ? record : item) : [...items, record]; writeCollection(key, next); return record; },
};

"use client";
import type { SummaryRecord } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";
const key = "aryaverse-summaries";
export const summaryRepository = { getByChapter: (chapterId: string) => readCollection<SummaryRecord>(key).find((item) => item.chapterId === chapterId) ?? null, save: (chapterId: string, content: string, style: SummaryRecord["style"]) => { const now = new Date().toISOString(); const items = readCollection<SummaryRecord>(key); const current = items.find((item) => item.chapterId === chapterId); const record: SummaryRecord = { id: current?.id ?? createId(), chapterId, content, style, createdAt: current?.createdAt ?? now, updatedAt: now }; writeCollection(key, current ? items.map((item) => item.id === record.id ? record : item) : [...items, record]); return record; } };

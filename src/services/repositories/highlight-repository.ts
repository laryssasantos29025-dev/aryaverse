"use client";

import type { HighlightRecord } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";

const key = "aryaverse-highlights";
export const highlightRepository = {
  list: (chapterId: string) => readCollection<HighlightRecord>(key).filter((item) => item.chapterId === chapterId),
  add: (highlight: Omit<HighlightRecord, "id" | "createdAt">) => {
    const now = new Date().toISOString();
    const record: HighlightRecord = { ...highlight, id: createId(), createdAt: now, updatedAt: now };
    writeCollection(key, [...readCollection<HighlightRecord>(key), record]);
    return record;
  },
  update: (id: string, patch: Partial<Omit<HighlightRecord, "id" | "chapterId" | "createdAt">>) => {
    let updated: HighlightRecord | undefined;
    const records = readCollection<HighlightRecord>(key).map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    writeCollection(key, records);
    return updated ?? null;
  },
  remove: (id: string) => writeCollection(key, readCollection<HighlightRecord>(key).filter((item) => item.id !== id)),
};

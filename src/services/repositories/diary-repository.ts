"use client";

import type { DiaryEntry } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";

const key = "aryaverse-diary-entries";

export const diaryRepository = {
  list: () => readCollection<DiaryEntry>(key),
  create: (position: Pick<DiaryEntry, "x" | "y">) => {
    const now = new Date().toISOString();
    const entry: DiaryEntry = { id: createId(), title: "Novo pensamento", content: "", color: "aqua", createdAt: now, updatedAt: now, width: 260, height: 230, ...position };
    writeCollection(key, [...readCollection<DiaryEntry>(key), entry]);
    return entry;
  },
  replace: (entries: DiaryEntry[]) => writeCollection(key, entries),
  remove: (id: string) => writeCollection(key, readCollection<DiaryEntry>(key).filter((entry) => entry.id !== id)),
};

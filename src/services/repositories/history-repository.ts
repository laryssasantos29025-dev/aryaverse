"use client";

import type { ActivityDestination, ActivityHistory } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";

const key = "aryaverse-history";
export const historyRepository = {
  listAll: () => readCollection<ActivityHistory>(key).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  list: (chapterId: string) => readCollection<ActivityHistory>(key).filter((item) => item.chapterId === chapterId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  add: (chapterId: string, type: string, detail: string, link?: { destination?: ActivityDestination; resourceId?: string; sourceText?: string }) => {
    const record: ActivityHistory = { id: createId(), chapterId, type, detail, createdAt: new Date().toISOString(), ...link };
    writeCollection(key, [...readCollection<ActivityHistory>(key), record]);
    return record;
  },
};

"use client";

import type { FlashcardReview } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";

const key = "aryaverse-flashcard-reviews";
export const flashcardReviewRepository = {
  list: (artifactId: string) => readCollection<FlashcardReview>(key).filter((item) => item.artifactId === artifactId),
  save: (input: Omit<FlashcardReview, "id" | "updatedAt">) => {
    const items = readCollection<FlashcardReview>(key); const current = items.find((item) => item.artifactId === input.artifactId && item.cardIndex === input.cardIndex); const record: FlashcardReview = { ...input, id: current?.id ?? createId(), updatedAt: new Date().toISOString() };
    writeCollection(key, current ? items.map((item) => item.id === record.id ? record : item) : [...items, record]); return record;
  },
};

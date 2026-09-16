import "server-only";

import type { ChapterArtifactType, SummaryStyle } from "@/types/study-flow";
import { generateChapterArtifact, generateFinalArtifact, generateQuiz, type FinalArtifactKind } from "./chapter-generation-service";
import { toAiServiceError } from "./ai-error";

export const aiService = {
  async generateArtifact(input: { type: ChapterArtifactType; text: string; summaryStyle?: SummaryStyle }) {
    try {
      return await generateChapterArtifact(input);
    } catch (error) {
      throw toAiServiceError(error);
    }
  },
  async generateQuiz(input: { originalText: string; summary: string }) {
    try {
      return await generateQuiz(input);
    } catch (error) {
      throw toAiServiceError(error);
    }
  },
  async generateFinalArtifact(input: { kind: FinalArtifactKind; sources: { title: string; text: string }[] }) {
    try {
      return await generateFinalArtifact(input);
    } catch (error) {
      throw toAiServiceError(error);
    }
  },
};

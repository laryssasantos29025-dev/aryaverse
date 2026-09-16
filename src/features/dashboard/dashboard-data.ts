"use client";

import { artifactRepository } from "@/services/repositories/artifact-repository";
import { chapterRepository } from "@/services/repositories/chapter-repository";
import { historyRepository } from "@/services/repositories/history-repository";
import { quizRepository } from "@/services/repositories/quiz-repository";
import { subjectRepository } from "@/services/repositories/subject-repository";
import type { ChapterRecord } from "@/types/study-flow";

export type DashboardData = {
  subjects: { id: string; name: string; chapters: number; progress: number }[];
  chapterCount: number;
  averageScore: number | null;
  activities: { id: string; detail: string; subjectId: string }[];
  journey: { title: string; detail: string; href: string }[];
  flashcardCount: number;
};

export function getDashboardData(): DashboardData {
  const activeSubjects = subjectRepository.list().filter((subject) => !subject.archived);
  const chapters = activeSubjects.flatMap((subject) => chapterRepository.list(subject.id));
  const subjects = activeSubjects.map((subject) => {
    const subjectChapters = chapters.filter((chapter) => chapter.subjectId === subject.id);
    const progress = subjectChapters.reduce((total, chapter) => total + getChapterStudyProgress(chapter), 0);
    return { id: subject.id, name: subject.name, chapters: subjectChapters.length, progress: Math.min(100, progress) };
  });
  const completed = quizRepository.listAttempts().filter((attempt) => typeof attempt.score === "number" && attempt.completedAt);
  const averageScore = completed.length ? completed.reduce((total, attempt) => total + (attempt.score ?? 0), 0) / completed.length : null;
  const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const activities = historyRepository.listAll().map((activity) => {
    const chapter = chapterById.get(activity.chapterId);
    return chapter ? { id: activity.id, detail: activity.detail, subjectId: chapter.subjectId } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null).slice(0, 4);
  const flashcardCount = chapters.reduce((total, chapter) => total + artifactRepository.list(chapter.id, "flashcards").length, 0);
  const latestChapter = [...chapters].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const journey = latestChapter ? [{ title: `Continuar ${latestChapter.title}`, detail: "Retome seu capítulo de onde parou.", href: `/biblioteca/${latestChapter.subjectId}/capitulo/${latestChapter.id}` }] : [];
  return { subjects, chapterCount: chapters.length, averageScore, activities, journey, flashcardCount };
}

export function getChapterStudyProgress(chapter: ChapterRecord) {
  const { id: chapterId, originalText } = chapter;
  const artifacts = artifactRepository.list(chapterId);
  const has = (type: "summary" | "explanation" | "flashcards" | "questions" | "mind-map" | "keywords") => artifacts.some((artifact) => artifact.type === type);
  const flashcards = artifacts.filter((artifact) => artifact.type === "flashcards").reduce((count, artifact) => Math.max(count, countFlashcards(artifact.content)), 0);
  const quizReady = quizRepository.list(chapterId).length > 0;
  const quizDone = quizRepository.listAttempts().some((attempt) => attempt.chapterId === chapterId && attempt.completedAt);
  return (originalText.trim() ? 5 : 0) + (has("summary") ? 20 : 0) + (has("explanation") ? 10 : 0) + (has("questions") ? 10 : 0) + (has("mind-map") ? 10 : 0) + (has("keywords") ? 5 : 0) + Math.min(20, Math.floor(flashcards / 10) * 10) + (quizReady ? 10 : 0) + (quizDone ? 10 : 0);
}

function countFlashcards(content: string) {
  try {
    const parsed: unknown = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed.length;
    if (typeof parsed === "object" && parsed && "flashcards" in parsed && Array.isArray(parsed.flashcards)) return parsed.flashcards.length;
  } catch { /* Flashcards antigos podem ser texto estruturado. */ }
  return content.split(/\n(?=(?:Frente|Pergunta|Card)\s*[:#])/i).filter(Boolean).length;
}

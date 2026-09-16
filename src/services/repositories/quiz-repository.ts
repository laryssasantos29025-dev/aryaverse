"use client";

import type { Quiz, QuizAttempt, UserAnswer } from "@/types/study-flow";
import { createId, readCollection, writeCollection } from "./local-store";

const quizKey = "aryaverse-quizzes";
const attemptKey = "aryaverse-quiz-attempts";

export const quizRepository = {
  listAttempts: () => readCollection<QuizAttempt>(attemptKey),
  list: (chapterId: string) => readCollection<Quiz>(quizKey).filter((quiz) => quiz.chapterId === chapterId),
  latest: (chapterId: string) => readCollection<Quiz>(quizKey).filter((quiz) => quiz.chapterId === chapterId).at(-1) ?? null,
  save: (quiz: Omit<Quiz, "id" | "createdAt">) => {
    const record: Quiz = { ...quiz, id: createId(), createdAt: new Date().toISOString() };
    writeCollection(quizKey, [...readCollection<Quiz>(quizKey), record]);
    return record;
  },
  getAttempt: (id: string) => readCollection<QuizAttempt>(attemptKey).find((attempt) => attempt.id === id) ?? null,
  latestAttempt: (quizId: string) => readCollection<QuizAttempt>(attemptKey).filter((attempt) => attempt.quizId === quizId).at(-1) ?? null,
  startAttempt: (quiz: Quiz, questionIds = quiz.questions.map((question) => question.id)) => {
    const record: QuizAttempt = { id: createId(), quizId: quiz.id, chapterId: quiz.chapterId, questionIds, answers: [], startedAt: new Date().toISOString(), markedForReview: [] };
    writeCollection(attemptKey, [...readCollection<QuizAttempt>(attemptKey), record]);
    return record;
  },
  saveAnswer: (attemptId: string, answer: UserAnswer) => {
    const attempts = readCollection<QuizAttempt>(attemptKey);
    const updated = attempts.map((attempt) => attempt.id !== attemptId ? attempt : { ...attempt, answers: [...attempt.answers.filter((item) => item.questionId !== answer.questionId), answer] });
    writeCollection(attemptKey, updated);
    return updated.find((attempt) => attempt.id === attemptId) ?? null;
  },
  toggleReview: (attemptId: string, questionId: string) => {
    const attempts = readCollection<QuizAttempt>(attemptKey);
    const updated = attempts.map((attempt) => attempt.id !== attemptId ? attempt : { ...attempt, markedForReview: attempt.markedForReview.includes(questionId) ? attempt.markedForReview.filter((id) => id !== questionId) : [...attempt.markedForReview, questionId] });
    writeCollection(attemptKey, updated);
    return updated.find((attempt) => attempt.id === attemptId) ?? null;
  },
  complete: (attemptId: string, score: number) => {
    const attempts = readCollection<QuizAttempt>(attemptKey);
    const updated = attempts.map((attempt) => attempt.id !== attemptId ? attempt : { ...attempt, score, completedAt: new Date().toISOString() });
    writeCollection(attemptKey, updated);
    return updated.find((attempt) => attempt.id === attemptId) ?? null;
  },
};

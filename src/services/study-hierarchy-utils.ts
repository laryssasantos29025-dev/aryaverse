import type { ChapterRecord, StudyBookRecord } from "@/types/study-flow";

export function chaptersForBook(books: StudyBookRecord[], chapters: ChapterRecord[], subjectId: string, bookId: string) {
  const isNormalBook = books.some((book) => book.id === bookId && book.subjectId === subjectId && book.bookType === "normal");
  return isNormalBook ? chapters.filter((chapter) => chapter.subjectId === subjectId && chapter.bookId === bookId) : [];
}

export function chaptersForSubject(books: StudyBookRecord[], chapters: ChapterRecord[], subjectId: string) {
  const normalBookIds = new Set(books.filter((book) => book.subjectId === subjectId && book.bookType === "normal").map((book) => book.id));
  return chapters.filter((chapter) => chapter.subjectId === subjectId && Boolean(chapter.bookId && normalBookIds.has(chapter.bookId)));
}

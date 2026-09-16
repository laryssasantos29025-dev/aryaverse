import { chaptersForBook, chaptersForSubject } from "../src/services/study-hierarchy-utils.ts";

const books = [
  { id: "book-a", subjectId: "subject-x", title: "Livro A", bookType: "normal", createdAt: "", updatedAt: "" },
  { id: "book-b", subjectId: "subject-x", title: "Livro B", bookType: "normal", createdAt: "", updatedAt: "" },
  { id: "book-c", subjectId: "subject-x", title: "Livro C", bookType: "normal", createdAt: "", updatedAt: "" },
  { id: "final", subjectId: "subject-x", title: "PROVA AVALIATIVA FINAL", bookType: "final_assessment", createdAt: "", updatedAt: "" },
] as const;
const chapter = (id: string, bookId: string) => ({ id, subjectId: "subject-x", bookId, title: id, originalText: id, summaryStyle: "complete" as const, status: "ready" as const, createdAt: "", updatedAt: "" });
const chapters = [chapter("A1", "book-a"), chapter("A2", "book-a"), chapter("B1", "book-b"), chapter("B2", "book-b"), chapter("C1", "book-c"), chapter("C2", "book-c")];

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const ids = (items: { id: string }[]) => items.map((item) => item.id).join(",");
assert(ids(chaptersForBook([...books], chapters, "subject-x", "book-a")) === "A1,A2", "Livro A deve usar apenas A1 e A2.");
assert(ids(chaptersForBook([...books], chapters, "subject-x", "book-b")) === "B1,B2", "Livro B deve usar apenas B1 e B2.");
assert(ids(chaptersForSubject([...books], chapters, "subject-x")) === "A1,A2,B1,B2,C1,C2", "A prova final deve agregar todos os capítulos normais.");
assert(chaptersForBook([...books], chapters, "subject-x", "final").length === 0, "Livro final não pode aceitar capítulos próprios.");
console.log("Book hierarchy fixtures passed.");

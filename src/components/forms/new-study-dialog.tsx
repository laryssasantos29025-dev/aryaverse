"use client";

import { useMemo, useState } from "react";
import { Check, Paperclip, X } from "lucide-react";
import { bookRepository } from "@/services/repositories/book-repository";
import { chapterRepository } from "@/services/repositories/chapter-repository";
import { subjectRepository } from "@/services/repositories/subject-repository";
import type { ChapterRecord, SummaryStyle } from "@/types/study-flow";

type BookOption = { id: string; subjectId: string; label: string };

export function NewStudyDialog({ onClose, subjectId, bookId, onCreated }: { onClose: () => void; subjectId?: string; bookId?: string; onCreated?: (chapter: ChapterRecord) => void }) {
  const books = useMemo<BookOption[]>(() => {
    const saved = subjectRepository.list().flatMap((subject) => bookRepository.listNormal(subject.id).map((book) => ({ id: book.id, subjectId: subject.id, label: `${subject.name} · ${book.title}` })));
    const direct = bookId ? bookRepository.get(bookId) : null;
    return direct && !saved.some((book) => book.id === direct.id) ? [{ id: direct.id, subjectId: direct.subjectId, label: direct.title }, ...saved] : saved;
  }, [bookId]);
  const initialBook = bookId && books.some((book) => book.id === bookId) ? bookId : books.find((book) => !subjectId || book.subjectId === subjectId)?.id ?? "";
  const [selectedBookId, setSelectedBookId] = useState(initialBook);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [style, setStyle] = useState<SummaryStyle>("complete");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const selectedBook = books.find((book) => book.id === selectedBookId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !text.trim() || !selectedBook) { setState("error"); return; }
    setState("saving");
    try {
      const chapter = chapterRepository.save({ subjectId: selectedBook.subjectId, bookId: selectedBook.id, title: title.trim(), originalText: text.trim(), summaryStyle: style, status: "draft" });
      onCreated?.(chapter);
      setState("saved");
    } catch { setState("error"); }
  };

  return <div className="dialog-backdrop" role="presentation"><form onSubmit={submit} className="magic-dialog" role="dialog" aria-modal="true" aria-labelledby="new-study-title"><button type="button" onClick={onClose} className="absolute right-5 top-5 text-[var(--muted)]" aria-label="Fechar"><X size={20} /></button><p className="text-sm font-semibold text-[var(--accent)]">NOVO CAPÍTULO</p><h2 id="new-study-title" className="mt-2 font-serif text-3xl font-semibold">Por onde vamos começar?</h2>{state === "saved" ? <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[var(--surface-soft)] p-4 text-sm font-semibold text-[var(--success)]"><Check size={19} />Capítulo salvo e adicionado ao seu livro.</div> : <div className="mt-7 grid gap-4"><label className="dialog-field">Título<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Ex.: Neuroplasticidade e memória" /></label><label className="dialog-field">Adicionar ao livro<select value={selectedBookId} onChange={(event) => setSelectedBookId(event.target.value)} disabled={Boolean(bookId)}><option value="">Selecione um livro</option>{books.filter((book) => !subjectId || book.subjectId === subjectId).map((book) => <option key={book.id} value={book.id}>{book.label}</option>)}</select></label><label className="dialog-field">Cole seu texto<textarea value={text} onChange={(event) => setText(event.target.value)} required placeholder="Cole aqui o conteúdo que deseja estudar." /></label><label className="upload-field"><Paperclip size={18} />Anexar arquivo<input type="file" accept=".pdf,.doc,.docx,.txt,image/*" /></label><label className="dialog-field">Tipo de resumo<select value={style} onChange={(event) => setStyle(event.target.value as SummaryStyle)}><option value="short">Curto</option><option value="complete">Completo</option><option value="bullets">Em tópicos</option><option value="notebook">Para copiar no caderno</option><option value="technical">Técnico</option><option value="simple">Simplificado</option></select></label>{state === "error" && <p role="alert" className="text-sm text-red-700">Informe título, texto e um livro para salvar o capítulo.</p>}<div className="mt-3 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--muted)]">Cancelar</button><button disabled={state === "saving" || !selectedBook} className="rounded-full bg-[var(--button-primary)] px-5 py-2.5 text-sm font-semibold text-white">{state === "saving" ? "Salvando..." : "Continuar"}</button></div></div>}</form></div>;
}

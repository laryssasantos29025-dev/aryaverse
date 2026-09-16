"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { getDashboardData } from "./dashboard-data";

export function LivingLibrary() {
  const books = getDashboardData().subjects;
  return <section className="library-panel mt-7 p-6 sm:p-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]"><BookOpen size={16} />Biblioteca Viva</p><h2 className="mt-2 font-serif text-2xl font-semibold">Sua história mora entre estas páginas.</h2><p className="mt-2 text-sm text-[var(--muted)]">{books.length ? "Abra um livro para retomar seu próximo capítulo." : "Sua primeira matéria fará esta estante ganhar vida."}</p></div><Link href="/biblioteca" className="text-sm font-semibold text-[var(--accent-deep)]">Visitar estante <ArrowRight className="ml-1 inline" size={15} /></Link></div>{books.length ? <div className="library-shelf mt-8 flex min-h-64 items-end justify-around gap-3 px-3 pb-6 pt-4 sm:gap-6 sm:px-8">{books.map((book, index) => <motion.div key={book.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 + index * .09 }}><Link href={`/biblioteca/${book.id}`} className="library-book library-book-sage" style={{ height: `${154 + index * 14}px` }} aria-label={`${book.name}, ${book.chapters} capítulos, ${book.progress}% de progresso`}><Sparkles className="library-book-gold" size={14} /><span className="library-book-title">{book.name}</span><span className="library-book-info">{book.chapters} cap. / {book.progress}%</span></Link></motion.div>)}</div> : null}</section>;
}

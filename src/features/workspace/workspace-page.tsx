"use client";

import { useState } from "react";
import { BookOpen, ChevronRight, FolderPlus, Plus, Search } from "lucide-react";

type WorkspacePageProps = { title: string; description: string; action: string; emptyText: string };

const subjects = [
  { name: "Pedagogia", count: "5 estudos", color: "bg-[var(--accent-soft)]" },
  { name: "Psicologia", count: "3 estudos", color: "bg-[var(--surface-soft)]" },
  { name: "Didática", count: "4 estudos", color: "bg-[var(--glow)]" },
  { name: "Metodologias ativas", count: "2 estudos", color: "bg-[var(--card-bg-secondary)]" },
];

export function WorkspacePage({ title, description, action, emptyText }: WorkspacePageProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(subjects);
  const visibleItems = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  const addItem = () => setItems((current) => [...current, { name: `Nova matéria ${current.length + 1}`, count: "0 estudos", color: "bg-[var(--accent-soft)]" }]);

  return <section>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[var(--accent-strong)]">Meu espaço</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-3 text-[var(--text-secondary)]">{description}</p></div><button onClick={addItem} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--button-primary)] px-5 py-3 text-sm font-semibold text-[var(--text-on-strong)] shadow-[0_8px_20px_var(--shadow-soft)] hover:bg-[var(--button-primary-hover)]"><Plus size={18} />{action}</button></div>
    <div className="relative mt-8 max-w-md"><Search className="absolute left-4 top-3 text-[var(--text-muted)]" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar no seu espaço" className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-3 pl-11 pr-4 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" /></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleItems.map((item) => <article key={item.name} className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[0_5px_20px_var(--shadow-soft)]"><div className={`grid size-11 place-items-center rounded-xl ${item.color}`}><BookOpen size={20} className="text-[var(--accent-strong)]" /></div><h2 className="mt-5 font-semibold">{item.name}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{item.count}</p><button className="mt-5 flex items-center gap-1 text-sm font-medium text-[var(--accent-strong)]">Abrir workspace <ChevronRight size={16} /></button></article>)}</div>
    {visibleItems.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)] p-12 text-center"><FolderPlus className="mx-auto text-[var(--accent)]" size={28} /><p className="mt-3 font-medium">{emptyText}</p><button onClick={addItem} className="mt-4 text-sm font-semibold text-[var(--accent-strong)]">Criar agora</button></div>}
  </section>;
}

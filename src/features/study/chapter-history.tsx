"use client";

import { Clock3 } from "lucide-react";
import type { ActivityHistory } from "@/types/study-flow";
import { historyRepository } from "@/services/repositories/history-repository";

export function ChapterHistory({ chapterId, onOpen }: { chapterId: string; onOpen: (item: ActivityHistory) => void }) {
  const items = historyRepository.list(chapterId);
  return <section className="settings-surface mt-5 p-6"><h2 className="font-serif text-2xl">Histórico do capítulo</h2>{items.length ? <ol className="mt-6 space-y-5 border-l border-[var(--border-strong)] pl-5">{items.map((item) => <li key={item.id} className="relative"><Clock3 size={15} className="absolute -left-[1.85rem] top-1 text-[var(--accent)]" />{item.destination ? <button onClick={() => onOpen(item)} className="text-left"><p className="font-semibold text-[var(--text-primary)] underline-offset-4 hover:underline">{item.detail}</p><span className="mt-1 inline-block text-xs font-semibold text-[var(--accent-strong)]">Abrir material</span></button> : <p className="font-semibold">{item.detail}</p>}<time className="mt-1 block text-xs text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString("pt-BR")}</time></li>)}</ol> : <p className="mt-4 text-sm text-[var(--text-secondary)]">As atividades deste capítulo aparecerão aqui.</p>}</section>;
}

"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { GripHorizontal, Plus, Save, Trash2 } from "lucide-react";
import { diaryRepository } from "@/services/repositories/diary-repository";
import type { DiaryEntry } from "@/types/study-flow";

const colors: DiaryEntry["color"][] = ["aqua", "sapphire", "pearl", "lilac", "gold"];
type DragState = { id: string; startX: number; startY: number; x: number; y: number } | null;

export function DiaryWorkspace() {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => diaryRepository.list());
  const [status, setStatus] = useState("Salvo");
  const drag = useRef<DragState>(null);
  const skipSave = useRef(true);

  useEffect(() => {
    if (skipSave.current) { skipSave.current = false; return; }
    setStatus("Salvando...");
    const timer = window.setTimeout(() => { diaryRepository.replace(entries); setStatus("Salvo"); }, 550);
    return () => window.clearTimeout(timer);
  }, [entries]);

  function update(id: string, patch: Partial<DiaryEntry>) { setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...patch, updatedAt: new Date().toISOString() } : entry)); }
  function create() { const entry = diaryRepository.create({ x: 24 + (entries.length % 3) * 55, y: 24 + (entries.length % 4) * 42 }); setEntries((current) => [...current, entry]); setStatus("Salvo"); }
  function remove(id: string) { if (!window.confirm("Excluir este post-it?")) return; diaryRepository.remove(id); setEntries((current) => current.filter((entry) => entry.id !== id)); setStatus("Salvo"); }
  function startDrag(event: PointerEvent, entry: DiaryEntry) { drag.current = { id: entry.id, startX: event.clientX, startY: event.clientY, x: entry.x, y: entry.y }; event.currentTarget.setPointerCapture(event.pointerId); }
  function moveDrag(event: PointerEvent) { if (!drag.current) return; update(drag.current.id, { x: Math.max(0, drag.current.x + event.clientX - drag.current.startX), y: Math.max(0, drag.current.y + event.clientY - drag.current.startY) }); }
  function persistSize(event: PointerEvent<HTMLElement>, id: string) { update(id, { width: event.currentTarget.offsetWidth, height: event.currentTarget.offsetHeight }); }

  return <div><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[var(--accent)]">DIÁRIO</p><h1 className="mt-2 font-serif text-3xl font-semibold">Pensamentos que merecem ficar.</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Seus post-its são salvos automaticamente e permanecem exatamente onde você os deixou.</p></div><div className="flex items-center gap-3"><span className="text-xs text-[var(--text-muted)]" role="status">{status}</span><button onClick={() => { diaryRepository.replace(entries); setStatus("Salvo"); }} className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold"><Save className="mr-2 inline" size={15} />Salvar</button><button onClick={create} className="rounded-full bg-[var(--button-primary)] px-4 py-2 text-sm font-semibold text-white"><Plus className="mr-2 inline" size={16} />Novo post-it</button></div></header><section className="diary-board settings-surface mt-7" onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>{entries.length ? entries.map((entry) => <DiaryNote key={entry.id} entry={entry} onUpdate={update} onRemove={remove} onStartDrag={startDrag} onPersistSize={persistSize} />) : <div className="diary-empty"><p>Seu mural está pronto para a primeira descoberta.</p><button onClick={create} className="rounded-full bg-[var(--button-primary)] px-4 py-2 text-sm font-semibold text-white">Criar post-it</button></div>}</section></div>;
}

function DiaryNote({ entry, onUpdate, onRemove, onStartDrag, onPersistSize }: { entry: DiaryEntry; onUpdate: (id: string, patch: Partial<DiaryEntry>) => void; onRemove: (id: string) => void; onStartDrag: (event: PointerEvent, entry: DiaryEntry) => void; onPersistSize: (event: PointerEvent<HTMLElement>, id: string) => void }) {
  return <article className={`diary-note diary-note-${entry.color}`} style={{ left: entry.x, top: entry.y, width: entry.width, height: entry.height }} onPointerUp={(event) => onPersistSize(event, entry.id)}><header className="diary-note-handle" onPointerDown={(event) => onStartDrag(event, entry)}><GripHorizontal size={17} /><time>{new Date(entry.createdAt).toLocaleDateString("pt-BR")}</time><button onPointerDown={(event) => event.stopPropagation()} onClick={() => onRemove(entry.id)} aria-label={`Excluir ${entry.title}`}><Trash2 size={15} /></button></header><input value={entry.title} onChange={(event) => onUpdate(entry.id, { title: event.target.value })} aria-label="Título do post-it" className="diary-note-title" placeholder="Título" /><textarea value={entry.content} onChange={(event) => onUpdate(entry.id, { content: event.target.value })} aria-label={`Conteúdo de ${entry.title || "post-it"}`} className="diary-note-content" placeholder="Escreva uma descoberta..." /><footer><select value={entry.color} onChange={(event) => onUpdate(entry.id, { color: event.target.value as DiaryEntry["color"] })} aria-label="Cor do post-it">{colors.map((color) => <option key={color} value={color}>{color === "aqua" ? "Água" : color === "sapphire" ? "Safira" : color === "pearl" ? "Pérola" : color === "lilac" ? "Lilás" : "Dourado"}</option>)}</select><input type="date" value={entry.createdAt.slice(0, 10)} onChange={(event) => onUpdate(entry.id, { createdAt: new Date(`${event.target.value}T12:00:00`).toISOString() })} aria-label="Data do post-it" /><span>{entry.content.length} caracteres</span></footer></article>;
}

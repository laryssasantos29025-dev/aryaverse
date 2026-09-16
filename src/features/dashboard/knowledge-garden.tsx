"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Droplets, Flower2, Gem, TreePine, Waves } from "lucide-react";
import type { DashboardData } from "./dashboard-data";

const plantIcons = [Droplets, Waves, Flower2, TreePine];
function stage(progress: number) { if (progress >= 80) return "Árvore das águas"; if (progress >= 60) return "Flores junto ao riacho"; if (progress >= 40) return "Folhas de cristal"; return "Broto da lagoa"; }

export function KnowledgeGarden({ data }: { data: DashboardData }) {
  if (!data.subjects.length) return null;
  return <section className="garden-panel water-garden-panel p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]"><Gem size={16} />Jardim das Águas</p><h2 className="mt-2 font-serif text-2xl font-semibold">O conhecimento encontra seu próprio curso.</h2><p className="mt-2 text-sm text-[var(--muted)]">Escolha uma nascente para abrir a matéria correspondente na Biblioteca Viva.</p></div><span className="water-badge rounded-full px-3 py-1.5 text-xs font-semibold">{data.subjects.length} livro{data.subjects.length === 1 ? "" : "s"} em fluxo</span></div><div className="garden-bed water-bed mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{data.subjects.map((subject, index) => { const Icon = plantIcons[index % plantIcons.length]; return <motion.div key={subject.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 + index * .08 }}><Link href={`/biblioteca/${subject.id}`} className="garden-plant water-plant block p-4 text-left" aria-label={`Abrir ${subject.name}: ${subject.progress}% de domínio`}><Icon className="garden-plant-art" /><span className="mt-3 block text-sm font-semibold">{subject.name}</span><span className="mt-1 block text-xs text-[var(--text-muted)]">{stage(subject.progress)}</span><span className="garden-plant-progress"><span>{subject.progress}% de domínio</span><i><b style={{ width: `${subject.progress}%` }} /></i><small>{subject.chapters} capítulo{subject.chapters === 1 ? "" : "s"}</small></span></Link></motion.div>; })}</div></section>;
}

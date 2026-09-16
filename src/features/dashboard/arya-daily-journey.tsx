"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { DashboardData } from "./dashboard-data";

export function AryaDailyJourney({ data }: { data: DashboardData }) {
  if (!data.journey.length) return null;
  return <section className="journey-panel mt-7 p-6 sm:p-8"><div className="max-w-xl"><p className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]"><Sparkles size={16} />UMA JORNADA GENTIL</p><h2 className="mt-2 font-serif text-2xl font-semibold">A jornada que Arya preparou para hoje</h2><p className="mt-2 text-sm text-[var(--muted)]">Siga o caminho no seu ritmo. Cada passo fortalece o seu universo.</p></div><div className="journey-path mt-8">{data.journey.map((task, index) => <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .1 + index * .08 }} className="journey-step" key={task.href}><span className="journey-seal">{index + 1}</span><span><strong>{task.title}</strong><small>{task.detail}</small></span><Link href={task.href} className="journey-arrow" aria-label={`Abrir ${task.title}`}><ArrowRight size={17} /></Link></motion.div>)}</div></section>;
}

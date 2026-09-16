"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { AryaDailyJourney } from "./arya-daily-journey";
import { getDashboardData } from "./dashboard-data";
import { DashboardSnapshot } from "./dashboard-snapshot";
import { EnchantedHero } from "./enchanted-hero";
import { KnowledgeGarden } from "./knowledge-garden";
import { ThemedStats } from "./themed-stats";

function AryaNote({ hasSubjects }: { hasSubjects: boolean }) { return <aside className="arya-note water-note p-7"><div className="note-eyebrow flex items-center gap-2 text-sm font-medium"><Sparkles size={17} />Um recado da Arya</div><blockquote className="note-title mt-5 font-serif text-2xl leading-snug">{hasSubjects ? "Cada capítulo novo dá mais vida ao seu universo." : "Sua jornada começa com o primeiro livro."}</blockquote><p className="note-copy mt-5 text-sm leading-6">{hasSubjects ? "Estou aqui para acompanhar seu próximo passo com calma." : "Crie sua primeira matéria para começar a construir sua Biblioteca Viva."}</p><Link href="/biblioteca" className="note-action mt-7 inline-flex items-center gap-2 text-sm font-semibold">{hasSubjects ? "Abrir Biblioteca" : "Criar primeira matéria"} <ArrowRight size={16} /></Link></aside>; }
export function DashboardOverview() { const data = getDashboardData(); return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}><EnchantedHero /><section className="relative mt-8 grid gap-7 xl:grid-cols-[1.45fr_1fr]"><DashboardSnapshot data={data} /><AryaNote hasSubjects={data.subjects.length > 0} /></section><KnowledgeGarden data={data} /><AryaDailyJourney data={data} /><ThemedStats data={data} /></motion.div>; }

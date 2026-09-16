"use client";

import { Droplets, Gem, Waves } from "lucide-react";
import { getDashboardData } from "./dashboard-data";
import { KnowledgeGarden } from "./knowledge-garden";

export function WaterGardenPage() {
  const data = getDashboardData(); const thriving = data.subjects.filter((subject) => subject.progress >= 70).length;
  return <div><header className="water-garden-header settings-surface p-7 sm:p-10"><p className="flex items-center gap-2 text-sm font-semibold text-[var(--glow)]"><Waves size={17} />JARDIM DAS ÁGUAS</p><h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold text-[var(--hero-text)]">Onde cada matéria encontra seu curso.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[var(--hero-copy)]">Acompanhe o crescimento do seu conhecimento pelas nascentes, flores e cristais que surgem a cada capítulo estudado.</p></header>{data.subjects.length ? <><KnowledgeGarden data={data} /><section className="mt-7 grid gap-5 md:grid-cols-3"><GardenDetail icon={Droplets} title="Riachos ativos" detail={`${data.subjects.length} matéria${data.subjects.length === 1 ? " segue" : "s seguem"} em movimento.`} /><GardenDetail icon={Gem} title="Cristais de domínio" detail={`${thriving} matéria${thriving === 1 ? " já ultrapassou" : "s já ultrapassaram"} 70% de domínio.`} /><GardenDetail icon={Waves} title="Fluxo de evolução" detail={`${data.chapterCount} capítulo${data.chapterCount === 1 ? " já foi criado" : "s já foram criados"}.`} /></section></> : <section className="settings-surface mt-7 p-7 text-center"><h2 className="font-serif text-2xl">Seu Jardim das Águas aguarda a primeira nascente.</h2><p className="mt-3 text-sm text-[var(--text-secondary)]">Quando você criar uma matéria, ela florescerá aqui.</p></section>}</div>;
}
function GardenDetail({ icon: Icon, title, detail }: { icon: typeof Droplets; title: string; detail: string }) { return <article className="settings-surface water-garden-detail p-6"><Icon className="text-[var(--glow)]" size={23} /><h2 className="mt-5 font-serif text-xl">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p></article>; }

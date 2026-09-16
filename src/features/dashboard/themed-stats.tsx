import { BookOpen, Clock3, ScrollText, Star } from "lucide-react";
import type { DashboardData } from "./dashboard-data";

export function ThemedStats({ data }: { data: DashboardData }) {
  const stats = [
    { label: "Livros cultivados", value: String(data.subjects.length), icon: BookOpen },
    { label: "Tempo de exploração", value: "0 min", icon: Clock3 },
    { label: "Capítulos escritos", value: String(data.chapterCount), icon: ScrollText },
    ...(data.averageScore === null ? [] : [{ label: "Sabedoria média", value: data.averageScore.toFixed(1).replace(".", ","), icon: Star }]),
  ];
  return <section className="journey-ribbon mt-7" aria-label="Marcas da sua jornada">{stats.map(({ label, value, icon: Icon }) => <div key={label} className="journey-ribbon-item"><Icon size={17} /><span><small>{label}</small><strong>{value}</strong></span></div>)}</section>;
}

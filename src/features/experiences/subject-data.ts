export type SubjectDetailData = { name: string; progress: number; chapters: readonly string[] };

const content: Record<string, SubjectDetailData> = {
  pedagogia: { name: "Pedagogia", progress: 18, chapters: ["Neuroplasticidade e aprendizagem", "Teorias da educação", "Planejamento escolar"] },
  psicologia: { name: "Psicologia", progress: 46, chapters: ["Desenvolvimento humano", "Psicologia da educação", "Aprendizagem e memória"] },
  didatica: { name: "Didática", progress: 72, chapters: ["Planejamento de ensino", "Metodologias ativas", "Avaliação formativa"] },
  "desenvolvimento-infantil": { name: "Desenvolvimento Infantil", progress: 91, chapters: ["Primeira infância", "Linguagem e vínculos", "Brincar e aprender"] },
};

export function getSubject(slug: string): SubjectDetailData | null { const known = content[slug]; if (known) return known; const name = slug.split("-").filter((part) => !/^\d+$/.test(part)).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); return name ? { name, progress: 0, chapters: [] } : null; }

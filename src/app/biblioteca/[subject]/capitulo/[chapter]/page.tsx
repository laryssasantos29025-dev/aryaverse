import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChapterStudy } from "@/features/study/chapter-study";
export default async function ChapterPage(props: PageProps<"/biblioteca/[subject]/capitulo/[chapter]">) { const { subject, chapter } = await props.params; return <DashboardShell><ChapterStudy subjectId={subject} chapterId={chapter} /></DashboardShell>; }

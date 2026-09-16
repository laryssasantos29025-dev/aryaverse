import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SubjectDetail } from "@/features/experiences/subject-detail";
import { getSubject } from "@/features/experiences/subject-data";
export default async function SubjectPage(props: PageProps<"/biblioteca/[subject]">) { const { subject: slug } = await props.params; const subject = getSubject(slug); if (!subject) notFound(); return <DashboardShell><SubjectDetail subject={subject} subjectId={slug} /></DashboardShell>; }

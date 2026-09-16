import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FinalAssessmentWorkspace } from "@/features/study/final-assessment-workspace";

export default async function FinalAssessmentPage(props: PageProps<"/biblioteca/[subject]/avaliacao-final">) {
  const { subject } = await props.params;
  return <DashboardShell><FinalAssessmentWorkspace subjectId={subject} /></DashboardShell>;
}

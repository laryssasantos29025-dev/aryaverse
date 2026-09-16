import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FinalAssessmentWorkspace } from "@/features/study/final-assessment-workspace";

export default async function BookAssessmentPage(props: PageProps<"/biblioteca/[subject]/livro/[book]/avaliacao">) {
  const { subject, book } = await props.params;
  return <DashboardShell><FinalAssessmentWorkspace subjectId={subject} bookId={book} scope="book" /></DashboardShell>;
}

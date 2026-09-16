import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BookDetail } from "@/features/experiences/book-detail";

export default async function BookPage(props: PageProps<"/biblioteca/[subject]/livro/[book]">) {
  const { subject, book } = await props.params;
  return <DashboardShell><BookDetail subjectId={subject} bookId={book} /></DashboardShell>;
}

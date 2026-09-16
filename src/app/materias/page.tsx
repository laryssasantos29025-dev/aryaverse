import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WorkspacePage } from "@/features/workspace/workspace-page";
export default function SubjectsPage() { return <DashboardShell><WorkspacePage title="Matérias" description="Organize seu universo em matérias e estudos." action="Nova matéria" emptyText="Nenhuma matéria encontrada." /></DashboardShell>; }

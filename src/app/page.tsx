import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";

export default function Home() {
  return (
    <DashboardShell>
      <DashboardOverview />
    </DashboardShell>
  );
}

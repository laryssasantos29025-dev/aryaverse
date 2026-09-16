import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminDashboard } from "@/features/admin/admin-dashboard";

export default function AdminPage() {
  return <DashboardShell><AdminDashboard /></DashboardShell>;
}

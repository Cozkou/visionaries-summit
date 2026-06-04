import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { InternalShell } from "@/components/layout/internal-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InternalShell sidebar={<DashboardSidebar />}>{children}</InternalShell>
  );
}

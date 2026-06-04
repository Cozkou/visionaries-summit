import { ControlTowerView } from "@/components/control-tower-view";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default function ControlTowerPage() {
  return (
    <AppShell>
      <ControlTowerView />
    </AppShell>
  );
}

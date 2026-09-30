import { VeraPageLayout } from "@/src/components/navigation";
import { VeriForgeDashboardSystemView } from "@/components/veriforge-dashboard-system/VeriForgeDashboardSystemView";

export const metadata = {
  title: "VeriForge Dashboard System",
  description:
    "Unified VERICore, VERIPM, contractor scoring, industry comparison, and drill-down.",
};

export default function VeriForgeDashboardSystemPage() {
  return (
    <VeraPageLayout
      title="VeriForge Dashboard System"
      description="Master entry for safety, maintenance, contractor scores, and shared analytics."
    >
      <VeriForgeDashboardSystemView />
    </VeraPageLayout>
  );
}

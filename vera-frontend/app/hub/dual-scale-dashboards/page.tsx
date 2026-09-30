import { VeraPageLayout } from "@/src/components/navigation";
import { DualScaleDashboardsView } from "@/components/dual-scale-dashboards/DualScaleDashboardsView";

export const metadata = {
  title: "Dual-Scale Dashboards — Project & Company",
  description:
    "Isolated project-scale and company-scale analytics with optional cross-plane opt-in.",
};

export default function DualScaleDashboardsPage() {
  return (
    <VeraPageLayout>
      <DualScaleDashboardsView />
    </VeraPageLayout>
  );
}

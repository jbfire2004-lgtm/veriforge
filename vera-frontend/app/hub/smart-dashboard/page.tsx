import { VeraPageLayout } from "@/src/components/navigation";
import { SmartDashboardEngineView } from "@/components/smart-dashboard/SmartDashboardEngineView";

export const metadata = {
  title: "Smart Dashboard Engine",
  description:
    "AI anomaly, trend, narrative, risk forecast, and correlation analysis for safety dashboards.",
};

export default function SmartDashboardPage() {
  return (
    <VeraPageLayout>
      <SmartDashboardEngineView />
    </VeraPageLayout>
  );
}

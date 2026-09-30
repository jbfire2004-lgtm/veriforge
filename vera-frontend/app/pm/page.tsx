import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmHomeDashboardView } from "@/components/veripm-home-dashboard/VeriPmHomeDashboardView";

export const metadata = {
  title: "VeriPM — Safety hub",
  description:
    "Project and company safety overview: incidents, leading indicators, corrective actions, and smart insights.",
};

export default function PmHomeRoute() {
  return (
    <VeraPageLayout>
      <VeriPmHomeDashboardView />
    </VeraPageLayout>
  );
}

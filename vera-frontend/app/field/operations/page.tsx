import { VeraPageLayout } from "@/src/components/navigation";
import { FieldOperationsDashboardView } from "@/components/field/FieldOperationsDashboardView";

export const metadata = {
  title: "FieldOS Field Operations Dashboard",
  description:
    "Real-time field intelligence — inspections, hazards, near-miss, equipment, competency, regional risk, AI anomalies.",
};

export default function FieldOperationsPage() {
  return (
    <VeraPageLayout>
      <FieldOperationsDashboardView />
    </VeraPageLayout>
  );
}

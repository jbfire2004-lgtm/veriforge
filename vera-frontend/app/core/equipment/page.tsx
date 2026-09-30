import { CoreEquipmentView } from "@/src/components/core/CoreEquipmentView";
import { VeraPageLayout } from "@/src/components/navigation";

export const metadata = {
  title: "Equipment profiles — Vera Core",
  description: "Equipment registry, inspections, and readiness scoring.",
};

export default function CoreEquipmentPage() {
  return (
    <VeraPageLayout
      title="Equipment profiles"
      description="Search assets, compliance status, inspections, and training requirements."
    >
      <CoreEquipmentView />
    </VeraPageLayout>
  );
}

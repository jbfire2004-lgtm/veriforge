import { CoreTwinDashboard } from "@/src/components/core/CoreTwinDashboard";
import { VeraPageLayout } from "@/src/components/navigation";

export const metadata = {
  title: "Digital twins — Vera Core",
  description: "Generate and monitor worker, equipment, and project digital twins.",
};

export default function CoreTwinsPage() {
  return (
    <VeraPageLayout
      title="Digital twins"
      description="Live twin state from compliance, training, and operational data."
    >
      <CoreTwinDashboard />
    </VeraPageLayout>
  );
}

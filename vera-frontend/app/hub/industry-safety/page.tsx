import { VeraPageLayout } from "@/src/components/navigation";
import { IndustrySafetyShell } from "@/components/hub/industry-safety/IndustrySafetyShell";

export const metadata = {
  title: "Industry Safety Intelligence — Vera Hub",
  description:
    "Industry Selector System with Project and Company planes. Dynamic filters, n≥5 gating, plane isolation.",
};

export default function HubIndustrySafetyPage() {
  return (
    <VeraPageLayout
      title="Industry Safety Intelligence"
      description="Industry · Entity type · Subtype · Scale — dynamic filters, n≥5 only, no cross-plane contamination."
    >
      <IndustrySafetyShell initialEntityType="project" />
    </VeraPageLayout>
  );
}

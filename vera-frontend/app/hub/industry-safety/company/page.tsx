import { VeraPageLayout } from "@/src/components/navigation";
import { IndustrySafetyShell } from "@/components/hub/industry-safety/IndustrySafetyShell";

export const metadata = {
  title: "Company-Scale Industry Dashboard — Vera Hub",
  description:
    "Company-plane industry benchmarks via the Industry Selector System.",
};

export default function HubIndustrySafetyCompanyPage() {
  return (
    <VeraPageLayout
      title="Industry Safety Intelligence"
      description="Your company vs industry · Company-Scale plane · n≥5 · anonymized cohorts."
    >
      <IndustrySafetyShell initialEntityType="company" />
    </VeraPageLayout>
  );
}

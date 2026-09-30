import { VeraPageLayout } from "@/src/components/navigation";
import { VeriSuiteIntelligenceView } from "@/components/verisuite-intelligence/VeriSuiteIntelligenceView";

export const metadata = {
  title: "VeriSuite Intelligence System",
  description:
    "Dual dashboards, regional drilldown, industry aggregation, anonymization, and AI insights.",
};

export default function VeriSuiteIntelligencePage() {
  return (
    <VeraPageLayout>
      <VeriSuiteIntelligenceView />
    </VeraPageLayout>
  );
}

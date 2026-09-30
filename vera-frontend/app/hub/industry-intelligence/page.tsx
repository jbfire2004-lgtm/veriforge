import { VeraPageLayout } from "@/src/components/navigation";
import { IndustryIntelligenceView } from "@/components/hub/industry-intelligence/IndustryIntelligenceView";

export const metadata = {
  title: "VeriHub Industry Intelligence",
  description:
    "Mining, construction, and manufacturing safety intelligence — benchmarks, HECA, predictive risk.",
};

export default function IndustryIntelligencePage() {
  return (
    <VeraPageLayout>
      <IndustryIntelligenceView />
    </VeraPageLayout>
  );
}

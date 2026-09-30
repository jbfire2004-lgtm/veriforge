import { VeraPageLayout } from "@/src/components/navigation";
import { AggregationEngineView } from "@/components/verisuite-aggregation/AggregationEngineView";

export const metadata = {
  title: "VeriSuite AI Industry Data Aggregation Engine",
  description:
    "Continuous web search, multi-modal AI extract, normalize, anonymize, daily benchmarks, AI narratives.",
};

export default function AggregationEnginePage() {
  return (
    <VeraPageLayout>
      <AggregationEngineView />
    </VeraPageLayout>
  );
}

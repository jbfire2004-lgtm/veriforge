import { VeraPageLayout } from "@/src/components/navigation";
import { RegionalDrilldownEngineView } from "@/components/regional-drilldown/RegionalDrilldownEngineView";

export const metadata = {
  title: "Regional Drilldown Engine",
  description:
    "Global → Site hierarchy — filter dashboards, normalize by region, compare regions and industries.",
};

export default function RegionalDrilldownPage() {
  return (
    <VeraPageLayout>
      <RegionalDrilldownEngineView />
    </VeraPageLayout>
  );
}

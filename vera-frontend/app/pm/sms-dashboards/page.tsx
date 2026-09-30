import { VeraPageLayout } from "@/src/components/navigation";
import { SmsAssembledDashboardGallery } from "@/components/verisuite-sms-dashboards";

export const metadata = {
  title: "SMS Dashboards — VeriSuite",
  description:
    "Assembled VeriSuite SMS dashboards using Step 1 design-system components — drilldown, AI panels, regional.",
};

export default function SmsAssembledDashboardsPage() {
  return (
    <VeraPageLayout>
      <SmsAssembledDashboardGallery />
    </VeraPageLayout>
  );
}

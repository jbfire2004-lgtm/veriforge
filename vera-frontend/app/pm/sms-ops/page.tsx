import { VeraPageLayout } from "@/src/components/navigation";
import { SmsPostLaunchOpsView } from "@/components/verisuite-sms-ops/SmsPostLaunchOpsView";

export const metadata = {
  title: "SMS Ops — VeriSuite",
  description:
    "Post-launch monitoring and release cycle for VeriSuite SMS — AI, incidents, inspections, FLHA/JHA/ERP, competency, benchmarks.",
};

export default function SmsOpsPage() {
  return (
    <VeraPageLayout>
      <SmsPostLaunchOpsView />
    </VeraPageLayout>
  );
}

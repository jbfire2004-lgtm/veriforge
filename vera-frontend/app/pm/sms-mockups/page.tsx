import { VeraPageLayout } from "@/src/components/navigation";
import { VeriSuiteSmsMockupGallery } from "@/components/verisuite-sms-mockups/VeriSuiteSmsMockupGallery";

export const metadata = {
    title: "SMS Mockups — VeriSuite",
  description:
    "FINALIZED Step 1 design system — pixel screens, UI kit, desktop/tablet handoff for VeriSuite SMS.",
};

export default function VeriSuiteSmsMockupsPage() {
  return (
    <VeraPageLayout>
      <VeriSuiteSmsMockupGallery />
    </VeraPageLayout>
  );
}

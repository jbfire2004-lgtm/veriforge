import { CoreVerificationHub } from "@/src/components/core/CoreVerificationHub";
import { VeraPageLayout } from "@/src/components/navigation";

export const metadata = {
  title: "Verification hub — Vera Core",
  description: "Training verification queue, ingestion runs, and record lookup.",
};

export default function CoreVerificationPage() {
  return (
    <VeraPageLayout
      title="Verification hub"
      description="Review pending training validations, ingestion runs, and verify individual records."
    >
      <CoreVerificationHub />
    </VeraPageLayout>
  );
}

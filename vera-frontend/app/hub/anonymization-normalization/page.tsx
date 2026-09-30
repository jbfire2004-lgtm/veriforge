import { VeraPageLayout } from "@/src/components/navigation";
import { AnonymizationNormalizationView } from "@/components/anonymization-normalization/AnonymizationNormalizationView";

export const metadata = {
  title: "Anonymization & Normalization Engine",
  description:
    "Tokenize IDs, strip identifiers, normalize /200k metrics, blind aggregation, min-sample enforcement.",
};

export default function AnonymizationNormalizationPage() {
  return (
    <VeraPageLayout>
      <AnonymizationNormalizationView />
    </VeraPageLayout>
  );
}

import { CoreWorkersView } from "@/src/components/core/CoreWorkersView";
import { VeraPageLayout } from "@/src/components/navigation";

export const metadata = {
  title: "Worker profiles — Vera Core",
  description: "Global worker registry, readiness, and training records.",
};

export default function CoreWorkersPage() {
  return (
    <VeraPageLayout
      title="Worker profiles"
      description="Search the global registry, view readiness scores, training, and company assignments."
    >
      <CoreWorkersView />
    </VeraPageLayout>
  );
}

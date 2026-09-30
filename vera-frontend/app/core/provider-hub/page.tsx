import { Suspense } from "react";
import { ProviderIntegrationHubPanel } from "@/src/components/core/ProviderIntegrationHubPanel";
import { VeraPageLayout } from "@/src/components/navigation";

export const metadata = {
  title: "Provider integration hub — Vera Core",
  description:
    "Training provider channels, ingestion health, validation failures, and integration event flow.",
};

export default function ProviderIntegrationHubPage() {
  return (
    <VeraPageLayout
      title="Provider integration hub"
      description="Monitor training provider connections, ingestion channels, validation outcomes, and the automated verification pipeline across your organization."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading provider hub…</p>}>
        <ProviderIntegrationHubPanel />
      </Suspense>
    </VeraPageLayout>
  );
}

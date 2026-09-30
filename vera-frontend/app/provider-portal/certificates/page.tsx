import { CertificateIssueClient } from "./CertificateIssueClient";
import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { Breadcrumbs, ErrorState } from "@/components/ui";

export default async function CertificateIssuancePage() {
  const dash = await apiGetSafeProviderDashboard();
  if (!dash.ok) {
    return <ErrorState title="Could not load provider" description={dash.error} />;
  }

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Provider portal", href: "/provider-portal" },
          { label: "Certificates" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Certificate issuance</h1>
      <CertificateIssueClient providerId={dash.data.provider.id} />
    </div>
  );
}

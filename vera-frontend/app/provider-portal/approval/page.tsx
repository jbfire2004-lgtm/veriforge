import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { ApprovalClient } from "./ApprovalClient";
import { Breadcrumbs, ErrorState } from "@/components/ui";

export default async function ProviderApprovalPage() {
  const dash = await apiGetSafeProviderDashboard();
  if (!dash.ok) return <ErrorState title="Unavailable" description={dash.error} />;

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs items={[{ label: "Provider portal", href: "/provider-portal" }, { label: "Approval" }]} />
      <h1 className="text-2xl font-semibold">Provider approval</h1>
      <ApprovalClient providerId={dash.data.provider.id} />
    </div>
  );
}

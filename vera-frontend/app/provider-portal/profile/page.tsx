import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { Breadcrumbs, Card, CardContent, ErrorState } from "@/components/ui";

export default async function ProviderProfilePage() {
  const dash = await apiGetSafeProviderDashboard();

  if (!dash.ok) {
    return <ErrorState title="Could not load profile" description={dash.error} />;
  }

  const p = dash.data.provider;

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Provider portal", href: "/provider-portal" },
          { label: "Profile" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Provider profile</h1>
      <Card>
        <CardContent className="pt-6 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span> {p.name}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span> {p.email ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Phone:</span> {p.phone ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Website:</span> {p.website ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Address:</span> {p.address ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Approval:</span> {p.approvalStatus}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

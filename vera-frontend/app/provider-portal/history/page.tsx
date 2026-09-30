import { apiGetSafe } from "@/lib/api";
import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { Breadcrumbs, Card, CardContent, ErrorState } from "@/components/ui";

export default async function ProviderHistoryPage() {
  const dash = await apiGetSafeProviderDashboard();
  if (!dash.ok) {
    return <ErrorState title="Could not load provider" description={dash.error} />;
  }

  const history = await apiGetSafe<unknown[]>(
    `/api/v1/training-providers/providers/${dash.data.provider.id}/history`
  );

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Provider portal", href: "/provider-portal" },
          { label: "History" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Training history</h1>
      {!history.ok ? (
        <ErrorState title="History unavailable" description={history.error} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ul className="divide-y text-sm">
              {(
                history.data as {
                  id: number;
                  issuedAt: string;
                  worker?: { firstName?: string; lastName?: string };
                  certification?: { name?: string };
                  course?: { name?: string };
                }[]
              ).map((r) => (
                <li key={r.id} className="py-3">
                  <p className="font-medium">
                    {r.worker?.firstName} {r.worker?.lastName}
                  </p>
                  <p className="text-muted-foreground">
                    {r.certification?.name}
                    {r.course?.name ? ` · ${r.course.name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.issuedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

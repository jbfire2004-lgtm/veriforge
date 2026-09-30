import { apiGetSafe } from "@/lib/api";
import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { Breadcrumbs, Card, CardContent, ErrorState } from "@/components/ui";

export default async function ProviderInstructorsPage() {
  const dash = await apiGetSafeProviderDashboard();
  if (!dash.ok) {
    return <ErrorState title="Could not load provider" description={dash.error} />;
  }

  const list = await apiGetSafe<unknown[]>(
    `/api/v1/training-providers/providers/${dash.data.provider.id}/instructors`
  );

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Provider portal", href: "/provider-portal" },
          { label: "Instructors" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Instructor management</h1>
      {!list.ok ? (
        <ErrorState title="Could not load instructors" description={list.error} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ul className="divide-y text-sm">
              {(
                list.data as {
                  id: number;
                  firstName: string;
                  lastName: string;
                  qualificationStatus: string;
                }[]
              ).map((i) => (
                <li key={i.id} className="flex justify-between py-2">
                  <span>
                    {i.firstName} {i.lastName}
                  </span>
                  <span className="text-muted-foreground">{i.qualificationStatus}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

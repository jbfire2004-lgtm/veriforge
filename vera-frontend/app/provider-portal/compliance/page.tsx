import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { ProviderInstructorCompliance } from "./ProviderInstructorCompliance";
import { Breadcrumbs, Card, CardContent, ErrorState, buttonStyles } from "@/components/ui";

export default async function ProviderCompliancePage() {
  const dash = await apiGetSafeProviderDashboard();
  if (!dash.ok) {
    return <ErrorState title="Could not load provider" description={dash.error} />;
  }

  const history = await apiGetSafe<
    { id: number; status: string; score: number | null; assessedAt: string; gaps: unknown }[]
  >(`/api/v1/training-providers/providers/${dash.data.provider.id}/compliance`);

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Provider portal", href: "/provider-portal" },
          { label: "Compliance" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Provider compliance</h1>
      <p className="text-sm text-muted-foreground">
        CSA, OHS, and qualification validation for {dash.data.provider.name}.
      </p>
      <Link
        href="/admin/training-standards/results"
        className={buttonStyles({ variant: "outline", size: "sm", className: "inline-flex" })}
      >
        View all validation results
      </Link>
      <ProviderInstructorCompliance providerId={dash.data.provider.id} />
      {!history.ok ? (
        <ErrorState title="Compliance history unavailable" description={history.error} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ul className="divide-y text-sm">
              {history.data.map((row) => (
                <li key={row.id} className="py-3">
                  <div className="flex justify-between">
                    <strong>{row.status}</strong>
                    <span className="text-muted-foreground">
                      {row.score != null ? `${row.score}%` : "—"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.assessedAt).toLocaleString()}
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

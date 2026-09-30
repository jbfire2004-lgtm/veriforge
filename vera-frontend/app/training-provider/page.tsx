import Link from "next/link";
import { AlertTriangle, Building2, Eye, ShieldCheck } from "lucide-react";
import { apiGetSafe } from "@/lib/api";
import {
  Badge,
  Breadcrumbs,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  buttonStyles,
} from "@/components/ui";

type CompanySummary = {
  id: number;
  name?: string | null;
};

type ComplianceSummary = {
  companyId: number;
  expiredTrainingCount: number;
  expiredCredentialsCount: number;
};

type CompanyWithCompliance = CompanySummary & { compliance: ComplianceSummary };

const breadcrumbs = [
  { label: "VERA", href: "/" },
  { label: "Company compliance" },
];

export default async function TrainingProviderDashboard() {
  const companiesRes = await apiGetSafe<CompanySummary[]>("/companies");
  if (!companiesRes.ok) {
    return (
      <div className="p-vera-6 space-y-vera-6">
        <Breadcrumbs items={breadcrumbs} className="text-vera-muted" />
        <ErrorState title="Could not load companies" description={companiesRes.error} />
      </div>
    );
  }

  const enriched = await Promise.all(
    companiesRes.data.map(async (c): Promise<CompanyWithCompliance> => {
      const comp = await apiGetSafe<ComplianceSummary>(`/companies/${c.id}/compliance`);
      const compliance: ComplianceSummary = comp.ok
        ? comp.data
        : {
            companyId: c.id,
            expiredTrainingCount: 0,
            expiredCredentialsCount: 0,
          };
      return { ...c, compliance };
    })
  );

  const highRisk = enriched.filter(
    (c) =>
      c.compliance.expiredTrainingCount > 0 ||
      c.compliance.expiredCredentialsCount > 0
  );

  return (
    <div className="p-vera-6 space-y-vera-8">
      <Breadcrumbs items={breadcrumbs} className="text-vera-muted" />

      <header className="space-y-vera-2">
        <h1 className="text-3xl font-bold tracking-tight text-vera-deep">
          Company compliance overview
        </h1>
        <p className="text-sm text-vera-muted">
          Workers are rostered under each company profile. Training schools issue certificates on training records;
          this view is only a cross-company expiry roll-up for admins and project managers.
        </p>
      </header>

      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">High-risk companies</CardTitle>
          <CardDescription>
            One or more expired training records or credentials on file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {highRisk.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Nothing high-risk"
              description="All managed companies are within compliance."
            />
          ) : (
            <ul className="space-y-vera-3">
              {highRisk.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-vera-3 rounded-xl border border-vera-charcoal/10 bg-vera-surface/40 p-vera-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-vera-deep">{c.name ?? `Company #${c.id}`}</p>
                    <p className="text-xs text-vera-muted">
                      Expired training: {c.compliance.expiredTrainingCount} · Expired credentials:{" "}
                      {c.compliance.expiredCredentialsCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-vera-2">
                    <Badge variant="danger" icon={AlertTriangle}>
                      At risk
                    </Badge>
                    <Link
                      href={`/companies/${c.id}`}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">All companies</CardTitle>
          <CardDescription>
            Tap a row to open its compliance dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enriched.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No companies"
              description="Companies will appear here once they're added to the directory."
            />
          ) : (
            <ul className="space-y-vera-2">
              {enriched.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-vera-3 rounded-xl border border-vera-charcoal/10 p-vera-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-vera-deep">{c.name ?? `Company #${c.id}`}</p>
                    <p className="text-xs text-vera-muted">
                      Expired training: {c.compliance.expiredTrainingCount} · Expired credentials:{" "}
                      {c.compliance.expiredCredentialsCount}
                    </p>
                  </div>
                  <Link
                    href={`/companies/${c.id}`}
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

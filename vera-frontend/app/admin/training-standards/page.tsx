import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import type { StandardsDashboard } from "@/lib/api/training-standards";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, ErrorState, buttonStyles } from "@/components/ui";

export default async function TrainingStandardsDashboardPage() {
  const res = await apiGetSafe<StandardsDashboard>("/api/v1/training-standards/dashboard");

  return (
    <AdminPageShell
      title="Training standards compliance"
      description="CSA, provincial OHS, federal regulations, and provider/instructor qualification validation."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training standards" },
      ]}
    >
      {!res.ok ? (
        <ErrorState title="Dashboard unavailable" description={res.error} />
      ) : (
        <section className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Pending" value={res.data.pending} />
            <Stat label="Approved" value={res.data.approved} />
            <Stat label="Rejected" value={res.data.rejected} warn />
            <Stat label="Needs review" value={res.data.needsReview} warn />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/training-standards/results" className={buttonStyles({ variant: "teal" })}>
              Validation results
            </Link>
            <Link href="/admin/training-standards/rejections" className={buttonStyles({ variant: "outline" })}>
              Rejection reasons
            </Link>
            <Link href="/provider-portal/compliance" className={buttonStyles({ variant: "outline" })}>
              Provider compliance
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-3 font-medium">Recent validations</h2>
              <ul className="divide-y text-sm">
                {(
                  res.data.recent as {
                    id: number;
                    outcome: string;
                    score: number | null;
                    subjectType: string;
                    validatedAt: string;
                  }[]
                ).map((r) => (
                  <li key={r.id} className="flex justify-between py-2">
                    <span>
                      #{r.id} · {r.subjectType}
                    </span>
                    <span className="text-muted-foreground">
                      {r.outcome} {r.score != null ? `(${r.score}%)` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </AdminPageShell>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${warn && value > 0 ? "text-amber-700" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

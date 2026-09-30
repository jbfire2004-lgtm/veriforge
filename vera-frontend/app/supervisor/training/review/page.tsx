import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { requireRouteAccess } from "@/lib/route-access";
import { canAccessSupervisorShell } from "@/lib/phase1-roles";
import {
  getUserCompanyContext,
  mergeCompaniesWithUser,
} from "@/lib/user-company-context";
import { TrainingNeedsReviewQueue } from "@/components/training/TrainingNeedsReviewQueue";
import {
  Breadcrumbs,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  buttonStyles,
} from "@/components/ui";
import { WorkspaceHero } from "@/components/theme/workspace";

export default async function SupervisorTrainingReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { session } = await requireRouteAccess({
    callbackUrl: "/supervisor/training/review",
    guard: canAccessSupervisorShell,
  });

  const { companyId: companyIdRaw } = await searchParams;
  const [companiesRes, userCompany] = await Promise.all([
    apiGetSafe<{ id: number; name: string }[]>("/companies", session),
    getUserCompanyContext(session),
  ]);
  const companies = mergeCompaniesWithUser(
    companiesRes.ok ? companiesRes.data : [],
    userCompany,
  );
  const companyId = companyIdRaw
    ? Number(companyIdRaw)
    : userCompany.companyId ?? companies[0]?.id ?? 1;

  const queueRes = await apiGetSafe<unknown[]>(
    `/api/v1/training-ingestion/needs-review?companyId=${companyId}&limit=50`,
    session,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-vera-8 px-vera-6 py-vera-10 pb-28">
      <Breadcrumbs
        className="text-vera-muted"
        items={[
          { label: "Supervisor", href: "/supervisor" },
          { label: "Training review" },
        ]}
      />

      <WorkspaceHero
        eyebrow="Training credentials"
        title="Needs review"
        description="Low-confidence ingestions and mismatched QR links land here. Approve, reject, or inspect the full verification chain before credentials go live."
        badges={[{ label: "Supervisor queue", tone: "amber" }]}
      />

      <div className="flex flex-wrap gap-2">
        <Link href="/supervisor/scan" className={buttonStyles({ variant: "teal", size: "sm" })}>
          Scan certificate QR
        </Link>
        <Link href="/core/training-ingest" className={buttonStyles({ variant: "outline", size: "sm" })}>
          Upload training
        </Link>
      </div>

      {companies.length > 1 ? (
        <Card className="border-vera-charcoal/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Company</CardTitle>
            <CardDescription>
              Showing review queue for company #{companyId}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/supervisor/training/review?companyId=${c.id}`}
                className={buttonStyles({
                  variant: c.id === companyId ? "teal" : "outline",
                  size: "sm",
                })}
              >
                {c.name}
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {!queueRes.ok ? (
        <ErrorState title="Queue unavailable" description={queueRes.error} />
      ) : (
        <TrainingNeedsReviewQueue
          companyId={companyId}
          initialItems={
            queueRes.data as Parameters<typeof TrainingNeedsReviewQueue>[0]["initialItems"]
          }
          recordHrefPrefix="/admin/training"
        />
      )}
    </div>
  );
}

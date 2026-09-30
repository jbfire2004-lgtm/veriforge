import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import type { StandardsDashboard } from "@/lib/api/training-standards";
import type { IngestionRun } from "@/lib/api/training-ingestion";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { TrainingIngestionUpload } from "@/components/training/TrainingIngestionUpload";
import { LedgerBackfillPanel } from "@/components/training/LedgerBackfillPanel";
import {
  Card,
  CardContent,
  ErrorState,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  buttonStyles,
} from "@/components/ui";

export default async function TrainingOpsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; tab?: string }>;
}) {
  const { companyId: companyIdRaw, tab } = await searchParams;
  const companiesRes = await apiGetSafe<{ id: number; name: string }[]>("/companies");
  const companies = companiesRes.ok ? companiesRes.data : [];
  const companyId = companyIdRaw
    ? Number(companyIdRaw)
    : companies[0]?.id ?? 1;

  const [standardsRes, runsRes, pendingRes] = await Promise.all([
    apiGetSafe<StandardsDashboard>("/api/v1/training-standards/dashboard"),
    apiGetSafe<IngestionRun[]>(
      `/api/v1/training-ingestion/runs?companyId=${companyId}&limit=30`,
    ),
    apiGetSafe<unknown[]>(
      `/api/v1/training-ingestion/verification-queue?companyId=${companyId}&limit=20`,
    ),
  ]);

  const defaultTab = tab ?? "pending";

  return (
    <AdminPageShell
      title="Training operations"
      description="Upload certificates, track ingestion runs, and verify training for your workforce."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training", href: "/admin/training" },
        { label: "Dashboard" },
      ]}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={`/admin/training/verification?companyId=${companyId}`}
          className={buttonStyles({ variant: "teal" })}
        >
          Verifier queue
        </Link>
        <Link
          href={`/supervisor/training/review?companyId=${companyId}`}
          className={buttonStyles({ variant: "outline" })}
        >
          Needs review
        </Link>
        <Link href="/admin/settings" className={buttonStyles({ variant: "outline" })}>
          System settings
        </Link>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending verification</TabsTrigger>
          <TabsTrigger value="recent">Recently uploaded</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="expiring">Expiring soon</TabsTrigger>
          <TabsTrigger value="ledger">Ledger backfill</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {!pendingRes.ok ? (
            <ErrorState title="Queue unavailable" description={pendingRes.error} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="mb-3 text-sm text-muted-foreground">
                  {(pendingRes.data as unknown[]).length} item(s) awaiting review
                </p>
                <ul className="divide-y text-sm">
                  {(pendingRes.data as { id: number; trainingRecord?: { worker?: { firstName: string; lastName: string } } }[]).map(
                    (row) => (
                      <li key={row.id} className="flex justify-between py-2">
                        <span>
                          Validation #{row.id}
                          {row.trainingRecord?.worker
                            ? ` — ${row.trainingRecord.worker.firstName} ${row.trainingRecord.worker.lastName}`
                            : ""}
                        </span>
                        <Link
                          href="/admin/training/verification"
                          className="text-teal-700 underline"
                        >
                          Review
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {!runsRes.ok ? (
            <ErrorState title="Runs unavailable" description={runsRes.error} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <ul className="divide-y text-sm">
                  {runsRes.data.map((run) => (
                    <li key={run.id} className="flex justify-between py-2">
                      <span>
                        #{run.id} {run.originalFilename} · {run.sourceChannel}
                      </span>
                      <span className="text-muted-foreground">
                        {run.status}
                        {run.ocrConfidence != null
                          ? ` · OCR ${Math.round(run.ocrConfidence * 100)}%`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <TrainingIngestionUpload
                companies={companies}
                initialCompanyId={companyId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="mt-6">
          {!standardsRes.ok ? (
            <ErrorState title="Stats unavailable" description={standardsRes.error} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  {standardsRes.data.needsReview} record(s) need review ·{" "}
                  {standardsRes.data.pending} pending validation
                </p>
                <Link
                  href={`/supervisor/training/review?companyId=${companyId}`}
                  className="mt-3 mr-4 inline-block text-sm text-teal-700 underline"
                >
                  Open needs review queue
                </Link>
                <Link
                  href="/admin/training"
                  className="mt-3 inline-block text-sm text-teal-700 underline"
                >
                  Open training records
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ledger" className="mt-6">
          <LedgerBackfillPanel defaultCompanyId={companyId} />
        </TabsContent>
      </Tabs>
    </AdminPageShell>
  );
}

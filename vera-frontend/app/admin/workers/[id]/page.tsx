import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ModuleDetailLayout } from "@/components/vera-core/layout/ModuleDetailLayout";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { WorkerTrainingAssessmentPanel } from "@/components/workers/WorkerTrainingAssessmentPanel";
import { WorkerSafetyKnowledgePanel } from "@/components/workers/WorkerSafetyKnowledgePanel";
import { WorkerSafetyFormsPanel } from "@/components/safety-workflow/WorkerSafetyFormsPanel";
import { WorkerFitTestPanel } from "@/components/workers/WorkerFitTestPanel";

export default async function WorkerDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await Promise.resolve(params);
  const idTrim = String(id ?? "").trim();

  if (!/^\d+$/.test(idTrim) || Number(idTrim) < 1) {
    return (
      <AdminPageShell
        title="Invalid worker ID"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: "Detail" },
        ]}
      >
        <ErrorState
          title="Invalid worker ID"
          description="Use a positive numeric id in the URL, for example /admin/workers/12."
        >
          <Link href="/admin/workers" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to workers
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const res = await apiGetSafe<any>(`/workers/${idTrim}`);

  if (!res.ok) {
    return (
      <AdminPageShell
        title="Worker unavailable"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: `#${idTrim}` },
        ]}
      >
        <ErrorState title="Could not load this worker" description={res.error}>
          <Link href="/admin/workers" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to workers
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const worker = res.data;

  const training = worker.training ?? [];
  const equipment = worker.equipment ?? [];

  const basePath = `/admin/workers/${worker.id}`;

  return (
    <AdminPageShell
      title={`${worker.firstName} ${worker.lastName}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers", href: "/admin/workers" },
        { label: `${worker.firstName} ${worker.lastName}` },
      ]}
      hideHeader
    >
      <ModuleDetailLayout
        moduleId="workers"
        basePath={basePath}
        title={`${worker.firstName} ${worker.lastName}`}
        subtitle={`Worker ID ${worker.id}`}
        actions={
          <section className="flex flex-wrap gap-vera-2">
            <Link href={`${basePath}/edit`} className={buttonStyles({ variant: "outline", size: "sm" })}>
              Edit
            </Link>
            <Link href={`${basePath}/print`} target="_blank" className={buttonStyles({ variant: "secondary", size: "sm" })}>
              Print QR
            </Link>
            <Link href={`${basePath}/delete`} className={buttonStyles({ variant: "destructive", size: "sm" })}>
              Delete
            </Link>
          </section>
        }
      >
      <Card className="border-vera-charcoal/10">
        <CardContent className="flex flex-col gap-vera-6 p-vera-8 sm:flex-row sm:items-start">
          {worker.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={worker.photoUrl} alt="" className="h-24 w-24 shrink-0 rounded-xl border border-vera-charcoal/10 object-cover" />
          ) : null}
          <div className="space-y-vera-3 text-sm leading-relaxed text-vera-muted">
            {worker.company ? (
              <p>
                <span className="font-semibold text-vera-charcoal">Company: </span>
                <Link href={`/admin/companies/${worker.company.id}`} className="text-vera-teal hover:underline">
                  {worker.company.name}
                </Link>
              </p>
            ) : (
              <p>No company assigned.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <WorkerTrainingAssessmentPanel workerId={worker.id} />
      <WorkerSafetyKnowledgePanel
        workerId={worker.id}
        workerName={`${worker.firstName} ${worker.lastName}`}
      />
      <WorkerSafetyFormsPanel workerId={worker.id} />
      <WorkerFitTestPanel workerId={worker.id} />

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Training records</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-vera-6">
          {training.length === 0 ? (
            <p className="px-vera-6 text-sm text-vera-muted">No training records.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {training.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/admin/training/${t.id}`} className="font-medium text-vera-deep hover:text-vera-teal hover:underline">
                        {t.certification?.name || "Certification"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.isValid ? "success" : "danger"}>{t.isValid ? "Valid" : "Expired"}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-vera-muted">{t.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Assigned equipment</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-vera-6">
          {equipment.length === 0 ? (
            <p className="px-vera-6 text-sm text-vera-muted">No equipment assigned.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Safety</TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment
                  .filter((assign: any) => assign?.equipment)
                  .map((assign: any) => {
                  const eq = assign.equipment;
                  const isOk =
                    eq.isSafe === true ||
                    eq.safetyStatus === "OK";
                  const needsInspection = eq.safetyStatus === "NEEDS_INSPECTION";
                  const badgeVariant = isOk
                    ? "success"
                    : needsInspection
                      ? "warning"
                      : "danger";
                  const badgeLabel = isOk
                    ? "Safe"
                    : needsInspection
                      ? "Needs inspection"
                      : "Unsafe";
                  return (
                  <TableRow key={assign.id}>
                    <TableCell>
                      <Link
                        href={`/admin/equipment/${eq.id}`}
                        className="font-medium text-vera-deep hover:text-vera-teal hover:underline"
                      >
                        {eq.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>
                        {badgeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-vera-muted">{eq.id}</TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10 bg-vera-surface/40">
        <CardHeader>
          <CardTitle className="text-base">Raw data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto rounded-lg border border-vera-charcoal/10 bg-vera-white p-vera-4 text-xs leading-relaxed text-vera-charcoal">
            {JSON.stringify(worker, null, 2)}
          </pre>
        </CardContent>
      </Card>
      </ModuleDetailLayout>
    </AdminPageShell>
  );
}

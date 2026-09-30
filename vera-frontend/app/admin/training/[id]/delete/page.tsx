import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDeleteConfirmDialog } from "@/components/admin/AdminDeleteConfirmDialog";
import { Badge, Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

type TrainingDto = {
  id: number;
  certification?: { name?: string | null } | null;
  worker?: { firstName?: string | null; lastName?: string | null } | null;
  expiresAt?: string | null;
};

function workerName(t: TrainingDto): string {
  const fn = t.worker?.firstName ?? "";
  const ln = t.worker?.lastName ?? "";
  const full = `${fn} ${ln}`.trim();
  return full || "—";
}

export default async function DeleteTrainingPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let training: TrainingDto | null = null;
  try {
    training = await adminServerGet<TrainingDto>(`/training-records/${id}`);
  } catch {
    training = null;
  }

  if (!training) {
    return (
      <AdminPageShell
        title="Training record not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Training", href: "/admin/training" },
          { label: "Delete" },
        ]}
      >
        <ErrorState
          title="Training record not found"
          description={`No record matches ID #${id}.`}
        >
          <Link
            href="/admin/training"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to training
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const courseName = training.certification?.name ?? "Untitled certification";
  const recordLabel = `${courseName} — ${workerName(training)}`;

  return (
    <AdminPageShell
      title="Delete training record"
      description="Confirm permanent removal of this issued training record."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training", href: "/admin/training" },
        { label: `#${training.id}`, href: `/admin/training/${training.id}` },
        { label: "Delete" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CardContent className="flex items-center gap-vera-4 p-vera-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-vera-surface ring-1 ring-vera-charcoal/10">
            <GraduationCap className="h-7 w-7 text-vera-muted" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-vera-1">
            <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Training record #{training.id}
            </p>
            <p className="truncate text-lg font-medium text-vera-charcoal">
              {courseName}
            </p>
            <p className="truncate text-sm text-vera-muted">
              {workerName(training)}
            </p>
          </div>
          {training.expiresAt ? (
            <Badge variant="outline" className="shrink-0 font-mono text-xs">
              Exp {new Date(training.expiresAt).toLocaleDateString()}
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      <AdminDeleteConfirmDialog
        entityKind="training record"
        entityName={recordLabel}
        apiPath={`/training-records/${training.id}`}
        redirectTo="/admin/training"
        cancelHref={`/admin/training/${training.id}`}
        successTitle="Training record deleted"
        body={
          <p className="text-vera-charcoal">
            Deleting record <span className="font-semibold">#{training.id}</span>{" "}
            for <span className="font-semibold">{courseName}</span> will remove
            it from compliance roll-ups. This cannot be undone.
          </p>
        }
      />
    </AdminPageShell>
  );
}

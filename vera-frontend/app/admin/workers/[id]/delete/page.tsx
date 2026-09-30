import Link from "next/link";
import { User } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDeleteConfirmDialog } from "@/components/admin/AdminDeleteConfirmDialog";
import { Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

type WorkerDto = {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  company?: { name?: string } | null;
};

export default async function DeleteWorkerPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let worker: WorkerDto | null = null;
  try {
    worker = await adminServerGet<WorkerDto>(`/workers/${id}`);
  } catch {
    worker = null;
  }

  if (!worker) {
    return (
      <AdminPageShell
        title="Worker not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: "Delete" },
        ]}
      >
        <ErrorState
          title="Worker not found"
          description={`No worker matches ID #${id}.`}
        >
          <Link
            href="/admin/workers"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to workers
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const fullName = `${worker.firstName} ${worker.lastName}`.trim();

  return (
    <AdminPageShell
      title="Delete worker"
      description="Confirm permanent removal of this worker profile."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers", href: "/admin/workers" },
        {
          label: fullName || `Worker #${worker.id}`,
          href: `/admin/workers/${worker.id}`,
        },
        { label: "Delete" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CardContent className="flex items-center gap-vera-4 p-vera-6">
          {worker.photoUrl != null && worker.photoUrl !== "" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={worker.photoUrl}
              alt={fullName}
              className="h-14 w-14 shrink-0 rounded-full border border-vera-charcoal/10 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-vera-surface ring-1 ring-vera-charcoal/10">
              <User className="h-7 w-7 text-vera-muted" aria-hidden />
            </div>
          )}
          <div className="min-w-0 space-y-vera-1">
            <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Worker #{worker.id}
            </p>
            <p className="truncate text-lg font-medium text-vera-charcoal">
              {fullName || `Worker #${worker.id}`}
            </p>
            {worker.company?.name ? (
              <p className="truncate text-sm text-vera-muted">
                {worker.company.name}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <AdminDeleteConfirmDialog
        entityKind="worker"
        entityName={fullName || `Worker #${worker.id}`}
        apiPath={`/workers/${worker.id}`}
        redirectTo="/admin/workers"
        cancelHref={`/admin/workers/${worker.id}`}
        successTitle="Worker deleted"
        successDescription="The directory has been updated."
        body={
          <p className="text-vera-charcoal">
            Deleting <span className="font-semibold">{fullName}</span> will
            remove their training, credentials, and equipment assignments. This
            cannot be undone.
          </p>
        }
      />
    </AdminPageShell>
  );
}

import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { WorkerUpsertForm } from "@/components/admin/WorkerUpsertForm";
import { Card, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

type WorkerDto = {
  id: number;
  firstName: string;
  lastName: string;
  company?: { id: number } | null;
  photoUrl?: string | null;
};

export default async function EditWorkerPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let worker: WorkerDto | null = null;
  let companies: { id: number; name: string }[] = [];
  try {
    worker = await adminServerGet<WorkerDto>(`/workers/${id}`);
  } catch {
    worker = null;
  }
  try {
    companies = await adminServerGet<{ id: number; name: string }[]>("/companies");
  } catch {
    companies = [];
  }

  if (!worker) {
    return (
      <AdminPageShell
        title="Worker not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: "Edit" },
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

  return (
    <AdminPageShell
      title="Edit worker"
      description={`${worker.firstName} ${worker.lastName}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers", href: "/admin/workers" },
        {
          label: worker.lastName ? `${worker.firstName} ${worker.lastName}` : "Worker",
          href: `/admin/workers/${worker.id}`,
        },
        { label: "Edit" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <WorkerUpsertForm
          mode="edit"
          companies={companies}
          initial={{
            id: worker.id,
            firstName: worker.firstName,
            lastName: worker.lastName,
            companyId: worker.company?.id ?? null,
            photoUrl: worker.photoUrl,
          }}
          cancelHref={`/admin/workers/${worker.id}`}
        />
      </Card>
    </AdminPageShell>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { apiGetSafe } from "@/lib/api";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { TrainingListView } from "@/components/admin/lists/TrainingListView";

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const res = await apiGetSafe<any[]>("/training-records");

  if (!res.ok) {
    return (
      <AdminPageShell
        title="Training records"
        description="Issued certifications and expiry status by worker."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Training" },
        ]}
        actions={
          <Link href="/admin/training/new" className={buttonStyles({ variant: "primary" })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add training record
          </Link>
        }
      >
        <ErrorState title="Could not load training records" description={res.error} />
      </AdminPageShell>
    );
  }

  const training = res.data;
  const now = new Date();
  const rows = training.map((t: any) => ({
    ...t,
    isValid: t.isValid ?? (t.expiresAt != null && new Date(t.expiresAt) > now),
  }));

  const search = (sp.search ?? "").toLowerCase();
  const filtered = rows.filter((t: any) => {
    const workerName = t.worker
      ? `${t.worker.firstName} ${t.worker.lastName}`.toLowerCase()
      : "";
    const cert = (t.certification?.name ?? "").toLowerCase();
    return workerName.includes(search) || cert.includes(search) || String(t.id).includes(search);
  });

  const sort = sp.sort || "expires";
  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sort === "id") return b.id - a.id;
    if (sort === "worker") {
      const an = a.worker ? `${a.worker.firstName} ${a.worker.lastName}` : "";
      const bn = b.worker ? `${b.worker.firstName} ${b.worker.lastName}` : "";
      return an.localeCompare(bn);
    }
    const ae = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
    const be = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
    return ae - be;
  });

  const page = Number(sp.page || 1);
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  return (
    <AdminPageShell
      title="Training records"
      description="Issued certifications and expiry status by worker."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training" },
      ]}
      actions={
        <Link href="/admin/training/new" className={buttonStyles({ variant: "primary" })}>
          <Plus className="h-4 w-4" aria-hidden />
          Upload training
        </Link>
      }
    >
      <Suspense fallback={<p className="text-sm text-vera-muted">Loading training…</p>}>
        <TrainingListView
          rows={paginated}
          page={page}
          totalPages={totalPages}
          sort={sort}
        />
      </Suspense>
    </AdminPageShell>
  );
}

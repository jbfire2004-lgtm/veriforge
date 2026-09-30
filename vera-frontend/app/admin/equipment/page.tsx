import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { apiGetSafe } from "@/lib/api";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { EquipmentListView } from "@/components/admin/lists/EquipmentListView";
import type { EquipmentSummary } from "@/lib/api/equipment-core";

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  if (sp.action === "create") {
    redirect("/admin/equipment/new");
  }
  const listQs = new URLSearchParams();
  listQs.set("page", "1");
  listQs.set("pageSize", "200");
  if (sp.compliant === "true") listQs.set("compliant", "true");
  if (sp.compliant === "false") listQs.set("compliant", "false");
  if (sp.complianceStatus) {
    listQs.set("complianceStatus", sp.complianceStatus);
  }
  const res = await apiGetSafe<EquipmentSummary[]>(
    `/api/v1/equipment?${listQs.toString()}`,
  );

  if (!res.ok) {
    return (
      <AdminPageShell
        title="Equipment"
        description="Fleet registry, safety flags, and assignments."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Equipment" },
        ]}
        actions={
          <section className="flex flex-wrap gap-2">
            <Link href="/admin/equipment/compliance" className={buttonStyles({ variant: "outline", size: "sm" })}>
              Compliance
            </Link>
            <Link href="/admin/equipment/new" className={buttonStyles({ variant: "primary", size: "sm" })}>
              <Plus className="h-4 w-4" aria-hidden />
              Add equipment
            </Link>
          </section>
        }
      >
        <ErrorState title="Could not load equipment" description={res.error} />
      </AdminPageShell>
    );
  }

  const equipment = Array.isArray(res.data) ? res.data : [];
  const search = (sp.search ?? "").toLowerCase();
  const statusFilter = sp.status?.toLowerCase();
  const filtered = equipment.filter((e) => {
    const row = e as EquipmentSummary & {
      operationalStatus?: string;
      deletedAt?: string | null;
    };
    const retired =
      row.operationalStatus === "decommissioned" || row.deletedAt != null;
    if (statusFilter === "retired") {
      if (!retired) return false;
    } else if (retired) {
      return false;
    }
    const name = (e.name ?? "").toLowerCase();
    const serial = (e.serialNumber ?? "").toLowerCase();
    return name.includes(search) || serial.includes(search) || String(e.id).includes(search);
  });

  const page = Number(sp.page || 1);
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <AdminPageShell
      title="Equipment"
      description="Fleet registry, safety flags, and assignments."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment" },
      ]}
      actions={
        <section className="flex flex-wrap gap-2">
          <Link href="/admin/equipment/compliance" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Compliance
          </Link>
          <Link href="/admin/equipment/new" className={buttonStyles({ variant: "primary", size: "sm" })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add equipment
          </Link>
        </section>
      }
    >
      <Suspense fallback={<p className="text-sm text-vera-muted">Loading equipment…</p>}>
        <EquipmentListView rows={paginated} page={page} totalPages={totalPages} />
      </Suspense>
    </AdminPageShell>
  );
}

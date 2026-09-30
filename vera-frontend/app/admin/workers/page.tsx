import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { apiGetSafe } from "@/lib/api";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { WorkersListView } from "@/components/admin/lists/WorkersListView";
import type { WorkersRosterRow } from "@/components/admin/WorkersRosterBulkTable";

async function getWorkers() {
  return apiGetSafe<any[]>("/workers");
}

async function getCompanies() {
  return apiGetSafe<{ id: number; name: string }[]>("/companies");
}

function queryLink(base: Record<string, string | number | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v === undefined || v === "") continue;
    u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  if (sp.action === "create") {
    redirect("/admin/workers/new");
  }
  const workersRes = await getWorkers();
  const roster = sp.roster;

  if (!workersRes.ok) {
    return (
      <AdminPageShell
        title="Workers"
        description="Employer roster lives on each worker under Company."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers" },
        ]}
        actions={
          <Link href="/admin/workers/new" className={buttonStyles({ variant: "primary" })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add worker
          </Link>
        }
      >
        <ErrorState title="Could not load workers" description={workersRes.error} />
      </AdminPageShell>
    );
  }

  const workers = workersRes.data;
  const search = (sp.search ?? "").toLowerCase();
  const statusFilter = sp.status?.toLowerCase();
  const filtered = workers.filter((w: any) => {
    const workerStatus = String(w.status ?? "ACTIVE").toUpperCase();
    if (statusFilter === "inactive") {
      if (workerStatus === "ACTIVE") return false;
    } else if (workerStatus !== "ACTIVE") {
      return false;
    }
    if (roster === "unassigned" && w.companyId != null) return false;
    const name = `${w.firstName} ${w.lastName}`.toLowerCase();
    const company = w.company?.name?.toLowerCase() || "";
    return name.includes(search) || company.includes(search) || String(w.id).includes(search);
  });

  const sort = sp.sort || "name";
  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sort === "name") {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    }
    if (sort === "company") {
      return (a.company?.name || "").localeCompare(b.company?.name || "");
    }
    if (sort === "id") {
      return b.id - a.id;
    }
    return 0;
  });

  const page = Number(sp.page || 1);
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const companiesRes = await getCompanies();
  const companies = companiesRes.ok ? companiesRes.data : [];

  const rosterRows: WorkersRosterRow[] = paginated.map((w: any) => ({
    id: w.id,
    firstName: w.firstName,
    lastName: w.lastName,
    companyId: w.companyId ?? null,
    companyName: w.company?.name ?? null,
    hasValidTraining: Array.isArray(w.training) && w.training.some((t: any) => t.isValid),
    hasUnsafeEquipment:
      Array.isArray(w.equipment) &&
      w.equipment.some((e: any) => {
        const eq = e?.equipment;
        if (!eq) return false;
        return eq.safetyStatus === "UNSAFE" || eq.isSafe === false;
      }),
  }));

  const emptyState: "none" | "no-workers" | "no-matches" =
    paginated.length === 0 && workers.length === 0
      ? "no-workers"
      : paginated.length === 0
        ? "no-matches"
        : "none";

  const pageHrefs = Array.from({ length: totalPages }, (_, i) =>
    queryLink({
      search: sp.search,
      sort,
      roster,
      status: sp.status,
      page: i + 1,
    }),
  );

  return (
    <AdminPageShell
      title="Workers"
      description="Employer roster lives on each worker under Company. Use Unassigned to find people not yet on a company profile."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers" },
      ]}
      actions={
        <Link href="/admin/workers/new" className={buttonStyles({ variant: "primary" })}>
          <Plus className="h-4 w-4" aria-hidden />
          Add worker
        </Link>
      }
    >
      <Suspense fallback={<p className="text-sm text-vera-muted">Loading workers…</p>}>
        <WorkersListView
          companies={companies}
          rows={rosterRows}
          page={page}
          totalPages={totalPages}
          pageHrefs={pageHrefs}
          emptyState={emptyState}
          roster={roster}
          sort={sort}
        />
      </Suspense>
    </AdminPageShell>
  );
}

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AddWorkerWorkflow } from "@/components/admin/workflows/AddWorkerWorkflow";
import { adminServerGet } from "@/lib/admin-server-api";

export default async function NewWorkerPage() {
  let companies: { id: number; name: string }[] = [];
  try {
    companies = await adminServerGet<{ id: number; name: string }[]>("/companies");
  } catch {
    companies = [];
  }

  return (
    <AdminPageShell
      title="Add worker"
      description="Guided workflow — profile, company link, optional training, then confirm."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers", href: "/admin/workers" },
        { label: "Add worker" },
      ]}
    >
      {companies.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No companies loaded — you can still create a worker, but assign an employer on step 2
          after companies are available, or create a company first under Admin → Companies.
        </p>
      ) : null}
      <AddWorkerWorkflow companies={companies} />
    </AdminPageShell>
  );
}

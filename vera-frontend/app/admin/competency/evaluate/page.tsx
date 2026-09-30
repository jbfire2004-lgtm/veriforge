import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CompetencyEvaluateForm } from "@/components/competency/CompetencyEvaluateForm";
import { ErrorState } from "@/components/ui";

export default async function CompetencyEvaluatePage() {
  const [workersRes, equipmentRes] = await Promise.all([
    apiGetSafe<{ id: number; firstName: string; lastName: string }[]>("/workers"),
    apiGetSafe<{ id: number; name: string }[]>("/api/v1/equipment?limit=200"),
  ]);

  if (!workersRes.ok || !equipmentRes.ok) {
    return (
      <AdminPageShell title="Evaluate competency">
        <ErrorState
          title="Could not load form data"
          description={
            !workersRes.ok
              ? workersRes.error
              : !equipmentRes.ok
                ? equipmentRes.error
                : "Unknown error"
          }
        />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Practical evaluation"
      description="Record worker competency on equipment. Signatures can be captured on a tablet in the field."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Competency", href: "/admin/competency" },
        { label: "Evaluate" },
      ]}
    >
      <CompetencyEvaluateForm workers={workersRes.data} equipment={equipmentRes.data} />
    </AdminPageShell>
  );
}

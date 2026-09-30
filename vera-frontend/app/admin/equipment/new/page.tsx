import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { EquipmentUpsertForm } from "@/components/admin/EquipmentUpsertForm";
import { Card } from "@/components/ui";
import { adminServerGet } from "@/lib/admin-server-api";

export default async function NewEquipmentPage() {
  let companies: { id: number; name: string }[] = [];
  try {
    companies = await adminServerGet("/companies");
  } catch {
    companies = [];
  }

  return (
    <AdminPageShell
      title="Add equipment"
      description="Register fleet assets, serial numbers, and safety posture."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        { label: "New" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <EquipmentUpsertForm mode="create" companies={companies} cancelHref="/admin/equipment" />
      </Card>
    </AdminPageShell>
  );
}

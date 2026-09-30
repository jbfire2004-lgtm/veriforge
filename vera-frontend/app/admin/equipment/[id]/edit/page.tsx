import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { EquipmentUpsertForm } from "@/components/admin/EquipmentUpsertForm";
import { Card, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

type EquipmentDto = {
  id: number;
  name: string;
  companyId: number | null;
  serialNumber: string | null;
  safetyStatus?: string;
  photoUrl?: string | null;
};

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let equipment: EquipmentDto | null = null;
  let companies: { id: number; name: string }[] = [];
  try {
    equipment = await adminServerGet<EquipmentDto>(`/equipment/${id}`);
  } catch {
    equipment = null;
  }
  try {
    companies = await adminServerGet("/companies");
  } catch {
    companies = [];
  }

  if (!equipment) {
    return (
      <AdminPageShell
        title="Equipment not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Equipment", href: "/admin/equipment" },
          { label: "Edit" },
        ]}
      >
        <ErrorState
          title="Equipment not found"
          description={`No equipment matches ID #${id}.`}
        >
          <Link
            href="/admin/equipment"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to equipment
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Edit equipment"
      description={equipment.name}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        { label: equipment.name, href: `/admin/equipment/${id}` },
        { label: "Edit" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <EquipmentUpsertForm
          mode="edit"
          companies={companies}
          initial={equipment}
          cancelHref={`/admin/equipment/${id}`}
        />
      </Card>
    </AdminPageShell>
  );
}

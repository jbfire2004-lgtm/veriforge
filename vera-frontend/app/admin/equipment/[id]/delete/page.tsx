import Link from "next/link";
import { HardHat } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDeleteConfirmDialog } from "@/components/admin/AdminDeleteConfirmDialog";
import { Badge, Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

type EquipmentDto = {
  id: number;
  name: string;
  serialNumber?: string | null;
  safetyStatus?: string | null;
  photoUrl?: string | null;
};

export default async function DeleteEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let equipment: EquipmentDto | null = null;
  try {
    equipment = await adminServerGet<EquipmentDto>(`/equipment/${id}`);
  } catch {
    equipment = null;
  }

  if (!equipment) {
    return (
      <AdminPageShell
        title="Equipment not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Equipment", href: "/admin/equipment" },
          { label: "Delete" },
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

  const safety = equipment.safetyStatus;
  const safetyVariant: "success" | "warning" | "danger" | "outline" =
    safety === "OK"
      ? "success"
      : safety === "NEEDS_INSPECTION"
        ? "warning"
        : safety === "UNSAFE"
          ? "danger"
          : "outline";

  return (
    <AdminPageShell
      title="Delete equipment"
      description="Confirm permanent removal of this asset."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        {
          label: equipment.name,
          href: `/admin/equipment/${equipment.id}`,
        },
        { label: "Delete" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CardContent className="flex items-center gap-vera-4 p-vera-6">
          {equipment.photoUrl != null && equipment.photoUrl !== "" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={equipment.photoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl border border-vera-charcoal/10 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-vera-surface ring-1 ring-vera-charcoal/10">
              <HardHat className="h-7 w-7 text-vera-muted" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-vera-1">
            <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Equipment #{equipment.id}
            </p>
            <p className="truncate text-lg font-medium text-vera-charcoal">
              {equipment.name}
            </p>
            {equipment.serialNumber ? (
              <p className="truncate font-mono text-xs text-vera-muted">
                SN {equipment.serialNumber}
              </p>
            ) : null}
          </div>
          {safety ? (
            <Badge variant={safetyVariant} className="shrink-0">
              {safety}
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      <AdminDeleteConfirmDialog
        entityKind="equipment"
        entityName={equipment.name}
        apiPath={`/equipment/${equipment.id}`}
        redirectTo="/admin/equipment"
        cancelHref={`/admin/equipment/${equipment.id}`}
        successTitle="Equipment deleted"
        body={
          <p className="text-vera-charcoal">
            Deleting <span className="font-semibold">{equipment.name}</span>{" "}
            will remove its assignments and incident history. This cannot be
            undone.
          </p>
        }
      />
    </AdminPageShell>
  );
}

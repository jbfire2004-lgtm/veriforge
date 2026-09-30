import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { PreUseInspectionPicker } from "@/components/inspection/PreUseInspectionPicker";
import { buttonStyles } from "@/components/ui/button";
import type { InspectionChecklist } from "@/lib/api/inspection";

export default async function PreUseInspectionPage({
  searchParams,
}: {
  searchParams: Promise<{ equipmentId?: string }>;
}) {
  const { equipmentId: initialEquipmentId } = await searchParams;
  const [equipmentRes, checklistsRes] = await Promise.all([
    apiGetSafe<{ id: number; name: string; lockedOutAt?: string | null }[]>(
      "/api/v1/equipment?limit=100",
    ),
    apiGetSafe<InspectionChecklist[]>("/api/v1/inspections/checklists?inspectionType=PRE_USE"),
  ]);

  return (
    <AdminPageShell
      title="Pre-use inspection"
      description="Daily operator check before use. Failed items trigger equipment lockout."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Inspections", href: "/admin/inspections" },
        { label: "Pre-use" },
      ]}
      actions={
        <Link href="/admin/inspections" className={buttonStyles({ variant: "outline", size: "sm" })}>
          Back
        </Link>
      }
    >
      {!equipmentRes.ok || !checklistsRes.ok ? (
        <p className="text-destructive">Unable to load equipment or checklists.</p>
      ) : (
        <PreUseInspectionPicker
          equipment={equipmentRes.data}
          checklists={checklistsRes.data}
          initialEquipmentId={initialEquipmentId}
        />
      )}
    </AdminPageShell>
  );
}

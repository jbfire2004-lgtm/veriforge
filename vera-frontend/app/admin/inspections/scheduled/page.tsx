import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ScheduledInspectionPicker } from "@/components/inspection/ScheduledInspectionPicker";
import { buttonStyles } from "@/components/ui/button";
import type { InspectionChecklist } from "@/lib/api/inspection";

export default async function ScheduledInspectionPage({
  searchParams,
}: {
  searchParams: Promise<{ equipmentId?: string }>;
}) {
  const { equipmentId: initialEquipmentId } = await searchParams;
  const [equipmentRes, checklistsRes] = await Promise.all([
    apiGetSafe<{ id: number; name: string }[]>("/api/v1/equipment?limit=100"),
    apiGetSafe<InspectionChecklist[]>("/api/v1/inspections/checklists"),
  ]);

  const scheduledTypes = new Set([
    "SCHEDULED",
    "PME",
    "CRANE_LIFT",
    "LIFTING_GEAR",
    "VEHICLE",
    "TOOL",
    "HYDRAULIC_PNEUMATIC",
  ]);
  const checklists = checklistsRes.ok
    ? checklistsRes.data.filter((c) => scheduledTypes.has(c.inspectionType))
    : [];

  return (
    <AdminPageShell
      title="Scheduled inspection"
      description="Formal, PME, crane, lifting gear, vehicle, and tool inspections."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Inspections", href: "/admin/inspections" },
        { label: "Scheduled" },
      ]}
      actions={
        <Link href="/admin/inspections" className={buttonStyles({ variant: "outline", size: "sm" })}>
          Back
        </Link>
      }
    >
      {!equipmentRes.ok ? (
        <p className="text-destructive">Unable to load equipment.</p>
      ) : (
        <ScheduledInspectionPicker
          equipment={equipmentRes.data}
          checklists={checklists}
          initialEquipmentId={initialEquipmentId}
        />
      )}
    </AdminPageShell>
  );
}

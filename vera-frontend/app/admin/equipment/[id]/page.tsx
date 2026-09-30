import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { EquipmentDetailTabs } from "@/components/equipment/EquipmentDetailTabs";
import { EquipmentComplianceBadge } from "@/components/equipment/EquipmentComplianceBadge";
import { Badge, Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { EquipmentDetail, TimelineEvent } from "@/lib/api/equipment-core";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const idTrim = String(id ?? "").trim();

  if (!/^\d+$/.test(idTrim) || Number(idTrim) < 1) {
    return (
      <AdminPageShell
        title="Invalid equipment ID"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Equipment", href: "/admin/equipment" },
        ]}
      >
        <ErrorState title="Invalid equipment ID" description="Use a numeric equipment id." />
      </AdminPageShell>
    );
  }

  const [detailRes, timelineRes, walletRes] = await Promise.all([
    apiGetSafe<EquipmentDetail>(`/api/v1/equipment/${idTrim}`),
    apiGetSafe<TimelineEvent[]>(`/api/v1/equipment/${idTrim}/timeline`),
    apiGetSafe<{ qrToken: string }>(`/api/v1/equipment/${idTrim}/qr`),
  ]);

  if (!detailRes.ok) {
    return (
      <AdminPageShell title="Equipment unavailable">
        <ErrorState title="Could not load equipment" description={detailRes.error} />
      </AdminPageShell>
    );
  }

  const equipment = detailRes.data;
  const timeline = timelineRes.ok ? timelineRes.data : [];
  const companyId =
    equipment.activeCompanyLink?.companyId ?? equipment.company?.id;

  let companyWorkers: { id: number; firstName: string; lastName: string }[] = [];
  if (companyId) {
    const workersRes = await apiGetSafe<
      { worker: { id: number; firstName: string; lastName: string } }[]
    >(`/api/v1/core/companies/${companyId}/workers`);
    if (workersRes.ok) {
      companyWorkers = workersRes.data
        .filter((l) => l.worker)
        .map((l) => l.worker);
    }
  }

  return (
    <AdminPageShell
      title={equipment.name}
      description={
        walletRes.ok
          ? `Asset · QR ${walletRes.data.qrToken}`
          : `Equipment ID ${equipment.id}`
      }
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        { label: equipment.name },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/equipment/${equipment.id}/edit`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Edit
          </Link>
          <Link
            href={`/admin/equipment/${equipment.id}/inspections`}
            className={buttonStyles({ variant: "teal", size: "sm" })}
          >
            Inspections
          </Link>
          <Link
            href={`/equipment/${equipment.id}/wallet`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            Wallet
          </Link>
        </div>
      }
    >
      <Card className="mb-4 border-vera-charcoal/10">
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <Badge variant={equipment.isSafe ? "success" : "danger"}>
            {equipment.isLockedOut
              ? "Locked out"
              : equipment.safetyStatus === "OK"
                ? "Safe"
                : equipment.safetyStatus}
          </Badge>
          <EquipmentComplianceBadge
            status={
              equipment.complianceStatus ?? equipment.activeCompanyLink?.complianceStatus
            }
          />
          {equipment.nextInspectionAt ? (
            <span className="text-sm text-muted-foreground">
              Next inspection{" "}
              {new Date(equipment.nextInspectionAt).toLocaleDateString()}
            </span>
          ) : null}
          {equipment.company ? (
            <Link
              href={`/admin/companies/${equipment.company.id}`}
              className="text-sm text-vera-teal hover:underline"
            >
              {equipment.company.name}
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <EquipmentDetailTabs
        equipment={equipment}
        timeline={timeline}
        companyWorkers={companyWorkers}
      />
    </AdminPageShell>
  );
}

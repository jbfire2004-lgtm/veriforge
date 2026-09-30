import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { EquipmentComplianceBadge } from "@/components/equipment/EquipmentComplianceBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { EquipmentComplianceDashboard } from "@/lib/api/equipment-compliance";

export default async function EquipmentCompliancePage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId } = await searchParams;
  const qs = companyId ? `?companyId=${companyId}` : "";
  const res = await apiGetSafe<EquipmentComplianceDashboard>(
    `/api/v1/equipment-compliance/dashboard${qs}`,
  );

  return (
    <AdminPageShell
      title="Equipment compliance"
      description="Real-time fleet compliance from inspections, training, competency, lockouts, and maintenance."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        { label: "Compliance" },
      ]}
      actions={
        <section className="flex flex-wrap gap-2">
          <Link
            href="/admin/equipment"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Equipment list
          </Link>
          <Link
            href="/admin/equipment?compliant=false"
            className={buttonStyles({ variant: "teal", size: "sm" })}
          >
            Non-compliant assets
          </Link>
        </section>
      }
    >
      {!res.ok ? (
        <ErrorState title="Compliance dashboard unavailable" description={res.error} />
      ) : (
        <section className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Stat label="Total" value={res.data.total} />
            <Stat label="Compliant" value={res.data.compliant} tone="success" />
            <Stat label="Needs attention" value={res.data.needsAttention} tone="warning" />
            <Stat label="Non-compliant" value={res.data.nonCompliant} tone="danger" />
            <Stat label="Locked out" value={res.data.lockedOut} tone="danger" />
            <Stat label="Overdue inspection" value={res.data.overdueInspection} tone="warning" />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Assets requiring action</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next inspection</TableHead>
                    <TableHead>Requirements</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {res.data.recent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        All assets compliant.
                      </TableCell>
                    </TableRow>
                  ) : (
                    res.data.recent.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Link
                            href={`/admin/equipment/${row.id}`}
                            className="font-medium text-teal-600 hover:underline"
                          >
                            {row.name}
                          </Link>
                          {row.company?.name && (
                            <p className="text-xs text-muted-foreground">{row.company.name}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <EquipmentComplianceBadge status={row.complianceStatus} />
                        </TableCell>
                        <TableCell>
                          {row.nextInspectionAt
                            ? new Date(row.nextInspectionAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.trainingRequired ? "Training " : ""}
                          {row.competencyRequired ? "Competency" : ""}
                          {!row.trainingRequired && !row.competencyRequired ? "—" : ""}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}
    </AdminPageShell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "danger";
}) {
  const color =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-700"
        : tone === "danger"
          ? "text-red-700"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

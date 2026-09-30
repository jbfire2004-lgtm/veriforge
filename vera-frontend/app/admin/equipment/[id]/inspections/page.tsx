import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { EquipmentUnlockPanel } from "@/components/inspection/EquipmentUnlockPanel";
import {
  Badge,
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
import type { InspectionRecord } from "@/lib/api/inspection";

type EquipmentDetail = {
  id: number;
  name: string;
  lockedOutAt?: string | null;
  lockoutReason?: string | null;
};

export default async function EquipmentInspectionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipmentId = Number(id);

  const [equipmentRes, inspectionsRes] = await Promise.all([
    apiGetSafe<EquipmentDetail>(`/api/v1/equipment/${equipmentId}`),
    apiGetSafe<InspectionRecord[]>(`/api/v1/inspections/equipment/${equipmentId}`),
  ]);

  return (
    <AdminPageShell
      title="Inspection history"
      description={equipmentRes.ok ? equipmentRes.data.name : `Equipment #${equipmentId}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        {
          label: equipmentRes.ok ? equipmentRes.data.name : id,
          href: `/admin/equipment/${id}`,
        },
        { label: "Inspections" },
      ]}
      actions={
        <section className="flex gap-2">
          <Link
            href={`/admin/inspections/pre-use?equipmentId=${id}`}
            className={buttonStyles({ variant: "teal", size: "sm" })}
          >
            Pre-use
          </Link>
          <Link
            href={`/admin/inspections/scheduled?equipmentId=${id}`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Scheduled
          </Link>
        </section>
      }
    >
      {equipmentRes.ok && (
        <EquipmentUnlockPanel
          equipmentId={equipmentId}
          lockedOut={Boolean(equipmentRes.data.lockedOutAt)}
          lockoutReason={equipmentRes.data.lockoutReason}
        />
      )}

      {!inspectionsRes.ok ? (
        <ErrorState title="History unavailable" description={inspectionsRes.error} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Inspection log</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Lockout</TableHead>
                  <TableHead>Next due</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionsRes.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No inspections recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  inspectionsRes.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.inspectionType}</TableCell>
                      <TableCell>
                        <Badge variant={row.passed ? "success" : "danger"}>
                          {row.passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.lockoutTriggered ? "Yes" : "—"}</TableCell>
                      <TableCell>
                        {row.nextInspectionDate
                          ? new Date(row.nextInspectionDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {row.completedAt
                          ? new Date(row.completedAt).toLocaleString()
                          : new Date(row.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}

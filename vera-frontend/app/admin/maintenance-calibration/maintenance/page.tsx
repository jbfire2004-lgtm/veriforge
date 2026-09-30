import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge, Card, CardContent, ErrorState, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

type MaintRow = {
  id: number;
  type: string;
  performedAt: string;
  nextDueAt: string | null;
  equipment: { id: number; name: string };
};

export default async function MaintenanceDashboardPage() {
  const [dashRes, recordsRes] = await Promise.all([
    apiGetSafe<{ maintenanceOverdue: number; maintenanceDueWithin14Days: number }>(
      "/api/v1/maintenance-calibration/dashboard",
    ),
    apiGetSafe<MaintRow[]>("/api/v1/maintenance-calibration/maintenance-records"),
  ]);

  return (
    <AdminPageShell
      title="Maintenance"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "M&C", href: "/admin/maintenance-calibration" },
        { label: "Maintenance" },
      ]}
      actions={
        <Link
          href="/admin/maintenance-calibration/maintenance/new"
          className={buttonStyles({ variant: "teal", size: "sm" })}
        >
          Add record
        </Link>
      }
    >
      {dashRes.ok && (dashRes.data.maintenanceOverdue > 0 || dashRes.data.maintenanceDueWithin14Days > 0) && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="pt-6 text-sm text-amber-900">
            {dashRes.data.maintenanceOverdue} overdue · {dashRes.data.maintenanceDueWithin14Days} due within 14 days
          </CardContent>
        </Card>
      )}

      {!recordsRes.ok ? (
        <ErrorState title="Unable to load records" description={recordsRes.error} />
      ) : (
        <Card>
          <CardContent className="px-0 pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Performed</TableHead>
                  <TableHead>Next due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordsRes.data.map((r) => {
                  const overdue = r.nextDueAt && new Date(r.nextDueAt) < new Date();
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link
                          href={`/admin/equipment/${r.equipment.id}`}
                          className="text-teal-600 hover:underline"
                        >
                          {r.equipment.name}
                        </Link>
                      </TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{new Date(r.performedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {r.nextDueAt ? (
                          <Badge variant={overdue ? "danger" : "outline"}>
                            {new Date(r.nextDueAt).toLocaleDateString()}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}

import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge, Card, CardContent, ErrorState, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

type CalRow = {
  id: number;
  passed: boolean;
  calibratedAt: string;
  expiresAt: string | null;
  certificateNumber: string | null;
  equipment: { id: number; name: string };
};

export default async function CalibrationDashboardPage() {
  const [dashRes, recordsRes] = await Promise.all([
    apiGetSafe<{ calibrationOverdue: number; calibrationDueWithin14Days: number }>(
      "/api/v1/maintenance-calibration/dashboard",
    ),
    apiGetSafe<CalRow[]>("/api/v1/maintenance-calibration/calibration-records"),
  ]);

  return (
    <AdminPageShell
      title="Calibration"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "M&C", href: "/admin/maintenance-calibration" },
        { label: "Calibration" },
      ]}
      actions={
        <Link
          href="/admin/maintenance-calibration/calibration/new"
          className={buttonStyles({ variant: "teal", size: "sm" })}
        >
          Add record
        </Link>
      }
    >
      {dashRes.ok && (dashRes.data.calibrationOverdue > 0 || dashRes.data.calibrationDueWithin14Days > 0) && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="pt-6 text-sm text-amber-900">
            {dashRes.data.calibrationOverdue} overdue · {dashRes.data.calibrationDueWithin14Days} due within 14 days
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
                  <TableHead>Result</TableHead>
                  <TableHead>Calibrated</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordsRes.data.map((r) => {
                  const expired = r.expiresAt && new Date(r.expiresAt) < new Date();
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
                      <TableCell>
                        <Badge variant={r.passed ? "success" : "danger"}>
                          {r.passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(r.calibratedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {r.expiresAt ? (
                          <Badge variant={expired ? "danger" : "outline"}>
                            {new Date(r.expiresAt).toLocaleDateString()}
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

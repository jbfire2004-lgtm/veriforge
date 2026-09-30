import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
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
import type { InspectionDashboard } from "@/lib/api/inspection";

export default async function InspectionsDashboardPage() {
  const [res, dueRes] = await Promise.all([
    apiGetSafe<InspectionDashboard>("/api/v1/inspections/dashboard"),
    apiGetSafe<InspectionDashboard["recent"]>("/api/v1/inspections/due?withinDays=7"),
  ]);

  return (
    <AdminPageShell
      title="Inspections"
      description="Pre-use, scheduled, PME, lifting gear, and vehicle inspections."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Inspections" },
      ]}
      actions={
        <section className="flex flex-wrap gap-2">
          <Link
            href="/admin/inspections/pre-use"
            className={buttonStyles({ variant: "teal", size: "sm" })}
          >
            Pre-use
          </Link>
          <Link
            href="/admin/inspections/scheduled"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Scheduled
          </Link>
        </section>
      }
    >
      {!res.ok ? (
        <ErrorState title="Dashboard unavailable" description={res.error} />
      ) : (
        <section className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Total" value={res.data.totalInspections} />
            <Stat label="Passed" value={res.data.passed} variant="success" />
            <Stat label="Failed" value={res.data.failed} variant="danger" />
            <Stat label="Locked out" value={res.data.lockedOutEquipment} variant="warning" />
            <Stat label="Due ≤7 days" value={res.data.dueWithin7Days} variant="warning" />
          </section>

          {dueRes.ok && dueRes.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Due within 7 days</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dueRes.data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.equipmentId ? (
                            <Link
                              href={`/admin/inspections/scheduled?equipmentId=${row.equipmentId}`}
                              className="text-teal-600 hover:underline"
                            >
                              {row.equipment?.name ?? row.equipmentId}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{row.inspectionType}</TableCell>
                        <TableCell>
                          {row.nextInspectionDate
                            ? new Date(row.nextInspectionDate).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent inspections</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Next due</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {res.data.recent.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.equipmentId ? (
                          <Link
                            href={`/admin/equipment/${row.equipmentId}`}
                            className="text-teal-600 hover:underline"
                          >
                            {row.equipment?.name ?? row.equipmentId}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{row.inspectionType}</TableCell>
                      <TableCell>
                        <Badge variant={row.passed ? "success" : "danger"}>
                          {row.passed ? "Pass" : "Fail"}
                        </Badge>
                        {row.lockoutTriggered && (
                          <Badge variant="warning" className="ml-1">
                            Lockout
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.nextInspectionDate
                          ? new Date(row.nextInspectionDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {new Date(row.completedAt ?? row.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
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
  variant,
}: {
  label: string;
  value: number;
  variant?: "success" | "danger" | "warning";
}) {
  const tone =
    variant === "success"
      ? "text-emerald-700"
      : variant === "danger"
        ? "text-red-700"
        : variant === "warning"
          ? "text-amber-700"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

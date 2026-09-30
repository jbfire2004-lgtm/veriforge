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
import type { CompetencyDashboard } from "@/lib/api/competency";

export default async function CompetencyDashboardPage() {
  const res = await apiGetSafe<CompetencyDashboard>("/api/v1/competency/dashboard");

  return (
    <AdminPageShell
      title="Competency"
      description="Worker ↔ equipment skill verification and expiry tracking."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Competency" },
      ]}
      actions={
        <Link href="/admin/competency/evaluate" className={buttonStyles({ variant: "teal", size: "sm" })}>
          New evaluation
        </Link>
      }
    >
      {!res.ok ? (
        <ErrorState title="Dashboard unavailable" description={res.error} />
      ) : (
        <section className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total evaluations" value={res.data.totalEvaluations} />
            <Stat label="Currently valid" value={res.data.passing} variant="success" />
            <Stat label="Expiring in 30 days" value={res.data.expiringSoon} variant="warning" />
            <Stat label="Expired" value={res.data.expired} variant="danger" />
          </section>
          <Card>
            <CardHeader>
              <CardTitle>Recent evaluations</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(res.data.recent as any[]).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.worker
                          ? `${row.worker.firstName} ${row.worker.lastName}`
                          : row.workerId}
                      </TableCell>
                      <TableCell>{row.equipment?.name ?? row.equipmentId}</TableCell>
                      <TableCell>{row.score}</TableCell>
                      <TableCell>
                        <Badge variant={row.passed ? "success" : "danger"}>
                          {row.passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(row.evaluationDate ?? row.createdAt).toLocaleDateString()}
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
  variant?: "success" | "warning" | "danger";
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-vera-muted">{label}</p>
        <p className="mt-1 text-3xl font-semibold">{value}</p>
        {variant === "danger" && value > 0 ? (
          <Badge variant="danger" className="mt-2">
            Action needed
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

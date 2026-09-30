import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { EquipmentCompetencyRequirements } from "@/components/competency/EquipmentCompetencyRequirements";
import { Card, CardContent, CardHeader, CardTitle, ErrorState, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default async function EquipmentCompetencyPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const equipmentId = Number(id);

  const eqRes = await apiGetSafe<{ name: string }>(`/api/v1/equipment/${equipmentId}`);
  const reqRes = await apiGetSafe<{
    resolved: {
      minPassingScore: number;
      expiryDays: number | null;
      requireEvaluation: boolean;
      source: string;
    };
  }>(`/api/v1/competency/equipment/${equipmentId}/requirements`);
  const evalRes = await apiGetSafe<
    { id: number; score: number; passed: boolean; worker: { firstName: string; lastName: string } }[]
  >(`/api/v1/competency/equipment/${equipmentId}`);

  if (!eqRes.ok) {
    return (
      <AdminPageShell title="Equipment competency">
        <ErrorState title="Equipment not found" />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={`${eqRes.data.name} — Competency`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        { label: eqRes.data.name, href: `/admin/equipment/${equipmentId}` },
        { label: "Competency" },
      ]}
      actions={
        <Link
          href="/admin/competency/evaluate"
          className={buttonStyles({ variant: "teal", size: "sm" })}
        >
          New evaluation
        </Link>
      }
    >
      <section className="space-y-6">
        {reqRes.ok ? (
          <EquipmentCompetencyRequirements
            equipmentId={equipmentId}
            resolved={reqRes.data.resolved}
          />
        ) : (
          <ErrorState title="Requirements unavailable" description={reqRes.error} />
        )}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Operator evaluations</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {!evalRes.ok ? (
              <p className="px-6 text-sm text-vera-muted">{evalRes.error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evalRes.data.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>
                        {ev.worker.firstName} {ev.worker.lastName}
                      </TableCell>
                      <TableCell>{ev.score}</TableCell>
                      <TableCell>
                        <Badge variant={ev.passed ? "success" : "danger"}>
                          {ev.passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </AdminPageShell>
  );
}

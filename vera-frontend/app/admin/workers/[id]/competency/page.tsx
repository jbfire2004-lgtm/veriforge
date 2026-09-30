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

type Evaluation = {
  id: number;
  score: number;
  passed: boolean;
  evaluationDate: string;
  expiresAt: string | null;
  equipment: { id: number; name: string };
};

export default async function WorkerCompetencyPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const workerId = Number(id);

  const workerRes = await apiGetSafe<{ firstName: string; lastName: string }>(
    `/workers/${workerId}`,
  );
  const historyRes = await apiGetSafe<Evaluation[]>(
    `/api/v1/competency/workers/${workerId}`,
  );

  if (!workerRes.ok) {
    return (
      <AdminPageShell title="Worker competency">
        <ErrorState title="Worker not found" description={workerRes.error} />
      </AdminPageShell>
    );
  }

  const name = `${workerRes.data.firstName} ${workerRes.data.lastName}`;

  return (
    <AdminPageShell
      title={`${name} — Competency`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers", href: "/admin/workers" },
        { label: name, href: `/admin/workers/${workerId}` },
        { label: "Competency" },
      ]}
      actions={
        <Link
          href={`/admin/competency/evaluate?workerId=${workerId}`}
          className={buttonStyles({ variant: "teal", size: "sm" })}
        >
          New evaluation
        </Link>
      }
    >
      {!historyRes.ok ? (
        <ErrorState title="Could not load history" description={historyRes.error} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Equipment competency history</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Evaluated</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRes.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-vera-muted">
                      No evaluations yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  historyRes.data.map((ev) => {
                    const expired =
                      ev.expiresAt && new Date(ev.expiresAt) < new Date();
                    return (
                      <TableRow key={ev.id}>
                        <TableCell>
                          <Link
                            href={`/admin/equipment/${ev.equipment.id}`}
                            className="text-vera-teal hover:underline"
                          >
                            {ev.equipment.name}
                          </Link>
                        </TableCell>
                        <TableCell>{ev.score}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ev.passed && !expired ? "success" : "danger"
                            }
                          >
                            {expired ? "Expired" : ev.passed ? "Pass" : "Fail"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(ev.evaluationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {ev.expiresAt
                            ? new Date(ev.expiresAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}

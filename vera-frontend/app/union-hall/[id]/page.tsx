import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { VeraPageHeader } from "@/src/components/layout/VeraPageHeader";
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
import { UnionHallDispatchForm } from "@/components/union-hall/UnionHallDispatchForm";
import { UnionHallTrainingDashboard } from "@/components/union-hall/UnionHallTrainingDashboard";

type Member = {
  id: number;
  memberNumber: string | null;
  status: string;
  worker: { id: number; firstName: string; lastName: string };
};

export default async function UnionHallDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const hallId = Number(id);

  const membersRes = await apiGetSafe<Member[]>(`/api/v1/core/union-halls/${hallId}/members`);
  const companiesRes = await apiGetSafe<{ id: number; name: string }[]>("/companies");

  return (
    <>
      <VeraPageHeader
        title={`Union hall #${hallId}`}
        description="Members, training uploads, and dispatch to employers."
        actions={
          <Link href="/union-hall" className={buttonStyles({ variant: "outline", size: "sm" })}>
            All halls
          </Link>
        }
      />

      <UnionHallTrainingDashboard hallId={hallId} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            {!membersRes.ok ? (
              <ErrorState title="Could not load members" description={membersRes.error} />
            ) : membersRes.data.length === 0 ? (
              <p className="text-sm text-vera-muted">No members yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Member #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersRes.data.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        {m.worker.firstName} {m.worker.lastName}
                      </TableCell>
                      <TableCell>{m.memberNumber ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === "ACTIVE" ? "success" : "outline"}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/verify/${m.worker.id}`}
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Wallet
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispatch worker</CardTitle>
          </CardHeader>
          <CardContent>
            {membersRes.ok && companiesRes.ok ? (
              <UnionHallDispatchForm
                hallId={hallId}
                members={membersRes.data}
                companies={companiesRes.data}
              />
            ) : (
              <p className="text-sm text-vera-muted">Load members and companies to dispatch.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

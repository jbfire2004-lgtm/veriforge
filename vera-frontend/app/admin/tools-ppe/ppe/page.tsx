import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge, Card, CardContent, ErrorState, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { PpeRow } from "@/lib/api/tools-ppe";

function expiryVariant(expiresAt: string, status: string) {
  if (status === "EXPIRED") return "danger" as const;
  const days = (new Date(expiresAt).getTime() - Date.now()) / (86400000);
  if (days <= 30) return "warning" as const;
  return "success" as const;
}

export default async function PpeListPage() {
  const res = await apiGetSafe<PpeRow[]>("/api/v1/tools-ppe/ppe");

  return (
    <AdminPageShell
      title="PPE"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Tools & PPE", href: "/admin/tools-ppe" },
        { label: "PPE" },
      ]}
      actions={
        <Link href="/admin/tools-ppe/ppe/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
          Add PPE
        </Link>
      }
    >
      {!res.ok ? (
        <ErrorState title="Unable to load PPE" description={res.error} />
      ) : (
        <Card>
          <CardContent className="px-0 pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {res.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/admin/tools-ppe/ppe/${p.id}`} className="text-teal-600 hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.ppeType}</TableCell>
                    <TableCell>
                      <Badge variant={expiryVariant(p.expiresAt, p.status)}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(p.expiresAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {p.assignments?.[0]?.worker
                        ? `${p.assignments[0].worker.firstName} ${p.assignments[0].worker.lastName}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}

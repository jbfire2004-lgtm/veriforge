import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge, Card, CardContent, ErrorState, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { ToolRow } from "@/lib/api/tools-ppe";

export default async function ToolsListPage() {
  const res = await apiGetSafe<ToolRow[]>("/api/v1/tools-ppe/tools");

  return (
    <AdminPageShell
      title="Tools"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Tools & PPE", href: "/admin/tools-ppe" },
        { label: "Tools" },
      ]}
      actions={
        <Link href="/admin/tools-ppe/tools/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
          Add tool
        </Link>
      }
    >
      {!res.ok ? (
        <ErrorState title="Unable to load tools" description={res.error} />
      ) : (
        <Card>
          <CardContent className="px-0 pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next inspection</TableHead>
                  <TableHead>Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {res.data.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/admin/tools-ppe/tools/${t.id}`} className="text-teal-600 hover:underline">
                        {t.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === "ACTIVE" ? "success" : "warning"}>{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {t.nextInspectionAt
                        ? new Date(t.nextInspectionAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {t.assignments?.[0]?.worker
                        ? `${t.assignments[0].worker.firstName} ${t.assignments[0].worker.lastName}`
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

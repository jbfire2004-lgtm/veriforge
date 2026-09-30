import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
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

export default async function CertificationDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await Promise.resolve(params);
  const idTrim = String(id ?? "").trim();

  if (!/^\d+$/.test(idTrim) || Number(idTrim) < 1) {
    return (
      <AdminPageShell
        title="Invalid certification ID"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Certifications", href: "/admin/certifications" },
          { label: "Detail" },
        ]}
      >
        <ErrorState
          title="Invalid certification ID"
          description="Use a positive numeric id in the URL, for example /admin/certifications/12."
        >
          <Link href="/admin/certifications" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to certifications
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const res = await apiGetSafe<any>(`/certifications/${idTrim}`);

  if (!res.ok) {
    return (
      <AdminPageShell
        title="Certification unavailable"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Certifications", href: "/admin/certifications" },
          { label: `#${idTrim}` },
        ]}
      >
        <ErrorState title="Could not load this certification" description={res.error}>
          <Link href="/admin/certifications" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to certifications
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const certification = res.data;

  const workers = certification.workers ?? [];

  return (
    <AdminPageShell
      title={certification.name}
      description={`ID ${certification.id} · ${certification.expiryDays ?? "—"} day renewal`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Certifications", href: "/admin/certifications" },
        { label: certification.name },
      ]}
      actions={
        <div className="flex flex-wrap gap-vera-2">
          <Link href={`/admin/certifications/${certification.id}/edit`} className={buttonStyles({ variant: "outline", size: "sm" })}>
            Edit
          </Link>
          <Link href={`/admin/certifications/${certification.id}/delete`} className={buttonStyles({ variant: "destructive", size: "sm" })}>
            Delete
          </Link>
        </div>
      }
    >
      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-vera-charcoal">{certification.description}</p>
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Workers with this certification</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-vera-6">
          {workers.length === 0 ? (
            <p className="px-vera-6 text-sm text-vera-muted">No workers listed on this record.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((w: any) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <Link href={`/admin/workers/${w.id}`} className="font-medium text-vera-deep hover:text-vera-teal hover:underline">
                        {w.firstName} {w.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-vera-muted">{w.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10 bg-vera-surface/40">
        <CardHeader>
          <CardTitle className="text-base">Raw data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto rounded-lg border border-vera-charcoal/10 bg-vera-white p-vera-4 text-xs leading-relaxed">
            {JSON.stringify(certification, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

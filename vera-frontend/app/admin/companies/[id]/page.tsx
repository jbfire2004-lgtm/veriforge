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

type EquipmentSafetyRow = {
  safetyStatus?: string | null;
  isSafe?: boolean | null;
};

function EquipmentSafetyBadge({ e }: { e: EquipmentSafetyRow }) {
  if (e.safetyStatus === "OK" || e.isSafe === true) {
    return <Badge variant="success">Safe</Badge>;
  }
  if (e.safetyStatus === "NEEDS_INSPECTION") {
    return <Badge variant="warning">Needs inspection</Badge>;
  }
  if (e.safetyStatus === "UNSAFE" || e.isSafe === false) {
    return <Badge variant="danger">Unsafe</Badge>;
  }
  if (e.safetyStatus) {
    return <Badge variant="danger">{e.safetyStatus}</Badge>;
  }
  return <Badge variant="outline">Unknown</Badge>;
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await Promise.resolve(params);
  const idTrim = String(id ?? "").trim();

  if (!/^\d+$/.test(idTrim) || Number(idTrim) < 1) {
    return (
      <AdminPageShell
        title="Invalid company ID"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Companies", href: "/admin/companies" },
          { label: "Detail" },
        ]}
      >
        <ErrorState
          title="Invalid company ID"
          description="Use a positive numeric id in the URL, for example /admin/companies/12."
        >
          <Link href="/admin/companies" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to companies
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const res = await apiGetSafe<any>(`/companies/${idTrim}`);

  if (!res.ok) {
    return (
      <AdminPageShell
        title="Company unavailable"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Companies", href: "/admin/companies" },
          { label: `#${idTrim}` },
        ]}
      >
        <ErrorState title="Could not load this company" description={res.error}>
          <Link href="/admin/companies" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to companies
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const company = res.data;

  const workers = company.workers ?? [];
  const equipment = company.equipment ?? [];

  return (
    <AdminPageShell
      title={company.name}
      description={`Company ID ${company.id}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Companies", href: "/admin/companies" },
        { label: company.name },
      ]}
      actions={
        <div className="flex flex-wrap gap-vera-2">
          <Link href={`/admin/companies/${company.id}/roster`} className={buttonStyles({ variant: "teal", size: "sm" })}>
            Manage roster
          </Link>
          <Link href={`/admin/companies/${company.id}/fleet`} className={buttonStyles({ variant: "teal", size: "sm" })}>
            Manage fleet
          </Link>
          <Link href={`/admin/companies/${company.id}/edit`} className={buttonStyles({ variant: "outline", size: "sm" })}>
            Edit
          </Link>
          <Link href={`/admin/companies/${company.id}/qr`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
            QR bulk
          </Link>
          <Link href={`/admin/companies/${company.id}/delete`} className={buttonStyles({ variant: "destructive", size: "sm" })}>
            Delete
          </Link>
        </div>
      }
    >
      <Card className="border-vera-charcoal/10">
        <CardContent className="flex flex-col gap-vera-6 p-vera-8 sm:flex-row sm:items-center">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="" className="h-20 w-20 shrink-0 rounded-xl border border-vera-charcoal/10 object-contain" />
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Workers</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-vera-6">
          {workers.length === 0 ? (
            <p className="px-vera-6 text-sm text-vera-muted">No workers linked.</p>
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

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-vera-6">
          {equipment.length === 0 ? (
            <p className="px-vera-6 text-sm text-vera-muted">No equipment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Safety</TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Link href={`/admin/equipment/${e.id}`} className="font-medium text-vera-deep hover:text-vera-teal hover:underline">
                        {e.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <EquipmentSafetyBadge e={e} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-vera-muted">{e.id}</TableCell>
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
            {JSON.stringify(company, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

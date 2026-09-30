import Link from "next/link";
import { Award, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { apiGetSafe } from "@/lib/api";
import {
  Button,
  buttonStyles,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

function queryLink(base: Record<string, string | number | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v !== undefined && v !== "") u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

export default async function CertificationsListPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const res = await apiGetSafe<any[]>("/certifications");

  if (!res.ok) {
    return (
      <AdminPageShell
        title="Certifications"
        description="Certification types, renewal windows, and linked workers or equipment."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Certifications" },
        ]}
        actions={
          <Link href="/admin/certifications/new" className={buttonStyles({ variant: "teal" })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add certification
          </Link>
        }
      >
        <ErrorState title="Could not load certifications" description={res.error} />
      </AdminPageShell>
    );
  }

  const certifications = res.data;
  const search = (searchParams?.search ?? "").toLowerCase();
  const filtered = certifications.filter((c: any) => {
    const name = (c.name ?? "").toLowerCase();
    return name.includes(search) || String(c.id).includes(search);
  });

  const page = Number(searchParams?.page || 1);
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const q = (extra: Record<string, string | number | undefined>) =>
    queryLink({
      search: searchParams?.search,
      page: extra.page ?? page,
    });

  return (
    <AdminPageShell
      title="Certifications"
      description="Certification types, renewal windows, and linked workers or equipment."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Certifications" },
      ]}
      actions={
        <Link href="/admin/certifications/new" className={buttonStyles({ variant: "teal" })}>
          <Plus className="h-4 w-4" aria-hidden />
          Add certification
        </Link>
      }
    >
      <Card className="border-vera-charcoal/10">
        <CardContent className="space-y-vera-4 p-vera-6">
          <form className="flex flex-wrap items-end gap-vera-3" method="get">
            <div className="space-y-vera-2">
              <Label htmlFor="cert-search">Search</Label>
              <Input
                id="cert-search"
                name="search"
                placeholder="Name or ID…"
                defaultValue={searchParams?.search ?? ""}
                className="w-full min-w-[12rem] sm:w-72"
              />
            </div>
            <Button type="submit" variant="default">
              <Search className="h-4 w-4" aria-hidden />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Renewal (days)</TableHead>
            <TableHead className="text-right">ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link
                  href={`/admin/certifications/${c.id}`}
                  className="font-semibold text-vera-deep underline-offset-4 hover:text-vera-teal hover:underline"
                >
                  {c.name}
                </Link>
              </TableCell>
              <TableCell className="text-vera-muted tabular-nums">{c.expiryDays ?? "—"}</TableCell>
              <TableCell className="text-right tabular-nums text-vera-muted">{c.id}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-vera-2">
                  <Link href={`/admin/certifications/${c.id}`} className={buttonStyles({ variant: "ghost", size: "sm" })}>
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    View
                  </Link>
                  <Link href={`/admin/certifications/${c.id}/edit`} className={buttonStyles({ variant: "outline", size: "sm" })}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Link>
                  <Link
                    href={`/admin/certifications/${c.id}/delete`}
                    className={buttonStyles({ variant: "destructive", size: "sm" })}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {paginated.length === 0 && certifications.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="p-0">
                <div className="p-vera-8">
                  <EmptyState
                    icon={Award}
                    title="No certifications"
                    description="Define certification types before issuing training or credentials."
                  >
                    <Link href="/admin/certifications/new" className={buttonStyles({ variant: "teal", size: "md" })}>
                      <Plus className="h-4 w-4" aria-hidden />
                      Add certification
                    </Link>
                  </EmptyState>
                </div>
              </TableCell>
            </TableRow>
          )}
          {paginated.length === 0 && certifications.length > 0 && (
            <TableRow>
              <TableCell colSpan={4} className="p-0">
                <div className="p-vera-8">
                  <EmptyState
                    icon={Search}
                    title="No matching certifications"
                    description="Try another search term."
                  />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        getHref={(p) => q({ page: p })}
        label="Certifications pagination"
      />
    </AdminPageShell>
  );
}

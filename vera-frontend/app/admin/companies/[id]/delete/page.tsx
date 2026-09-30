import Link from "next/link";
import { Building2 } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDeleteConfirmDialog } from "@/components/admin/AdminDeleteConfirmDialog";
import { Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

export default async function DeleteCompanyPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let company: { id: number; name: string; logoUrl?: string | null } | null = null;
  try {
    company = await adminServerGet(`/companies/${id}`);
  } catch {
    company = null;
  }

  if (!company) {
    return (
      <AdminPageShell
        title="Company not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Companies", href: "/admin/companies" },
          { label: "Delete" },
        ]}
      >
        <ErrorState
          title="Company not found"
          description={`No company matches ID #${id}.`}
        >
          <Link
            href="/admin/companies"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to companies
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Delete company"
      description="Confirm permanent removal of this organization."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Companies", href: "/admin/companies" },
        { label: company.name, href: `/admin/companies/${company.id}` },
        { label: "Delete" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CardContent className="flex items-center gap-vera-4 p-vera-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-vera-charcoal/10 bg-vera-surface">
            {company.logoUrl != null && company.logoUrl !== "" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt=""
                className="h-full w-full object-contain p-vera-2"
              />
            ) : (
              <Building2 className="h-7 w-7 text-vera-muted" aria-hidden />
            )}
          </div>
          <div className="min-w-0 space-y-vera-1">
            <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Company #{company.id}
            </p>
            <p className="truncate text-lg font-medium text-vera-charcoal">
              {company.name}
            </p>
          </div>
        </CardContent>
      </Card>

      <AdminDeleteConfirmDialog
        entityKind="company"
        entityName={company.name}
        apiPath={`/companies/${company.id}`}
        redirectTo="/admin/companies"
        cancelHref={`/admin/companies/${company.id}`}
        successTitle="Company deleted"
        body={
          <p className="text-vera-charcoal">
            Deleting <span className="font-semibold">{company.name}</span> will
            also remove its workers, equipment, training, and credential
            associations. This cannot be undone.
          </p>
        }
      />
    </AdminPageShell>
  );
}

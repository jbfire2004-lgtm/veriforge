import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CompanyUpsertForm } from "@/components/admin/CompanyUpsertForm";
import { Card, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

export default async function EditCompanyPage({
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
          { label: "Edit" },
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
      title="Edit company"
      description={company.name}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Companies", href: "/admin/companies" },
        { label: company.name, href: `/admin/companies/${id}` },
        { label: "Edit" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CompanyUpsertForm
          mode="edit"
          initial={{
            id: company.id,
            name: company.name,
            logoUrl: company.logoUrl,
          }}
          cancelHref={`/admin/companies/${id}`}
        />
      </Card>
    </AdminPageShell>
  );
}

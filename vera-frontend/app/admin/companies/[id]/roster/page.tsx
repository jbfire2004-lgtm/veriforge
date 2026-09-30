import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CompanyRosterPanel } from "@/components/company/CompanyRosterPanel";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { CompanyLink } from "@/lib/api/vera-core";

export default async function CompanyRosterPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const companyId = Number(id);

  const companyRes = await apiGetSafe<{ name: string }>(`/companies/${companyId}`);
  const linksRes = await apiGetSafe<CompanyLink[]>(
    `/api/v1/core/companies/${companyId}/workers`,
  );

  if (!companyRes.ok) {
    return (
      <AdminPageShell title="Company roster" breadcrumbs={[{ label: "Admin", href: "/admin" }]}>
        <ErrorState title="Company not found" description={companyRes.error} />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={`${companyRes.data.name} — Workers`}
      description="Link workers from the global registry, scan QR codes, and manage active assignments."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Companies", href: "/admin/companies" },
        { label: companyRes.data.name, href: `/admin/companies/${companyId}` },
        { label: "Roster" },
      ]}
      actions={
        <Link
          href={`/admin/companies/${companyId}`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Company overview
        </Link>
      }
    >
      {linksRes.ok ? (
        <CompanyRosterPanel companyId={companyId} initialLinks={linksRes.data} />
      ) : (
        <ErrorState title="Could not load roster" description={linksRes.error} />
      )}
    </AdminPageShell>
  );
}

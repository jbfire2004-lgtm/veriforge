import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CompanyFleetPanel } from "@/components/company/CompanyFleetPanel";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { EquipmentLink } from "@/lib/api/vera-core";

export default async function CompanyFleetPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const companyId = Number(id);

  const companyRes = await apiGetSafe<{ name: string }>(`/companies/${companyId}`);
  const linksRes = await apiGetSafe<EquipmentLink[]>(
    `/api/v1/core/companies/${companyId}/equipment`,
  );

  if (!companyRes.ok) {
    return (
      <AdminPageShell
        title="Company fleet"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Companies", href: "/admin/companies" },
          { label: "Fleet" },
        ]}
      >
        <ErrorState title="Company not found" description={companyRes.error} />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={`${companyRes.data.name} — Equipment`}
      description="Link equipment from the global registry or scan QR to activate on site."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Companies", href: "/admin/companies" },
        { label: companyRes.data.name, href: `/admin/companies/${companyId}` },
        { label: "Fleet" },
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
        <CompanyFleetPanel companyId={companyId} initialLinks={linksRes.data} />
      ) : (
        <ErrorState title="Could not load fleet" description={linksRes.error} />
      )}
    </AdminPageShell>
  );
}

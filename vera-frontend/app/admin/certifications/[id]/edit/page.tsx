import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CertificationUpsertForm } from "@/components/admin/CertificationUpsertForm";
import { Card, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

export default async function EditCertificationPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let certification: {
    id: number;
    name: string;
    description: string;
    expiryDays: number;
  } | null = null;
  try {
    certification = await adminServerGet(`/certifications/${id}`);
  } catch {
    certification = null;
  }

  if (!certification) {
    return (
      <AdminPageShell
        title="Certification not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Certifications", href: "/admin/certifications" },
          { label: "Edit" },
        ]}
      >
        <ErrorState
          title="Certification not found"
          description={`No certification matches ID #${id}.`}
        >
          <Link
            href="/admin/certifications"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to certifications
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Edit certification"
      description={certification.name}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Certifications", href: "/admin/certifications" },
        { label: certification.name, href: `/admin/certifications/${id}` },
        { label: "Edit" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CertificationUpsertForm mode="edit" initial={certification} cancelHref={`/admin/certifications/${id}`} />
      </Card>
    </AdminPageShell>
  );
}

import Link from "next/link";
import { Award } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDeleteConfirmDialog } from "@/components/admin/AdminDeleteConfirmDialog";
import { Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

type CertificationDto = {
  id: number;
  name: string;
  description?: string | null;
  expiryDays?: number | null;
};

export default async function DeleteCertificationPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let cert: CertificationDto | null = null;
  try {
    cert = await adminServerGet<CertificationDto>(`/certifications/${id}`);
  } catch {
    cert = null;
  }

  if (!cert) {
    return (
      <AdminPageShell
        title="Certification not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Certifications", href: "/admin/certifications" },
          { label: "Delete" },
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
      title="Delete certification"
      description="Confirm permanent removal of this certification type."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Certifications", href: "/admin/certifications" },
        { label: cert.name, href: `/admin/certifications/${cert.id}` },
        { label: "Delete" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CardContent className="flex items-center gap-vera-4 p-vera-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-vera-surface ring-1 ring-vera-charcoal/10">
            <Award className="h-7 w-7 text-vera-muted" aria-hidden />
          </div>
          <div className="min-w-0 space-y-vera-1">
            <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Certification #{cert.id}
            </p>
            <p className="truncate text-lg font-medium text-vera-charcoal">
              {cert.name}
            </p>
            {cert.expiryDays != null ? (
              <p className="text-sm text-vera-muted">
                Renewal window: {cert.expiryDays} days
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <AdminDeleteConfirmDialog
        entityKind="certification"
        entityName={cert.name}
        apiPath={`/certifications/${cert.id}`}
        redirectTo="/admin/certifications"
        cancelHref={`/admin/certifications/${cert.id}`}
        successTitle="Certification deleted"
        body={
          <p className="text-vera-charcoal">
            Deleting <span className="font-semibold">{cert.name}</span> may
            orphan training records that reference it. This cannot be undone.
          </p>
        }
      />
    </AdminPageShell>
  );
}

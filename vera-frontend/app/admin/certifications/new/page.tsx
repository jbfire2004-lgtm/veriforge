import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CertificationUpsertForm } from "@/components/admin/CertificationUpsertForm";
import { Card } from "@/components/ui";

export default function NewCertificationPage() {
  return (
    <AdminPageShell
      title="Add certification"
      description="Define a certification type and default renewal window."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Certifications", href: "/admin/certifications" },
        { label: "New" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CertificationUpsertForm mode="create" cancelHref="/admin/certifications" />
      </Card>
    </AdminPageShell>
  );
}

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CompanyUpsertForm } from "@/components/admin/CompanyUpsertForm";
import { Card } from "@/components/ui";

export default function NewCompanyPage() {
  return (
    <AdminPageShell
      title="Add company"
      description="Register a contractor or client organization."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Companies", href: "/admin/companies" },
        { label: "New" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CompanyUpsertForm mode="create" cancelHref="/admin/companies" />
      </Card>
    </AdminPageShell>
  );
}

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { TrainingRecordUpsertForm } from "@/components/admin/TrainingRecordUpsertForm";
import { Card } from "@/components/ui";

export default function NewTrainingPage() {
  return (
    <AdminPageShell
      title="Add training record"
      description="Link a worker to a certification with issue and expiry dates."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training", href: "/admin/training" },
        { label: "New" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <TrainingRecordUpsertForm mode="create" cancelHref="/admin/training" />
      </Card>
    </AdminPageShell>
  );
}

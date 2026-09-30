import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { TrainingRecordUpsertForm } from "@/components/admin/TrainingRecordUpsertForm";
import { Card, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { adminServerGet } from "@/lib/admin-server-api";

type TrainingDto = {
  id: number;
  workerId: number;
  certificationId: number;
  issuedAt: string | null;
  expiresAt: string | null;
  certificateNumber?: string | null;
  providerId?: number | null;
};

export default async function EditTrainingPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  let training: TrainingDto | null = null;
  try {
    training = await adminServerGet<TrainingDto>(`/training-records/${id}`);
  } catch {
    training = null;
  }

  if (!training) {
    return (
      <AdminPageShell
        title="Training record not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Training", href: "/admin/training" },
          { label: "Edit" },
        ]}
      >
        <ErrorState
          title="Training record not found"
          description={`No record matches ID #${id}.`}
        >
          <Link
            href="/admin/training"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to training
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Edit training record"
      description={`Record #${training.id}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training", href: "/admin/training" },
        { label: `#${training.id}`, href: `/admin/training/${id}` },
        { label: "Edit" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <TrainingRecordUpsertForm
          mode="edit"
          initial={{
            id: training.id,
            workerId: training.workerId,
            certificationId: training.certificationId,
            issuedAt: training.issuedAt,
            expiresAt: training.expiresAt,
            certificateNumber: training.certificateNumber,
            providerId: training.providerId ?? null,
          }}
          cancelHref={`/admin/training/${id}`}
        />
      </Card>
    </AdminPageShell>
  );
}

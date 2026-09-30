import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { TrainingVerificationQueue } from "@/components/training/TrainingVerificationQueue";
import { ErrorState } from "@/components/ui";

export default async function TrainingVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId: raw } = await searchParams;
  const companyId = Number(raw) || 1;

  const res = await apiGetSafe<unknown[]>(
    `/api/v1/training-ingestion/verification-queue?companyId=${companyId}&limit=50`,
  );

  return (
    <AdminPageShell
      title="Training verification queue"
      description="Review uploaded certificates, approve or reject with reason codes."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training dashboard", href: `/admin/training/dashboard?companyId=${companyId}` },
        { label: "Verification" },
      ]}
    >
      {!res.ok ? (
        <ErrorState title="Queue unavailable" description={res.error} />
      ) : (
        <TrainingVerificationQueue
          companyId={companyId}
          initialItems={res.data as Parameters<typeof TrainingVerificationQueue>[0]["initialItems"]}
        />
      )}
    </AdminPageShell>
  );
}

import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge, Card, CardContent, CardHeader, CardTitle, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { CredentialVerificationChainPanel } from "@/src/components/credential/CredentialVerificationChainPanel";

export default async function TrainingDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await Promise.resolve(params);
  const idTrim = String(id ?? "").trim();

  if (!/^\d+$/.test(idTrim) || Number(idTrim) < 1) {
    return (
      <AdminPageShell
        title="Invalid training ID"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Training", href: "/admin/training" },
          { label: "Detail" },
        ]}
      >
        <ErrorState
          title="Invalid training record ID"
          description="Use a positive numeric id in the URL, for example /admin/training/12."
        >
          <Link href="/admin/training" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to training list
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const res = await apiGetSafe<Record<string, unknown>>(`/training-records/${idTrim}`);

  if (!res.ok) {
    return (
      <AdminPageShell
        title="Training record unavailable"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Training", href: "/admin/training" },
          { label: `#${idTrim}` },
        ]}
      >
        <ErrorState
          title="Could not load this training record"
          description={res.error}
        >
          <Link href="/admin/training" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to training list
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  const training = res.data as any;
  const now = new Date();
  const isValid = training.isValid ?? (training.expiresAt != null && new Date(training.expiresAt) > now);

  return (
    <AdminPageShell
      title="Training record"
      description={`ID ${training.id}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training", href: "/admin/training" },
        { label: `#${training.id}` },
      ]}
      actions={
        <div className="flex flex-wrap gap-vera-2">
          <Link href={`/verify/core/training/${training.id}`} className={buttonStyles({ variant: "outline", size: "sm" })}>
            Verify
          </Link>
          <Link href={`/admin/training/${training.id}/edit`} className={buttonStyles({ variant: "outline", size: "sm" })}>
            Edit
          </Link>
          <Link href={`/admin/training/${training.id}/delete`} className={buttonStyles({ variant: "destructive", size: "sm" })}>
            Delete
          </Link>
        </div>
      }
    >
      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-vera-4 text-sm leading-relaxed text-vera-muted">
          {training.certificateNumber ? (
            <p>
              <span className="font-semibold text-vera-charcoal">Certificate #: </span>
              <span className="font-mono text-vera-charcoal">{String(training.certificateNumber)}</span>
            </p>
          ) : null}
          {training.worker ? (
            <p>
              <span className="font-semibold text-vera-charcoal">Worker: </span>
              <Link href={`/admin/workers/${(training.worker as any).id}`} className="text-vera-teal hover:underline">
                {(training.worker as any).firstName} {(training.worker as any).lastName}
              </Link>
            </p>
          ) : null}
          {training.company ? (
            <p>
              <span className="font-semibold text-vera-charcoal">Company: </span>
              <Link href={`/admin/companies/${(training.company as any).id}`} className="text-vera-teal hover:underline">
                {(training.company as any).name}
              </Link>
            </p>
          ) : null}
          {training.certification ? (
            <p>
              <span className="font-semibold text-vera-charcoal">Certification: </span>
              <Link
                href={`/admin/certifications/${(training.certification as any).id}`}
                className="text-vera-teal hover:underline"
              >
                {(training.certification as any).name}
              </Link>
            </p>
          ) : null}
          <p>
            <span className="font-semibold text-vera-charcoal">Status: </span>
            <Badge variant={isValid ? "success" : "danger"} className="ml-vera-2">
              {isValid ? "Valid" : "Expired"}
            </Badge>
          </p>
          <p>
            <span className="font-semibold text-vera-charcoal">Issued: </span>
            {String(training.issuedAt)}
          </p>
          <p>
            <span className="font-semibold text-vera-charcoal">Expires: </span>
            {String(training.expiresAt)}
          </p>
        </CardContent>
      </Card>

      <CredentialVerificationChainPanel credentialId={training.id} className="mt-6" />

      <Card className="border-vera-charcoal/10 bg-vera-surface/40 mt-6">
        <CardHeader>
          <CardTitle className="text-base">Raw data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto rounded-lg border border-vera-charcoal/10 bg-vera-white p-vera-4 text-xs leading-relaxed">
            {JSON.stringify(training, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

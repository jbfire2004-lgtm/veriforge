import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import {
  Badge,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { formatShortDate, parseDate } from "@/components/wallet/worker-wallet-utils";

type CertificateValidation = {
  valid: boolean;
  expired?: boolean;
  reason?: string;
  record?: {
    id: number;
    workerId: number;
    workerName: string;
    certification: string;
    course?: string | null;
    provider?: string | null;
    instructor?: string | null;
    issuedAt: string;
    expiresAt?: string | null;
    certificateNumber?: string | null;
  };
};

export default async function CertificateVerifyPage({
  params,
}: {
  params: Promise<{ token: string }> | { token: string };
}) {
  const { token } = await Promise.resolve(params);
  const res = await apiGetSafe<CertificateValidation>(
    `/api/v1/training-providers/certificates/validate/${encodeURIComponent(token)}`,
    { requireAuth: false }
  );

  if (!res.ok) {
    return (
      <div className="mx-auto max-w-lg space-y-vera-6 py-vera-10">
        <ErrorState
          title="Certificate verification failed"
          description={res.error ?? "Could not validate this certificate."}
        />
      </div>
    );
  }

  const data = res.data;
  const record = data.record;

  return (
    <div className="mx-auto max-w-xl space-y-vera-6 px-vera-4 py-vera-10">
      <Breadcrumbs
        items={[
          { label: "VERA", href: "/" },
          { label: "Verify", href: "/verify" },
          { label: "Certificate" },
        ]}
      />

      <Card className="border-vera-charcoal/10 shadow-md">
        <CardHeader>
          <CardTitle>Training certificate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-vera-4">
          <Badge variant={data.valid ? "success" : "danger"}>
            {data.valid ? "Valid" : data.expired ? "Expired" : data.reason ?? "Invalid"}
          </Badge>

          {record != null ? (
            <dl className="grid gap-vera-3 text-sm">
              <Row label="Worker" value={record.workerName} />
              <Row label="Certification" value={record.certification} />
              {record.course != null && <Row label="Course" value={record.course} />}
              {record.provider != null && <Row label="Provider" value={record.provider} />}
              {record.instructor != null && (
                <Row label="Instructor" value={record.instructor} />
              )}
              <Row
                label="Issued"
                value={formatShortDate(parseDate(record.issuedAt)) ?? "—"}
              />
              <Row
                label="Expires"
                value={formatShortDate(parseDate(record.expiresAt ?? null)) ?? "—"}
              />
              {record.certificateNumber != null && (
                <Row label="Certificate #" value={record.certificateNumber} />
              )}
            </dl>
          ) : (
            <p className="text-sm text-vera-muted">No certificate details available.</p>
          )}

          {record != null && (
            <div className="flex flex-wrap gap-vera-2 pt-vera-2">
              <Link
                href={`/verify/${record.workerId}`}
                className={buttonStyles({ variant: "teal", size: "sm" })}
              >
                Worker wallet
              </Link>
              <Link
                href={`/verify/core/training/${record.id}`}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                Full training verification
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
        {label}
      </dt>
      <dd className="font-medium text-vera-charcoal">{value}</dd>
    </div>
  );
}

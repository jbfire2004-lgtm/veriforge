"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Award,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Search,
  ShieldCheck,
  ShieldOff,
  User,
} from "lucide-react";
import { useAsyncResource } from "@/lib/use-async-resource";
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  Label,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  VerificationFlowSkeleton,
  type StatusPillTone,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import {
  daysUntil,
  formatShortDate,
  getExpiryTone,
  parseDate,
} from "@/components/wallet/worker-wallet-utils";
import type { Credential } from "@/components/wallet/wallet-api";
import {
  loadTrainingBundle,
  pickRelatedDocument,
  type TrainingBundle,
  type TrainingRecordDetail,
  type TrainingVerificationPayload,
  type WorkerDocument,
} from "./training-api";
import { FilePreview, FilePreviewEmpty } from "./FilePreview";

const breadcrumbs = [
  { label: "VERA", href: "/" },
  { label: "Verify", href: "/qr" },
  { label: "Training" },
];

// ---------------------------------------------------------------------------
// status helpers
// ---------------------------------------------------------------------------

type TrainingDisplayStatus = "VALID" | "EXPIRED" | "PENDING" | "NOT_FOUND";

type StatusMeta = {
  tone: StatusPillTone;
  label: string;
  icon: LucideIcon;
};

function statusOf(record: TrainingRecordDetail | null): TrainingDisplayStatus {
  if (!record) return "NOT_FOUND";
  const exp = parseDate(record.expiresAt);
  if (getExpiryTone(exp) === "bad") return "EXPIRED";
  if (record.completedAt == null && record.issuedAt == null) return "PENDING";
  return "VALID";
}

function statusMeta(status: TrainingDisplayStatus): StatusMeta {
  switch (status) {
    case "VALID":
      return { tone: "success", label: "Valid", icon: CheckCircle2 };
    case "EXPIRED":
      return { tone: "danger", label: "Expired", icon: ShieldOff };
    case "PENDING":
      return { tone: "warning", label: "Pending", icon: AlertTriangle };
    case "NOT_FOUND":
    default:
      return { tone: "neutral", label: "Not found", icon: Search };
  }
}

function statusDescription(
  status: TrainingDisplayStatus,
  record: TrainingRecordDetail | null
): string {
  switch (status) {
    case "VALID": {
      const exp = parseDate(record?.expiresAt ?? null);
      const days = daysUntil(exp);
      if (exp == null) return "Training is on file and active.";
      if (days != null && days >= 0) {
        return `Active through ${formatShortDate(exp)} · ${days} day${
          days === 1 ? "" : "s"
        } left.`;
      }
      return `Active through ${formatShortDate(exp)}.`;
    }
    case "EXPIRED": {
      const exp = parseDate(record?.expiresAt ?? null);
      return exp != null
        ? `Training expired on ${formatShortDate(exp)}. Schedule a refresher.`
        : "Training is past its expiry. Schedule a refresher.";
    }
    case "PENDING":
      return "Training has not yet been signed off as complete.";
    case "NOT_FOUND":
    default:
      return "No training record matches that ID.";
  }
}

function credentialStatusMeta(credential: Credential): StatusMeta {
  const exp = parseDate(credential.expiresAt ?? null);
  const tone = getExpiryTone(exp);
  if (tone === "bad")
    return { tone: "danger", label: "Expired", icon: ShieldOff };
  if (tone === "soon")
    return { tone: "warning", label: "Expiring soon", icon: AlertTriangle };
  return { tone: "success", label: "Valid", icon: CheckCircle2 };
}

// ---------------------------------------------------------------------------
// Shared layout pieces
// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <div className="mb-vera-8 space-y-vera-4">
      <Breadcrumbs items={breadcrumbs} />
      <div className="space-y-vera-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-vera-teal">
          Field verification
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-vera-deep sm:text-3xl md:text-4xl">
          Training Viewer
        </h1>
        <p className="max-w-2xl text-sm font-normal leading-relaxed text-vera-muted md:text-base">
          Look up a training record to confirm the worker, company, linked
          credential, and uploaded certificate.
        </p>
      </div>
    </div>
  );
}

function CardSectionHeader({
  icon: Icon,
  title,
  description,
  right,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
      <div className="flex min-w-0 items-start gap-vera-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-vera-1">
          <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
          {description != null && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
      </div>
      {right != null && <div className="shrink-0">{right}</div>}
    </CardHeader>
  );
}

function MetaItem({
  label,
  value,
  mono,
  span,
}: {
  label: string;
  value: string;
  mono?: boolean;
  span?: "full";
}) {
  return (
    <div
      className={
        span === "full"
          ? "col-span-full min-w-0 space-y-vera-1"
          : "min-w-0 space-y-vera-1"
      }
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "break-words font-mono text-sm text-vera-charcoal"
            : "break-words text-sm font-medium text-vera-charcoal"
        }
      >
        {value}
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lookup / scan card
// ---------------------------------------------------------------------------

interface LookupCardProps {
  idInput: string;
  setIdInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

function LookupCard({
  idInput,
  setIdInput,
  onSubmit,
  isLoading,
}: LookupCardProps) {
  return (
    <Card className="mb-vera-8 border-vera-charcoal/10 shadow-md print:hidden">
      <CardSectionHeader
        icon={GraduationCap}
        title="Training record ID"
        description="Enter the training record number, or follow a credential link to land here."
        right={
          <StatusPill tone="info" icon={ShieldCheck} subtle>
            Public
          </StatusPill>
        }
      />
      <CardContent>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-vera-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1 space-y-vera-2">
            <Label htmlFor="training-id">Training record ID</Label>
            <Input
              id="training-id"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 17"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            variant="teal"
            disabled={isLoading || idInput.trim() === ""}
          >
            {isLoading ? "Loading…" : "View"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Status banner
// ---------------------------------------------------------------------------

function StatusBanner({
  bundle,
  status,
}: {
  bundle: TrainingBundle;
  status: TrainingDisplayStatus;
}) {
  const meta = statusMeta(status);
  return (
    <Card className="mb-vera-6 border-vera-charcoal/10 shadow-vera">
      <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
        <div className="flex min-w-0 items-start gap-vera-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep shadow-md ring-1 ring-inset ring-vera-teal/20">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-vera-1">
            <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Training viewer
            </p>
            <CardTitle className="text-xl tracking-tight">
              {bundle.record.courseName ??
                bundle.record.certification?.name ??
                "Training record"}
            </CardTitle>
            <CardDescription>
              {statusDescription(status, bundle.record)}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-vera-2">
          <Badge variant="outline" className="font-mono text-xs">
            Training #{bundle.training.id}
          </Badge>
          <StatusPill tone={meta.tone} icon={meta.icon}>
            {meta.label}
          </StatusPill>
        </div>
      </CardHeader>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Left column — File preview card
// ---------------------------------------------------------------------------

function FilePreviewCard({
  documents,
  documentsError,
  preferred,
}: {
  documents: WorkerDocument[] | null;
  documentsError: string | null;
  preferred: WorkerDocument | null;
}) {
  return (
    <Card className="border-vera-charcoal/10 shadow-md lg:sticky lg:top-vera-6">
      <CardSectionHeader
        icon={FileText}
        title="Certificate file"
        description="Original certificate or supporting document attached to this training."
      />
      <CardContent>
        {documents == null ? (
          <FilePreviewEmpty
            message={
              documentsError ??
              "Document preview is restricted. Sign in as an admin or supervisor to view files."
            }
          />
        ) : preferred == null ? (
          <FilePreviewEmpty message="No supporting document is on file for this worker yet." />
        ) : (
          <FilePreview document={preferred} embedded />
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Right column — Metadata panel cards
// ---------------------------------------------------------------------------

function TrainingMetadataCard({
  payload,
  record,
}: {
  payload: TrainingVerificationPayload;
  record: TrainingRecordDetail;
}) {
  const issued = parseDate(record.issuedAt ?? null);
  const expires = parseDate(record.expiresAt ?? null);
  const completed = parseDate(record.completedAt ?? null);
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardSectionHeader
        icon={GraduationCap}
        title="Training metadata"
        description={record.courseName ?? "Training record"}
      />
      <CardContent>
        <dl className="grid grid-cols-1 gap-vera-4 sm:grid-cols-2">
          <MetaItem label="Course" value={record.courseName ?? "—"} />
          <MetaItem
            label="Code"
            value={record.certification?.code ?? "—"}
            mono
          />
          <MetaItem label="Issued" value={formatShortDate(issued)} />
          <MetaItem label="Expires" value={formatShortDate(expires)} />
          <MetaItem label="Completed" value={formatShortDate(completed)} />
          <MetaItem
            label="Certificate #"
            value={record.certificateNumber ?? "—"}
            mono
          />
          {payload.provider?.name != null && (
            <MetaItem
              label="Provider"
              value={payload.provider.name}
              span="full"
            />
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

function CredentialInfoCard({
  credential,
  workerId,
}: {
  credential: Credential | null;
  workerId: number;
}) {
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardSectionHeader
        icon={Award}
        title="Credential info"
        description="The credential linked to this training's certification."
        right={
          credential != null ? (
            <StatusPill
              tone={credentialStatusMeta(credential).tone}
              icon={credentialStatusMeta(credential).icon}
            >
              {credentialStatusMeta(credential).label}
            </StatusPill>
          ) : undefined
        }
      />
      <CardContent>
        {credential == null ? (
          <EmptyState
            icon={Award}
            title="No linked credential"
            description="No credential has been issued to this worker for this certification yet."
          />
        ) : (
          <div className="space-y-vera-4">
            <dl className="grid grid-cols-1 gap-vera-4 sm:grid-cols-2">
              <MetaItem
                label="Name"
                value={
                  credential.name ?? credential.certification?.name ?? "—"
                }
              />
              <MetaItem
                label="Reference"
                value={credential.value ?? "—"}
                mono
              />
              <MetaItem
                label="Issued"
                value={formatShortDate(parseDate(credential.issuedAt ?? null))}
              />
              <MetaItem
                label="Expires"
                value={formatShortDate(parseDate(credential.expiresAt ?? null))}
              />
            </dl>
            <div className="flex flex-wrap gap-vera-2 border-t border-vera-charcoal/10 pt-vera-4">
              <Link
                href={`/verify/credential?id=${encodeURIComponent(
                  String(credential.id)
                )}`}
                className={buttonStyles({ variant: "teal", size: "sm" })}
              >
                <ClipboardCheck className="mr-vera-2 h-4 w-4" aria-hidden />
                Verify credential
              </Link>
              <Link
                href={`/verify/${workerId}`}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                Worker wallet
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WorkerInfoCard({
  payload,
  workerId,
}: {
  payload: TrainingVerificationPayload;
  workerId: number;
}) {
  const fullName =
    [payload.firstName, payload.lastName].filter(Boolean).join(" ") || "Worker";
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardSectionHeader
        icon={User}
        title="Worker info"
        description="Identity attached to this training record."
      />
      <CardContent>
        <div className="flex flex-col gap-vera-4 sm:flex-row sm:items-center">
          {payload.photoUrl != null && payload.photoUrl !== "" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={payload.photoUrl}
              alt={fullName}
              className="h-20 w-20 shrink-0 rounded-2xl border border-vera-charcoal/10 object-cover shadow-md"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-vera-charcoal/10 bg-vera-surface shadow-md">
              <User className="h-9 w-9 text-vera-muted" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-vera-2">
            <p className="text-lg font-medium tracking-tight text-vera-deep">
              {fullName}
            </p>
            <Badge variant="outline" className="font-mono text-xs">
              Worker #{workerId}
            </Badge>
            <div className="pt-vera-1">
              <Link
                href={`/verify/${workerId}`}
                className={buttonStyles({ variant: "teal", size: "sm" })}
              >
                Open worker wallet
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyInfoCard({ payload }: { payload: TrainingVerificationPayload }) {
  const company = payload.company;
  const hasCompany =
    company != null && (company.name != null || company.id != null);
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardSectionHeader
        icon={Building2}
        title="Company info"
        description={
          hasCompany
            ? "Organization that owns this training."
            : "No company linked to this training."
        }
      />
      {hasCompany && (
        <CardContent>
          <div className="flex flex-col gap-vera-4 sm:flex-row sm:items-center">
            {company!.logoUrl != null && company!.logoUrl !== "" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company!.logoUrl}
                alt={company!.name ?? ""}
                className="h-14 w-14 shrink-0 rounded-xl border border-vera-charcoal/10 object-contain shadow-md"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-vera-charcoal/10 bg-vera-surface shadow-md">
                <Building2 className="h-7 w-7 text-vera-muted" aria-hidden />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-vera-2">
              <p className="text-lg font-medium text-vera-charcoal">
                {company!.name ?? "Unknown company"}
              </p>
              {company!.id != null && (
                <Badge variant="outline" className="font-mono text-xs">
                  Company #{company!.id}
                </Badge>
              )}
              {company!.id != null && (
                <div className="pt-vera-1">
                  <Link
                    href={`/companies/${company!.id}`}
                    className={buttonStyles({ variant: "outline", size: "sm" })}
                  >
                    View company workers
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function OtherCredentialsCard({
  credentials,
}: {
  credentials: Credential[];
}) {
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardSectionHeader
        icon={CalendarClock}
        title="Other credentials on file"
        description="Additional credentials issued to this worker."
      />
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Credential</TableHead>
              <TableHead className="text-right">Issued</TableHead>
              <TableHead className="text-right">Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((c) => {
              const meta = credentialStatusMeta(c);
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium text-vera-charcoal">
                      {c.name ?? c.certification?.name ?? "Credential"}
                    </p>
                    {c.value != null && c.value !== "" && (
                      <p className="font-mono text-xs text-vera-muted">
                        Ref {c.value}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-vera-muted">
                    {formatShortDate(parseDate(c.issuedAt ?? null))}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-vera-muted">
                    {formatShortDate(parseDate(c.expiresAt ?? null))}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={meta.tone} icon={meta.icon} subtle>
                      {meta.label}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/verify/credential?id=${encodeURIComponent(
                        String(c.id)
                      )}`}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      Verify
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Not-found card
// ---------------------------------------------------------------------------

function NotFoundCard({ id }: { id: number }) {
  const meta = statusMeta("NOT_FOUND");
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardContent className="flex flex-col items-center gap-vera-4 p-vera-8 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-vera-surface text-vera-muted shadow-md ring-1 ring-vera-charcoal/10">
          <Search className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="text-xl font-medium tracking-tight text-vera-deep">
          Training record not found
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-vera-muted">
          No training record matches ID #{id}. Double-check the number and try
          again.
        </p>
        <StatusPill tone={meta.tone} icon={meta.icon}>
          {meta.label}
        </StatusPill>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function TrainingViewerView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromUrl = searchParams?.get("id") ?? null;

  const [idInput, setIdInput] = useState(idFromUrl ?? "");

  const { result, isLoading, setLocalError, retry } =
    useAsyncResource<TrainingBundle>({
      rawId: idFromUrl,
      loader: loadTrainingBundle,
      invalidMessage: "Enter a positive numeric training record ID.",
    });

  const updateUrlId = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (id) params.set("id", id);
      else params.delete("id");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, searchParams]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    updateUrlId(idInput.trim());
  };

  const status: TrainingDisplayStatus = useMemo(() => {
    if (result.status === "ok") return statusOf(result.data.record);
    if (result.status === "not-found") return "NOT_FOUND";
    return "VALID";
  }, [result]);

  const preferredDoc = useMemo(() => {
    if (result.status !== "ok" || result.data.documents == null) return null;
    return pickRelatedDocument(result.data.documents, {
      certificationName: result.data.record.certification?.name ?? null,
      certificateNumber: result.data.record.certificateNumber ?? null,
    });
  }, [result]);

  return (
    <div className="min-h-screen bg-vera-white pb-vera-16 print:bg-white">
      <div className="mx-auto max-w-6xl px-vera-5 py-vera-10 md:px-vera-8">
        <PageHeader />

        <LookupCard
          idInput={idInput}
          setIdInput={setIdInput}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />

        {result.status === "idle" && (
          <EmptyState
            icon={GraduationCap}
            title="Enter a training record ID to begin"
            description="Or follow the Training link from a credential or worker wallet."
          />
        )}

        {result.status === "loading" && <VerificationFlowSkeleton />}

        {result.status === "error" && (
          <ErrorState title="Could not load training" description={result.message}>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={retry}
              disabled={idInput.trim() === ""}
            >
              Try again
            </Button>
            <Link
              href="/qr"
              className={buttonStyles({ variant: "teal", size: "md" })}
            >
              Open QR scanner
            </Link>
          </ErrorState>
        )}

        {result.status === "not-found" && <NotFoundCard id={result.id} />}

        {result.status === "ok" && (
          <>
            <StatusBanner bundle={result.data} status={status} />

            <div className="grid gap-vera-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <FilePreviewCard
                  documents={result.data.documents}
                  documentsError={result.data.documentsError}
                  preferred={preferredDoc}
                />
              </div>

              <div className="space-y-vera-6 lg:col-span-2">
                <TrainingMetadataCard
                  payload={result.data.training}
                  record={result.data.record}
                />
                <CredentialInfoCard
                  credential={result.data.credential}
                  workerId={result.data.worker.id}
                />
                <WorkerInfoCard
                  payload={result.data.training}
                  workerId={result.data.worker.id}
                />
                <CompanyInfoCard payload={result.data.training} />
              </div>
            </div>

            {result.data.otherCredentials.length > 0 && (
              <div className="mt-vera-6">
                <OtherCredentialsCard
                  credentials={result.data.otherCredentials}
                />
              </div>
            )}
          </>
        )}

        <footer className="mt-vera-12 text-center text-xs text-vera-muted print:hidden">
          VERA · Training viewer · Confirm with your site&apos;s access policy.
        </footer>
      </div>
    </div>
  );
}

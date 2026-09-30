"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Building2,
  Camera,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  History,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  User,
  XCircle,
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
import type {
  TrainingRecord,
  VerificationLogEntry,
} from "@/components/wallet/wallet-api";
import { QrScanner } from "./QrScanner";
import {
  extractCredentialIdFromScan,
  loadCredentialBundle,
  normaliseStatus,
  type CredentialBundle,
  type CredentialDisplayStatus,
  type CredentialVerificationPayload,
} from "./credential-api";

const breadcrumbs = [
  { label: "VERA", href: "/" },
  { label: "Verify", href: "/qr" },
  { label: "Credential" },
];

// ---------------------------------------------------------------------------
// status helpers
// ---------------------------------------------------------------------------

type StatusMeta = {
  tone: StatusPillTone;
  label: string;
  icon: LucideIcon;
};

function deriveCredentialStatus(
  payload: CredentialVerificationPayload
): CredentialDisplayStatus {
  const apiStatus = normaliseStatus(payload.status);
  if (apiStatus === "REVOKED") return "REVOKED";
  const expiresAt = parseDate(payload.expiresOn);
  if (expiresAt != null && expiresAt < new Date()) return "EXPIRED";
  if (apiStatus === "EXPIRED") return "EXPIRED";
  return "VALID";
}

function statusMeta(status: CredentialDisplayStatus): StatusMeta {
  switch (status) {
    case "VALID":
      return { tone: "success", label: "Valid", icon: CheckCircle2 };
    case "EXPIRED":
      return { tone: "danger", label: "Expired", icon: ShieldOff };
    case "REVOKED":
      return { tone: "danger", label: "Revoked", icon: ShieldAlert };
    case "NOT_FOUND":
      return { tone: "neutral", label: "Not found", icon: Search };
    default:
      return { tone: "neutral", label: "Unknown", icon: Search };
  }
}

function statusDescription(
  status: CredentialDisplayStatus,
  payload?: CredentialVerificationPayload | null
): string {
  const expires = parseDate(payload?.expiresOn ?? null);
  switch (status) {
    case "VALID": {
      if (expires == null) return "Credential is on file and active.";
      const days = daysUntil(expires);
      if (days != null && days >= 0) {
        return `Active through ${formatShortDate(expires)} · ${days} day${
          days === 1 ? "" : "s"
        } left.`;
      }
      return `Active through ${formatShortDate(expires)}.`;
    }
    case "EXPIRED":
      return expires != null
        ? `Credential expired on ${formatShortDate(expires)}.`
        : "Credential is past its expiry date.";
    case "REVOKED":
      return "This credential has been revoked by the issuer.";
    case "NOT_FOUND":
      return "No credential matches that ID.";
    default:
      return "Status unknown.";
  }
}

function trainingRecordStatus(record: TrainingRecord): StatusMeta {
  const expires = parseDate(record.expiresAt ?? null);
  const tone = getExpiryTone(expires);
  if (tone === "bad")
    return { tone: "danger", label: "Expired", icon: XCircle };
  if (tone === "soon")
    return { tone: "warning", label: "Expiring soon", icon: AlertTriangle };
  return { tone: "success", label: "Valid", icon: CheckCircle2 };
}

// ---------------------------------------------------------------------------
// shared layout pieces
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
          Credential verification
        </h1>
        <p className="max-w-2xl text-sm font-normal leading-relaxed text-vera-muted md:text-base">
          Scan or enter a credential ID to confirm the worker, company, linked
          training records, and recent verification activity.
        </p>
      </div>
    </div>
  );
}

function SectionDivider({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-vera-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 space-y-vera-1">
        <h3 className="text-base font-medium leading-tight tracking-tight text-vera-deep">
          {title}
        </h3>
        {description != null && (
          <p className="text-sm font-normal leading-relaxed text-vera-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-vera-1">
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
// Scan UI
// ---------------------------------------------------------------------------

interface ScanSectionProps {
  idInput: string;
  setIdInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  scanOpen: boolean;
  setScanOpen: (v: boolean) => void;
  onDecode: (text: string) => void;
  isLoading: boolean;
}

function ScanSection({
  idInput,
  setIdInput,
  onSubmit,
  scanOpen,
  setScanOpen,
  onDecode,
  isLoading,
}: ScanSectionProps) {
  return (
    <Card className="mb-vera-8 border-vera-charcoal/10 shadow-md print:hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
        <div className="flex items-center gap-vera-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
            <ScanLine className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <CardTitle className="text-xl tracking-tight">
              Scan or enter credential ID
            </CardTitle>
            <CardDescription>
              Aim the camera at a VERA QR or paste the credential ID below.
            </CardDescription>
          </div>
        </div>
        <StatusPill tone="info" icon={ShieldCheck} subtle>
          Public
        </StatusPill>
      </CardHeader>
      <CardContent className="space-y-vera-5">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-vera-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1 space-y-vera-2">
            <Label htmlFor="credential-id">Credential ID</Label>
            <Input
              id="credential-id"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1024"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-wrap gap-vera-2">
            <Button
              type="submit"
              variant="teal"
              disabled={isLoading || idInput.trim() === ""}
            >
              {isLoading ? "Verifying…" : "Verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setScanOpen(!scanOpen)}
              aria-pressed={scanOpen}
            >
              <Camera className="mr-vera-2 h-4 w-4" aria-hidden />
              {scanOpen ? "Stop scan" : "Scan QR"}
            </Button>
          </div>
        </form>

        <QrScanner
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          onDecode={onDecode}
        />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Credential Viewer card (the single unified card)
// ---------------------------------------------------------------------------

function workerFullName(payload: CredentialVerificationPayload): string {
  const name = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
  if (name) return name;
  const fromWorker = [payload.worker?.firstName, payload.worker?.lastName]
    .filter(Boolean)
    .join(" ");
  return fromWorker || `Worker #${payload.workerId}`;
}

function WorkerSection({
  payload,
}: {
  payload: CredentialVerificationPayload;
}) {
  const fullName = workerFullName(payload);
  const photo = payload.photoUrl ?? payload.worker?.photoUrl ?? null;
  return (
    <section className="space-y-vera-4">
      <SectionDivider
        icon={User}
        title="Worker"
        description="Identity attached to this credential."
      />
      <div className="flex flex-col gap-vera-5 sm:flex-row sm:items-center">
        {photo != null && photo !== "" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={fullName}
            className="h-20 w-20 shrink-0 rounded-2xl border border-vera-charcoal/10 object-cover shadow-md"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-vera-charcoal/10 bg-vera-surface shadow-md">
            <User className="h-9 w-9 text-vera-muted" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-vera-2">
          <p className="text-xl font-medium tracking-tight text-vera-deep">
            {fullName}
          </p>
          <Badge variant="outline" className="font-mono text-xs">
            Worker #{payload.workerId}
          </Badge>
          <div className="flex flex-wrap gap-vera-2 pt-vera-2">
            <Link
              href={`/verify/${payload.workerId}`}
              className={buttonStyles({ variant: "teal", size: "sm" })}
            >
              Open worker wallet
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanySection({
  payload,
}: {
  payload: CredentialVerificationPayload;
}) {
  const company = payload.company;
  const hasCompany =
    company != null && (company.name != null || company.id != null);
  return (
    <section className="space-y-vera-4">
      <SectionDivider
        icon={Building2}
        title="Company"
        description={
          hasCompany
            ? "Organization that owns this credential."
            : "No company linked to this credential."
        }
      />
      {hasCompany && (
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
      )}
    </section>
  );
}

function CredentialMetadataSection({
  payload,
}: {
  payload: CredentialVerificationPayload;
}) {
  const issued = parseDate(payload.issuedOn);
  const expires = parseDate(payload.expiresOn);
  return (
    <section className="space-y-vera-4">
      <SectionDivider
        icon={ShieldCheck}
        title="Credential metadata"
        description="Verified facts pulled from VERA."
      />
      <dl className="grid grid-cols-1 gap-vera-5 sm:grid-cols-2 lg:grid-cols-3">
        <MetaItem
          label="Name"
          value={
            payload.name ?? payload.certification?.name ?? "Credential"
          }
        />
        <MetaItem
          label="Certification"
          value={payload.certification?.name ?? "—"}
        />
        <MetaItem
          label="Code"
          value={payload.certification?.code ?? "—"}
          mono
        />
        <MetaItem
          label="Reference"
          value={payload.value ?? "—"}
          mono
        />
        <MetaItem label="Issued" value={formatShortDate(issued)} />
        <MetaItem label="Expires" value={formatShortDate(expires)} />
      </dl>
    </section>
  );
}

function TrainingMetadataSection({
  records,
}: {
  records: TrainingRecord[];
}) {
  return (
    <section className="space-y-vera-4">
      <SectionDivider
        icon={GraduationCap}
        title="Training metadata"
        description="Training records tied to this credential's certification."
      />
      {records.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No linked training records"
          description="When training is recorded against this credential's certification it will appear here."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead className="text-right">Issued</TableHead>
              <TableHead className="text-right">Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const status = trainingRecordStatus(record);
              return (
                <TableRow key={record.id}>
                  <TableCell>
                    <p className="font-medium text-vera-charcoal">
                      {record.certification?.name ?? "Training"}
                    </p>
                    {record.certification?.code != null && (
                      <p className="text-xs text-vera-muted">
                        Code {record.certification.code}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-vera-muted">
                    {formatShortDate(parseDate(record.issuedAt ?? null))}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-vera-muted">
                    {formatShortDate(parseDate(record.expiresAt ?? null))}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={status.tone} icon={status.icon} subtle>
                      {status.label}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/verify/training?id=${encodeURIComponent(
                        String(record.id)
                      )}`}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

function VerificationHistorySection({
  history,
  historyError,
}: {
  history: VerificationLogEntry[] | null;
  historyError: string | null;
}) {
  return (
    <section className="space-y-vera-4">
      <SectionDivider
        icon={History}
        title="Verification history"
        description="Recent gate sign-offs and toolbox checks for this worker."
      />
      {history == null ? (
        <ErrorState
          title="History not available"
          description={
            historyError ??
            "Sign-off logs are restricted to admins and supervisors."
          }
        />
      ) : history.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No verification activity yet"
          description="When this worker is checked into a site or piece of equipment, the result shows here."
        />
      ) : (
        <ul className="space-y-vera-3">
          {history.map((entry) => {
            const safe = entry.result === "SAFE";
            const date = parseDate(entry.createdAt);
            return (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-vera-3 rounded-xl border border-vera-charcoal/10 bg-vera-surface/40 p-vera-4"
              >
                <div className="flex min-w-0 items-center gap-vera-3">
                  <span
                    className={
                      safe
                        ? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shadow-md ring-1 ring-inset ring-emerald-100"
                        : "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 shadow-md ring-1 ring-inset ring-red-100"
                    }
                  >
                    {safe ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    ) : (
                      <XCircle className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-vera-charcoal">
                      {entry.equipment?.name ?? "Site verification"}
                    </p>
                    <p className="text-xs text-vera-muted">
                      <CalendarClock className="-mt-0.5 mr-vera-1 inline h-3.5 w-3.5" aria-hidden />
                      {date != null ? formatShortDate(date) : "—"}
                    </p>
                  </div>
                </div>
                <StatusPill
                  tone={safe ? "success" : "danger"}
                  icon={safe ? CheckCircle2 : XCircle}
                  subtle
                >
                  {entry.result}
                </StatusPill>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

interface CredentialViewerCardProps {
  bundle: CredentialBundle;
  status: CredentialDisplayStatus;
}

function CredentialViewerCard({ bundle, status }: CredentialViewerCardProps) {
  const { credential, relatedTraining, history, historyError } = bundle;
  const meta = statusMeta(status);
  const description = statusDescription(status, credential);
  return (
    <Card className="border-vera-charcoal/10 shadow-vera">
      <CardHeader className="gap-vera-3 border-b border-vera-charcoal/10 pb-vera-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-vera-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep shadow-md ring-1 ring-inset ring-vera-teal/20">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-vera-1">
            <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Credential viewer
            </p>
            <CardTitle className="text-xl tracking-tight">
              {credential.name ?? credential.certification?.name ?? "Credential"}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-vera-2">
          <Badge variant="outline" className="font-mono text-xs">
            Credential #{credential.id}
          </Badge>
          <StatusPill tone={meta.tone} icon={meta.icon}>
            {meta.label}
          </StatusPill>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-vera-charcoal/10 pt-0 [&>section]:py-vera-6 [&>section:first-child]:pt-vera-6 [&>section:last-child]:pb-0">
        <CredentialMetadataSection payload={credential} />
        <WorkerSection payload={credential} />
        <CompanySection payload={credential} />
        <TrainingMetadataSection records={relatedTraining} />
        <VerificationHistorySection
          history={history}
          historyError={historyError}
        />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// State views (loading / error / not-found / idle)
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
          Credential not found
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-vera-muted">
          No credential matches ID #{id}. Re-scan the QR or double-check the
          number and try again.
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

export function CredentialVerificationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromUrl = searchParams?.get("id") ?? null;

  const [idInput, setIdInput] = useState(idFromUrl ?? "");
  const [scanOpen, setScanOpen] = useState(false);

  const { result, isLoading, setLocalError, retry } =
    useAsyncResource<CredentialBundle>({
      rawId: idFromUrl,
      loader: loadCredentialBundle,
      invalidMessage: "Enter a positive numeric credential ID.",
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

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    updateUrlId(idInput.trim());
  };

  const onDecode = useCallback(
    (text: string) => {
      const id = extractCredentialIdFromScan(text);
      if (id == null) {
        setLocalError("Scanned QR did not contain a credential ID.");
        return;
      }
      const idStr = String(id);
      setLocalError(null);
      setIdInput(idStr);
      setScanOpen(false);
      updateUrlId(idStr);
    },
    [setLocalError, updateUrlId]
  );

  const status: CredentialDisplayStatus = useMemo(() => {
    if (result.status === "ok") return deriveCredentialStatus(result.data.credential);
    if (result.status === "not-found") return "NOT_FOUND";
    return "VALID";
  }, [result]);

  return (
    <div className="min-h-screen bg-vera-white pb-vera-16 print:bg-white">
      <div className="mx-auto max-w-3xl px-vera-5 py-vera-10 md:px-vera-8">
        <PageHeader />

        <ScanSection
          idInput={idInput}
          setIdInput={setIdInput}
          onSubmit={onSubmit}
          scanOpen={scanOpen}
          setScanOpen={setScanOpen}
          onDecode={onDecode}
          isLoading={isLoading}
        />

        {result.status === "idle" && (
          <EmptyState
            icon={ShieldCheck}
            title="Enter a credential ID to begin"
            description="Scan a VERA credential QR or paste the credential ID in the field above."
          />
        )}

        {result.status === "loading" && <VerificationFlowSkeleton />}

        {result.status === "error" && (
          <ErrorState title="Could not load credential" description={result.message}>
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
          <CredentialViewerCard bundle={result.data} status={status} />
        )}

        <footer className="mt-vera-12 text-center text-xs text-vera-muted print:hidden">
          VERA · Credential verification · Confirm with your site&apos;s access
          policy.
        </footer>
      </div>
    </div>
  );
}

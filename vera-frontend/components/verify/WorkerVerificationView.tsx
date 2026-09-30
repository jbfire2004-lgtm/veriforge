"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Shield,
  ShieldOff,
  User,
  XCircle,
} from "lucide-react";

import { cn } from "@/src/lib/utils";
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
  VerificationFlowSkeleton,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import {
  daysUntil,
  formatShortDate,
  getExpiryTone,
  parseDate,
} from "@/components/wallet/worker-wallet-utils";
import { useAsyncResource } from "@/lib/use-async-resource";
import {
  loadWorkerWallet,
  type Credential,
  type TrainingRecord,
  type VerificationLogEntry,
  type WorkerWalletData,
} from "@/components/wallet/wallet-api";
import { QrScanner } from "./QrScanner";
import { extractWorkerIdFromScan } from "./worker-scan";

const breadcrumbs = [
  { label: "VERA", href: "/" },
  { label: "Verify", href: "/qr" },
  { label: "Worker" },
];

type WorkerStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED" | "NOT_FOUND";

function deriveWorkerStatus(data: WorkerWalletData): WorkerStatus {
  const all = [
    ...(data.payload.certifications ?? []),
    ...(data.payload.credentials ?? []),
  ];

  let anyExpired = false;
  let anySoon = false;
  for (const item of all) {
    const exp = parseDate(item.expiresAt ?? null);
    if (!exp) continue;
    const tone = getExpiryTone(exp);
    if (tone === "bad") anyExpired = true;
    else if (tone === "soon") anySoon = true;
  }

  if (anyExpired) return "EXPIRED";
  if (anySoon) return "EXPIRING_SOON";
  return "VALID";
}

function statusToneClasses(status: WorkerStatus): {
  ring: string;
  badge: "success" | "danger" | "warning" | "outline";
  badgeText: string;
  panelBg: string;
  iconColor: string;
} {
  switch (status) {
    case "VALID":
      return {
        ring: "border-emerald-300/80 ring-1 ring-emerald-200/60",
        badge: "success",
        badgeText: "Valid",
        panelBg: "bg-emerald-50/70",
        iconColor: "text-emerald-600",
      };
    case "EXPIRING_SOON":
      return {
        ring: "border-amber-300/80 ring-1 ring-amber-200/60",
        badge: "warning",
        badgeText: "Expiring soon",
        panelBg: "bg-amber-50/70",
        iconColor: "text-amber-600",
      };
    case "EXPIRED":
      return {
        ring: "border-red-300/80 ring-1 ring-red-200/60",
        badge: "danger",
        badgeText: "Expired",
        panelBg: "bg-red-50/70",
        iconColor: "text-red-600",
      };
    case "NOT_FOUND":
    default:
      return {
        ring: "border-vera-charcoal/15 ring-1 ring-vera-charcoal/10",
        badge: "outline",
        badgeText: "Not found",
        panelBg: "bg-vera-surface/60",
        iconColor: "text-vera-muted",
      };
  }
}

function StatusIcon({ status, className }: { status: WorkerStatus; className?: string }) {
  switch (status) {
    case "VALID":
      return <CheckCircle2 className={className} aria-hidden />;
    case "EXPIRING_SOON":
      return <AlertTriangle className={className} aria-hidden />;
    case "EXPIRED":
      return <ShieldOff className={className} aria-hidden />;
    case "NOT_FOUND":
    default:
      return <Search className={className} aria-hidden />;
  }
}

function statusDescription(status: WorkerStatus, data: WorkerWalletData): string {
  const issues = data.payload.compliance?.issues ?? [];
  switch (status) {
    case "VALID":
      return issues.length === 0
        ? "All credentials and training records are current."
        : "Active overall, but check the compliance notes below.";
    case "EXPIRING_SOON":
      return "One or more credentials or training records expire within 30 days.";
    case "EXPIRED":
      return "One or more credentials or training records are past their expiry.";
    case "NOT_FOUND":
    default:
      return "We couldn't find a worker with that ID.";
  }
}

function MetaTile({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">{label}</p>
      <p
        className={cn(
          "mt-vera-1 break-words font-medium text-vera-charcoal",
          mono && "font-mono text-sm"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function WorkerCard({ data }: { data: WorkerWalletData }) {
  const w = data.payload.worker;
  const fullName = [w.firstName, w.lastName].filter(Boolean).join(" ") || "Worker";
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <User className="h-6 w-6 text-vera-teal" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Worker</CardTitle>
            <CardDescription>Identity attached to this QR.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-vera-5 sm:flex-row sm:items-center">
        {w.photoUrl != null && w.photoUrl !== "" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={w.photoUrl}
            alt={fullName}
            className="h-24 w-24 shrink-0 rounded-2xl border border-vera-charcoal/10 object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-vera-charcoal/10 bg-vera-surface">
            <User className="h-10 w-10 text-vera-muted" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-vera-2">
          <h3 className="text-2xl font-bold tracking-tight text-vera-deep">{fullName}</h3>
          <Badge variant="outline" className="font-mono text-xs">
            Worker #{w.id}
          </Badge>
          <div className="flex flex-wrap gap-vera-2 pt-vera-2">
            <Link
              href={`/verify/${w.id}`}
              className={buttonStyles({ variant: "teal", size: "sm" })}
            >
              Open worker wallet
            </Link>
            {w.company?.id != null && (
              <Link
                href={`/companies/${w.company.id}`}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                View company
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyCard({ data }: { data: WorkerWalletData }) {
  const company = data.payload.worker.company ?? null;
  if (!company || (!company.name && !company.id)) {
    return (
      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-vera-3">
            <Building2 className="h-6 w-6 text-vera-teal" aria-hidden />
            <div>
              <CardTitle className="text-xl tracking-tight">Company</CardTitle>
              <CardDescription>No company linked to this worker.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <Building2 className="h-6 w-6 text-vera-teal" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Company</CardTitle>
            <CardDescription>Organization that employs this worker.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-vera-4 sm:flex-row sm:items-center">
        {company.logoUrl != null && company.logoUrl !== "" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logoUrl}
            alt={company.name ?? ""}
            className="h-16 w-16 shrink-0 rounded-xl border border-vera-charcoal/10 object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-vera-charcoal/10 bg-vera-surface">
            <Building2 className="h-8 w-8 text-vera-muted" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-vera-2">
          <p className="text-lg font-semibold text-vera-charcoal">{company.name ?? "Unknown"}</p>
          {company.id != null && (
            <Badge variant="outline" className="font-mono text-xs">
              Company #{company.id}
            </Badge>
          )}
          {company.id != null && (
            <div className="pt-vera-1">
              <Link
                href={`/companies/${company.id}`}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                View company workers
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CompliancePanel({ data }: { data: WorkerWalletData }) {
  const compliance = data.payload.compliance;
  if (!compliance) return null;
  const ok = compliance.isCompliant ?? true;
  const issues = compliance.issues ?? [];
  return (
    <Card
      className={cn(
        "border shadow-sm",
        ok ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"
      )}
    >
      <CardHeader className="flex flex-row items-start gap-vera-4 space-y-0">
        {ok ? (
          <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" aria-hidden />
        ) : (
          <AlertTriangle className="h-8 w-8 shrink-0 text-amber-600" aria-hidden />
        )}
        <div>
          <CardTitle className="text-lg">
            {ok ? "Compliance OK" : "Compliance gaps"}
          </CardTitle>
          <CardDescription>Company training rules applied to this worker.</CardDescription>
        </div>
      </CardHeader>
      {issues.length > 0 && (
        <CardContent className="border-t border-vera-charcoal/10 pt-0">
          <ul className="space-y-vera-2 pt-vera-4">
            {issues.map((issue, idx) => (
              <li
                key={`${issue.courseName}-${idx}`}
                className="flex flex-wrap items-center justify-between gap-vera-2 rounded-lg bg-vera-white/80 px-vera-3 py-vera-2 text-sm"
              >
                <span className="font-medium text-vera-charcoal">{issue.courseName}</span>
                <Badge variant={issue.type === "EXPIRED" ? "danger" : "warning"}>
                  {issue.type.replace(/_/g, " ")}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

function CredentialsList({ items }: { items: Credential[] }) {
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <ClipboardCheck className="h-6 w-6 text-vera-teal" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Credentials</CardTitle>
            <CardDescription>Passes and IDs currently on file.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No credentials"
            description="This worker has no credentials issued yet."
          />
        ) : (
          <ul className="space-y-vera-3">
            {items.map((c) => {
              const exp = parseDate(c.expiresAt ?? null);
              const tone = getExpiryTone(exp);
              const isExpired = tone === "bad";
              const isSoon = tone === "soon";
              return (
                <li
                  key={c.id}
                  className={cn(
                    "flex flex-wrap items-start justify-between gap-vera-3 rounded-xl border p-vera-4",
                    isExpired
                      ? "border-red-200/80 bg-red-50/40"
                      : isSoon
                        ? "border-amber-200/80 bg-amber-50/40"
                        : "border-emerald-200/60 bg-emerald-50/30"
                  )}
                >
                  <div className="min-w-0 space-y-vera-1">
                    <p className="font-semibold text-vera-charcoal">
                      {c.certification?.name ?? c.name ?? "Credential"}
                    </p>
                    <p className="text-sm text-vera-muted">
                      {exp != null && <span>Expires {formatShortDate(exp)}</span>}
                      {exp != null && daysUntil(exp) != null && !isExpired && (
                        <span className="ml-vera-2">· {daysUntil(exp)}d left</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-vera-2">
                    <Badge variant={isExpired ? "danger" : isSoon ? "warning" : "success"}>
                      {isExpired ? "Expired" : isSoon ? "Expiring" : "Valid"}
                    </Badge>
                    <Link
                      href={`/verify/credential?id=${encodeURIComponent(String(c.id))}`}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      Open
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TrainingList({ items }: { items: TrainingRecord[] }) {
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <Shield className="h-6 w-6 text-vera-teal" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Training records</CardTitle>
            <CardDescription>
              Issued dates and expirations for completed courses.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No training records"
            description="This worker hasn't completed any tracked training yet."
          />
        ) : (
          <ul className="space-y-vera-3">
            {items.map((tr) => {
              const exp = parseDate(tr.expiresAt ?? null);
              const issued = parseDate(tr.issuedAt ?? null);
              const tone = getExpiryTone(exp);
              const expired = tone === "bad";
              const soon = tone === "soon";
              return (
                <li
                  key={tr.id}
                  className={cn(
                    "flex flex-wrap items-start justify-between gap-vera-3 rounded-xl border p-vera-4",
                    expired
                      ? "border-red-200/80 bg-red-50/40"
                      : soon
                        ? "border-amber-200/80 bg-amber-50/40"
                        : "border-emerald-200/60 bg-emerald-50/30"
                  )}
                >
                  <div className="min-w-0 space-y-vera-1">
                    <p className="font-semibold text-vera-charcoal">
                      {tr.certification?.name ?? "Training"}
                    </p>
                    <p className="text-sm text-vera-muted">
                      {issued != null && (
                        <span className="mr-vera-3">
                          <CalendarClock
                            className="-mt-0.5 mr-vera-1 inline h-4 w-4"
                            aria-hidden
                          />
                          Issued {formatShortDate(issued)}
                        </span>
                      )}
                      {exp != null && <span>Expires {formatShortDate(exp)}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-vera-2">
                    <Badge variant={expired ? "danger" : soon ? "warning" : "success"}>
                      {expired ? "Expired" : soon ? "Expiring" : "Valid"}
                    </Badge>
                    <Link
                      href={`/verify/training?id=${encodeURIComponent(String(tr.id))}`}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      Open
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function HistoryCard({
  history,
  historyError,
}: {
  history: VerificationLogEntry[] | null;
  historyError: string | null;
}) {
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <History className="h-6 w-6 text-vera-teal" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Verification history</CardTitle>
            <CardDescription>Recent gate sign-offs for this worker.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {history == null ? (
          <p className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4 text-sm text-vera-muted">
            {historyError ?? "Sign-off logs are restricted to admins and supervisors."}
          </p>
        ) : history.length === 0 ? (
          <EmptyState
            icon={History}
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
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-vera-3 rounded-xl border p-vera-4",
                    safe
                      ? "border-emerald-200/80 bg-emerald-50/40"
                      : "border-red-200/80 bg-red-50/40"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-vera-3">
                    {safe ? (
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 text-emerald-600"
                        aria-hidden
                      />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-vera-charcoal">
                        {entry.equipment?.name ?? "Site verification"}
                      </p>
                      <p className="text-sm text-vera-muted">
                        {date != null ? formatShortDate(date) : "—"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={safe ? "success" : "danger"}>{entry.result}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function WorkerSummaryCard({ data }: { data: WorkerWalletData }) {
  const credCount = data.payload.credentials?.length ?? 0;
  const trainingCount = data.payload.certifications?.length ?? 0;
  const expiredCount = data.payload.expiredCerts?.length ?? 0;
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <ClipboardCheck className="h-6 w-6 text-vera-teal" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Snapshot</CardTitle>
            <CardDescription>At-a-glance counts for this worker.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-vera-4 sm:grid-cols-3">
        <MetaTile label="Credentials" value={String(credCount)} />
        <MetaTile label="Training records" value={String(trainingCount)} />
        <MetaTile label="Expired" value={String(expiredCount)} />
      </CardContent>
    </Card>
  );
}

export function WorkerVerificationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromUrl = searchParams?.get("id") ?? null;

  const [idInput, setIdInput] = useState(idFromUrl ?? "");
  const [scanOpen, setScanOpen] = useState(false);

  const { result, isLoading, setLocalError, retry } = useAsyncResource<WorkerWalletData>({
    rawId: idFromUrl,
    loader: loadWorkerWallet,
    invalidMessage: "Enter a positive numeric worker ID.",
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
      const id = extractWorkerIdFromScan(text);
      if (id == null) {
        setLocalError("Scanned QR did not contain a worker ID.");
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

  const status: WorkerStatus = useMemo(() => {
    if (result.status === "ok") return deriveWorkerStatus(result.data);
    if (result.status === "not-found") return "NOT_FOUND";
    return "VALID";
  }, [result]);

  const tone = statusToneClasses(status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-vera-surface/80 via-vera-white to-vera-white pb-vera-16 print:bg-white">
      <div className="mx-auto max-w-2xl px-vera-5 py-vera-10 md:px-vera-8">
        <div className="mb-vera-8 space-y-vera-4">
          <Breadcrumbs className="text-vera-muted" items={breadcrumbs} />
          <div className="space-y-vera-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-vera-teal">
              Field verification
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-vera-deep sm:text-3xl md:text-4xl">
              Worker Verification
            </h1>
            <p className="text-base leading-relaxed text-vera-muted md:text-lg">
              Scan a worker QR or enter the ID, then confirm credentials, training, company, and
              recent sign-offs.
            </p>
          </div>
        </div>

        <Card className="mb-vera-8 border-vera-charcoal/10 shadow-md print:hidden">
          <CardHeader>
            <div className="flex items-center gap-vera-3">
              <ScanLine className="h-6 w-6 text-vera-teal" aria-hidden />
              <div>
                <CardTitle className="text-xl tracking-tight">Scan or enter ID</CardTitle>
                <CardDescription>
                  Use the camera button to scan a QR, or paste the worker ID.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-vera-4">
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-vera-3 sm:flex-row sm:items-end"
            >
              <div className="min-w-0 flex-1 space-y-vera-2">
                <Label htmlFor="worker-id">Worker ID</Label>
                <Input
                  id="worker-id"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 42"
                  value={idInput}
                  onChange={(event) => setIdInput(event.target.value)}
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
                  onClick={() => setScanOpen((v) => !v)}
                  aria-pressed={scanOpen}
                >
                  <Camera className="mr-vera-2 h-4 w-4" aria-hidden />
                  {scanOpen ? "Stop scan" : "Scan QR"}
                </Button>
              </div>
            </form>

            <QrScanner open={scanOpen} onClose={() => setScanOpen(false)} onDecode={onDecode} />

            <Link
              href="/qr"
              className={buttonStyles({
                variant: "ghost",
                size: "sm",
                className: "w-fit text-vera-muted print:hidden",
              })}
            >
              Open QR scanner page
            </Link>
          </CardContent>
        </Card>

        {result.status === "loading" && (
          <div className="mb-vera-8">
            <VerificationFlowSkeleton />
          </div>
        )}

        {result.status === "error" && (
          <div className="mb-vera-8">
            <ErrorState title="Verification failed" description={result.message}>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={retry}
                disabled={idInput.trim() === ""}
              >
                Try again
              </Button>
            </ErrorState>
          </div>
        )}

        {result.status === "not-found" && (
          <div className="mb-vera-8">
            <Card className={cn("border bg-vera-white shadow-md", tone.ring)}>
              <CardContent className="flex flex-col items-center gap-vera-4 p-vera-8 text-center">
                <Search className="h-10 w-10 text-vera-muted" aria-hidden />
                <h2 className="text-2xl font-bold tracking-tight text-vera-deep">
                  Worker not found
                </h2>
                <p className="text-vera-muted">
                  No worker matches ID #{result.id}. Re-scan the QR or check the number.
                </p>
                <Badge variant="outline" className="text-xs uppercase tracking-wide">
                  Not found
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {result.status === "idle" && (
          <div className="mb-vera-8">
            <EmptyState
              icon={Search}
              title="Enter a worker ID to begin"
              description="Or scan a worker QR using the camera button above."
            />
          </div>
        )}

        {result.status === "ok" && (
          <div
            className={cn(
              "space-y-vera-6 rounded-2xl border bg-vera-white p-vera-6 shadow-md md:p-vera-8",
              tone.ring
            )}
          >
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-vera-4 rounded-xl border border-vera-charcoal/10 p-vera-5 shadow-sm",
                tone.panelBg
              )}
            >
              <div className="flex items-center gap-vera-3">
                <StatusIcon status={status} className={cn("h-8 w-8 shrink-0", tone.iconColor)} />
                <div className="space-y-vera-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">
                    Status
                  </p>
                  <p className="text-lg font-semibold text-vera-charcoal">
                    {statusDescription(status, result.data)}
                  </p>
                </div>
              </div>
              <Badge variant={tone.badge} className="text-xs uppercase tracking-wide">
                {tone.badgeText}
              </Badge>
            </div>

            <WorkerCard data={result.data} />
            <WorkerSummaryCard data={result.data} />
            <CompanyCard data={result.data} />
            <CompliancePanel data={result.data} />
            <CredentialsList items={result.data.payload.credentials ?? []} />
            <TrainingList items={result.data.payload.certifications ?? []} />
            <HistoryCard
              history={result.data.history}
              historyError={result.data.historyError}
            />
          </div>
        )}

        <footer className="mt-vera-12 text-center text-xs text-vera-muted print:hidden">
          VERA · Public worker verification · Confirm with your site&apos;s access policy.
        </footer>
      </div>
    </div>
  );
}

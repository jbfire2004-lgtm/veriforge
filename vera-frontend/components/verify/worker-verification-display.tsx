"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  History,
  Search,
  Shield,
  ShieldOff,
  User,
  XCircle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import {
  daysUntil,
  formatShortDate,
  getExpiryTone,
  parseDate,
} from "@/components/wallet/worker-wallet-utils";
import type {
  Credential,
  TrainingRecord,
  VerificationLogEntry,
  WorkerWalletData,
} from "@/components/wallet/wallet-api";

export type WorkerStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED" | "NOT_FOUND";

export function deriveWorkerStatus(data: WorkerWalletData): WorkerStatus {
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
            <CardDescription>Identity attached to this verification link.</CardDescription>
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
          {w.company?.id != null ? (
            <div className="pt-vera-2">
              <Link
                href={`/companies/${w.company.id}`}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                View company
              </Link>
            </div>
          ) : null}
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
      <CardContent>
        <p className="text-lg font-semibold text-vera-charcoal">{company.name ?? "Unknown"}</p>
      </CardContent>
    </Card>
  );
}

function CompliancePanel({ data }: { data: WorkerWalletData }) {
  const issues = data.payload.compliance?.issues ?? [];
  if (issues.length === 0) return null;
  return (
    <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <Shield className="h-6 w-6 text-amber-700" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Compliance notes</CardTitle>
            <CardDescription>Items flagged during verification.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-vera-2 text-sm text-amber-950">
          {issues.map((issue, i) => (
            <li key={i}>
              {issue.type}: {issue.courseName}
              {issue.expiresAt ? ` (expires ${formatShortDate(parseDate(issue.expiresAt))})` : ""}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CredentialsList({ items }: { items: Credential[] }) {
  if (!items.length) return null;
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl tracking-tight">Credentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-vera-3">
        {items.map((c) => {
          const exp = parseDate(c.expiresAt ?? null);
          const tone = getExpiryTone(exp);
          return (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-vera-2 rounded-lg border border-vera-charcoal/10 px-vera-4 py-vera-3"
            >
              <span className="font-medium">{c.certification?.name ?? c.name ?? "Credential"}</span>
              <Badge
                variant={tone === "bad" ? "danger" : tone === "soon" ? "warning" : "success"}
              >
                {exp ? formatShortDate(exp) : "No expiry"}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TrainingList({ items }: { items: TrainingRecord[] }) {
  if (!items.length) return null;
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <GraduationCap className="h-6 w-6 text-vera-teal" aria-hidden />
          <CardTitle className="text-xl tracking-tight">Training</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-vera-3">
        {items.map((r) => {
          const exp = parseDate(r.expiresAt ?? null);
          const tone = getExpiryTone(exp);
          const days = daysUntil(exp);
          return (
            <div
              key={r.id}
              className="rounded-lg border border-vera-charcoal/10 px-vera-4 py-vera-3"
            >
              <p className="font-medium">
                {r.certification?.name ?? r.courseName ?? "Training record"}
              </p>
              <div className="mt-vera-1 flex flex-wrap items-center gap-vera-2 text-sm text-vera-muted">
                <CalendarClock className="h-4 w-4" aria-hidden />
                {exp ? (
                  <span>
                    Expires {formatShortDate(exp)}
                    {days != null ? ` (${days}d)` : ""}
                  </span>
                ) : (
                  <span>No expiry on file</span>
                )}
                <Badge
                  variant={tone === "bad" ? "danger" : tone === "soon" ? "warning" : "success"}
                >
                  {tone === "bad" ? "Expired" : tone === "soon" ? "Expiring" : "Current"}
                </Badge>
              </div>
            </div>
          );
        })}
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
  if (historyError) {
    return (
      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">Recent sign-offs</CardTitle>
          <CardDescription>Sign-in history is not shown on public verification.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  if (!history?.length) return null;
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <History className="h-6 w-6 text-vera-teal" aria-hidden />
          <CardTitle className="text-xl tracking-tight">Recent sign-offs</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-vera-2">
        {history.slice(0, 5).map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border border-vera-charcoal/10 px-vera-3 py-vera-2 text-sm"
          >
            <span className="flex items-center gap-vera-2">
              {entry.result === "SAFE" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" aria-hidden />
              )}
              {entry.result}
            </span>
            <span className="text-vera-muted">{formatShortDate(parseDate(entry.createdAt))}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function WorkerSummaryCard({ data }: { data: WorkerWalletData }) {
  const certs = data.payload.certifications ?? [];
  const creds = data.payload.credentials ?? [];
  const expired = data.payload.expiredCerts?.length ?? 0;
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <ClipboardCheck className="h-6 w-6 text-vera-teal" aria-hidden />
          <CardTitle className="text-xl tracking-tight">Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-vera-3 sm:grid-cols-3">
        <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Training</p>
          <p className="mt-vera-1 text-lg font-semibold">{certs.length}</p>
        </div>
        <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">
            Credentials
          </p>
          <p className="mt-vera-1 text-lg font-semibold">{creds.length}</p>
        </div>
        <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Expired</p>
          <p className="mt-vera-1 text-lg font-semibold">{expired}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/** Anonymous public verification card — status, identity, training, credentials. */
export function WorkerVerificationResult({ data }: { data: WorkerWalletData }) {
  const status = deriveWorkerStatus(data);
  const tone = statusToneClasses(status);

  return (
    <div
      className={cn(
        "space-y-vera-6 rounded-2xl border bg-vera-white p-vera-6 shadow-md md:p-vera-8",
        tone.ring,
      )}
      data-testid="public-worker-verify-card"
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-vera-4 rounded-xl border border-vera-charcoal/10 p-vera-5 shadow-sm",
          tone.panelBg,
        )}
      >
        <div className="flex items-center gap-vera-3">
          <StatusIcon status={status} className={cn("h-8 w-8 shrink-0", tone.iconColor)} />
          <div className="space-y-vera-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Status</p>
            <p className="text-lg font-semibold text-vera-charcoal">
              {statusDescription(status, data)}
            </p>
          </div>
        </div>
        <Badge variant={tone.badge} className="text-xs uppercase tracking-wide">
          {tone.badgeText}
        </Badge>
      </div>

      <WorkerCard data={data} />
      <WorkerSummaryCard data={data} />
      <CompanyCard data={data} />
      <CompliancePanel data={data} />
      <CredentialsList items={data.payload.credentials ?? []} />
      <TrainingList items={data.payload.certifications ?? []} />
      <HistoryCard history={data.history} historyError={data.historyError} />
    </div>
  );
}

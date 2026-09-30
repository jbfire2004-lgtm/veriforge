"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  HardHat,
  History,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Target,
  User,
  UserX,
  XCircle,
} from "lucide-react";
import { parseVerifyRefTarget, useAsyncResource } from "@/lib/use-async-resource";
import { cn } from "@/src/lib/utils";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  ProgressBar,
  Skeleton,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  WalletPageSkeleton,
  type StatusPillTone,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import {
  daysUntil,
  formatShortDate,
  getExpiryTone,
  parseDate,
  validityProgressPercent,
  type ExpiryTone,
} from "./worker-wallet-utils";
import { WorkerWeatherAlerts } from "./WorkerWeatherAlerts";
import { VerifiedByVeraBadge } from "@/src/components/verification/VerifiedByVeraBadge";
import { toBadgeStatus, type VerifiedByVeraStatus } from "@vera/api-contract";
import { useOptionalFieldMode } from "@/components/field/FieldModeProvider";
import {
  fetchWorkerReadiness,
  type CoreWorkerReadiness,
} from "@/lib/core/vera-core-platform";
import {
  READINESS_STATE_LABELS,
  readinessStateStyles,
  type ReadinessVisualState,
} from "@/lib/readiness-display";
import {
  loadStaffWorkerWallet,
  loadWorkerWallet,
  type Credential,
  type EquipmentAssignment,
  type TrainingRecord,
  type VerificationLogEntry,
  type WorkerVerificationPayload,
  type WorkerWalletData,
} from "./wallet-api";
import { useWorkerWalletAutoSync } from "./useWorkerWalletAutoSync";
import { CredentialCard } from "@/components/vera-core-ui";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function useWindowOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    () => ""
  );
}

const QRCodeSVG = dynamic(() => import("react-qr-code").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-vera-surface">
      <Skeleton className="h-36 w-36 rounded-lg" />
    </div>
  ),
});

type CredentialStatus = "valid" | "expiring" | "expired" | "revoked" | "none";

type StatusMeta = {
  tone: StatusPillTone;
  label: string;
  icon: LucideIcon;
};

function deriveStatus(
  expiresAt: Date | null,
  revokedAt: Date | null = null
): CredentialStatus {
  if (revokedAt != null) return "revoked";
  const tone = getExpiryTone(expiresAt);
  if (tone === "good") return "valid";
  if (tone === "soon") return "expiring";
  if (tone === "bad") return "expired";
  return "none";
}

function statusMeta(status: CredentialStatus): StatusMeta {
  switch (status) {
    case "valid":
      return { tone: "success", label: "Valid", icon: CheckCircle2 };
    case "expiring":
      return { tone: "warning", label: "Expiring soon", icon: AlertTriangle };
    case "expired":
      return { tone: "danger", label: "Expired", icon: XCircle };
    case "revoked":
      return { tone: "danger", label: "Revoked", icon: ShieldAlert };
    default:
      return { tone: "neutral", label: "No expiry", icon: CheckCircle2 };
  }
}

function progressTone(status: CredentialStatus): "teal" | "warning" | "danger" | "slate" {
  switch (status) {
    case "expired":
    case "revoked":
      return "danger";
    case "expiring":
      return "warning";
    case "valid":
      return "teal";
    default:
      return "slate";
  }
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-vera-5 flex flex-col gap-vera-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-vera-1">
        <h2 className="text-xl font-medium leading-tight tracking-tight text-vera-deep">
          {title}
        </h2>
        {description != null && (
          <p className="text-sm font-normal leading-relaxed text-vera-muted">
            {description}
          </p>
        )}
      </div>
      {action != null && <div className="shrink-0">{action}</div>}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Credential / Training card
// ---------------------------------------------------------------------------

type CardKind = "training" | "credential";

interface CredentialCardProps {
  kind: CardKind;
  title: string;
  subtitle?: string;
  issuer: string | null;
  issuedAt: Date | null;
  expiresAt: Date | null;
  revokedAt?: Date | null;
  href?: string;
  hrefLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

function CredentialCard({
  kind,
  title,
  subtitle,
  issuer,
  issuedAt,
  expiresAt,
  revokedAt = null,
  href,
  hrefLabel,
  secondaryHref,
  secondaryLabel,
}: CredentialCardProps) {
  const status = deriveStatus(expiresAt, revokedAt);
  const meta = statusMeta(status);
  const pct = validityProgressPercent(issuedAt, expiresAt);
  const days = daysUntil(expiresAt);
  const KindIcon = kind === "training" ? GraduationCap : ShieldCheck;

  const showProgress = expiresAt != null && status !== "revoked";

  return (
    <Card className="overflow-hidden border-vera-charcoal/10 shadow-md">
      <CardHeader className="gap-vera-4 pb-vera-4">
        <div className="flex flex-wrap items-start justify-between gap-vera-3">
          <div className="flex min-w-0 items-start gap-vera-3">
            <span className="mt-vera-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
              <KindIcon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-vera-1">
              <CardTitle className="text-lg leading-snug tracking-tight">
                {title}
              </CardTitle>
              {subtitle != null && (
                <CardDescription className="text-sm">{subtitle}</CardDescription>
              )}
            </div>
          </div>
          <StatusPill tone={meta.tone} icon={meta.icon}>
            {meta.label}
          </StatusPill>
        </div>

        <dl className="grid grid-cols-1 gap-vera-4 sm:grid-cols-3">
          <div className="min-w-0 space-y-vera-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Issuer
            </dt>
            <dd className="flex items-center gap-vera-2 text-sm font-medium text-vera-charcoal">
              <Building2 className="h-4 w-4 shrink-0 text-vera-muted" aria-hidden />
              <span className="truncate">{issuer ?? "—"}</span>
            </dd>
          </div>
          <div className="min-w-0 space-y-vera-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Issued
            </dt>
            <dd className="text-sm font-medium tabular-nums text-vera-charcoal">
              {formatShortDate(issuedAt)}
            </dd>
          </div>
          <div className="min-w-0 space-y-vera-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Expires
            </dt>
            <dd className="flex items-center gap-vera-2 text-sm font-medium tabular-nums text-vera-charcoal">
              <CalendarClock
                className="h-4 w-4 shrink-0 text-vera-muted"
                aria-hidden
              />
              {expiresAt != null ? (
                <span>
                  {formatShortDate(expiresAt)}
                  {days != null && status !== "expired" && status !== "revoked" && (
                    <span className="ml-vera-2 font-normal text-vera-muted">
                      ({days <= 0 ? "due today" : `${days}d left`})
                    </span>
                  )}
                </span>
              ) : (
                <span>No expiry</span>
              )}
            </dd>
          </div>
        </dl>

        {showProgress && (
          <ProgressBar
            value={pct}
            label="Validity remaining"
            showLabel
            tone={progressTone(status)}
          />
        )}
      </CardHeader>
      {(href != null || secondaryHref != null) && (
        <CardFooter className="flex-wrap">
          {href != null && (
            <Link
              href={href}
              className={buttonStyles({ variant: "teal", size: "sm" })}
            >
              {hrefLabel ?? "Open verification"}
            </Link>
          )}
          {secondaryHref != null && (
            <Link
              href={secondaryHref}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              {secondaryLabel ?? "View company"}
            </Link>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

function complianceMeta(status: string | null | undefined): {
  tone: StatusPillTone;
  label: string;
} {
  const s = (status ?? "ACTIVE").toUpperCase();
  if (s === "APPROVED" || s === "ACTIVE") {
    return { tone: "success", label: s === "APPROVED" ? "Approved" : "Active" };
  }
  if (s === "NEEDS_REVIEW") {
    return { tone: "warning", label: "Needs review" };
  }
  if (s === "REJECTED") {
    return { tone: "danger", label: "Rejected" };
  }
  return { tone: "neutral", label: s.replace(/_/g, " ") };
}

function ProviderTrainingCard({ record }: { record: TrainingRecord }) {
  const issued = parseDate(record.issuedAt ?? record.completedAt ?? null);
  const expires = parseDate(record.expiresAt ?? null);
  const expiryStatus = deriveStatus(expires);
  const expiryMeta = statusMeta(expiryStatus);
  const compliance = complianceMeta(record.complianceStatus);
  const title = record.courseName ?? record.certification?.name ?? "Training";
  const standards =
    record.courseStandards != null && record.courseStandards.length > 0
      ? record.courseStandards.join(" · ")
      : null;

  return (
    <Card className="overflow-hidden border-vera-charcoal/10 shadow-md">
      <CardHeader className="gap-vera-4 pb-vera-4">
        <div className="flex flex-wrap items-start justify-between gap-vera-3">
          <div className="flex min-w-0 items-start gap-vera-3">
            <span className="mt-vera-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-vera-1">
              <CardTitle className="text-lg leading-snug tracking-tight">
                {title}
              </CardTitle>
              {record.certification?.code != null && (
                <CardDescription className="text-sm">
                  Cert {record.certification.code}
                </CardDescription>
              )}
              {standards != null && (
                <CardDescription className="text-sm">{standards}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-vera-2">
            <StatusPill tone={compliance.tone}>{compliance.label}</StatusPill>
            <StatusPill tone={expiryMeta.tone} icon={expiryMeta.icon} subtle>
              {expiryMeta.label}
            </StatusPill>
            {record.verifiedByVeraStatus &&
            record.verifiedByVeraStatus !== "UNVERIFIED" ? (
              <VerifiedByVeraBadge
                status={toBadgeStatus(
                  record.verifiedByVeraStatus as VerifiedByVeraStatus,
                )}
                jurisdictionCoverage={record.jurisdictionCoverage}
                regulatorySummary={record.regulatorySummary}
              />
            ) : (
              <VerifiedByVeraBadge trainingRecordId={record.id} />
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-vera-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 space-y-vera-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Provider
            </dt>
            <dd className="text-sm font-medium text-vera-charcoal">
              {record.providerName ?? "—"}
            </dd>
          </div>
          <div className="min-w-0 space-y-vera-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Instructor
            </dt>
            <dd className="text-sm font-medium text-vera-charcoal">
              {record.instructorName ?? "—"}
            </dd>
          </div>
          <div className="min-w-0 space-y-vera-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Jurisdiction
            </dt>
            <dd className="flex flex-wrap items-center gap-vera-2 text-sm font-medium text-vera-charcoal">
              {record.jurisdictionCode ?? "—"}
              {record.jurisdictionValid != null && (
                <Badge
                  variant={record.jurisdictionValid ? "success" : "danger"}
                  className="text-xs"
                >
                  {record.jurisdictionValid ? "Valid" : "Invalid"}
                </Badge>
              )}
            </dd>
          </div>
          <div className="min-w-0 space-y-vera-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Issued
            </dt>
            <dd className="text-sm font-medium tabular-nums text-vera-charcoal">
              {formatShortDate(issued)}
            </dd>
          </div>
          <div className="min-w-0 space-y-vera-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
              Expires
            </dt>
            <dd className="text-sm font-medium tabular-nums text-vera-charcoal">
              {formatShortDate(expires)}
            </dd>
          </div>
          {record.certificateNumber != null && (
            <div className="min-w-0 space-y-vera-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-vera-muted">
                Certificate #
              </dt>
              <dd className="text-sm font-medium text-vera-charcoal">
                {record.certificateNumber}
              </dd>
            </div>
          )}
        </dl>
      </CardHeader>
      <CardFooter className="flex-wrap gap-vera-2">
        <Link
          href={trainingHref(record)}
          className={buttonStyles({ variant: "teal", size: "sm" })}
        >
          Open training viewer
        </Link>
        {record.certificateQrUrl != null && (
          <a
            href={record.certificateQrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <QrCode className="mr-vera-2 inline h-4 w-4" aria-hidden />
            Certificate QR
          </a>
        )}
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Verification history row
// ---------------------------------------------------------------------------

function HistoryRow({ entry }: { entry: VerificationLogEntry }) {
  const safe = entry.result === "SAFE";
  const date = parseDate(entry.createdAt);
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
        <div className="flex min-w-0 items-center gap-vera-3">
          <span
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-md ring-1 ring-inset",
              safe
                ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                : "bg-red-50 text-red-600 ring-red-100"
            )}
          >
            {safe ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden />
            ) : (
              <XCircle className="h-4 w-4" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base">
              {entry.equipment?.name ?? "Site verification"}
            </CardTitle>
            <CardDescription>
              {date != null ? formatShortDate(date) : "—"}
            </CardDescription>
          </div>
        </div>
        <StatusPill
          tone={safe ? "success" : "danger"}
          icon={safe ? CheckCircle2 : XCircle}
        >
          {entry.result}
        </StatusPill>
      </CardHeader>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Training history table
// ---------------------------------------------------------------------------

function trainingHref(record: TrainingRecord): string {
  return `/verify/training?id=${encodeURIComponent(String(record.id))}`;
}

function credentialHref(c: Credential): string {
  return `/verify/credential?id=${encodeURIComponent(String(c.id))}`;
}

function companyHref(companyId: number | null | undefined): string | undefined {
  if (companyId == null) return undefined;
  return `/companies/${companyId}`;
}

interface TrainingHistoryTableProps {
  records: TrainingRecord[];
  issuer: string | null;
}

function TrainingHistoryTable({ records, issuer }: TrainingHistoryTableProps) {
  const sorted = useMemo(
    () =>
      [...records].sort((a, b) => {
        const at = parseDate(a.issuedAt ?? a.completedAt ?? null)?.getTime() ?? 0;
        const bt = parseDate(b.issuedAt ?? b.completedAt ?? null)?.getTime() ?? 0;
        return bt - at;
      }),
    [records]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Standards</TableHead>
          <TableHead className="text-right">Issued</TableHead>
          <TableHead className="text-right">Expires</TableHead>
          <TableHead>Compliance</TableHead>
          <TableHead className="w-[120px] text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((record) => {
          const issued = parseDate(record.issuedAt ?? record.completedAt ?? null);
          const expires = parseDate(record.expiresAt ?? null);
          const status = deriveStatus(expires);
          const meta = statusMeta(status);
          const compliance = complianceMeta(record.complianceStatus);
          const courseTitle =
            record.courseName ?? record.certification?.name ?? "Training";
          return (
            <TableRow key={record.id}>
              <TableCell>
                <p className="font-medium text-vera-charcoal">{courseTitle}</p>
                {record.instructorName != null && (
                  <p className="text-xs text-vera-muted">
                    Instructor {record.instructorName}
                  </p>
                )}
                {record.certification?.code != null && (
                  <p className="text-xs text-vera-muted">
                    Code {record.certification.code}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-sm text-vera-charcoal">
                {record.providerName ?? issuer ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-vera-muted">
                {record.courseStandards?.length
                  ? record.courseStandards.join(", ")
                  : "—"}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-vera-muted">
                {formatShortDate(issued)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-vera-muted">
                {formatShortDate(expires)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-vera-1">
                  <StatusPill tone={compliance.tone} subtle>
                    {compliance.label}
                  </StatusPill>
                  <StatusPill tone={meta.tone} icon={meta.icon} subtle>
                    {meta.label}
                  </StatusPill>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-vera-1">
                  <Link
                    href={trainingHref(record)}
                    className={buttonStyles({ variant: "outline", size: "sm" })}
                  >
                    View
                  </Link>
                  {record.certificateQrUrl != null && (
                    <a
                      href={record.certificateQrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                    >
                      QR
                    </a>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// expiry warning helpers
// ---------------------------------------------------------------------------

function expiryItems(payload: WorkerVerificationPayload) {
  const items: { id: string; label: string; tone: ExpiryTone }[] = [];

  for (const t of payload.certifications ?? []) {
    const exp = parseDate(t.expiresAt ?? null);
    const tone = getExpiryTone(exp);
    if (tone === "bad" || tone === "soon") {
      items.push({
        id: `t-${t.id}`,
        label: t.courseName ?? t.certification?.name ?? "Training",
        tone,
      });
    }
  }
  for (const c of payload.credentials ?? []) {
    const exp = parseDate(c.expiresAt ?? null);
    const tone = getExpiryTone(exp);
    if (tone === "bad" || tone === "soon") {
      items.push({
        id: `c-${c.id}`,
        label: c.certification?.name ?? c.name ?? "Credential",
        tone,
      });
    }
  }
  return items;
}

function WalletReadinessPanel({
  readiness,
  projects,
}: {
  readiness: CoreWorkerReadiness | null;
  projects: Array<{ projectId: number; projectName: string; projectCode?: string | null }>;
}) {
  if (!readiness) {
    return (
      <EmptyState
        icon={Target}
        title="Readiness loading"
        description="Project readiness scores appear when the worker is linked to active assignments."
      />
    );
  }

  const state = readiness.state ?? "AT_RISK";
  const styles = readinessStateStyles(state);

  return (
    <div className="space-y-vera-6">
      <Card className="border-vera-charcoal/10 shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-vera-4 space-y-0">
          <div>
            <CardTitle className="text-lg">Project readiness</CardTitle>
            <CardDescription>
              Training, competency, and safety knowledge rolled into one score.
            </CardDescription>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-vera-3 py-vera-1 text-xs font-semibold",
              styles.badge,
            )}
          >
            {READINESS_STATE_LABELS[state]}
          </span>
        </CardHeader>
        <CardContent className="space-y-vera-4">
          <div className="flex items-end gap-vera-4">
            <p className="text-4xl font-semibold tabular-nums text-vera-charcoal">
              {readiness.score}%
            </p>
            <p className="pb-1 text-sm text-vera-muted">
              {readiness.isCompliant ? "Meets company requirements" : "Gaps on file"}
            </p>
          </div>
          <ProgressBar value={readiness.score} label="Overall readiness" />
          {readiness.issues.length > 0 ? (
            <ul className="space-y-vera-2 text-sm text-vera-charcoal">
              {readiness.issues.slice(0, 6).map((issue, i) => (
                <li key={`${issue.type}-${i}`} className="flex items-start gap-vera-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  {issue.message}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      {readiness.dimensions && readiness.dimensions.length > 0 ? (
        <section>
          <SectionHeading title="Dimensions" description="Per-area readiness breakdown." />
          <div className="grid gap-vera-4 sm:grid-cols-2">
            {readiness.dimensions.map((dim) => {
              const dimState = dim.state as ReadinessVisualState;
              const dimStyles = readinessStateStyles(dimState);
              return (
                <Card key={dim.key} className="border-vera-charcoal/10 shadow-md">
                  <CardHeader className="pb-vera-2">
                    <div className="flex items-center justify-between gap-vera-2">
                      <CardTitle className="text-base">{dim.label}</CardTitle>
                      <span className={cn("text-xs font-medium", dimStyles.score)}>
                        {READINESS_STATE_LABELS[dimState]}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProgressBar value={dim.score} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section>
          <SectionHeading
            title="Active projects"
            description="Assignments where this worker's readiness is evaluated."
          />
          <div className="space-y-vera-3">
            {projects.map((p) => (
              <Card key={p.projectId} className="border-vera-charcoal/10 shadow-md">
                <CardHeader className="py-vera-4">
                  <CardTitle className="text-base">{p.projectName}</CardTitle>
                  {p.projectCode ? (
                    <CardDescription className="font-mono text-xs">
                      {p.projectCode}
                    </CardDescription>
                  ) : null}
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function WorkerWalletView({
  workerId,
  mode = "staff",
}: {
  workerId: string;
  /** `staff` = signed-in hub at /wallet; `public` kept for legacy embeds. */
  mode?: "staff" | "public";
}) {
  const numericWorkerId = /^\d+$/.test(workerId.trim()) ? Number(workerId) : null;
  const fieldMode = useOptionalFieldMode();
  const walletSync = useWorkerWalletAutoSync(
    mode === "staff" ? numericWorkerId : null,
    fieldMode?.cache ?? null,
  );
  const [readiness, setReadiness] = useState<CoreWorkerReadiness | null>(null);

  useEffect(() => {
    if (mode !== "staff" || numericWorkerId == null) {
      setReadiness(null);
      return;
    }
    void fetchWorkerReadiness(numericWorkerId)
      .then(setReadiness)
      .catch(() => setReadiness(null));
  }, [mode, numericWorkerId]);

  const walletLoader = mode === "staff" ? loadStaffWorkerWallet : loadWorkerWallet;
  const { result } = useAsyncResource<WorkerWalletData>({
    rawId: workerId,
    parser: parseVerifyRefTarget,
    loader: (id) => walletLoader(String(id)),
    loaderRef: walletLoader,
    invalidMessage: "Enter a valid verification token or worker id.",
  });

  const origin = useWindowOrigin();
  const walletQrUrl = useMemo(() => {
    if (!origin || !workerId) return "";
    return `${origin}/verify/${workerId}`;
  }, [origin, workerId]);

  const payload = result.status === "ok" ? result.data.payload : null;
  const history = result.status === "ok" ? result.data.history : null;
  const historyError = result.status === "ok" ? result.data.historyError : null;
  const expiries = useMemo(() => (payload ? expiryItems(payload) : []), [payload]);

  if (result.status === "loading" || result.status === "idle") {
    return (
      <div className="mx-auto max-w-lg space-y-vera-6 md:max-w-2xl">
        <WalletPageSkeleton />
      </div>
    );
  }

  if (result.status === "error") {
    const isInvalid = result.message.startsWith("The worker ID");
    return (
      <div className="mx-auto max-w-lg py-vera-10 md:max-w-2xl">
        <ErrorState
          title={isInvalid ? "Invalid wallet link" : "Wallet unavailable"}
          description={result.message}
        >
          <Link href="/wallet" className={buttonStyles({ variant: "outline", size: "md" })}>
            {isInvalid ? "Enter worker ID" : "Try another ID"}
          </Link>
        </ErrorState>
      </div>
    );
  }

  if (result.status === "not-found" || !payload?.worker) {
    return (
      <div className="mx-auto max-w-lg py-vera-10 md:max-w-2xl">
        <EmptyState
          icon={UserX}
          title="Worker not found"
          description="Check the link or QR code and try again."
        >
          <Link href="/wallet" className={buttonStyles({ variant: "outline", size: "md" })}>
            <Search className="h-4 w-4" aria-hidden />
            Enter worker ID
          </Link>
        </EmptyState>
      </div>
    );
  }

  const tabPanelClass =
    "mt-0 space-y-vera-8 border-0 bg-transparent p-0 shadow-none outline-none";

  const w = payload.worker;
  const company = w.company ?? null;
  const companyLink = companyHref(company?.id ?? null);
  const issuer = company?.name ?? null;
  const equipment: EquipmentAssignment[] = w.equipmentAssignments ?? [];
  const certifications: TrainingRecord[] = payload.certifications ?? [];
  const credentials: Credential[] = payload.credentials ?? [];
  const expired = expiries.filter((i) => i.tone === "bad");
  const soon = expiries.filter((i) => i.tone === "soon");
  const displayName =
    [w.firstName, w.lastName].filter(Boolean).join(" ") || "Worker";

  return (
    <div className="mx-auto max-w-lg md:max-w-3xl">
      <Tabs defaultValue="overview" className="space-y-vera-8">
        <header className="space-y-vera-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2F8F8C]">
            {mode === "staff" ? "VeriWallet · Staff credentials" : "VeriWallet · Worker"}
          </p>
          <div className="flex items-start gap-vera-3 sm:gap-vera-5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[3px] border border-[#2A2E33]/20 bg-[#F4F6F8] shadow-none ring-1 ring-[#1E6FB8]/25 sm:h-24 sm:w-24">
              {w.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={w.photoUrl}
                  alt={`${displayName} photo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-8 w-8 text-vera-muted sm:h-12 sm:w-12" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-vera-2 pt-vera-1">
              <h1 className="text-2xl font-medium tracking-tight text-vera-deep sm:text-3xl md:text-4xl">
                {displayName}
              </h1>
              {company?.name != null && (
                <p className="text-base font-medium text-vera-charcoal">
                  {companyLink ? (
                    <Link
                      href={companyLink}
                      className="inline-flex items-center gap-vera-2 text-vera-charcoal underline-offset-4 hover:text-vera-teal hover:underline"
                    >
                      <Building2 className="h-4 w-4 text-vera-muted" aria-hidden />
                      {company.name}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-vera-2">
                      <Building2 className="h-4 w-4 text-vera-muted" aria-hidden />
                      {company.name}
                    </span>
                  )}
                </p>
              )}
              <Badge variant="outline" className="mt-vera-2 font-mono text-xs">
                ID {w.id}
              </Badge>
              {mode === "staff" ? (
                <Link
                  href={`/verify/${w.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-vera-2 inline-block text-xs font-medium text-[#1E6FB8] hover:underline"
                >
                  Open public verify card →
                </Link>
              ) : null}
            </div>
          </div>

          <TabsList className="w-full max-w-xl flex-wrap justify-start shadow-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            {mode === "staff" ? (
              <TabsTrigger value="readiness">Readiness</TabsTrigger>
            ) : null}
            <TabsTrigger value="gear">Gear</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          {mode === "staff" ? (
            <p className="text-xs text-vera-muted">
              {walletSync.syncing
                ? "Syncing wallet bundle…"
                : walletSync.online
                  ? walletSync.lastSyncedAt
                    ? `Wallet synced ${formatShortDate(parseDate(walletSync.lastSyncedAt))}`
                    : "Wallet online"
                  : "Offline — showing cached credentials"}
              {walletSync.lastError ? ` · ${walletSync.lastError}` : null}
            </p>
          ) : null}
        </header>

        {/* ----- Overview ------------------------------------------------- */}
        <TabsContent value="overview" className={tabPanelClass}>
          <section>
            <SectionHeading
              title="Public verification QR"
              description="Print or share this QR — it opens the anonymous /verify link (no login)."
            />
            <Card className="rounded-[6px] border border-[#2A2E33]/14 shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
                <div className="flex items-center gap-vera-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] border border-[#2A2E33]/12 bg-[#F4F6F8] text-[#1E6FB8]">
                    <QrCode className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <CardTitle className="text-lg">Scan to verify</CardTitle>
                    <CardDescription>
                      Identity & training are pulled live from VERA.
                    </CardDescription>
                  </div>
                </div>
                <StatusPill tone="success" icon={ShieldCheck} subtle>
                  Live
                </StatusPill>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-vera-5 pt-vera-2">
                <div className="rounded-2xl bg-vera-white p-vera-5 shadow-inner ring-1 ring-vera-charcoal/10">
                  {walletQrUrl ? (
                    <QRCodeSVG
                      value={walletQrUrl}
                      size={180}
                      level="M"
                      fgColor="#0A1A2F"
                    />
                  ) : (
                    <Skeleton className="h-44 w-44 rounded-xl" />
                  )}
                </div>
                {walletQrUrl !== "" && (
                  <p className="break-all text-center text-xs leading-relaxed text-vera-muted">
                    {walletQrUrl}
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <WorkerWeatherAlerts workerId={workerId} />

          {payload.compliance != null && (
            <section>
              <SectionHeading
                title="Compliance snapshot"
                description="What your employer expects on file right now."
              />
              <Card className="border-vera-charcoal/10 shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
                  <div className="flex items-start gap-vera-3">
                    <span
                      className={cn(
                        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md ring-1 ring-inset",
                        payload.compliance.isCompliant
                          ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                          : "bg-amber-50 text-amber-700 ring-amber-100"
                      )}
                    >
                      {payload.compliance.isCompliant ? (
                        <CheckCircle2 className="h-5 w-5" aria-hidden />
                      ) : (
                        <AlertTriangle className="h-5 w-5" aria-hidden />
                      )}
                    </span>
                    <div>
                      <CardTitle className="text-lg">
                        {payload.compliance.isCompliant
                          ? "Requirements satisfied"
                          : "Action needed"}
                      </CardTitle>
                      <CardDescription>
                        {payload.compliance.isCompliant
                          ? "Recorded training matches current company requirements."
                          : "Some required courses or documents need attention."}
                      </CardDescription>
                    </div>
                  </div>
                  <StatusPill
                    tone={payload.compliance.isCompliant ? "success" : "warning"}
                    icon={
                      payload.compliance.isCompliant ? CheckCircle2 : AlertTriangle
                    }
                  >
                    {payload.compliance.isCompliant ? "Compliant" : "Attention"}
                  </StatusPill>
                </CardHeader>
                {(payload.compliance.issues?.length ?? 0) > 0 && (
                  <CardContent className="pt-0">
                    <ul className="space-y-vera-2">
                      {payload.compliance.issues!.map((issue, idx) => (
                        <li
                          key={`${issue.courseName}-${issue.type}-${idx}`}
                          className="flex flex-wrap items-center justify-between gap-vera-2 rounded-lg border border-vera-charcoal/10 bg-vera-surface/40 px-vera-4 py-vera-3 text-sm"
                        >
                          <span className="font-medium text-vera-charcoal">
                            {issue.courseName}
                          </span>
                          <StatusPill
                            tone={issue.type === "EXPIRED" ? "danger" : "warning"}
                            icon={
                              issue.type === "EXPIRED" ? XCircle : AlertTriangle
                            }
                            subtle
                          >
                            {issue.type.replace(/_/g, " ")}
                          </StatusPill>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            </section>
          )}

          {(expired.length > 0 || soon.length > 0) && (
            <section>
              <SectionHeading
                title="Expiry warnings"
                description="Renewals and deadlines worth a second look."
              />
              <div className="grid gap-vera-4 md:grid-cols-2">
                {expired.length > 0 && (
                  <Card className="border-red-200 shadow-md">
                    <CardHeader className="flex flex-row items-start gap-vera-3 space-y-0">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-md ring-1 ring-inset ring-red-100">
                        <XCircle className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0 space-y-vera-2">
                        <CardTitle className="text-base">Expired items</CardTitle>
                        <CardDescription>
                          Renew or replace before working unsupervised.
                        </CardDescription>
                        <div className="flex flex-wrap gap-vera-2">
                          {expired.map((e) => (
                            <StatusPill key={e.id} tone="danger" subtle icon={XCircle}>
                              {e.label}
                            </StatusPill>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )}
                {soon.length > 0 && (
                  <Card className="border-amber-200 shadow-md">
                    <CardHeader className="flex flex-row items-start gap-vera-3 space-y-0">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 shadow-md ring-1 ring-inset ring-amber-100">
                        <AlertTriangle className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0 space-y-vera-2">
                        <CardTitle className="text-base">
                          Expiring within 30 days
                        </CardTitle>
                        <CardDescription>Plan renewal soon.</CardDescription>
                        <div className="flex flex-wrap gap-vera-2">
                          {soon.map((e) => (
                            <StatusPill
                              key={e.id}
                              tone="warning"
                              subtle
                              icon={AlertTriangle}
                            >
                              {e.label}
                            </StatusPill>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </section>
          )}
        </TabsContent>

        {/* ----- Training ------------------------------------------------- */}
        <TabsContent value="training" className={tabPanelClass}>
          {certifications.length > 0 ? (
            <section>
              <SectionHeading
                title="Wallet cards"
                description="Apple Wallet–style credentials with expiry countdowns."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {certifications.slice(0, 4).map((t) => (
                  <CredentialCard
                    key={`card-${t.id}`}
                    credential={{
                      id: t.id,
                      title: t.certification?.name ?? t.courseName ?? "Training",
                      issuer: t.providerName ?? t.companyName ?? issuer,
                      expiresAt: t.expiresAt,
                      issuedAt: t.issuedAt ?? t.completedAt,
                      verifiedStatus: t.verifiedByVeraStatus,
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <SectionHeading
              title="Certifications"
              description="Active training records with validity windows."
            />
            {certifications.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No certifications on file"
                description="Completed trainings will appear here with expiry dates and status."
              />
            ) : (
              <div className="space-y-vera-5">
                {certifications.map((t) => (
                  <ProviderTrainingCard key={t.id} record={t} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading
              title="Credentials"
              description="Licenses, IDs, and digital passes tied to you."
            />
            {credentials.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="No credentials"
                description="Digital credentials show up when they are issued to you."
              />
            ) : (
              <div className="space-y-vera-5">
                {credentials.map((c) => (
                  <CredentialCard
                    key={c.id}
                    kind="credential"
                    title={c.certification?.name ?? c.name ?? "Credential"}
                    subtitle={c.value != null ? `Ref · ${c.value}` : undefined}
                    issuer={issuer}
                    issuedAt={parseDate(c.issuedAt ?? null)}
                    expiresAt={parseDate(c.expiresAt ?? null)}
                    href={credentialHref(c)}
                    hrefLabel="Open verification"
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading
              title="Training history"
              description="Every training record VERA has on file for this worker, newest first."
            />
            {certifications.length === 0 ? (
              <EmptyState
                icon={History}
                title="No training history yet"
                description="As trainings are recorded, a chronological audit trail builds up here."
              />
            ) : (
              <TrainingHistoryTable records={certifications} issuer={issuer} />
            )}
          </section>
        </TabsContent>

        {/* ----- Readiness ------------------------------------------------ */}
        {mode === "staff" ? (
          <TabsContent value="readiness" className={tabPanelClass}>
            <section>
              <SectionHeading
                title="Site readiness"
                description="Whether this worker meets project and company requirements right now."
              />
              <WalletReadinessPanel
                readiness={readiness}
                projects={(walletSync.bundle?.projects ?? []).map((p) => ({
                  projectId: p.projectId,
                  projectName: p.projectName,
                  projectCode: p.projectCode,
                }))}
              />
            </section>
          </TabsContent>
        ) : null}

        {/* ----- Gear ----------------------------------------------------- */}
        <TabsContent value="gear" className={tabPanelClass}>
          <section>
            <SectionHeading
              title="Gear on site"
              description="Active equipment you're checked out on."
            />
            {equipment.length === 0 ? (
              <EmptyState
                icon={HardHat}
                title="No active assignments"
                description="Checkouts from the yard will list here."
              />
            ) : (
              <div className="space-y-vera-4">
                {equipment.map((a) => {
                  const st = a.equipment?.safetyStatus ?? "";
                  const ok = st === "OK";
                  const inspect = st === "NEEDS_INSPECTION";
                  const tone: StatusPillTone = ok
                    ? "success"
                    : inspect
                      ? "warning"
                      : "danger";
                  const label = ok ? "OK" : inspect ? "Inspect" : "Unsafe";
                  const icon = ok
                    ? CheckCircle2
                    : inspect
                      ? AlertTriangle
                      : ShieldAlert;
                  return (
                    <Card key={a.id} className="border-vera-charcoal/10 shadow-md">
                      <CardHeader className="flex flex-row items-center justify-between gap-vera-4 space-y-0 pb-vera-4">
                        <div className="flex min-w-0 items-center gap-vera-3">
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
                            <HardHat className="h-5 w-5" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <CardTitle className="text-base">
                              {a.equipment?.name ?? "Equipment"}
                            </CardTitle>
                            {a.assignedAt != null && (
                              <CardDescription>
                                Assigned {formatShortDate(parseDate(a.assignedAt))}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <StatusPill tone={tone} icon={icon}>
                          {label}
                        </StatusPill>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </TabsContent>

        {/* ----- History -------------------------------------------------- */}
        <TabsContent value="history" className={tabPanelClass}>
          <section>
            <SectionHeading
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
              <div className="space-y-vera-3">
                {history.map((entry) => (
                  <HistoryRow key={entry.id} entry={entry} />
                ))}
                <p className="flex items-center gap-vera-2 pt-vera-2 text-xs text-vera-muted">
                  <History className="h-4 w-4" aria-hidden />
                  Showing the most recent {history.length} record
                  {history.length === 1 ? "" : "s"}.
                </p>
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>

      <footer className="mt-vera-12 border-t border-vera-charcoal/10 pt-vera-8 text-center text-xs text-vera-muted">
        VERA · Worker wallet · For official verification use site procedures.
      </footer>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileQuestion,
  HardHat,
  MapPin,
  ScanLine,
  Shield,
  User,
} from "lucide-react";
import { apiFetchJson } from "@/lib/api-fetch";
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
  toneLabel,
  validityProgressPercent,
  type ExpiryTone,
} from "@/components/wallet/worker-wallet-utils";

function statusBadgeVariant(
  status: string
): "success" | "warning" | "danger" | "outline" {
  const s = status.toUpperCase();
  if (s.includes("EXPIRED") || s.includes("INVALID")) return "danger";
  if (s.includes("SOON") || s.includes("WARNING")) return "warning";
  if (s.includes("VALID") || s.includes("OK") || s.includes("ALLOWED")) return "success";
  return "outline";
}

function ProgressBar({ value, tone }: { value: number; tone: ExpiryTone }) {
  const barTint =
    tone === "bad"
      ? "bg-red-500"
      : tone === "soon"
        ? "bg-amber-500"
        : tone === "good"
          ? "bg-vera-teal"
          : "bg-vera-muted";

  return (
    <div className="mt-vera-3 space-y-vera-2">
      <div className="flex justify-between text-xs font-medium text-vera-muted">
        <span>Time left in window</span>
        <span className="tabular-nums">{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-vera-charcoal/10">
        <div
          className={cn("h-full rounded-full transition-all", barTint)}
          style={{ width: `${Math.round(value)}%` }}
        />
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardHeader className="space-y-vera-2">
        <div className="flex items-center gap-vera-3">
          {icon != null && <span className="text-vera-teal">{icon}</span>}
          <div>
            <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
            {description != null && (
              <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-vera-4 pt-0">{children}</CardContent>
    </Card>
  );
}

function CertificationRow({ record }: { record: Record<string, unknown> }) {
  const exp = parseDate((record.expiresAt as string | undefined) ?? null);
  const issued = parseDate((record.issuedAt as string | undefined) ?? null);
  const tone = getExpiryTone(exp);
  const pct = validityProgressPercent(issued, exp);
  const label =
    (record.name as string | undefined) ??
    (record.courseName as string | undefined) ??
    (record.certification as { name?: string } | undefined)?.name ??
    "Certification";

  const border =
    tone === "bad"
      ? "border-red-200/80 bg-red-50/40"
      : tone === "soon"
        ? "border-amber-200/80 bg-amber-50/40"
        : "border-emerald-200/60 bg-emerald-50/30";

  return (
    <div
      className={cn(
        "rounded-xl border p-vera-5 shadow-sm transition-colors",
        border
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-vera-3">
        <div className="min-w-0 space-y-vera-1">
          <p className="text-base font-semibold tracking-tight text-vera-charcoal">{label}</p>
          {exp != null && (
            <p className="flex items-center gap-vera-2 text-sm text-vera-muted">
              <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
              Expires {formatShortDate(exp)}
              {daysUntil(exp) != null && tone !== "bad" && (
                <span className="text-vera-muted">
                  · {daysUntil(exp)! <= 0 ? "Due today" : `${daysUntil(exp)}d left`}
                </span>
              )}
            </p>
          )}
        </div>
        <Badge variant={statusBadgeVariant(tone === "bad" ? "EXPIRED" : tone === "soon" ? "EXPIRING SOON" : "VALID")}>
          {toneLabel(tone)}
        </Badge>
      </div>
      {exp != null && <ProgressBar value={pct} tone={tone} />}
    </div>
  );
}

function TrainingMetaRow({ record }: { record: Record<string, unknown> }) {
  const cert = record.certification as { name?: string; code?: string } | undefined;
  const provider = record.provider as { name?: string } | undefined;
  const certNum = record.certificateNumber as string | undefined;

  return (
    <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4 shadow-sm">
      <p className="font-semibold text-vera-charcoal">
        {[record.courseName, cert?.name].find((v) => typeof v === "string") ?? "Training record"}
      </p>
      <dl className="mt-vera-3 grid gap-vera-2 text-sm text-vera-muted">
        {record.issuedAt != null && (
          <div className="flex justify-between gap-vera-4">
            <dt className="font-medium text-vera-charcoal/80">Issued</dt>
            <dd className="tabular-nums">{formatShortDate(parseDate(record.issuedAt as string))}</dd>
          </div>
        )}
        {record.expiresAt != null && (
          <div className="flex justify-between gap-vera-4">
            <dt className="font-medium text-vera-charcoal/80">Expires</dt>
            <dd className="tabular-nums">{formatShortDate(parseDate(record.expiresAt as string))}</dd>
          </div>
        )}
        {cert?.code != null && (
          <div className="flex justify-between gap-vera-4">
            <dt className="font-medium text-vera-charcoal/80">Course code</dt>
            <dd>{cert.code}</dd>
          </div>
        )}
        {certNum != null && certNum !== "" && (
          <div className="flex justify-between gap-vera-4">
            <dt className="font-medium text-vera-charcoal/80">Certificate #</dt>
            <dd className="break-all font-mono text-xs">{certNum}</dd>
          </div>
        )}
        {provider?.name != null && (
          <div className="flex justify-between gap-vera-4">
            <dt className="font-medium text-vera-charcoal/80">Provider</dt>
            <dd>{provider.name}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function CredentialCard({ c }: { c: Record<string, unknown> }) {
  const exp = parseDate((c.expiresAt as string | undefined) ?? null);
  const issued = parseDate((c.issuedAt as string | undefined) ?? null);
  const tone = getExpiryTone(exp);
  const pct = validityProgressPercent(issued, exp);
  const cert = c.certification as { name?: string } | undefined;
  const title = (cert?.name as string | undefined) ?? (c.name as string) ?? "Credential";

  return (
    <div className="rounded-xl border border-vera-charcoal/10 bg-vera-white p-vera-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-vera-3">
        <div className="flex min-w-0 items-start gap-vera-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-vera-deep" aria-hidden />
          <div>
            <p className="font-semibold text-vera-charcoal">{title}</p>
            {c.value != null && String(c.value) !== "" && (
              <p className="mt-vera-1 font-mono text-xs text-vera-muted">Ref {String(c.value)}</p>
            )}
          </div>
        </div>
        <Badge variant={statusBadgeVariant(tone === "bad" ? "EXPIRED" : tone === "soon" ? "EXPIRING SOON" : "VALID")}>
          {toneLabel(tone)}
        </Badge>
      </div>
      {exp != null && (
        <p className="mt-vera-2 text-sm text-vera-muted">Valid through {formatShortDate(exp)}</p>
      )}
      {exp != null && <ProgressBar value={pct} tone={tone} />}
    </div>
  );
}

export default function VerifyPage({
  title,
  endpoint,
}: {
  title: string;
  endpoint: string;
}) {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams?.get("id") ?? null;

  const [id, setId] = useState(idFromUrl || "");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const verify = useCallback(
    async (targetId: string) => {
      setError("");
      setResult(null);
      setLoading(true);

      try {
        const data = await apiFetchJson<Record<string, unknown>>(
          `/verify/${encodeURIComponent(endpoint)}/${encodeURIComponent(targetId)}`,
          { requireAuth: false }
        );
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Verification failed");
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    if (!idFromUrl) return;
    const id = idFromUrl;
    queueMicrotask(() => {
      void verify(id);
    });
  }, [idFromUrl, verify]);

  const countdown = useCallback((dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)}d ago`;
    if (days === 0) return "today";
    return `${days}d left`;
  }, []);

  const overallStatus = useMemo(() => {
    if (!result) return "VALID";

    if (result.status === "EXPIRED") return "EXPIRED";

    let expired = false;
    let expiringSoon = false;

    const certs = result.certifications as unknown[] | undefined;
    if (certs) {
      for (const c of certs) {
        const rec = c as { expiresAt?: string };
        if (!rec.expiresAt) continue;
        const now = new Date();
        const exp = new Date(rec.expiresAt);
        if (exp < now) expired = true;
        else if ((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 30) expiringSoon = true;
      }
    }

    const equipment = result.equipment as unknown;
    const eqList = Array.isArray(equipment) ? equipment : equipment != null ? [equipment] : [];
    for (const e of eqList) {
      const row = e as { isSafe?: boolean };
      if (row.isSafe === false) expired = true;
    }

    const trainingRecords = result.trainingRecords as unknown[] | undefined;
    if (trainingRecords) {
      for (const t of trainingRecords) {
        const tr = t as { expiresAt?: string };
        const now = new Date();
        if (tr.expiresAt && new Date(tr.expiresAt) < now) expired = true;
      }
    }

    const siteAccess = result.siteAccess as { isAllowed?: boolean } | undefined;
    if (siteAccess && !siteAccess.isAllowed) expired = true;

    if (expired) return "EXPIRED";
    if (expiringSoon) return "EXPIRING SOON";
    return "VALID";
  }, [result]);

  const statusFrameClass =
    overallStatus === "VALID"
      ? "border-emerald-300/80 ring-1 ring-emerald-200/60"
      : overallStatus === "EXPIRED"
        ? "border-red-300/80 ring-1 ring-red-200/60"
        : "border-amber-300/80 ring-1 ring-amber-200/60";

  const breadcrumbs = useMemo(
    () => [
      { label: "VERA", href: "/" },
      { label: "Verify", href: "/qr" },
      { label: title },
    ],
    [title]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-vera-surface/80 via-vera-white to-vera-white pb-vera-16 print:bg-white">
      <div className="mx-auto max-w-2xl px-vera-5 py-vera-10 md:px-vera-8">
        <div className="mb-vera-8 space-y-vera-4">
          <Breadcrumbs className="text-vera-muted" items={breadcrumbs} />
          <div className="space-y-vera-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-vera-teal">Field verification</p>
            <h1 className="text-2xl font-bold tracking-tight text-vera-deep sm:text-3xl md:text-4xl">
              {title}
            </h1>
            <p className="text-base leading-relaxed text-vera-muted md:text-lg">
              Scan or enter an ID from a VERA QR, then review credentials, training, and safety status in one place.
            </p>
          </div>
        </div>

        {/* Scan */}
        <Card className="mb-vera-8 border-vera-charcoal/10 shadow-md print:hidden">
          <CardHeader>
            <div className="flex items-center gap-vera-3">
              <ScanLine className="h-6 w-6 text-vera-teal" aria-hidden />
              <div>
                <CardTitle className="text-xl tracking-tight">Scan or enter ID</CardTitle>
                <CardDescription>
                  Paste the number from a printed card, or use the camera flow on the QR page.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-vera-4">
            {idFromUrl != null ? (
              <div className="flex flex-wrap items-center gap-vera-3 rounded-xl border border-vera-charcoal/10 bg-vera-surface/60 px-vera-4 py-vera-3 text-sm">
                <span className="font-semibold text-vera-charcoal">ID from link</span>
                <code className="rounded-md bg-vera-white px-vera-2 py-vera-1 font-mono text-sm text-vera-deep shadow-sm">
                  {idFromUrl}
                </code>
                {loading && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-vera-teal">
                    Checking…
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-vera-4 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-vera-2">
                  <Label htmlFor="verify-id">Record ID</Label>
                  <Input
                    id="verify-id"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 42"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void verify(id.trim());
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="teal"
                  className="shrink-0 sm:mb-0.5"
                  disabled={loading || id.trim() === ""}
                  onClick={() => void verify(id.trim())}
                >
                  {loading ? "Verifying…" : "Verify"}
                </Button>
              </div>
            )}
            <Link
              href="/qr"
              className={buttonStyles({
                variant: "ghost",
                size: "sm",
                className: "w-fit text-vera-muted print:hidden",
              })}
            >
              Open QR scanner
            </Link>
          </CardContent>
        </Card>

        {error !== "" && (
          <div className="mb-vera-8">
            <ErrorState title="Verification failed" description={error} />
          </div>
        )}

        {loading && (
          <div className="mb-vera-8">
            <VerificationFlowSkeleton />
          </div>
        )}

        {result != null && !loading && (
          <div className={cn("space-y-vera-8 rounded-2xl border bg-vera-white p-vera-6 shadow-md md:p-vera-8", statusFrameClass)}>
            <div className="flex flex-wrap items-center justify-between gap-vera-4 border-b border-vera-charcoal/10 pb-vera-5">
              <div className="space-y-vera-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Overall</p>
                <p className="text-lg font-semibold text-vera-charcoal">Verification result</p>
              </div>
              <Badge variant={statusBadgeVariant(overallStatus)} className="text-xs uppercase tracking-wide">
                {overallStatus}
              </Badge>
            </div>

            {/* Identity */}
            {(result.firstName != null || result.lastName != null) && (
              <Card className="border-vera-charcoal/10 shadow-sm">
                <CardContent className="flex flex-col gap-vera-5 p-vera-6 sm:flex-row sm:items-center">
                  {typeof result.photoUrl === "string" && result.photoUrl !== "" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.photoUrl}
                      alt=""
                      className="h-24 w-24 shrink-0 rounded-2xl border border-vera-charcoal/10 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-vera-charcoal/10 bg-vera-surface">
                      <User className="h-10 w-10 text-vera-muted" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-vera-2">
                    <h2 className="text-2xl font-bold tracking-tight text-vera-deep">
                      {[result.firstName, result.lastName].filter(Boolean).join(" ")}
                    </h2>
                    {result.company != null && typeof result.company === "object" && (
                      <div className="flex flex-wrap items-center gap-vera-3">
                        {typeof (result.company as { logoUrl?: string }).logoUrl === "string" &&
                          (result.company as { logoUrl?: string }).logoUrl !== "" && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={(result.company as { logoUrl: string }).logoUrl}
                              alt=""
                              className="h-10 w-10 rounded-lg border border-vera-charcoal/10 object-contain"
                            />
                          )}
                        <span className="text-base font-medium text-vera-charcoal">
                          {(result.company as { name?: string }).name}
                        </span>
                      </div>
                    )}
                    {typeof result.id === "number" && (
                      <Badge variant="outline" className="w-fit font-mono text-xs">
                        Record #{result.id}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Credential-only viewer (endpoint credential or inline type) */}
            {result.type === "credential" && (
              <SectionCard
                icon={<ClipboardCheck className="h-6 w-6" />}
                title="Credential"
                description="Document status for this pass or license."
              >
                <div className="grid gap-vera-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Name</p>
                    <p className="mt-vera-1 text-lg font-semibold text-vera-charcoal">{String(result.name ?? "—")}</p>
                  </div>
                  <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Status</p>
                    <div className="mt-vera-2">
                      <Badge variant={statusBadgeVariant(String(result.status ?? "VALID"))}>
                        {String(result.status ?? "—")}
                      </Badge>
                    </div>
                  </div>
                  {result.issuedOn != null && (
                    <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Issued</p>
                      <p className="mt-vera-1 font-medium text-vera-charcoal">
                        {formatShortDate(parseDate(result.issuedOn as string))}
                      </p>
                    </div>
                  )}
                  {result.expiresOn != null && (
                    <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-vera-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Expires</p>
                      <p className="mt-vera-1 font-medium text-vera-charcoal">
                        {formatShortDate(parseDate(result.expiresOn as string))}
                      </p>
                    </div>
                  )}
                </div>
                {result.certification != null && typeof result.certification === "object" && (
                  <p className="text-sm text-vera-muted">
                    Linked course:{" "}
                    <span className="font-semibold text-vera-charcoal">
                      {(result.certification as { name?: string }).name ?? "—"}
                    </span>
                  </p>
                )}
                {typeof result.workerId === "number" && (
                  <div className="mt-vera-4 rounded-xl border border-vera-teal/25 bg-vera-surface/60 p-vera-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-vera-deep">
                      Continue verification
                    </p>
                    <div className="mt-vera-3 flex flex-wrap gap-vera-3 text-sm">
                      <Link
                        href={`/verify/${result.workerId}`}
                        className={buttonStyles({ variant: "outline", size: "sm" })}
                      >
                        Worker wallet
                      </Link>
                      {typeof result.companyId === "number" && (
                        <Link
                          href={`/companies/${result.companyId}`}
                          className={buttonStyles({ variant: "outline", size: "sm" })}
                        >
                          Company
                        </Link>
                      )}
                      {Array.isArray(result.relatedTrainingRecords) &&
                        (result.relatedTrainingRecords as { id: number }[]).map((tr) => (
                          <Link
                            key={tr.id}
                            href={`/verify/core/training/${tr.id}`}
                            className={buttonStyles({ variant: "teal", size: "sm" })}
                          >
                            Training #{tr.id}
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Company card */}
            {result.type === "company" && (
              <SectionCard
                icon={<Building2 className="h-6 w-6" />}
                title={String(result.name ?? "Company")}
                description="Organization snapshot from the public directory."
              >
                <div className="grid gap-vera-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-vera-charcoal/10 p-vera-4">
                    <p className="text-xs font-semibold uppercase text-vera-muted">Workers</p>
                    <p className="mt-vera-1 text-2xl font-bold tabular-nums text-vera-deep">
                      {String(result.workerCount ?? "—")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-vera-charcoal/10 p-vera-4">
                    <p className="text-xs font-semibold uppercase text-vera-muted">Equipment</p>
                    <p className="mt-vera-1 text-2xl font-bold tabular-nums text-vera-deep">
                      {String(result.equipmentCount ?? "—")}
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Equipment detail */}
            {result.type === "equipment" && (
              <SectionCard
                icon={<HardHat className="h-6 w-6" />}
                title={String(result.name ?? "Equipment")}
                description="Safety posture for this asset."
              >
                <div className="flex flex-wrap items-center gap-vera-3">
                  {typeof result.safetyStatus === "string" && (
                    <Badge
                      variant={
                        result.safetyStatus === "OK"
                          ? "success"
                          : result.safetyStatus === "NEEDS_INSPECTION"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {result.safetyStatus}
                    </Badge>
                  )}
                  {result.serialNumber != null && String(result.serialNumber) !== "" && (
                    <span className="text-sm text-vera-muted">
                      Serial <span className="font-mono text-vera-charcoal">{String(result.serialNumber)}</span>
                    </span>
                  )}
                </div>
                {Array.isArray(result.assignedWorkers) && result.assignedWorkers.length > 0 && (
                  <div>
                    <p className="mb-vera-3 text-sm font-semibold text-vera-charcoal">Assigned workers</p>
                    <ul className="space-y-vera-2">
                      {(result.assignedWorkers as { id: number; firstName?: string; lastName?: string }[]).map(
                        (w) => (
                          <li
                            key={w.id}
                            className="flex items-center justify-between rounded-lg border border-vera-charcoal/10 bg-vera-surface/40 px-vera-4 py-vera-3 text-sm"
                          >
                            <span className="font-medium text-vera-charcoal">
                              {[w.firstName, w.lastName].filter(Boolean).join(" ")}
                            </span>
                            <Badge variant="outline">#{w.id}</Badge>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Site access */}
            {result.siteAccess != null && typeof result.siteAccess === "object" && (
              <SectionCard
                icon={<MapPin className="h-6 w-6" />}
                title="Site access"
                description={(result.siteAccess as { siteName?: string }).siteName ?? "Gate decision"}
              >
                <div className="flex flex-wrap items-center gap-vera-3">
                  <Badge
                    variant={(result.siteAccess as { isAllowed?: boolean }).isAllowed ? "success" : "danger"}
                  >
                    {(result.siteAccess as { isAllowed?: boolean }).isAllowed ? "Allowed" : "Not allowed"}
                  </Badge>
                  {(result.siteAccess as { complianceOk?: boolean }).complianceOk === false && (
                    <Badge variant="warning">Compliance gap</Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-vera-muted">
                  Status: {(result.siteAccess as { accessStatus?: string }).accessStatus ?? "—"}
                  {(result.siteAccess as { approved?: boolean }).approved === false && " · Not approved"}
                </p>
              </SectionCard>
            )}

            {/* Cert definition */}
            {result.type === "cert" && (
              <SectionCard
                icon={<Shield className="h-6 w-6" />}
                title={String(result.name ?? "Certification")}
                description={String(result.description ?? "Course definition in the catalog.")}
              >
                <div className="grid gap-vera-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-vera-charcoal/10 p-vera-4">
                    <p className="text-xs font-semibold uppercase text-vera-muted">Training records</p>
                    <p className="mt-vera-1 text-2xl font-bold tabular-nums text-vera-deep">
                      {String(result.trainingRecordCount ?? "—")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-vera-charcoal/10 p-vera-4">
                    <p className="text-xs font-semibold uppercase text-vera-muted">Credentials</p>
                    <p className="mt-vera-1 text-2xl font-bold tabular-nums text-vera-deep">
                      {String(result.credentialCount ?? "—")}
                    </p>
                  </div>
                </div>
                {result.code != null && (
                  <p className="text-sm text-vera-muted">
                    Code <span className="font-mono font-semibold text-vera-charcoal">{String(result.code)}</span>
                  </p>
                )}
              </SectionCard>
            )}

            {/* Compliance (worker) */}
            {result.compliance != null && typeof result.compliance === "object" && (
              <Card
                className={cn(
                  "border shadow-sm",
                  (result.compliance as { isCompliant?: boolean }).isCompliant
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-amber-200 bg-amber-50/60"
                )}
              >
                <CardHeader className="flex flex-row items-start gap-vera-4 space-y-0">
                  {(result.compliance as { isCompliant?: boolean }).isCompliant ? (
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <AlertTriangle className="h-8 w-8 shrink-0 text-amber-600" aria-hidden />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {(result.compliance as { isCompliant?: boolean }).isCompliant
                        ? "Compliance OK"
                        : "Compliance gaps"}
                    </CardTitle>
                    <CardDescription>Company training rules applied to this worker.</CardDescription>
                  </div>
                </CardHeader>
                {Array.isArray((result.compliance as { issues?: unknown[] }).issues) &&
                  (result.compliance as { issues: unknown[] }).issues.length > 0 && (
                    <CardContent className="border-t border-vera-charcoal/10 pt-0">
                      <ul className="space-y-vera-2 pt-vera-4">
                        {(result.compliance as { issues: { type: string; courseName: string }[] }).issues.map(
                          (issue, idx) => (
                            <li
                              key={`${issue.courseName}-${idx}`}
                              className="flex flex-wrap items-center justify-between gap-vera-2 rounded-lg bg-vera-white/80 px-vera-3 py-vera-2 text-sm"
                            >
                              <span className="font-medium text-vera-charcoal">{issue.courseName}</span>
                              <Badge variant={issue.type === "EXPIRED" ? "danger" : "warning"}>
                                {issue.type.replace(/_/g, " ")}
                              </Badge>
                            </li>
                          )
                        )}
                      </ul>
                    </CardContent>
                  )}
              </Card>
            )}

            {/* Certifications */}
            {Array.isArray(result.certifications) && result.certifications.length > 0 && (
              <SectionCard
                icon={<Shield className="h-6 w-6" />}
                title="Certifications"
                description="Expiry relative to today — renew before you lose site access."
              >
                <div className="space-y-vera-4">
                  {(result.certifications as Record<string, unknown>[]).map((c, idx) => (
                    <CertificationRow key={(c.id as number | undefined) ?? idx} record={c} />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Credentials list (worker bundle) */}
            {Array.isArray(result.credentials) && result.credentials.length > 0 && (
              <SectionCard
                icon={<ClipboardCheck className="h-6 w-6" />}
                title="Credentials"
                description="Passes and IDs on file for this worker."
              >
                <div className="space-y-vera-4">
                  {(result.credentials as Record<string, unknown>[]).map((c, idx) => (
                    <CredentialCard key={(c.id as number | undefined) ?? idx} c={c} />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Training metadata */}
            {Array.isArray(result.trainingRecords) && result.trainingRecords.length > 0 && (
              <SectionCard
                icon={<CalendarClock className="h-6 w-6" />}
                title="Training records"
                description="Issued dates, expirations, providers, and certificate references."
              >
                <div className="space-y-vera-4">
                  {(result.trainingRecords as Record<string, unknown>[]).map((t) => {
                    const merged = {
                      ...t,
                      provider:
                        (t.provider as { name?: string } | undefined) ??
                        (result.provider as { name?: string } | undefined),
                    };
                    return (
                      <div key={t.id as number}>
                        <TrainingMetaRow record={merged} />
                        {t.expiresAt != null && typeof t.expiresAt === "string" && (
                          <p className="mt-vera-2 text-xs text-vera-muted">
                            Window: {countdown(t.expiresAt)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Equipment list (worker-style array) */}
            {Array.isArray(result.equipment) && result.equipment.length > 0 && result.type !== "equipment" && (
              <SectionCard
                icon={<HardHat className="h-6 w-6" />}
                title="Equipment"
                description="Assets tied to this verification context."
              >
                <ul className="space-y-vera-3">
                  {(result.equipment as { id: number; name?: string; isSafe?: boolean; safetyStatus?: string }[]).map(
                    (e) => (
                      <li
                        key={e.id}
                        className="flex flex-wrap items-center justify-between gap-vera-3 rounded-xl border border-vera-charcoal/10 bg-vera-surface/40 px-vera-4 py-vera-3"
                      >
                        <span className="font-semibold text-vera-charcoal">{e.name ?? "Equipment"}</span>
                        <div className="flex items-center gap-vera-2">
                          {e.safetyStatus != null && (
                            <Badge
                              variant={
                                e.safetyStatus === "OK"
                                  ? "success"
                                  : e.safetyStatus === "NEEDS_INSPECTION"
                                    ? "warning"
                                    : "danger"
                              }
                            >
                              {e.safetyStatus}
                            </Badge>
                          )}
                          {e.safetyStatus == null && typeof e.isSafe === "boolean" && (
                            <Badge variant={e.isSafe ? "success" : "danger"}>{e.isSafe ? "Safe" : "Unsafe"}</Badge>
                          )}
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </SectionCard>
            )}

            {result.certifications == null &&
              result.trainingRecords == null &&
              result.credentials == null &&
              result.equipment == null &&
              result.type !== "company" &&
              result.type !== "equipment" &&
              result.type !== "cert" &&
              result.firstName == null && (
                <EmptyState
                  icon={FileQuestion}
                  title="No displayable fields"
                  description="Raw payload is available below."
                />
              )}

            <div className="border-t border-vera-charcoal/10 pt-vera-6 print:hidden">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowRaw((s) => !s)}>
                {showRaw ? "Hide" : "Show"} raw response
              </Button>
              {showRaw && (
                <Card className="mt-vera-4 border-vera-charcoal/10 bg-vera-charcoal text-vera-surface shadow-inner">
                  <CardContent className="p-vera-4">
                    <pre className="max-h-72 overflow-auto text-xs leading-relaxed">{JSON.stringify(result, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <footer className="mt-vera-12 text-center text-xs text-vera-muted print:hidden">
          VERA · Public verification · Confirm with your site’s access policy.
        </footer>
      </div>
    </div>
  );
}

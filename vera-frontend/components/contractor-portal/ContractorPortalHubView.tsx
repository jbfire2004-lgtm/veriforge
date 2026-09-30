"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Shield,
  Upload,
} from "lucide-react";
import type { ContractorPortalHubDashboard } from "@/lib/contractor-portal-hub";
import {
  SmsAlert,
  SmsBadge,
  SmsButton,
  SmsCard,
  SmsModuleLayout,
  SmsSkeleton,
} from "@/src/components/sms/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ContractorOpsPanel from "@/src/pages/contractor-safety-portal/dashboard";

const STATUS_TONE: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "danger" | "info"
> = {
  complete: "success",
  in_progress: "warning",
  not_started: "secondary",
  blocked: "danger",
  verified: "success",
  expiring: "warning",
  expired: "danger",
  pending: "info",
  submitted: "info",
  under_review: "warning",
  accepted: "success",
  rejected: "danger",
};

export function ContractorPortalHubView() {
  const [dash, setDash] = useState<ContractorPortalHubDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [docKind, setDocKind] = useState("insurance");
  const [docTitle, setDocTitle] = useState("");
  const [docExpires, setDocExpires] = useState("");
  const [showOps, setShowOps] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/contractor-portal-hub");
      if (!res.ok) throw new Error(`Portal error (${res.status})`);
      setDash((await res.json()) as ContractorPortalHubDashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load portal");
      setDash(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function postAction(body: Record<string, unknown>) {
    if (!dash) return;
    setBusy(true);
    try {
      const res = await fetch("/api/v1/contractor-portal-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          contractorCompanyId: dash.contractorCompanyId,
          primeCompanyId: dash.primeCompanyId,
        }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      setDash((await res.json()) as ContractorPortalHubDashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !dash) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        <SmsSkeleton className="h-28" />
        <SmsSkeleton className="h-64" />
      </div>
    );
  }

  return (
    <>
      <SmsModuleLayout
        eyebrow="Vera · Contractor"
        title="Contractor Portal"
        description="Onboarding, training verification, document submission, and safety performance — connected to Document Archive and Training Ingestion."
        meta={dash?.scopeLabel}
        actions={
          <div className="flex flex-wrap gap-2">
            <SmsButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading || busy}
              onClick={() => void load()}
            >
              Refresh
            </SmsButton>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowOps((v) => !v)}
            >
              {showOps ? "Hide" : "Show"} CAPA inbox
            </Button>
          </div>
        }
        stats={
          dash
            ? [
                {
                  id: "onboard",
                  label: "Onboarding",
                  value: `${dash.onboarding.progressPct}%`,
                  hint: "Program checklist progress",
                  tone:
                    dash.onboarding.progressPct >= 80
                      ? "positive"
                      : "caution",
                  icon: ClipboardCheck,
                },
                {
                  id: "train",
                  label: "Training expired",
                  value: dash.training.expired,
                  hint: `${dash.training.expiringSoon} expiring soon`,
                  tone: dash.training.expired > 0 ? "critical" : "positive",
                  icon: GraduationCap,
                },
                {
                  id: "docs",
                  label: "Documents filed",
                  value: dash.documents.submitted.length,
                  hint: "Program submissions",
                  tone: "info",
                  icon: FileText,
                },
                {
                  id: "score",
                  label: "Safety score",
                  value: dash.safety
                    ? `${dash.safety.overallScore} · ${dash.safety.grade}`
                    : "—",
                  hint: dash.safety?.status ?? "No CSS yet",
                  tone:
                    dash.safety && dash.safety.overallScore >= 75
                      ? "positive"
                      : "caution",
                  icon: Shield,
                },
              ]
            : undefined
        }
        sections={
          dash
            ? [
                {
                  id: "onboarding",
                  title: "Contractor onboarding",
                  description:
                    "Complete profile, insurance, HSE docs, crew training, and prime approval.",
                  icon: ClipboardCheck,
                  children: (
                    <div className="space-y-4">
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--sf-border)]">
                        <div
                          className="h-full rounded-full bg-[var(--sf-accent)] transition-all"
                          style={{
                            width: `${dash.onboarding.progressPct}%`,
                          }}
                        />
                      </div>
                      <ul className="space-y-2">
                        {dash.onboarding.steps.map((step) => (
                          <li
                            key={step.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--sf-border)] px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                {step.label}
                              </p>
                              <p className="text-xs text-[var(--sf-muted)]">
                                {step.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <SmsBadge
                                tone={STATUS_TONE[step.status] ?? "default"}
                              >
                                {step.status.replace(/_/g, " ")}
                              </SmsBadge>
                              {step.status !== "complete" &&
                              step.status !== "blocked" ? (
                                <SmsButton
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  disabled={busy}
                                  onClick={() =>
                                    void postAction({
                                      action: "complete_step",
                                      stepId: step.id,
                                    })
                                  }
                                >
                                  Mark done
                                </SmsButton>
                              ) : null}
                              {step.href?.startsWith("/") ? (
                                <Link
                                  href={step.href}
                                  className="text-xs font-semibold text-[var(--sf-accent)] underline"
                                >
                                  Open
                                </Link>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
                {
                  id: "training",
                  title: "Training verification",
                  description:
                    "Crew certificate status — upload evidence and auto-verify expiry via Training Ingestion.",
                  icon: GraduationCap,
                  actions: (
                    <div className="flex flex-wrap gap-2">
                      <Link href={dash.training.ingestHref}>
                        <SmsButton type="button" size="sm">
                          Upload evidence
                        </SmsButton>
                      </Link>
                      <Link href={dash.training.verificationHref}>
                        <SmsButton type="button" size="sm" variant="secondary">
                          Verification queue
                        </SmsButton>
                      </Link>
                      <Link href={dash.training.competencyHref}>
                        <SmsButton type="button" size="sm" variant="secondary">
                          Competency
                        </SmsButton>
                      </Link>
                    </div>
                  ),
                  children: (
                    <div className="space-y-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Metric
                          label="Crew"
                          value={dash.training.workersTotal}
                        />
                        <Metric
                          label="Verified"
                          value={dash.training.verified}
                        />
                        <Metric
                          label="At risk"
                          value={
                            dash.training.expired + dash.training.expiringSoon
                          }
                        />
                      </div>
                      <div className="overflow-hidden rounded-lg border border-[var(--sf-border)]">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[var(--sf-muted-bg,#f8fafc)] text-[10px] uppercase tracking-wide text-[var(--sf-muted)]">
                            <tr>
                              <th className="px-3 py-2">Worker</th>
                              <th className="px-3 py-2">Certification</th>
                              <th className="px-3 py-2">Status</th>
                              <th className="px-3 py-2">Expiry</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--sf-border)]">
                            {dash.training.rows.map((row) => (
                              <tr key={row.id}>
                                <td className="px-3 py-2">{row.workerLabel}</td>
                                <td className="px-3 py-2">
                                  {row.certification}
                                </td>
                                <td className="px-3 py-2">
                                  <SmsBadge
                                    tone={STATUS_TONE[row.status] ?? "default"}
                                  >
                                    {row.status}
                                  </SmsBadge>
                                </td>
                                <td className="px-3 py-2 tabular-nums text-[var(--sf-muted)]">
                                  {row.expiresAt
                                    ? new Date(
                                        row.expiresAt,
                                      ).toLocaleDateString()
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "documents",
                  title: "Document submission",
                  description:
                    "Submit program documents into Document Archive for prime review.",
                  icon: Upload,
                  actions: (
                    <Link href={dash.documents.archiveHref}>
                      <SmsButton type="button" size="sm" variant="secondary">
                        Open archive
                      </SmsButton>
                    </Link>
                  ),
                  children: (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {dash.documents.required.map((req) => {
                          const filed = dash.documents.submitted.find(
                            (d) => d.kind === req.code,
                          );
                          return (
                            <SmsCard key={req.code} padding="md">
                              <p className="sms-text-label">{req.label}</p>
                              <p className="mt-1 text-xs text-[var(--sf-muted)]">
                                {req.mandatory ? "Required" : "Optional"}
                              </p>
                              <p className="mt-2 text-sm font-medium">
                                {filed ? (
                                  <span className="inline-flex items-center gap-1 text-[var(--sf-success,#3D8F58)]">
                                    <CheckCircle2
                                      className="h-3.5 w-3.5"
                                      aria-hidden
                                    />
                                    {filed.status.replace(/_/g, " ")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[var(--sf-warning,#C89F3D)]">
                                    <AlertTriangle
                                      className="h-3.5 w-3.5"
                                      aria-hidden
                                    />
                                    Missing
                                  </span>
                                )}
                              </p>
                            </SmsCard>
                          );
                        })}
                      </div>

                      <form
                        className="grid gap-3 rounded-lg border border-[var(--sf-border)] p-4 sm:grid-cols-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void postAction({
                            action: "submit_document",
                            kind: docKind,
                            title: docTitle || docKind,
                            expiresAt: docExpires || null,
                          }).then(() => {
                            setDocTitle("");
                            setDocExpires("");
                          });
                        }}
                      >
                        <div className="space-y-1">
                          <Label htmlFor="doc-kind">Document type</Label>
                          <select
                            id="doc-kind"
                            className="flex h-10 w-full rounded-md border border-[var(--sf-border)] bg-white px-3 text-sm"
                            value={docKind}
                            onChange={(e) => setDocKind(e.target.value)}
                          >
                            {dash.documents.required.map((r) => (
                              <option key={r.code} value={r.code}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="doc-title">Title</Label>
                          <Input
                            id="doc-title"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            placeholder="Certificate / policy name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="doc-exp">Expiry (optional)</Label>
                          <Input
                            id="doc-exp"
                            type="date"
                            value={docExpires}
                            onChange={(e) => setDocExpires(e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <SmsButton
                            type="submit"
                            disabled={busy}
                            className="w-full sm:w-auto"
                          >
                            Submit to archive
                          </SmsButton>
                        </div>
                      </form>

                      <ul className="divide-y divide-[var(--sf-border)] rounded-lg border border-[var(--sf-border)]">
                        {dash.documents.submitted.map((d) => (
                          <li
                            key={d.id}
                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium">{d.title}</p>
                              <p className="text-xs text-[var(--sf-muted)]">
                                {d.kind} ·{" "}
                                {new Date(d.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <SmsBadge
                                tone={STATUS_TONE[d.status] ?? "default"}
                              >
                                {d.status.replace(/_/g, " ")}
                              </SmsBadge>
                              <Link
                                href={d.archiveHref}
                                className="text-xs font-semibold text-[var(--sf-accent)] underline"
                              >
                                Archive
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
                {
                  id: "safety",
                  title: "Safety performance tracking",
                  description:
                    "Contractor Safety Score (CSS) pillars — program, incidents, CAPA, training, audits.",
                  icon: Shield,
                  actions: dash.safety ? (
                    <Link href={dash.safety.href || dash.links.css}>
                      <SmsButton type="button" size="sm" variant="secondary">
                        Full score card
                      </SmsButton>
                    </Link>
                  ) : undefined,
                  children: dash.safety ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-end gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sf-muted)]">
                            Overall
                          </p>
                          <p className="text-4xl font-semibold tabular-nums">
                            {dash.safety.overallScore}
                            <span className="ml-2 text-lg font-medium">
                              {dash.safety.grade}
                            </span>
                          </p>
                        </div>
                        <SmsBadge tone="info">{dash.safety.status}</SmsBadge>
                        <p className="text-xs text-[var(--sf-muted)]">
                          Scored{" "}
                          {new Date(dash.safety.scoredAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {dash.safety.pillars.map((p) => (
                          <SmsCard key={p.id} padding="md">
                            <p className="sms-text-label">{p.label}</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums">
                              {p.score}
                            </p>
                          </SmsCard>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--sf-muted)]">
                      No Contractor Safety Score yet. Complete onboarding
                      documents and training to generate a score.{" "}
                      <Link
                        href={dash.links.css}
                        className="font-semibold underline"
                      >
                        Open CSS
                      </Link>
                    </p>
                  ),
                },
              ]
            : undefined
        }
      >
        {error ? <SmsAlert tone="error">{error}</SmsAlert> : null}

        {dash ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <SmsCard padding="md">
              <p className="sms-text-label">Open CAPA</p>
              <p className="text-2xl font-semibold">{dash.ops.openActions}</p>
            </SmsCard>
            <SmsCard padding="md">
              <p className="sms-text-label">Overdue</p>
              <p className="text-2xl font-semibold">{dash.ops.overdue}</p>
            </SmsCard>
            <SmsCard padding="md">
              <p className="sms-text-label">Findings to ack</p>
              <p className="text-2xl font-semibold">
                {dash.ops.unacknowledgedFindings}
              </p>
            </SmsCard>
          </div>
        ) : null}
      </SmsModuleLayout>

      {showOps ? (
        <div className="border-t border-[var(--sf-border)]">
          <ContractorOpsPanel />
        </div>
      ) : null}
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--sf-border)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sf-muted)]">
        {label}
      </p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type AuditCategory =
  | "verification"
  | "training"
  | "compliance"
  | "incident"
  | "system";

export type AuditSeverity = "critical" | "high" | "normal" | "info";

export type AuditEntryLocal = {
  id: string;
  source: AuditCategory;
  action: string;
  details: string;
  category: AuditCategory;
  severity: AuditSeverity;
  timestamp: string;
  userId: number;
  requirementId: string | null;
};

export type AuditEvidenceLocal = {
  id: string;
  entryId: string;
  fileName: string;
  format: string;
  timestamp: string;
  userId: number;
  requirementId: string | null;
};

export type AuditActionLocal = {
  id: string;
  entryId: string;
  name: string;
  owner: string;
  dueDate: string;
  status: "open" | "in_progress" | "done";
};

export type AuditScoreSnapshot = {
  score: number;
  completeness: number;
  totalEntries: number;
  criticalFindings: number;
  evidenceCount: number;
  openActions: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.audit.score";

export function persistAuditScore(snapshot: AuditScoreSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:audit-score", { detail: snapshot }),
  );
}

export function readAuditScore(): AuditScoreSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuditScoreSnapshot;
  } catch {
    return null;
  }
}

export function useAuditScoreSync(
  fallback: AuditScoreSnapshot = {
    score: 64,
    completeness: 25,
    totalEntries: 4,
    criticalFindings: 2,
    evidenceCount: 0,
    openActions: 0,
    timestamp: new Date().toISOString(),
  },
) {
  const [score, setScore] = React.useState<AuditScoreSnapshot>(
    () => readAuditScore() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setScore(JSON.parse(event.newValue) as AuditScoreSnapshot);
      } catch {
        // ignore
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<AuditScoreSnapshot>).detail;
      if (detail) setScore(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:audit-score", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:audit-score",
        onCustom as EventListener,
      );
    };
  }, []);

  return { score, setScore };
}

function seedEntries(): AuditEntryLocal[] {
  return [
    {
      id: "aud-1",
      source: "verification",
      action: "forgeCheck.failed",
      details: "forgeStatus failed on PPE validation workflow.",
      category: "verification",
      severity: "critical",
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId: "cmp-1",
    },
    {
      id: "aud-2",
      source: "training",
      action: "module.completed",
      details: "Lockout-Tagout completed with passing score.",
      category: "training",
      severity: "info",
      timestamp: new Date().toISOString(),
      userId: 2,
      requirementId: null,
    },
    {
      id: "aud-3",
      source: "compliance",
      action: "requirement.updated",
      details: "Emergency drill requirement enabled.",
      category: "compliance",
      severity: "normal",
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId: "cmp-2",
    },
    {
      id: "aud-4",
      source: "incident",
      action: "incident.reported",
      details: "Hot-work spark near fuel staging reported.",
      category: "incident",
      severity: "critical",
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId: null,
    },
  ];
}

function computeScore(
  entries: AuditEntryLocal[],
  evidence: AuditEvidenceLocal[],
  actions: AuditActionLocal[],
): AuditScoreSnapshot {
  const criticalFindings = entries.filter((item) => item.severity === "critical").length;
  const highFindings = entries.filter((item) => item.severity === "high").length;
  const openActions = actions.filter((item) => item.status !== "done").length;
  const linkedFindings = entries.filter((item) =>
    actions.some((action) => action.entryId === item.id),
  ).length;
  const completeness =
    entries.length === 0
      ? 0
      : Math.round(
          ((evidence.length + linkedFindings) / Math.max(entries.length * 2, 1)) * 100,
        );
  const raw =
    100 -
    criticalFindings * 18 -
    highFindings * 8 -
    openActions * 5 +
    Math.min(evidence.length * 3, 15);

  return {
    score: Math.max(0, Math.min(100, Math.round(raw))),
    completeness: Math.max(0, Math.min(100, completeness)),
    totalEntries: entries.length,
    criticalFindings,
    evidenceCount: evidence.length,
    openActions,
    timestamp: new Date().toISOString(),
  };
}

function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  if (severity === "critical") {
    return (
      <span className="inline-flex border border-[#1E6FB8] bg-[rgba(30, 111, 184,.28)] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#ffe0e0] shadow-[0_0_12px_rgba(30, 111, 184,.4)]">
        Critical
      </span>
    );
  }
  if (severity === "high") {
    return (
      <span className="inline-flex border border-[#1E6FB8] bg-[#241818] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#ffd0d0]">
        High
      </span>
    );
  }
  return (
    <span className="inline-flex border border-[#424242] bg-[#1f1f1f] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#d8d8d8]">
      {severity}
    </span>
  );
}

export function VeriForgeAuditEngine() {
  const { push } = useVeriForgeNotifications();
  const [entries, setEntries] = React.useState<AuditEntryLocal[]>(() => seedEntries());
  const [evidence, setEvidence] = React.useState<AuditEvidenceLocal[]>([]);
  const [actions, setActions] = React.useState<AuditActionLocal[]>([]);
  const [reports, setReports] = React.useState<
    Array<{ id: string; summary: string; generatedAt: string; score: number }>
  >([]);

  const [source, setSource] = React.useState<AuditCategory>("verification");
  const [action, setAction] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [severity, setSeverity] = React.useState<AuditSeverity>("normal");
  const [requirementId, setRequirementId] = React.useState("");

  const [evidenceEntryId, setEvidenceEntryId] = React.useState("aud-1");
  const [evidenceName, setEvidenceName] = React.useState("");
  const [evidenceFormat, setEvidenceFormat] = React.useState("pdf");

  const [actionEntryId, setActionEntryId] = React.useState("aud-1");
  const [actionName, setActionName] = React.useState("");
  const [actionOwner, setActionOwner] = React.useState("");
  const [actionDue, setActionDue] = React.useState("");

  const score = React.useMemo(
    () => computeScore(entries, evidence, actions),
    [actions, entries, evidence],
  );

  React.useEffect(() => {
    persistAuditScore(score);
  }, [score]);

  const trail = React.useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
    [entries],
  );

  const ingest = () => {
    if (!action.trim() || !details.trim()) return;
    const entry: AuditEntryLocal = {
      id: `aud-${Date.now()}`,
      source,
      action: action.trim(),
      details: details.trim(),
      category: source,
      severity,
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId: requirementId.trim() || null,
    };
    setEntries((prev) => [entry, ...prev]);
    if (severity === "critical") {
      push({
        category: "system",
        tone: "critical",
        title: "CRITICAL AUDIT FINDING",
        message: `${entry.action}: ${entry.details}`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Audit",
      });
    }
    setAction("");
    setDetails("");
    setRequirementId("");
  };

  const uploadEvidence = () => {
    if (!evidenceName.trim()) return;
    const item: AuditEvidenceLocal = {
      id: `aev-${Date.now()}`,
      entryId: evidenceEntryId,
      fileName: evidenceName.trim(),
      format: evidenceFormat,
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId:
        entries.find((entry) => entry.id === evidenceEntryId)?.requirementId ?? null,
    };
    setEvidence((prev) => [item, ...prev]);
    setEvidenceName("");
  };

  const linkAction = () => {
    if (!actionName.trim() || !actionOwner.trim() || !actionDue) return;
    const linked: AuditActionLocal = {
      id: `aca-${Date.now()}`,
      entryId: actionEntryId,
      name: actionName.trim(),
      owner: actionOwner.trim(),
      dueDate: actionDue,
      status: "open",
    };
    setActions((prev) => [linked, ...prev]);
    setEntries((prev) => [
      {
        id: `aud-${Date.now()}`,
        source: "system",
        action: "corrective_action.linked",
        details: `Linked "${linked.name}" to ${linked.entryId}`,
        category: "system",
        severity: "normal",
        timestamp: new Date().toISOString(),
        userId: 1,
        requirementId: null,
      },
      ...prev,
    ]);
    setActionName("");
    setActionOwner("");
    setActionDue("");
  };

  const completeAction = (id: string) => {
    setActions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "done" as const } : item)),
    );
  };

  const exportReport = () => {
    const report = {
      id: `rpt-${Date.now()}`,
      summary: `Audit completeness ${score.completeness}% · score ${score.score}% · critical ${score.criticalFindings}`,
      generatedAt: new Date().toISOString(),
      score: score.score,
    };
    setReports((prev) => [report, ...prev]);
    setEntries((prev) => [
      {
        id: `aud-${Date.now()}`,
        source: "system",
        action: "audit.report.exported",
        details: `Exported report ${report.id}`,
        category: "system",
        severity: "info",
        timestamp: new Date().toISOString(),
        userId: 1,
        requirementId: null,
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Audit Engine
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Ingest logs, track evidence, score compliance, visualize trails, and export reports.
            </p>
          </div>
          <ShieldGridIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div
          className={cn(
            "border border-[#424242] bg-[#1A1A1A] p-4",
            score.score < 70 && "border-[#1E6FB8] shadow-[0_0_18px_rgba(30, 111, 184,.35)]",
          )}
        >
          <VeriForgeProgressBar label="Audit Compliance Score" value={score.score} />
          <div className="mt-3">
            <VeriForgeProgressBar label="Audit Completeness" value={score.completeness} />
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <Metric label="Entries" value={String(score.totalEntries)} />
          <Metric
            label="Critical"
            value={String(score.criticalFindings)}
            critical={score.criticalFindings > 0}
          />
          <Metric label="Evidence" value={String(score.evidenceCount)} />
          <Metric label="Open Actions" value={String(score.openActions)} />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Audit Log Ingestion
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeSelect
              label="Source"
              value={source}
              onChange={(event) => setSource(event.target.value as AuditCategory)}
              options={[
                { label: "Verification", value: "verification" },
                { label: "Training", value: "training" },
                { label: "Compliance", value: "compliance" },
                { label: "Incident", value: "incident" },
                { label: "System", value: "system" },
              ]}
            />
            <VeriForgeTextField
              label="Action"
              value={action}
              onChange={(event) => setAction(event.target.value)}
              placeholder="forgeCheck.failed"
            />
            <VeriForgeTextField
              label="Details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Finding detail"
            />
            <VeriForgeSelect
              label="Severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value as AuditSeverity)}
              options={[
                { label: "Critical", value: "critical" },
                { label: "High", value: "high" },
                { label: "Normal", value: "normal" },
                { label: "Info", value: "info" },
              ]}
            />
            <VeriForgeTextField
              label="Requirement ID"
              value={requirementId}
              onChange={(event) => setRequirementId(event.target.value)}
              placeholder="cmp-1"
            />
            <VeriForgeButton className="w-full" onClick={ingest}>
              Ingest Audit Log
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            Audit Entry Table
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="overflow-auto border border-[#424242]">
            <table className="min-w-full border-collapse bg-[#1A1A1A] text-left text-sm text-[#FAFAFA]">
              <thead className="bg-[linear-gradient(180deg,#2d2d2d_0%,#232323_100%)]">
                <tr>
                  {["Timestamp", "Category", "Action", "Severity", "User"].map((header) => (
                    <th
                      key={header}
                      className={cn(
                        veriforgeTypography.heading,
                        "border-b border-[#555] px-3 py-2 text-[11px] text-[#e5e5e5]",
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={cn(
                      "border-b border-[#333] transition hover:bg-[rgba(30, 111, 184,.14)]",
                      entry.severity === "critical"
                        ? "bg-[rgba(30, 111, 184,.16)] shadow-[inset_2px_0_0_#1E6FB8]"
                        : index % 2 === 0
                          ? "bg-[#1f1f1f]"
                          : "bg-[#181818]",
                    )}
                  >
                    <td className="px-3 py-2 text-xs text-[#d0d0d0]">
                      {entry.timestamp.slice(0, 19)}
                    </td>
                    <td className="px-3 py-2 text-xs text-[#d0d0d0]">{entry.category}</td>
                    <td className="px-3 py-2 text-xs text-[#d0d0d0]">{entry.action}</td>
                    <td className="px-3 py-2">
                      <SeverityBadge severity={entry.severity} />
                    </td>
                    <td className="px-3 py-2 text-xs text-[#d0d0d0]">{entry.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Evidence Tracking
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeSelect
              label="Audit Entry"
              value={evidenceEntryId}
              onChange={(event) => setEvidenceEntryId(event.target.value)}
              options={entries.map((item) => ({
                label: `${item.id} · ${item.action}`,
                value: item.id,
              }))}
            />
            <div className="border border-[#424242] bg-[linear-gradient(160deg,#222_0%,#171717_100%)] p-3">
              <VeriForgeTextField
                label="Evidence File"
                value={evidenceName}
                onChange={(event) => setEvidenceName(event.target.value)}
                placeholder="finding-photo.jpg"
              />
              <div className="mt-2">
                <VeriForgeSelect
                  label="Format"
                  value={evidenceFormat}
                  onChange={(event) => setEvidenceFormat(event.target.value)}
                  options={[
                    { label: "PDF", value: "pdf" },
                    { label: "JPG", value: "jpg" },
                    { label: "PNG", value: "png" },
                  ]}
                />
              </div>
            </div>
            <VeriForgeButton className="w-full" onClick={uploadEvidence}>
              Upload Evidence
            </VeriForgeButton>
          </div>
          <div className="mt-3 space-y-2">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="border border-[#1E6FB8] bg-[#1f1f1f] px-3 py-2 text-sm text-[#d8d8d8]"
              >
                <p>{item.fileName}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                  timestamp: {item.timestamp} · userId: {item.userId} · requirementId:{" "}
                  {item.requirementId ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. Audit Trail Visualization
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-0">
            {trail.map((entry, index) => {
              const critical = entry.severity === "critical";
              const active = critical || index === trail.length - 1;
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex w-6 flex-col items-center">
                    <span
                      className={cn(
                        "mt-1 h-3 w-3 border",
                        active
                          ? "border-[#1E6FB8] bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.55)]"
                          : "border-[#424242] bg-[#2a2a2a]",
                      )}
                    />
                    {index < trail.length - 1 ? (
                      <span className="h-10 w-px bg-[linear-gradient(180deg,#5a5a5a_0%,#1E6FB8_100%)]" />
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      "mb-2 flex-1 border px-3 py-2",
                      critical
                        ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)]"
                        : "border-[#424242] bg-[#1f1f1f]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-[#f0f0f0]">{entry.action}</p>
                      <SeverityBadge severity={entry.severity} />
                    </div>
                    <p className="mt-1 text-xs text-[#b8b8b8]">{entry.details}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                      {entry.category} · userId {entry.userId} · {entry.timestamp.slice(0, 19)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. Corrective Actions
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeSelect
              label="Finding Entry"
              value={actionEntryId}
              onChange={(event) => setActionEntryId(event.target.value)}
              options={entries.map((item) => ({
                label: `${item.id} · ${item.action}`,
                value: item.id,
              }))}
            />
            <VeriForgeTextField
              label="Action Name"
              value={actionName}
              onChange={(event) => setActionName(event.target.value)}
              placeholder="Remediate PPE forgeCheck failure"
            />
            <VeriForgeTextField
              label="Owner"
              value={actionOwner}
              onChange={(event) => setActionOwner(event.target.value)}
              placeholder="SafetyManager"
            />
            <VeriForgeTextField
              label="Due Date"
              type="date"
              value={actionDue}
              onChange={(event) => setActionDue(event.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={linkAction}>
              Link Corrective Action
            </VeriForgeButton>
          </div>
          <div className="mt-3 space-y-2">
            {actions.map((item) => (
              <div
                key={item.id}
                className="border border-[#1E6FB8] bg-[#1f1f1f] px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{item.name}</p>
                    <p className="text-xs text-[#b0b0b0]">
                      {item.owner} · due {item.dueDate} · entry {item.entryId}
                    </p>
                  </div>
                  {item.status !== "done" ? (
                    <VeriForgeButton
                      size="sm"
                      variant="secondary"
                      onClick={() => completeAction(item.id)}
                    >
                      Complete
                    </VeriForgeButton>
                  ) : (
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#ffd0d0]">
                      Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <HeatEdgeIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              6. Reporting
            </h3>
          </div>
          <VeriForgeDivider className="mb-3" />
          <div className="border border-[#424242] bg-[#1f1f1f] p-4">
            <p className="text-sm text-[#d8d8d8]">
              Exportable audit package includes entries, evidence, corrective actions, and score
              metadata.
            </p>
            <VeriForgeButton className="mt-3 w-full" onClick={exportReport}>
              Export Audit Report
            </VeriForgeButton>
          </div>
          <div className="mt-3 space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border border-[#424242] bg-[#1A1A1A] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <ForgeBoltIcon className="text-[#1E6FB8]" />
                  <p className="text-sm text-[#f0f0f0]">{report.id}</p>
                </div>
                <p className="mt-1 text-xs text-[#b8b8b8]">{report.summary}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  generated: {report.generatedAt} · score: {report.score}%
                </p>
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  critical = false,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-[#424242] bg-[#1f1f1f] px-3 py-2",
        critical && "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.35)]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">{label}</p>
      <p className="mt-1 text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}

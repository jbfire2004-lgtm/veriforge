"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { ForgeBoltIcon, ShieldGridIcon } from "./icons";

export type ForgeComplianceStatus = "Pass" | "Fail" | "Pending";

export type ComplianceRequirementRecord = {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
};

export type ComplianceAssignmentRecord = {
  id: string;
  requirementId: string;
  targetType: "user" | "role" | "department";
  targetLabel: string;
  timestamp: string;
  userId: number;
};

export type ComplianceDocumentRecord = {
  id: string;
  requirementId: string;
  fileName: string;
  format: string;
  expiresAt: string | null;
  forgeStatus: ForgeComplianceStatus;
  timestamp: string;
  userId: number;
};

export type ComplianceAuditRecord = {
  id: string;
  action: string;
  timestamp: string;
  userId: number;
  requirementId: string | null;
  details?: Record<string, unknown>;
};

export type ComplianceScoreRecord = {
  score: number;
  totalRequirements: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  failedDocuments: number;
  expiringSoon: number;
  timestamp: string;
  userId: number | null;
  requirementId: string | null;
};

const STORAGE_KEY = "veriforge.compliance.score";

export function persistComplianceScore(score: ComplianceScoreRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  window.dispatchEvent(new CustomEvent("veriforge:compliance-score", { detail: score }));
}

export function readComplianceScore(): ComplianceScoreRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ComplianceScoreRecord;
  } catch {
    return null;
  }
}

export function useComplianceScoreSync(fallback = 78) {
  const [score, setScore] = React.useState<ComplianceScoreRecord>(() => {
    return (
      readComplianceScore() ?? {
        score: fallback,
        totalRequirements: 2,
        verifiedDocuments: 1,
        pendingDocuments: 1,
        failedDocuments: 0,
        expiringSoon: 0,
        timestamp: new Date().toISOString(),
        userId: null,
        requirementId: null,
      }
    );
  });

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setScore(JSON.parse(event.newValue) as ComplianceScoreRecord);
      } catch {
        // ignore malformed payloads
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<ComplianceScoreRecord>).detail;
      if (detail) setScore(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:compliance-score", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("veriforge:compliance-score", onCustom as EventListener);
    };
  }, []);

  return { score, setScore };
}

export function VeriForgeForgeStatusBadge({ status }: { status: ForgeComplianceStatus }) {
  const styles =
    status === "Pass"
      ? "border-[#4FAF6F]/60 bg-[rgba(79,175,111,0.14)] text-[#D4EEDC]"
      : status === "Fail"
        ? "border-[#B33A3A]/70 bg-[rgba(179,58,58,0.14)] text-[#F0DADA]"
        : "border-[#5A6169] bg-[#2A2E33] text-[#A8B0B8]";
  return (
    <span
      className={cn(
        "inline-flex rounded-[3px] border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
        styles,
      )}
    >
      forgeStatus: {status}
    </span>
  );
}

export function VeriForgeComplianceScoreBar({
  score,
  label = "Compliance Score",
}: {
  score: number;
  label?: string;
}) {
  const low = score < 70;
  return (
    <div
      className={cn(
        "rounded-[3px] border border-[#5A6169] bg-[#2A2E33] p-4 shadow-none",
        low && "border-[#C89F3D]/70 bg-[#2A2820]",
      )}
    >
      <VeriForgeProgressBar
        label={label}
        value={score}
        tone={low ? "amber" : score >= 85 ? "green" : "blue"}
      />
      {low ? (
        <p className="mt-2 text-xs text-[#F2E8C8]">
          Low score detected. Remediation review required.
        </p>
      ) : null}
    </div>
  );
}

export function VeriForgeComplianceAuditTable({
  rows,
}: {
  rows: ComplianceAuditRecord[];
}) {
  return (
    <div className="overflow-auto border border-[#424242]">
      <table className="min-w-full border-collapse bg-[#1A1A1A] text-left text-sm text-[#FAFAFA]">
        <thead className="bg-[linear-gradient(180deg,#2d2d2d_0%,#232323_100%)]">
          <tr>
            {["Timestamp", "Action", "User", "Requirement"].map((header) => (
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
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className={cn(
                "border-b border-[#333] transition hover:bg-[rgba(30, 111, 184,.16)] hover:shadow-[inset_2px_0_0_#1E6FB8]",
                index % 2 === 0 ? "bg-[#1f1f1f]" : "bg-[#181818]",
              )}
            >
              <td className="px-3 py-2 text-[#d7d7d7]">{row.timestamp}</td>
              <td className="px-3 py-2 text-[#d7d7d7]">{row.action}</td>
              <td className="px-3 py-2 text-[#d7d7d7]">{row.userId}</td>
              <td className="px-3 py-2 text-[#d7d7d7]">{row.requirementId ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function seedState() {
  return {
    requirements: [
      {
        id: "cmp-1",
        name: "Mandatory PPE validation",
        category: "safety",
        description: "Validate PPE credentials before site access.",
        enabled: true,
      },
      {
        id: "cmp-2",
        name: "Monthly emergency drill",
        category: "training",
        description: "Confirm emergency drill completion each month.",
        enabled: true,
      },
    ] as ComplianceRequirementRecord[],
    assignments: [] as ComplianceAssignmentRecord[],
    documents: [] as ComplianceDocumentRecord[],
    audits: [
      {
        id: "audit-1",
        action: "engine.initialized",
        timestamp: new Date().toISOString(),
        userId: 0,
        requirementId: null,
      },
    ] as ComplianceAuditRecord[],
  };
}

function computeScore(
  requirements: ComplianceRequirementRecord[],
  documents: ComplianceDocumentRecord[],
  userId: number | null,
): ComplianceScoreRecord {
  const enabled = requirements.filter((item) => item.enabled);
  const verified = documents.filter((item) => item.forgeStatus === "Pass").length;
  const pending = documents.filter((item) => item.forgeStatus === "Pending").length;
  const failed = documents.filter((item) => item.forgeStatus === "Fail").length;
  const expiringSoon = documents.filter((item) => {
    if (!item.expiresAt) return false;
    const expires = new Date(item.expiresAt).getTime();
    return expires <= Date.now() + 30 * 24 * 60 * 60 * 1000 && expires >= Date.now();
  }).length;
  const raw =
    (verified / Math.max(enabled.length, 1)) * 100 - failed * 8 - pending * 3 - expiringSoon * 5;
  return {
    score: Math.max(0, Math.min(100, Math.round(raw))),
    totalRequirements: enabled.length,
    verifiedDocuments: verified,
    pendingDocuments: pending,
    failedDocuments: failed,
    expiringSoon,
    timestamp: new Date().toISOString(),
    userId,
    requirementId: null,
  };
}

function checkDocument(format: string, expiresAt: string | null): ForgeComplianceStatus {
  const allowed = new Set(["pdf", "png", "jpg", "jpeg"]);
  if (!allowed.has(format.toLowerCase())) return "Fail";
  if (!expiresAt) return "Pending";
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires) || expires < Date.now()) return "Fail";
  return "Pass";
}

export function VeriForgeComplianceEngine() {
  const { push } = useVeriForgeNotifications();
  const seeded = React.useMemo(() => seedState(), []);
  const [requirements, setRequirements] = React.useState(seeded.requirements);
  const [assignments, setAssignments] = React.useState(seeded.assignments);
  const [documents, setDocuments] = React.useState(seeded.documents);
  const [audits, setAudits] = React.useState(seeded.audits);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("safety");
  const [description, setDescription] = React.useState("");
  const [assignRequirementId, setAssignRequirementId] = React.useState("cmp-1");
  const [targetType, setTargetType] = React.useState<"user" | "role" | "department">("role");
  const [targetLabel, setTargetLabel] = React.useState("SafetyManager");
  const [uploadRequirementId, setUploadRequirementId] = React.useState("cmp-1");
  const [fileName, setFileName] = React.useState("");
  const [format, setFormat] = React.useState("pdf");
  const [expiresAt, setExpiresAt] = React.useState("");

  const score = React.useMemo(
    () => computeScore(requirements, documents, 1),
    [documents, requirements],
  );

  React.useEffect(() => {
    persistComplianceScore(score);
  }, [score]);

  const writeAudit = React.useCallback(
    (action: string, requirementId: string | null, details: Record<string, unknown> = {}) => {
      const entry: ComplianceAuditRecord = {
        id: `audit-${Date.now()}`,
        action,
        timestamp: new Date().toISOString(),
        userId: 1,
        requirementId,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          userId: 1,
          requirementId,
        },
      };
      setAudits((prev) => [entry, ...prev]);
    },
    [],
  );

  const createRequirement = () => {
    if (!name.trim() || !description.trim()) return;
    const requirement: ComplianceRequirementRecord = {
      id: `cmp-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      enabled: true,
    };
    setRequirements((prev) => [requirement, ...prev]);
    writeAudit("requirement.created", requirement.id, { name: requirement.name });
    setName("");
    setDescription("");
  };

  const assignRequirement = () => {
    const assignment: ComplianceAssignmentRecord = {
      id: `asg-${Date.now()}`,
      requirementId: assignRequirementId,
      targetType,
      targetLabel,
      timestamp: new Date().toISOString(),
      userId: 1,
    };
    setAssignments((prev) => [assignment, ...prev]);
    writeAudit("requirement.assigned", assignRequirementId, {
      targetType,
      targetLabel,
    });
  };

  const uploadDocument = () => {
    if (!fileName.trim()) return;
    const forgeStatus = checkDocument(format, expiresAt || null);
    const document: ComplianceDocumentRecord = {
      id: `doc-${Date.now()}`,
      requirementId: uploadRequirementId,
      fileName: fileName.trim(),
      format,
      expiresAt: expiresAt || null,
      forgeStatus,
      timestamp: new Date().toISOString(),
      userId: 1,
    };
    setDocuments((prev) => [document, ...prev]);
    writeAudit("document.uploaded", uploadRequirementId, {
      documentId: document.id,
      forgeStatus,
    });
    if (forgeStatus === "Fail" || (expiresAt && new Date(expiresAt).getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      push({
        category: "compliance",
        tone: "critical",
        title: "COMPLIANCE EXPIRY ALERT",
        message: `${document.fileName} requires immediate remediation.`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Compliance",
      });
    }
    setFileName("");
  };

  const verifyDocument = (documentId: string) => {
    const current = documents.find((item) => item.id === documentId);
    if (!current) return;
    const forgeStatus = checkDocument(current.format, current.expiresAt);
    setDocuments((prev) =>
      prev.map((item) =>
        item.id === documentId
          ? { ...item, forgeStatus, timestamp: new Date().toISOString() }
          : item,
      ),
    );
    writeAudit("document.verified", current.requirementId, {
      documentId: current.id,
      forgeStatus,
    });
  };

  const runAutomation = () => {
    writeAudit("workflow.automation.ran", null, {
      score: score.score,
      expiringSoon: score.expiringSoon,
    });
    if (score.expiringSoon > 0 || score.score < 70) {
      push({
        category: "compliance",
        tone: "critical",
        title: "AUTOMATED COMPLIANCE ALERT",
        message: `Score ${score.score}% with ${score.expiringSoon} expiring document(s).`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Remediate",
      });
    }
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Compliance Engine
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Requirement management, automated checks, scoring, and audit automation.
            </p>
          </div>
          <VeriForgeButton onClick={runAutomation}>Run Workflow Automation</VeriForgeButton>
        </div>
        <VeriForgeDivider className="my-3" />
        <VeriForgeComplianceScoreBar score={score.score} />
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <Metric label="Requirements" value={String(score.totalRequirements)} />
          <Metric label="Verified" value={String(score.verifiedDocuments)} />
          <Metric label="Pending" value={String(score.pendingDocuments)} />
          <Metric label="Expiring" value={String(score.expiringSoon)} critical={score.expiringSoon > 0} />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Requirement Creation
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeTextField
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Requirement name"
            />
            <VeriForgeSelect
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={[
                { label: "Safety", value: "safety" },
                { label: "Training", value: "training" },
                { label: "Verification", value: "verification" },
                { label: "Compliance", value: "compliance" },
              ]}
            />
            <VeriForgeTextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Requirement description"
            />
            <VeriForgeButton className="w-full" onClick={createRequirement}>
              Create Requirement
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Assignment
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeSelect
              label="Requirement"
              value={assignRequirementId}
              onChange={(event) => setAssignRequirementId(event.target.value)}
              options={requirements.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />
            <VeriForgeSelect
              label="Assign To"
              value={targetType}
              onChange={(event) =>
                setTargetType(event.target.value as "user" | "role" | "department")
              }
              options={[
                { label: "User", value: "user" },
                { label: "Role", value: "role" },
                { label: "Department", value: "department" },
              ]}
            />
            <VeriForgeTextField
              label="Target Label"
              value={targetLabel}
              onChange={(event) => setTargetLabel(event.target.value)}
              placeholder="User / role / department"
            />
            <VeriForgeButton className="w-full" onClick={assignRequirement}>
              Assign Requirement
            </VeriForgeButton>
          </div>
          <div className="mt-3 space-y-2">
            {assignments.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="border border-[#1E6FB8] bg-[#1f1f1f] px-3 py-2 text-sm text-[#d8d8d8]"
              >
                {item.requirementId} → {item.targetType}:{item.targetLabel}
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3. Document Upload
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeSelect
              label="Requirement"
              value={uploadRequirementId}
              onChange={(event) => setUploadRequirementId(event.target.value)}
              options={requirements.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />
            <VeriForgeTextField
              label="File Name"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="ppe-certificate.pdf"
            />
            <VeriForgeSelect
              label="Format"
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              options={[
                { label: "PDF", value: "pdf" },
                { label: "PNG", value: "png" },
                { label: "JPG", value: "jpg" },
                { label: "DOCX (invalid)", value: "docx" },
              ]}
            />
            <VeriForgeTextField
              label="Expires At"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
            <div className="border border-[#424242] bg-[linear-gradient(160deg,#222_0%,#171717_100%)] p-3 text-xs text-[#cfcfcf]">
              Upload field uses metallic borders with red glow on active focus.
            </div>
            <VeriForgeButton className="w-full" onClick={uploadDocument}>
              Upload Document
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. Verification
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-sm text-[#b5b5b5]">No documents uploaded yet.</p>
            ) : (
              documents.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 border border-[#424242] bg-[#1f1f1f] px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{item.fileName}</p>
                    <p className="text-xs text-[#aaaaaa]">
                      {item.requirementId} · {item.format.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <VeriForgeForgeStatusBadge status={item.forgeStatus} />
                    <VeriForgeButton size="sm" variant="secondary" onClick={() => verifyDocument(item.id)}>
                      Re-check
                    </VeriForgeButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </VeriForgeFrame>
      </div>

      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldGridIcon className="text-[#1E6FB8]" />
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5–6. Score + Audit Logging
          </h3>
        </div>
        <VeriForgeComplianceAuditTable rows={audits} />
        <p className="mt-3 text-xs text-[#b8b8b8]">
          Every compliance state includes metadata: timestamp, userId, requirementId.
        </p>
      </VeriForgeFrame>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {requirements.map((item) => (
          <article
            key={item.id}
            className="border border-[#1E6FB8] bg-[#1A1A1A] p-3 shadow-[inset_0_0_0_1px_rgba(30, 111, 184,.2)]"
          >
            <div className="flex items-start gap-2">
              <ForgeBoltIcon className="mt-0.5 text-[#1E6FB8]" />
              <div>
                <h4 className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                  {item.name}
                </h4>
                <p className="mt-1 text-xs text-[#c8c8c8]">{item.description}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#ffcfcf]">
                  {item.category}
                </p>
              </div>
            </div>
          </article>
        ))}
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

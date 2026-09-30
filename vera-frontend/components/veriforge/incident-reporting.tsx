"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar, VeriForgeStepRail } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type IncidentSeverity = "critical" | "moderate" | "low";
export type IncidentStatus =
  | "reported"
  | "investigating"
  | "actions"
  | "resolved"
  | "closed";
export type InvestigationStep =
  | "assign_investigator"
  | "collect_evidence"
  | "review"
  | "finalize";

export type IncidentEvidence = {
  id: string;
  fileName: string;
  format: string;
  uploadedAt: string;
  userId: number;
};

export type CorrectiveAction = {
  id: string;
  name: string;
  responsiblePerson: string;
  dueDate: string;
  status: "open" | "in_progress" | "done";
  createdAt: string;
};

export type IncidentRecord = {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: IncidentSeverity;
  involvedPersonnel: string[];
  status: IncidentStatus;
  investigationStep: InvestigationStep;
  investigator: string | null;
  evidence: IncidentEvidence[];
  correctiveActions: CorrectiveAction[];
  timestamp: string;
  userId: number;
  updatedAt: string;
  resolvedAt: string | null;
};

export type IncidentAnalyticsSnapshot = {
  totalIncidents: number;
  openIncidents: number;
  criticalCount: number;
  moderateCount: number;
  lowCount: number;
  averageResolutionHours: number;
  investigationProgress: number;
  severityDistribution: Array<{ severity: IncidentSeverity; count: number }>;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.incident.analytics";
const INVESTIGATION_STEPS = [
  "ASSIGN INVESTIGATOR",
  "COLLECT EVIDENCE",
  "REVIEW",
  "FINALIZE",
];
const STEP_INDEX: Record<InvestigationStep, number> = {
  assign_investigator: 0,
  collect_evidence: 1,
  review: 2,
  finalize: 3,
};

export function persistIncidentAnalytics(snapshot: IncidentAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:incident-analytics", { detail: snapshot }),
  );
}

export function readIncidentAnalytics(): IncidentAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IncidentAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useIncidentAnalyticsSync(
  fallback: IncidentAnalyticsSnapshot = {
    totalIncidents: 1,
    openIncidents: 1,
    criticalCount: 1,
    moderateCount: 0,
    lowCount: 0,
    averageResolutionHours: 0,
    investigationProgress: 50,
    severityDistribution: [
      { severity: "critical", count: 1 },
      { severity: "moderate", count: 0 },
      { severity: "low", count: 0 },
    ],
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<IncidentAnalyticsSnapshot>(
    () => readIncidentAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as IncidentAnalyticsSnapshot);
      } catch {
        // ignore malformed payloads
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<IncidentAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:incident-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:incident-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

export function VeriForgeSeverityBadge({ severity }: { severity: IncidentSeverity }) {
  if (severity === "critical") {
    return (
      <span className="inline-flex border border-[#1E6FB8] bg-[rgba(30, 111, 184,.28)] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#ffe0e0] shadow-[0_0_14px_rgba(30, 111, 184,.45)]">
        Critical
      </span>
    );
  }
  if (severity === "moderate") {
    return (
      <span className="inline-flex border border-[#424242] bg-[#2a2a2a] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#d8d8d8]">
        Moderate
      </span>
    );
  }
  return (
    <span className="inline-flex border border-[#6a6a6a] bg-[#1f1f1f] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#FAFAFA]">
      Low
    </span>
  );
}

function computeAnalytics(incidents: IncidentRecord[]): IncidentAnalyticsSnapshot {
  const criticalCount = incidents.filter((item) => item.severity === "critical").length;
  const moderateCount = incidents.filter((item) => item.severity === "moderate").length;
  const lowCount = incidents.filter((item) => item.severity === "low").length;
  const openIncidents = incidents.filter(
    (item) => item.status !== "resolved" && item.status !== "closed",
  ).length;
  const resolved = incidents.filter((item) => item.resolvedAt);
  const averageResolutionHours =
    resolved.length === 0
      ? 0
      : Math.round(
          resolved.reduce((sum, item) => {
            const start = new Date(item.timestamp).getTime();
            const end = new Date(item.resolvedAt as string).getTime();
            return sum + (end - start) / (1000 * 60 * 60);
          }, 0) / resolved.length,
        );
  const investigationProgress =
    incidents.length === 0
      ? 0
      : Math.round(
          incidents.reduce(
            (sum, item) => sum + (STEP_INDEX[item.investigationStep] + 1) * 25,
            0,
          ) / incidents.length,
        );

  return {
    totalIncidents: incidents.length,
    openIncidents,
    criticalCount,
    moderateCount,
    lowCount,
    averageResolutionHours,
    investigationProgress,
    severityDistribution: [
      { severity: "critical", count: criticalCount },
      { severity: "moderate", count: moderateCount },
      { severity: "low", count: lowCount },
    ],
    timestamp: new Date().toISOString(),
  };
}

function seedIncidents(): IncidentRecord[] {
  return [
    {
      id: "inc-1",
      title: "Hot-work spark near fuel staging",
      description: "Spark cluster observed during cutting near temporary fuel drums.",
      location: "Forge Cell B / Bay 3",
      severity: "critical",
      involvedPersonnel: ["Maya Ironwood", "Dylan Forge"],
      status: "investigating",
      investigationStep: "collect_evidence",
      investigator: "Rhea Calder",
      evidence: [],
      correctiveActions: [],
      timestamp: new Date().toISOString(),
      userId: 1,
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    },
  ];
}

export function VeriForgeIncidentReportingSystem() {
  const { push } = useVeriForgeNotifications();
  const [incidents, setIncidents] = React.useState<IncidentRecord[]>(() => seedIncidents());
  const [selectedId, setSelectedId] = React.useState("inc-1");

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [severity, setSeverity] = React.useState<IncidentSeverity>("moderate");
  const [personnel, setPersonnel] = React.useState("");
  const [evidenceName, setEvidenceName] = React.useState("");
  const [evidenceFormat, setEvidenceFormat] = React.useState("jpg");

  const [investigator, setInvestigator] = React.useState("");
  const [actionName, setActionName] = React.useState("");
  const [actionOwner, setActionOwner] = React.useState("");
  const [actionDue, setActionDue] = React.useState("");
  const [extraEvidence, setExtraEvidence] = React.useState("");

  const selected = incidents.find((item) => item.id === selectedId) ?? incidents[0];
  const analytics = React.useMemo(() => computeAnalytics(incidents), [incidents]);

  React.useEffect(() => {
    persistIncidentAnalytics(analytics);
  }, [analytics]);

  const createIncident = () => {
    if (!title.trim() || !description.trim() || !location.trim()) return;
    const now = new Date().toISOString();
    const evidence: IncidentEvidence[] = evidenceName.trim()
      ? [
          {
            id: `ev-${Date.now()}`,
            fileName: evidenceName.trim(),
            format: evidenceFormat,
            uploadedAt: now,
            userId: 1,
          },
        ]
      : [];
    const incident: IncidentRecord = {
      id: `inc-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      severity,
      involvedPersonnel: personnel
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status: "reported",
      investigationStep: "assign_investigator",
      investigator: null,
      evidence,
      correctiveActions: [],
      timestamp: now,
      userId: 1,
      updatedAt: now,
      resolvedAt: null,
    };
    setIncidents((prev) => [incident, ...prev]);
    setSelectedId(incident.id);
    if (incident.severity === "critical") {
      push({
        category: "system",
        tone: "critical",
        title: "CRITICAL INCIDENT",
        message: `${incident.title} at ${incident.location}. Immediate investigation required.`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Incidents",
      });
    }
    setTitle("");
    setDescription("");
    setLocation("");
    setPersonnel("");
    setEvidenceName("");
  };

  const updateSelected = (mutator: (incident: IncidentRecord) => IncidentRecord) => {
    if (!selected) return;
    setIncidents((prev) =>
      prev.map((item) => (item.id === selected.id ? mutator(item) : item)),
    );
  };

  const assignInvestigator = () => {
    if (!investigator.trim() || !selected) return;
    updateSelected((incident) => ({
      ...incident,
      investigator: investigator.trim(),
      status: "investigating",
      investigationStep: "collect_evidence",
      updatedAt: new Date().toISOString(),
    }));
    setInvestigator("");
  };

  const uploadEvidence = () => {
    if (!extraEvidence.trim() || !selected) return;
    updateSelected((incident) => ({
      ...incident,
      evidence: [
        {
          id: `ev-${Date.now()}`,
          fileName: extraEvidence.trim(),
          format: "jpg",
          uploadedAt: new Date().toISOString(),
          userId: 1,
        },
        ...incident.evidence,
      ],
      investigationStep:
        incident.investigationStep === "collect_evidence"
          ? "review"
          : incident.investigationStep,
      status: "investigating",
      updatedAt: new Date().toISOString(),
    }));
    setExtraEvidence("");
  };

  const advanceInvestigation = () => {
    if (!selected) return;
    const order: InvestigationStep[] = [
      "assign_investigator",
      "collect_evidence",
      "review",
      "finalize",
    ];
    const index = order.indexOf(selected.investigationStep);
    const next = index < order.length - 1 ? order[index + 1] : order[index];
    updateSelected((incident) => ({
      ...incident,
      investigationStep: next,
      status: next === "finalize" ? "actions" : "investigating",
      updatedAt: new Date().toISOString(),
    }));
  };

  const addCorrectiveAction = () => {
    if (!actionName.trim() || !actionOwner.trim() || !actionDue || !selected) return;
    updateSelected((incident) => ({
      ...incident,
      correctiveActions: [
        {
          id: `ca-${Date.now()}`,
          name: actionName.trim(),
          responsiblePerson: actionOwner.trim(),
          dueDate: actionDue,
          status: "open",
          createdAt: new Date().toISOString(),
        },
        ...incident.correctiveActions,
      ],
      status: "actions",
      updatedAt: new Date().toISOString(),
    }));
    setActionName("");
    setActionOwner("");
    setActionDue("");
  };

  const completeAction = (actionId: string) => {
    updateSelected((incident) => {
      const correctiveActions = incident.correctiveActions.map((action) =>
        action.id === actionId ? { ...action, status: "done" as const } : action,
      );
      const allDone =
        correctiveActions.length > 0 &&
        correctiveActions.every((action) => action.status === "done");
      return {
        ...incident,
        correctiveActions,
        status: allDone ? "resolved" : "actions",
        resolvedAt: allDone ? new Date().toISOString() : incident.resolvedAt,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Incident Reporting System
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Create, classify, investigate, correct, and analyze industrial incidents.
            </p>
          </div>
          <VeriForgeSeverityBadge severity="critical" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Total" value={String(analytics.totalIncidents)} />
          <Metric label="Open" value={String(analytics.openIncidents)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalCount)}
            critical={analytics.criticalCount > 0}
          />
          <Metric label="Avg Resolve (h)" value={String(analytics.averageResolutionHours)} />
        </div>
        <div className="mt-3">
          <VeriForgeProgressBar
            label="Investigation Progress"
            value={analytics.investigationProgress}
          />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Incident Creation
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeTextField
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Incident title"
            />
            <VeriForgeTextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What happened"
            />
            <VeriForgeTextField
              label="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Forge Cell / Bay"
            />
            <VeriForgeSelect
              label="Severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value as IncidentSeverity)}
              options={[
                { label: "Critical", value: "critical" },
                { label: "Moderate", value: "moderate" },
                { label: "Low", value: "low" },
              ]}
            />
            <VeriForgeTextField
              label="Involved Personnel"
              value={personnel}
              onChange={(event) => setPersonnel(event.target.value)}
              placeholder="Comma-separated names"
            />
            <div className="border border-[#424242] bg-[linear-gradient(160deg,#222_0%,#171717_100%)] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-[#d0d0d0]">
                Evidence Upload
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <VeriForgeTextField
                  label="File Name"
                  value={evidenceName}
                  onChange={(event) => setEvidenceName(event.target.value)}
                  placeholder="spark-photo.jpg"
                />
                <VeriForgeSelect
                  label="Format"
                  value={evidenceFormat}
                  onChange={(event) => setEvidenceFormat(event.target.value)}
                  options={[
                    { label: "JPG", value: "jpg" },
                    { label: "PNG", value: "png" },
                    { label: "PDF", value: "pdf" },
                  ]}
                />
              </div>
            </div>
            <VeriForgeButton className="w-full" onClick={createIncident}>
              Report Incident
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Severity Classification + Summaries
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-2">
            {incidents.map((incident) => (
              <button
                key={incident.id}
                type="button"
                onClick={() => setSelectedId(incident.id)}
                className={cn(
                  "w-full border px-3 py-2 text-left transition",
                  selectedId === incident.id
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                    : "border-[#424242] bg-[#1f1f1f] hover:border-[#6a6a6a]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{incident.title}</p>
                    <p className="mt-1 text-xs text-[#aaaaaa]">
                      {incident.location} · {incident.status}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                      timestamp: {incident.timestamp} · userId: {incident.userId}
                    </p>
                  </div>
                  <VeriForgeSeverityBadge severity={incident.severity} />
                </div>
              </button>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      {selected ? (
        <>
          <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              3. Investigation Workflow · {selected.id}
            </h3>
            <VeriForgeDivider className="my-3" />
            <VeriForgeStepRail
              steps={INVESTIGATION_STEPS}
              current={STEP_INDEX[selected.investigationStep]}
            />
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <VeriForgeTextField
                label="Investigator"
                value={investigator}
                onChange={(event) => setInvestigator(event.target.value)}
                placeholder="Assign investigator"
              />
              <VeriForgeTextField
                label="Additional Evidence"
                value={extraEvidence}
                onChange={(event) => setExtraEvidence(event.target.value)}
                placeholder="evidence-file.jpg"
              />
              <div className="flex items-end gap-2">
                <VeriForgeButton className="w-full" onClick={assignInvestigator}>
                  Assign
                </VeriForgeButton>
                <VeriForgeButton
                  className="w-full"
                  variant="secondary"
                  onClick={uploadEvidence}
                >
                  Upload
                </VeriForgeButton>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <VeriForgeButton onClick={advanceInvestigation}>Advance Step</VeriForgeButton>
              <span className="text-xs text-[#b8b8b8]">
                Investigator: {selected.investigator ?? "Unassigned"} · Evidence:{" "}
                {selected.evidence.length}
              </span>
            </div>
          </VeriForgeFrame>

          <div className="grid gap-4 xl:grid-cols-2">
            <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
              <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                4. Corrective Actions
              </h3>
              <VeriForgeDivider className="my-3" />
              <div className="space-y-3">
                <VeriForgeTextField
                  label="Action Name"
                  value={actionName}
                  onChange={(event) => setActionName(event.target.value)}
                  placeholder="Relocate fuel staging"
                />
                <VeriForgeTextField
                  label="Responsible Person"
                  value={actionOwner}
                  onChange={(event) => setActionOwner(event.target.value)}
                  placeholder="Owner name"
                />
                <VeriForgeTextField
                  label="Due Date"
                  type="date"
                  value={actionDue}
                  onChange={(event) => setActionDue(event.target.value)}
                />
                <VeriForgeButton className="w-full" onClick={addCorrectiveAction}>
                  Add Corrective Action
                </VeriForgeButton>
              </div>
              <div className="mt-3 space-y-2">
                {selected.correctiveActions.map((action) => (
                  <div
                    key={action.id}
                    className="border border-[#1E6FB8] bg-[#1f1f1f] px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-[#f0f0f0]">{action.name}</p>
                        <p className="text-xs text-[#b0b0b0]">
                          {action.responsiblePerson} · due {action.dueDate}
                        </p>
                      </div>
                      {action.status !== "done" ? (
                        <VeriForgeButton
                          size="sm"
                          variant="secondary"
                          onClick={() => completeAction(action.id)}
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
                <ShieldGridIcon className="text-[#1E6FB8]" />
                <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                  5. Reporting & Analytics
                </h3>
              </div>
              <VeriForgeDivider className="mb-3" />
              <div className="space-y-3">
                {analytics.severityDistribution.map((item) => {
                  const max = Math.max(analytics.totalIncidents, 1);
                  const pct = Math.round((item.count / max) * 100);
                  return (
                    <div key={item.severity}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="uppercase tracking-[0.12em] text-[#d0d0d0]">
                          {item.severity}
                        </span>
                        <span className="text-[#ffb8b8]">{item.count}</span>
                      </div>
                      <div className="h-3 border border-[#424242] bg-[#151515]">
                        <div
                          className={cn(
                            "h-full transition-all",
                            item.severity === "critical"
                              ? "bg-[linear-gradient(90deg,#174F86_0%,#1E6FB8_100%)] shadow-[0_0_12px_rgba(30, 111, 184,.45)]"
                              : "bg-[#424242]",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <Metric label="Frequency" value={String(analytics.totalIncidents)} />
                <Metric
                  label="Critical Share"
                  value={`${Math.round(
                    (analytics.criticalCount / Math.max(analytics.totalIncidents, 1)) * 100,
                  )}%`}
                  critical={analytics.criticalCount > 0}
                />
                <Metric
                  label="Resolution Time"
                  value={`${analytics.averageResolutionHours}h`}
                />
              </div>
              <p className="mt-3 text-xs text-[#b8b8b8]">
                Investigation status syncs dynamically to dashboard and mobile surfaces.
              </p>
            </VeriForgeFrame>
          </div>
        </>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {incidents.slice(0, 6).map((incident) => (
          <article
            key={incident.id}
            className={cn(
              "border bg-[#1A1A1A] p-3",
              incident.severity === "critical"
                ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.28)]"
                : "border-[#424242]",
            )}
          >
            <div className="flex items-start gap-2">
              {incident.severity === "critical" ? (
                <HeatEdgeIcon className="mt-0.5 text-[#1E6FB8]" />
              ) : (
                <ForgeBoltIcon className="mt-0.5 text-[#8f8f8f]" />
              )}
              <div>
                <h4 className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                  {incident.title}
                </h4>
                <p className="mt-1 text-xs text-[#c8c8c8]">{incident.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <VeriForgeSeverityBadge severity={incident.severity} />
                  <span className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
                    {incident.status}
                  </span>
                </div>
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

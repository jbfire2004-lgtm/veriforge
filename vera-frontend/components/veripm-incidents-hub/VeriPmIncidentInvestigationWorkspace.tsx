"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getPmIncident,
  getInvestigationSuggestions,
  openInvestigation,
  submitPmIncident,
  updatePmIncident,
  updateInvestigation,
  type PmSafetyEvent,
  type TaprootPathway,
} from "@/lib/pm-incidents";
import {
  InsightStrip,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import type { InsightChip } from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { PmAuthBanner } from "@/src/components/pm/layout";
import { Button } from "@/components/ui/button";
import { EvidencePanel } from "@/components/investigation/EvidencePanel";
import { FiveWhyRcaPanel } from "@/components/investigation/FiveWhyRcaPanel";
import { FishboneRcaPanel } from "@/components/investigation/FishboneRcaPanel";
import { TaprootPathwaySelector } from "@/components/investigation/TaprootPathwaySelector";
import { GuidedInvestigationFlow } from "@/components/investigation/GuidedInvestigationFlow";
import { CausalTreeDiagram } from "@/components/investigation/CausalTreeDiagram";
import { IncidentCorrectiveActionsPanel } from "@/components/investigation/IncidentCorrectiveActionsPanel";
import { IncidentFinalReviewPanel } from "@/components/investigation/IncidentFinalReviewPanel";
import { IncidentSmsClassificationPanel } from "@/components/sms/IncidentSmsClassificationPanel";
import { IncidentSifEnginePanel } from "@/src/components/pm/IncidentSifEnginePanel";
import { IncidentIntelligencePanel } from "@/src/components/pm/IncidentIntelligencePanel";
import { OrderTestFromIncident } from "@/components/substance-testing/OrderTestFromIncident";

export type InvestigationStage =
  | "information"
  | "evidence"
  | "root_cause"
  | "corrective_actions"
  | "final_review";

const STAGES: {
  id: InvestigationStage;
  label: string;
  short: string;
  invStatus: string;
  step: number;
}[] = [
  {
    id: "information",
    label: "Incident information",
    short: "1 · Info",
    invStatus: "not_started",
    step: 0,
  },
  {
    id: "evidence",
    label: "Evidence",
    short: "2 · Evidence",
    invStatus: "evidence_gathering",
    step: 1,
  },
  {
    id: "root_cause",
    label: "Root cause",
    short: "3 · RCA",
    invStatus: "root_cause",
    step: 2,
  },
  {
    id: "corrective_actions",
    label: "Corrective actions",
    short: "4 · Actions",
    invStatus: "capa_planning",
    step: 3,
  },
  {
    id: "final_review",
    label: "Final review",
    short: "5 · Review",
    invStatus: "review",
    step: 4,
  },
];

const EVENT_TYPES = [
  "incident_injury",
  "incident_property",
  "incident_environmental",
  "incident_equipment",
  "near_miss",
  "hazard_observation",
  "positive_observation",
  "behavioral_observation",
  "equipment_failure",
  "security_event",
  "custom",
] as const;

const SEVERITIES = ["low", "medium", "high", "critical"] as const;

type RcaMethodTab = "five_why" | "fishbone" | "taproot" | "guided" | "tree";

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function stageComplete(stage: InvestigationStage, event: PmSafetyEvent): boolean {
  const evidenceCount =
    (event.attachments?.length ?? 0) +
    (event.witnesses?.length ?? 0) +
    (event.statements?.length ?? 0);
  switch (stage) {
    case "information":
      return Boolean(
        event.title?.trim() &&
          event.description?.trim() &&
          event.occurredAt &&
          (event.locationNote?.trim() || event.projectId),
      );
    case "evidence":
      return evidenceCount > 0;
    case "root_cause":
      return event.rootCauses.length > 0;
    case "corrective_actions":
      return event.correctiveActions.length > 0;
    case "final_review":
      return ["approved", "closed", "locked"].includes(event.status);
    default:
      return false;
  }
}

export function VeriPmIncidentInvestigationWorkspace({
  id,
  projectId = 1,
  companyId = 1,
}: {
  id: string;
  projectId?: number;
  companyId?: number;
}) {
  const searchParams = useSearchParams();
  const stageParam = searchParams.get("stage") as InvestigationStage | null;

  const {
    query,
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
  } = usePmInspectionScope(companyId, projectId);

  const [event, setEvent] = useState<PmSafetyEvent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stage, setStage] = useState<InvestigationStage>(() => {
    if (
      stageParam &&
      [
        "information",
        "evidence",
        "root_cause",
        "corrective_actions",
        "final_review",
      ].includes(stageParam)
    ) {
      return stageParam;
    }
    return "information";
  });
  const [pathways, setPathways] = useState<TaprootPathway[]>([]);
  const [rcaTab, setRcaTab] = useState<RcaMethodTab>("five_why");
  const [opening, setOpening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [eventType, setEventType] = useState<string>("near_miss");
  const [severity, setSeverity] = useState<string>("medium");
  const [immediateActions, setImmediateActions] = useState("");
  const [narrative, setNarrative] = useState("");

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const row = await getPmIncident(id);
      setEvent(row);
      setTitle(row.title ?? "");
      setDescription(row.description ?? "");
      setLocationNote(row.locationNote ?? "");
      setOccurredAt(toLocalInput(row.occurredAt));
      setEventType(row.eventType);
      setSeverity(row.severity);
      setImmediateActions(row.investigation?.immediateActions ?? "");
      setNarrative(row.investigation?.narrative ?? "");
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Could not load this incident.",
      );
    }
  }, [id]);

  useEffect(() => {
    if (!tokenReady) return;
    void load();
    void getInvestigationSuggestions(id)
      .then((s) => setPathways(s.pathways))
      .catch(() => undefined);
  }, [id, load, tokenReady, session?.accessToken]);

  async function goStage(next: InvestigationStage) {
    setStage(next);
    const meta = STAGES.find((s) => s.id === next);
    if (!meta || !event) return;
    try {
      if (!event.investigation) {
        await openInvestigation(id);
      }
      await updateInvestigation(id, {
        status: meta.invStatus,
        currentStep: meta.step,
      } as never);
      await load();
    } catch {
      /* stage nav should not block */
    }
  }

  async function handleOpenInvestigation() {
    setOpening(true);
    try {
      await openInvestigation(id);
      await load();
      await goStage("evidence");
    } finally {
      setOpening(false);
    }
  }

  async function saveInformation() {
    if (!event) return;
    setSaving(true);
    setInfoMsg(null);
    try {
      await updatePmIncident(id, {
        title: title.trim(),
        description: description.trim(),
        locationNote: locationNote.trim(),
        occurredAt: occurredAt
          ? new Date(occurredAt).toISOString()
          : undefined,
        eventType,
        severity,
      });
      try {
        await updateInvestigation(id, {
          narrative: narrative.trim() || undefined,
          immediateActions: immediateActions.trim() || undefined,
        } as never);
      } catch {
        /* investigation may not exist yet */
      }
      setInfoMsg("Incident information saved.");
      await load();
    } catch (e) {
      setInfoMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const chips: InsightChip[] = useMemo(() => {
    if (!event) return [];
    return [
      {
        id: "status",
        label: "Status",
        value: event.status.replaceAll("_", " "),
        tone:
          event.status === "closed"
            ? "positive"
            : event.status === "draft"
              ? "neutral"
              : "info",
      },
      {
        id: "sev",
        label: "Severity",
        value: event.severity,
        tone:
          event.severity === "critical" || event.severity === "high"
            ? "critical"
            : "caution",
      },
      {
        id: "risk",
        label: "Risk",
        value: String(event.riskScore),
        tone: "info",
      },
      {
        id: "rca",
        label: "Root causes",
        value: String(event.rootCauses.length),
        tone: event.rootCauses.length ? "positive" : "caution",
      },
      {
        id: "capa",
        label: "Actions",
        value: String(event.correctiveActions.length),
        tone: event.correctiveActions.length ? "positive" : "caution",
      },
    ];
  }, [event]);

  const subjectWorkerId =
    (event?.injuries?.[0] as { workerId?: number } | undefined)?.workerId ??
    event?.people?.find((p) => typeof p.workerId === "number")?.workerId;

  const locked =
    event?.status === "closed" || event?.status === "locked";

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Incident investigation"
      title={event?.title ?? "Incident investigation"}
      description="Enterprise investigation workflow — information, evidence, multi-method root cause, linked corrective actions, and final review."
      meta={
        event
          ? [
              event.company?.name ?? `Company ${event.companyId}`,
              event.project?.name ?? `Project ${event.projectId}`,
              event.eventType.replaceAll("_", " "),
              event.locationNote || null,
            ]
              .filter(Boolean)
              .join(" · ")
          : undefined
      }
    >
      <PmAuthBanner
        authLoading={authLoading}
        authenticated={authenticated}
        tokenReady={tokenReady}
        sessionExpired={sessionExpired}
        signInMessage="Sign in to open this investigation."
      />

      {loadError ? (
        <VsSection band="narrative">
          <p className="text-sm" style={{ color: VS_COLORS.critical }}>
            {loadError}
          </p>
        </VsSection>
      ) : null}

      {!event && !loadError ? (
        <VsSection band="narrative">
          <p className="text-sm" style={{ color: VS_COLORS.muted }}>
            Loading incident…
          </p>
        </VsSection>
      ) : null}

      {event ? (
        <>
          <VsSection band="controls">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/pm/incidents${query}`}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{ color: VS_COLORS.muted }}
              >
                ← Incidents hub
              </Link>
              <Link
                href={`/pm/action-management${query}`}
                className="rounded px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: VS_COLORS.slate,
                  color: VS_COLORS.white,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
              >
                Action Management
              </Link>
              {!event.investigation ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={opening || locked}
                  onClick={() => void handleOpenInvestigation()}
                >
                  {opening ? "Opening…" : "Start investigation"}
                </Button>
              ) : (
                <span
                  className="rounded px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    background: VS_COLORS.slate,
                    color: VS_COLORS.emerald,
                    border: `1px solid ${VS_COLORS.border}`,
                  }}
                >
                  Investigation ·{" "}
                  {event.investigation.status?.replaceAll("_", " ")}
                </span>
              )}
              {event.status === "draft" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void submitPmIncident(id).then(() => load())
                  }
                >
                  Submit report
                </Button>
              ) : null}
            </div>
          </VsSection>

          <VsSection band="kpis">
            <InsightStrip chips={chips} />
          </VsSection>

          <VsSection band="controls" label="Investigation stages">
            <nav className="flex flex-wrap gap-2">
              {STAGES.map((s) => {
                const done = stageComplete(s.id, event);
                const active = stage === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className="rounded px-3 py-2 text-left text-xs font-semibold transition"
                    style={{
                      background: active ? VS_COLORS.blue : VS_COLORS.slate,
                      color: active ? VS_COLORS.navy : VS_COLORS.white,
                      border: `1px solid ${
                        done ? VS_COLORS.emerald : VS_COLORS.border
                      }`,
                      minWidth: "7.5rem",
                    }}
                    onClick={() => void goStage(s.id)}
                  >
                    <span className="block opacity-80">{s.short}</span>
                    <span className="mt-0.5 block text-[11px] font-normal">
                      {done ? "Complete" : "In progress"}
                    </span>
                  </button>
                );
              })}
            </nav>
          </VsSection>

          {stage === "information" ? (
            <VsSection band="detail" label="Incident information">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="vs-panel space-y-3 p-4">
                  <p className="vs-eyebrow">Core details</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Company">
                      <p className="text-sm" style={{ color: VS_COLORS.white }}>
                        {event.company?.name ?? `Company #${event.companyId}`}
                      </p>
                    </Field>
                    <Field label="Project">
                      <p className="text-sm" style={{ color: VS_COLORS.white }}>
                        {event.project?.name ?? `Project #${event.projectId}`}
                      </p>
                    </Field>
                    <Field label="Title">
                      <input
                        className={inputClass}
                        style={inputStyle}
                        disabled={locked}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </Field>
                    <Field label="Occurred at">
                      <input
                        type="datetime-local"
                        className={inputClass}
                        style={inputStyle}
                        disabled={locked}
                        value={occurredAt}
                        onChange={(e) => setOccurredAt(e.target.value)}
                      />
                    </Field>
                    <Field label="Location">
                      <input
                        className={inputClass}
                        style={inputStyle}
                        disabled={locked}
                        placeholder="Site, area, equipment ID…"
                        value={locationNote}
                        onChange={(e) => setLocationNote(e.target.value)}
                      />
                    </Field>
                    <Field label="Event type">
                      <select
                        className={inputClass}
                        style={inputStyle}
                        disabled={locked}
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                      >
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Severity">
                      <select
                        className={inputClass}
                        style={inputStyle}
                        disabled={locked}
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                      >
                        {SEVERITIES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Reported by">
                      <p className="text-sm" style={{ color: VS_COLORS.muted }}>
                        {event.createdBy?.username ?? "—"}
                      </p>
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      className={`${inputClass} min-h-[120px]`}
                      style={inputStyle}
                      disabled={locked}
                      placeholder="What happened, who was involved, conditions, equipment, sequence of events…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field>

                  <Field label="Immediate actions taken">
                    <textarea
                      className={`${inputClass} min-h-[72px]`}
                      style={inputStyle}
                      disabled={locked}
                      placeholder="First aid, scene secured, equipment locked out, notifications…"
                      value={immediateActions}
                      onChange={(e) => setImmediateActions(e.target.value)}
                    />
                  </Field>

                  <Field label="Investigation narrative">
                    <textarea
                      className={`${inputClass} min-h-[72px]`}
                      style={inputStyle}
                      disabled={locked}
                      placeholder="Working narrative for the investigation team…"
                      value={narrative}
                      onChange={(e) => setNarrative(e.target.value)}
                    />
                  </Field>

                  {!locked ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        size="sm"
                        disabled={saving}
                        onClick={() => void saveInformation()}
                      >
                        {saving ? "Saving…" : "Save information"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void goStage("evidence")}
                      >
                        Continue to evidence →
                      </Button>
                      {infoMsg ? (
                        <p
                          className="text-xs"
                          style={{ color: VS_COLORS.muted }}
                        >
                          {infoMsg}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div className="vs-panel space-y-3 p-4">
                    <p className="vs-eyebrow">SMS / SCL classification</p>
                    <IncidentSmsClassificationPanel
                      eventId={id}
                      companyId={event.companyId}
                      initialHecaCode={event.hecaCategoryCode}
                      onSaved={() => void load()}
                    />
                  </div>
                  {typeof subjectWorkerId === "number" ? (
                    <OrderTestFromIncident
                      incidentId={id}
                      workerId={subjectWorkerId}
                      projectId={projectId}
                    />
                  ) : null}
                  <div className="vs-panel p-4">
                    <p className="vs-eyebrow">Injuries / people</p>
                    <p
                      className="mt-2 text-sm"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {event.injuries.length} injury record(s) ·{" "}
                      {event.people?.length ?? 0} person(s) linked
                    </p>
                  </div>
                </div>
              </div>
            </VsSection>
          ) : null}

          {stage === "evidence" ? (
            <VsSection band="detail" label="Evidence collection">
              <EvidencePanel event={event} onUpdate={() => void load()} />
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void goStage("root_cause")}
                >
                  Continue to root cause →
                </Button>
              </div>
            </VsSection>
          ) : null}

          {stage === "root_cause" ? (
            <VsSection band="detail" label="Root cause analysis">
              <div className="mb-4 flex flex-wrap gap-2">
                {(
                  [
                    ["five_why", "5-Why"],
                    ["fishbone", "Fishbone"],
                    ["taproot", "TapRooT"],
                    ["guided", "Guided interview"],
                    ["tree", "Causal tree"],
                  ] as const
                ).map(([idTab, label]) => (
                  <button
                    key={idTab}
                    type="button"
                    className="rounded px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background:
                        rcaTab === idTab ? VS_COLORS.blue : VS_COLORS.slate,
                      color:
                        rcaTab === idTab ? VS_COLORS.navy : VS_COLORS.white,
                      border: `1px solid ${VS_COLORS.border}`,
                    }}
                    onClick={() => setRcaTab(idTab)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {rcaTab === "five_why" ? (
                <FiveWhyRcaPanel
                  eventId={id}
                  onAdded={() => void load()}
                />
              ) : null}
              {rcaTab === "fishbone" ? (
                <FishboneRcaPanel
                  eventId={id}
                  onAdded={() => void load()}
                />
              ) : null}
              {rcaTab === "taproot" ? (
                <TaprootPathwaySelector
                  eventId={id}
                  pathways={pathways}
                  onAdded={() => void load()}
                />
              ) : null}
              {rcaTab === "guided" ? (
                <div className="vs-panel p-4">
                  <GuidedInvestigationFlow
                    eventId={id}
                    onComplete={() => {
                      void load();
                      setRcaTab("taproot");
                    }}
                  />
                </div>
              ) : null}
              {rcaTab === "tree" ? (
                <div className="vs-panel p-4">
                  <CausalTreeDiagram eventId={id} />
                </div>
              ) : null}

              {event.rootCauses.length ? (
                <div className="vs-panel mt-4 space-y-2 p-4">
                  <p className="vs-eyebrow">Documented root causes</p>
                  <ul className="space-y-2">
                    {event.rootCauses.map((rc) => (
                      <li
                        key={rc.id}
                        className="rounded border px-3 py-2 text-sm"
                        style={{ borderColor: VS_COLORS.border }}
                      >
                        <span
                          className="mr-2 font-mono text-[10px] uppercase"
                          style={{ color: VS_COLORS.blue }}
                        >
                          {rc.method}
                        </span>
                        <span style={{ color: VS_COLORS.white }}>
                          {rc.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4 space-y-4">
                <IncidentIntelligencePanel eventId={id} />
                <IncidentSifEnginePanel eventId={id} />
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void goStage("corrective_actions")}
                >
                  Continue to corrective actions →
                </Button>
              </div>
            </VsSection>
          ) : null}

          {stage === "corrective_actions" ? (
            <VsSection band="detail" label="Corrective actions">
              <IncidentCorrectiveActionsPanel
                event={event}
                query={query}
                onUpdate={() => void load()}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void goStage("final_review")}
                >
                  Continue to final review →
                </Button>
              </div>
            </VsSection>
          ) : null}

          {stage === "final_review" ? (
            <VsSection band="detail" label="Final review & closure">
              <IncidentFinalReviewPanel
                event={event}
                onUpdate={() => void load()}
              />
            </VsSection>
          ) : null}
        </>
      ) : null}
    </VsDashboardShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: VS_COLORS.muted }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded border bg-transparent px-3 py-2 text-sm disabled:opacity-60";
const inputStyle = {
  borderColor: VS_COLORS.border,
  color: VS_COLORS.white,
} as const;

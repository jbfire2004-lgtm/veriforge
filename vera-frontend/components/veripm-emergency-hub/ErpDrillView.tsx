"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ERP_DRILL_TYPES,
  buildDrillSummary,
  defaultAttendanceSeed,
  seedChecklist,
  type DrillAttendancePerson,
  type DrillChecklistState,
  type DrillIssue,
  type DrillTimelineEvent,
  type ErpDrillSummaryReport,
  type ErpDrillTypeId,
} from "@/lib/erp-drill";
import { ErpDrillSummaryPanel } from "@/components/veripm-emergency-hub/ErpDrillSummaryPanel";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";
import { SfFloatingTextarea } from "@/src/components/safety-forms/ui/SfFloatingTextarea";

type Phase = "setup" | "live" | "summary";

const STATUSES: DrillAttendancePerson["status"][] = [
  "expected",
  "accounted",
  "missing",
  "excused",
];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function summarizeAttendance(people: DrillAttendancePerson[]) {
  const expected = people.length;
  const accounted = people.filter((p) => p.status === "accounted").length;
  const missing = people.filter((p) => p.status === "missing").length;
  const excused = people.filter((p) => p.status === "excused").length;
  const tracked = accounted + excused;
  const pct = expected ? Math.round((tracked / expected) * 100) : 0;
  return { expected, accounted, missing, excused, pct };
}

export function ErpDrillView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const q = `projectId=${projectId}&companyId=${companyId}`;
  const [phase, setPhase] = useState<Phase>("setup");
  const [drillType, setDrillType] = useState<ErpDrillTypeId>("evacuation");
  const [title, setTitle] = useState("Site evacuation drill");
  const [musterPoint, setMusterPoint] = useState("Muster Point A — Gate 1");
  const [facilitator, setFacilitator] = useState("Site supervisor");
  const [projectName, setProjectName] = useState("Active project");
  const [erpId, setErpId] = useState("local-erp");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [checklist, setChecklist] = useState<DrillChecklistState[]>([]);
  const [timeline, setTimeline] = useState<DrillTimelineEvent[]>([]);
  const [attendance, setAttendance] = useState<DrillAttendancePerson[]>(
    defaultAttendanceSeed(),
  );
  const [issues, setIssues] = useState<DrillIssue[]>([]);
  const [issueText, setIssueText] = useState("");
  const [issueSeverity, setIssueSeverity] =
    useState<DrillIssue["severity"]>("observation");
  const [issueRequiresAction, setIssueRequiresAction] = useState(false);
  const [report, setReport] = useState<ErpDrillSummaryReport | null>(null);
  const [newPersonName, setNewPersonName] = useState("");

  const typeDef = useMemo(
    () => ERP_DRILL_TYPES.find((t) => t.id === drillType),
    [drillType],
  );
  const attendanceStats = summarizeAttendance(attendance);
  const checklistDone = checklist.filter((c) => c.done).length;
  const requiredOpen = checklist.filter((c) => c.required && !c.done).length;

  useEffect(() => {
    if (phase !== "live" || !startedAt) return;
    const tick = () => {
      setElapsedSec(
        Math.max(0, Math.floor((Date.now() - Date.parse(startedAt)) / 1000)),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  function pushTimeline(
    kind: DrillTimelineEvent["kind"],
    label: string,
    detail?: string,
  ) {
    const at = new Date().toISOString();
    setTimeline((prev) => [
      ...prev,
      { id: newId("evt"), at, kind, label, detail },
    ]);
  }

  function handleStart() {
    const now = new Date().toISOString();
    const list = seedChecklist(drillType);
    setStartedAt(now);
    setElapsedSec(0);
    setChecklist(list);
    setTimeline([
      {
        id: newId("evt"),
        at: now,
        kind: "started",
        label: `${typeDef?.label ?? "Drill"} started`,
        detail: title,
      },
    ]);
    setIssues([]);
    setReport(null);
    setPhase("live");
  }

  function toggleChecklist(id: string) {
    const at = new Date().toISOString();
    setChecklist((prev) => {
      const item = prev.find((c) => c.id === id);
      const next = prev.map((c) => {
        if (c.id !== id) return c;
        const done = !c.done;
        return {
          ...c,
          done,
          completedAt: done ? at : null,
        };
      });
      if (item) {
        const done = !item.done;
        setTimeline((tl) => [
          ...tl,
          {
            id: newId("evt"),
            at,
            kind: "checklist",
            label: done ? `Completed: ${item.label}` : `Unchecked: ${item.label}`,
          },
        ]);
      }
      return next;
    });
  }

  function setPersonStatus(
    id: string,
    status: DrillAttendancePerson["status"],
  ) {
    const at = new Date().toISOString();
    setAttendance((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              markedAt: status === "expected" ? null : at,
            }
          : p,
      ),
    );
    const person = attendance.find((p) => p.id === id);
    pushTimeline(
      "attendance",
      `${person?.name ?? id} → ${status}`,
    );
  }

  function addPerson() {
    const name = newPersonName.trim();
    if (!name) return;
    setAttendance((prev) => [
      ...prev,
      {
        id: newId("person"),
        name,
        role: "Worker",
        crew: "Crew A",
        status: "expected",
        markedAt: null,
      },
    ]);
    setNewPersonName("");
    pushTimeline("attendance", `Added to roster: ${name}`);
  }

  function addIssue() {
    const text = issueText.trim();
    if (!text) return;
    const at = new Date().toISOString();
    const severity = issueSeverity;
    const item: DrillIssue = {
      id: newId("issue"),
      at,
      severity,
      text,
      requiresAction: issueRequiresAction || severity === "critical" || severity === "issue",
    };
    setIssues((prev) => [...prev, item]);
    pushTimeline(
      severity === "observation" || severity === "info"
        ? "observation"
        : "issue",
      text,
      severity,
    );
    setIssueText("");
    setIssueRequiresAction(false);
  }

  function handleComplete() {
    if (!startedAt) return;
    const endedAt = new Date().toISOString();
    const closeTimeline: DrillTimelineEvent[] = [
      ...timeline,
      {
        id: newId("evt"),
        at: endedAt,
        kind: "completed",
        label: "Drill closed — summary generated",
      },
    ];
    const summary = buildDrillSummary({
      drillType,
      title,
      musterPoint,
      projectName,
      erpId: erpId || undefined,
      startedAt,
      endedAt,
      checklist,
      timeline: closeTimeline,
      attendance,
      issues,
      facilitator,
    });
    setTimeline(closeTimeline);
    setReport(summary);
    setPhase("summary");
  }

  const elapsedLabel = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;

  return (
    <VeraPageLayout
      title="ERP drill"
      description="Select a drill type, run a live checklist with timestamps, capture attendance and issues, then generate the summary report."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/pm/emergency-response?${q}`}
            className="rounded border px-3 py-1.5 text-xs font-semibold"
          >
            Emergency hub
          </Link>
          <Link
            href={`/pm/emergency-response/generator?${q}`}
            className="rounded border px-3 py-1.5 text-xs font-semibold"
          >
            ERP generator
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {phase === "setup" ? (
          <SfCard className="space-y-4 p-5">
            <div>
              <h2 className="font-medium">Drill setup</h2>
              <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
                TRAINING ONLY — this workflow does not dispatch emergency
                services.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-[var(--sf-text-muted)]">
                  Drill type
                </span>
                <select
                  className="w-full rounded border border-[var(--sf-border)] bg-transparent px-3 py-2"
                  value={drillType}
                  onChange={(e) => {
                    const next = e.target.value as ErpDrillTypeId;
                    setDrillType(next);
                    const def = ERP_DRILL_TYPES.find((t) => t.id === next);
                    if (def) setTitle(`${def.label} drill`);
                  }}
                >
                  {ERP_DRILL_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <SfInput
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <SfInput
                label="Muster point"
                value={musterPoint}
                onChange={(e) => setMusterPoint(e.target.value)}
              />
              <SfInput
                label="Facilitator"
                value={facilitator}
                onChange={(e) => setFacilitator(e.target.value)}
              />
              <SfInput
                label="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <SfInput
                label="ERP record id (optional)"
                value={erpId}
                onChange={(e) => setErpId(e.target.value)}
              />
            </div>

            {typeDef ? (
              <div className="rounded-lg border border-[var(--sf-border)] p-3 text-sm">
                <p className="font-medium">{typeDef.label}</p>
                <p className="mt-1 text-[var(--sf-text-muted)]">
                  {typeDef.description} · Target ~{typeDef.defaultDurationMin}{" "}
                  min · {typeDef.checklist.length} checklist steps
                </p>
                <ul className="mt-2 list-inside list-disc text-xs text-[var(--sf-text-muted)]">
                  {typeDef.checklist.map((c) => (
                    <li key={c.id}>
                      {c.label}
                      {c.required ? " (required)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <SfButton type="button" onClick={handleStart}>
              Start live drill
            </SfButton>
          </SfCard>
        ) : null}

        {phase === "live" && startedAt ? (
          <>
            <SfCard className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--sf-text-muted)]">
                    Live drill
                  </p>
                  <h2 className="font-medium">{title}</h2>
                  <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
                    {typeDef?.label} · {musterPoint} · Started{" "}
                    {new Date(startedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-semibold tabular-nums">
                    {elapsedLabel}
                  </p>
                  <p className="text-xs text-[var(--sf-text-muted)]">
                    elapsed · {checklistDone}/{checklist.length} checklist ·{" "}
                    {attendanceStats.pct}% attendance
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <Stat label="Checklist done" value={`${checklistDone}/${checklist.length}`} />
                <Stat
                  label="Required open"
                  value={String(requiredOpen)}
                  alert={requiredOpen > 0}
                />
                <Stat
                  label="Accounted"
                  value={`${attendanceStats.accounted}/${attendanceStats.expected}`}
                />
                <Stat
                  label="Missing"
                  value={String(attendanceStats.missing)}
                  alert={attendanceStats.missing > 0}
                />
              </div>
            </SfCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <SfCard className="space-y-3 p-5">
                <h3 className="font-medium">Live checklist</h3>
                <ul className="divide-y rounded-lg border border-[var(--sf-border)]">
                  {checklist.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-start gap-3 px-3 py-2.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={c.done}
                        onChange={() => toggleChecklist(c.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={c.done ? "line-through opacity-70" : ""}>
                          {c.label}
                          {c.required ? (
                            <span className="ml-1 text-[10px] uppercase text-[var(--sf-text-muted)]">
                              required
                            </span>
                          ) : null}
                        </p>
                        {c.completedAt ? (
                          <p className="text-xs text-[var(--sf-text-muted)]">
                            {new Date(c.completedAt).toLocaleTimeString()} · +
                            {Math.round(
                              (Date.parse(c.completedAt) -
                                Date.parse(startedAt)) /
                                1000,
                            )}
                            s
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </SfCard>

              <SfCard className="space-y-3 p-5">
                <h3 className="font-medium">Attendance capture</h3>
                <ul className="divide-y rounded-lg border border-[var(--sf-border)]">
                  {attendance.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                    >
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-[var(--sf-text-muted)]">
                          {p.role} · {p.crew}
                          {p.markedAt
                            ? ` · ${new Date(p.markedAt).toLocaleTimeString()}`
                            : ""}
                        </p>
                      </div>
                      <select
                        className="rounded border border-[var(--sf-border)] bg-transparent px-2 py-1 text-xs"
                        value={p.status}
                        onChange={(e) =>
                          setPersonStatus(
                            p.id,
                            e.target.value as DrillAttendancePerson["status"],
                          )
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <SfInput
                    label="Add person"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                  />
                  <div className="flex items-end">
                    <SfButton type="button" variant="secondary" onClick={addPerson}>
                      Add
                    </SfButton>
                  </div>
                </div>
              </SfCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SfCard className="space-y-3 p-5">
                <h3 className="font-medium">Issues &amp; observations</h3>
                <SfFloatingTextarea
                  label="Note"
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  rows={3}
                />
                <div className="flex flex-wrap items-end gap-2">
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-[var(--sf-text-muted)]">
                      Severity
                    </span>
                    <select
                      className="rounded border border-[var(--sf-border)] bg-transparent px-2 py-2 text-sm"
                      value={issueSeverity}
                      onChange={(e) =>
                        setIssueSeverity(
                          e.target.value as DrillIssue["severity"],
                        )
                      }
                    >
                      <option value="info">Info</option>
                      <option value="observation">Observation</option>
                      <option value="issue">Issue</option>
                      <option value="critical">Critical</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 pb-2 text-sm">
                    <input
                      type="checkbox"
                      checked={issueRequiresAction}
                      onChange={(e) =>
                        setIssueRequiresAction(e.target.checked)
                      }
                    />
                    Requires action
                  </label>
                  <SfButton type="button" variant="secondary" onClick={addIssue}>
                    Log entry
                  </SfButton>
                </div>
                {issues.length > 0 ? (
                  <ul className="divide-y rounded-lg border border-[var(--sf-border)] text-sm">
                    {issues.map((i) => (
                      <li key={i.id} className="px-3 py-2">
                        <span className="mr-2 text-[10px] uppercase text-[var(--sf-text-muted)]">
                          {i.severity}
                        </span>
                        {i.text}
                        <span className="ml-2 text-xs text-[var(--sf-text-muted)]">
                          {new Date(i.at).toLocaleTimeString()}
                          {i.requiresAction ? " · action" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--sf-text-muted)]">
                    No issues logged yet.
                  </p>
                )}
              </SfCard>

              <SfCard className="space-y-3 p-5">
                <h3 className="font-medium">Timestamp timeline</h3>
                <ul className="max-h-80 space-y-2 overflow-auto text-sm">
                  {[...timeline].reverse().map((e) => (
                    <li
                      key={e.id}
                      className="rounded border border-[var(--sf-border)] px-3 py-2"
                    >
                      <span className="font-mono text-xs text-[var(--sf-text-muted)]">
                        {new Date(e.at).toLocaleTimeString()}
                      </span>
                      <p>{e.label}</p>
                      {e.detail ? (
                        <p className="text-xs text-[var(--sf-text-muted)]">
                          {e.detail}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </SfCard>
            </div>

            <div className="flex flex-wrap gap-2">
              <SfButton type="button" onClick={handleComplete}>
                Close drill &amp; generate summary
              </SfButton>
              <SfButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setPhase("setup");
                  setReport(null);
                }}
              >
                Cancel to setup
              </SfButton>
            </div>
          </>
        ) : null}

        {phase === "summary" && report ? (
          <>
            <ErpDrillSummaryPanel report={report} />
            <div className="flex flex-wrap gap-2">
              <SfButton
                type="button"
                onClick={() => {
                  setPhase("setup");
                  setReport(null);
                  setStartedAt(null);
                }}
              >
                Run another drill
              </SfButton>
            </div>
          </>
        ) : null}
      </div>
    </VeraPageLayout>
  );
}

function Stat({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{
        borderColor: alert ? "#f87171" : "var(--sf-border)",
      }}
    >
      <p className="text-[11px] uppercase text-[var(--sf-text-muted)]">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

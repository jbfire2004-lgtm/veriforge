"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type EmergencyType =
  | "fire"
  | "medical"
  | "chemical"
  | "security"
  | "environmental";

export type EmergencySeverity = "critical" | "high" | "moderate" | "low";
export type EmergencyStatus =
  | "active"
  | "responding"
  | "contained"
  | "resolved"
  | "escalated";

export type ResponseActionType =
  | "evacuate"
  | "isolate"
  | "shut_down"
  | "notify"
  | "assist";

export type ResponseActionStatus = "pending" | "in_progress" | "done" | "critical";
export type MusterStatus = "safe" | "missing" | "en_route";
export type RouteStatus = "clear" | "blocked" | "unsafe";
export type DrillStatus = "scheduled" | "ready" | "overdue" | "completed";

export type EmergencyAlertLocal = {
  id: string;
  type: EmergencyType;
  title: string;
  description: string;
  severity: EmergencySeverity;
  location: string;
  status: EmergencyStatus;
  responsePercent: number;
  timestamp: string;
  userId: number;
};

export type ResponseActionLocal = {
  id: string;
  emergencyId: string;
  action: ResponseActionType;
  label: string;
  status: ResponseActionStatus;
  assignee: string;
  timestamp: string;
  userId: number;
};

export type CommMessageLocal = {
  id: string;
  emergencyId: string;
  sender: string;
  body: string;
  priority: "normal" | "priority";
  timestamp: string;
  userId: number;
};

export type MusterPersonLocal = {
  id: string;
  name: string;
  musterPoint: string;
  status: MusterStatus;
  timestamp: string;
  userId: number;
};

export type EvacuationRouteLocal = {
  id: string;
  name: string;
  fromZone: string;
  toMuster: string;
  status: RouteStatus;
  timestamp: string;
  userId: number;
};

export type EmergencyDrillLocal = {
  id: string;
  title: string;
  type: EmergencyType;
  scheduledAt: string;
  readiness: number;
  status: DrillStatus;
  timestamp: string;
  userId: number;
};

export type EmergencyAnalyticsSnapshot = {
  activeEmergencies: number;
  criticalCount: number;
  averageResponsePercent: number;
  averageResponseMinutes: number;
  missingPersonnel: number;
  blockedRoutes: number;
  overdueDrills: number;
  drillReadiness: number;
  incidentFrequency: number;
  escalationCount: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.emergency.analytics";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeEmergencyAnalytics(input: {
  alerts: EmergencyAlertLocal[];
  muster: MusterPersonLocal[];
  routes: EvacuationRouteLocal[];
  drills: EmergencyDrillLocal[];
}): EmergencyAnalyticsSnapshot {
  const active = input.alerts.filter(
    (a) => a.status === "active" || a.status === "responding" || a.status === "escalated",
  );
  const averageResponsePercent =
    input.alerts.length === 0
      ? 0
      : Math.round(
          input.alerts.reduce((sum, a) => sum + a.responsePercent, 0) / input.alerts.length,
        );
  return {
    activeEmergencies: active.length,
    criticalCount: input.alerts.filter((a) => a.severity === "critical").length,
    averageResponsePercent,
    averageResponseMinutes: Math.max(3, 18 - Math.round(averageResponsePercent / 10)),
    missingPersonnel: input.muster.filter((p) => p.status === "missing").length,
    blockedRoutes: input.routes.filter((r) => r.status === "blocked" || r.status === "unsafe")
      .length,
    overdueDrills: input.drills.filter((d) => d.status === "overdue").length,
    drillReadiness:
      input.drills.length === 0
        ? 0
        : Math.round(
            input.drills.reduce((sum, d) => sum + d.readiness, 0) / input.drills.length,
          ),
    incidentFrequency: input.alerts.length,
    escalationCount: input.alerts.filter((a) => a.status === "escalated").length,
    timestamp: new Date().toISOString(),
  };
}

export function persistEmergencyAnalytics(snapshot: EmergencyAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:emergency-analytics", { detail: snapshot }),
  );
}

export function readEmergencyAnalytics(): EmergencyAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EmergencyAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useEmergencyAnalyticsSync(
  fallback: EmergencyAnalyticsSnapshot = {
    activeEmergencies: 1,
    criticalCount: 1,
    averageResponsePercent: 42,
    averageResponseMinutes: 14,
    missingPersonnel: 1,
    blockedRoutes: 2,
    overdueDrills: 1,
    drillReadiness: 54,
    incidentFrequency: 1,
    escalationCount: 0,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<EmergencyAnalyticsSnapshot>(
    () => readEmergencyAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as EmergencyAnalyticsSnapshot);
      } catch {
        // ignore
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<EmergencyAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:emergency-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:emergency-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function seed() {
  const now = new Date().toISOString();
  return {
    alerts: [
      {
        id: "emg-1",
        type: "fire" as const,
        title: "Thermal event · Bay 4",
        description: "Smoke detected near weld cell fuel staging.",
        severity: "critical" as const,
        location: "Bay 4 · Weld Cell",
        status: "responding" as const,
        responsePercent: 42,
        timestamp: now,
        userId: 1,
      },
    ] as EmergencyAlertLocal[],
    actions: [
      {
        id: "act-1",
        emergencyId: "emg-1",
        action: "evacuate" as const,
        label: "Evacuate Bay 4",
        status: "in_progress" as const,
        assignee: "Shift Lead",
        timestamp: now,
        userId: 1,
      },
      {
        id: "act-2",
        emergencyId: "emg-1",
        action: "isolate" as const,
        label: "Isolate fuel line",
        status: "critical" as const,
        assignee: "Maintenance",
        timestamp: now,
        userId: 1,
      },
      {
        id: "act-3",
        emergencyId: "emg-1",
        action: "notify" as const,
        label: "Notify fire brigade",
        status: "done" as const,
        assignee: "Control Room",
        timestamp: now,
        userId: 1,
      },
    ] as ResponseActionLocal[],
    messages: [
      {
        id: "msg-1",
        emergencyId: "emg-1",
        sender: "Control Room",
        body: "All crews: proceed to Muster Alpha. Do not re-enter Bay 4.",
        priority: "priority" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "msg-2",
        emergencyId: "emg-1",
        sender: "Shift Lead",
        body: "Headcount in progress at Alpha. Two unaccounted.",
        priority: "priority" as const,
        timestamp: now,
        userId: 1,
      },
    ] as CommMessageLocal[],
    muster: [
      {
        id: "per-1",
        name: "Jordan Forge",
        musterPoint: "Muster Alpha",
        status: "safe" as const,
        timestamp: now,
        userId: 101,
      },
      {
        id: "per-2",
        name: "Riley Steel",
        musterPoint: "Muster Alpha",
        status: "missing" as const,
        timestamp: now,
        userId: 102,
      },
      {
        id: "per-3",
        name: "Sam Ortega",
        musterPoint: "Muster Bravo",
        status: "en_route" as const,
        timestamp: now,
        userId: 103,
      },
      {
        id: "per-4",
        name: "Kim Vale",
        musterPoint: "Muster Alpha",
        status: "safe" as const,
        timestamp: now,
        userId: 104,
      },
    ] as MusterPersonLocal[],
    routes: [
      {
        id: "rte-1",
        name: "Primary East Egress",
        fromZone: "Bay 4",
        toMuster: "Muster Alpha",
        status: "clear" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "rte-2",
        name: "North Service Corridor",
        fromZone: "Bay 4",
        toMuster: "Muster Bravo",
        status: "blocked" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "rte-3",
        name: "Roof Access Stair",
        fromZone: "Mezzanine",
        toMuster: "Muster Alpha",
        status: "unsafe" as const,
        timestamp: now,
        userId: 1,
      },
    ] as EvacuationRouteLocal[],
    drills: [
      {
        id: "drl-1",
        title: "Fire Evacuation Drill Q3",
        type: "fire" as const,
        scheduledAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        readiness: 68,
        status: "scheduled" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "drl-2",
        title: "Chemical Spill Response",
        type: "chemical" as const,
        scheduledAt: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
        readiness: 40,
        status: "overdue" as const,
        timestamp: now,
        userId: 1,
      },
    ] as EmergencyDrillLocal[],
  };
}

export function VeriForgeEmergencyResponseSystem() {
  const { push } = useVeriForgeNotifications();
  const initial = React.useMemo(() => seed(), []);
  const [alerts, setAlerts] = React.useState(initial.alerts);
  const [actions, setActions] = React.useState(initial.actions);
  const [messages, setMessages] = React.useState(initial.messages);
  const [muster, setMuster] = React.useState(initial.muster);
  const [routes, setRoutes] = React.useState(initial.routes);
  const [drills, setDrills] = React.useState(initial.drills);
  const [selectedId, setSelectedId] = React.useState("emg-1");
  const notified = React.useRef<Set<string>>(new Set(["emg-1"]));
  const seq = React.useRef(20);

  const [type, setType] = React.useState<EmergencyType>("fire");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [severity, setSeverity] = React.useState<EmergencySeverity>("critical");
  const [location, setLocation] = React.useState("");
  const [actionType, setActionType] = React.useState<ResponseActionType>("evacuate");
  const [actionLabel, setActionLabel] = React.useState("");
  const [actionAssignee, setActionAssignee] = React.useState("");
  const [msgBody, setMsgBody] = React.useState("");
  const [msgPriority, setMsgPriority] = React.useState<"normal" | "priority">("priority");
  const [drillTitle, setDrillTitle] = React.useState("");
  const [drillDate, setDrillDate] = React.useState("");

  const selected = alerts.find((a) => a.id === selectedId) ?? alerts[0];
  const selectedActions = actions.filter((a) => a.emergencyId === selected?.id);
  const selectedMessages = messages.filter((m) => m.emergencyId === selected?.id);

  const analytics = React.useMemo(
    () => computeEmergencyAnalytics({ alerts, muster, routes, drills }),
    [alerts, muster, routes, drills],
  );

  React.useEffect(() => {
    persistEmergencyAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const alert of alerts) {
      if (alert.severity !== "critical" && alert.severity !== "high") continue;
      if (notified.current.has(alert.id)) continue;
      notified.current.add(alert.id);
      push({
        category: "system",
        tone: "critical",
        title: "CRITICAL EMERGENCY",
        message: `${alert.type.toUpperCase()}: ${alert.title} at ${alert.location}.`,
        forgeStatus: "failed",
        userId: alert.userId,
        actionLabel: "Open Emergency",
      });
    }
    for (const drill of drills) {
      if (drill.status !== "overdue") continue;
      const key = `drill:${drill.id}`;
      if (notified.current.has(key)) continue;
      notified.current.add(key);
      push({
        category: "compliance",
        tone: "critical",
        title: "DRILL OVERDUE",
        message: `${drill.title} is overdue.`,
        forgeStatus: "failed",
        userId: drill.userId,
      });
    }
  }, [alerts, drills, push]);

  const raiseAlert = () => {
    if (!title.trim() || !location.trim()) return;
    const now = new Date().toISOString();
    const id = `emg-${seq.current++}`;
    const alert: EmergencyAlertLocal = {
      id,
      type,
      title: title.trim(),
      description: description.trim() || `${type} emergency`,
      severity,
      location: location.trim(),
      status: "active",
      responsePercent: 5,
      timestamp: now,
      userId: 1,
    };
    setAlerts((prev) => [alert, ...prev]);
    setActions((prev) => [
      {
        id: `act-${seq.current++}`,
        emergencyId: id,
        action: "notify",
        label: "Notify responders & supervisors",
        status: "done",
        assignee: "System",
        timestamp: now,
        userId: 1,
      },
      {
        id: `act-${seq.current++}`,
        emergencyId: id,
        action: "evacuate",
        label: "Evacuate zone",
        status: "pending",
        assignee: "Response Team",
        timestamp: now,
        userId: 1,
      },
      {
        id: `act-${seq.current++}`,
        emergencyId: id,
        action: "isolate",
        label: "Isolate hazard",
        status: "critical",
        assignee: "Response Team",
        timestamp: now,
        userId: 1,
      },
      ...prev,
    ]);
    setMessages((prev) => [
      {
        id: `msg-${seq.current++}`,
        emergencyId: id,
        sender: "System",
        body: `ALERT ${type.toUpperCase()}: ${title.trim()} at ${location.trim()}. Responders notified.`,
        priority: "priority",
        timestamp: now,
        userId: 1,
      },
      ...prev,
    ]);
    setSelectedId(id);
    setTitle("");
    setDescription("");
    setLocation("");
  };

  const addAction = () => {
    if (!selected || !actionLabel.trim()) return;
    setActions((prev) => [
      {
        id: `act-${seq.current++}`,
        emergencyId: selected.id,
        action: actionType,
        label: actionLabel.trim(),
        status: actionType === "isolate" || actionType === "evacuate" ? "critical" : "pending",
        assignee: actionAssignee.trim() || "Response Team",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setActionLabel("");
    setActionAssignee("");
  };

  const completeAction = (actionId: string) => {
    setActions((prev) =>
      prev.map((item) => (item.id === actionId ? { ...item, status: "done" } : item)),
    );
    if (!selected) return;
    setAlerts((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              responsePercent: clamp(item.responsePercent + 12),
              status:
                item.responsePercent + 12 >= 100 ? "contained" : item.status === "active"
                  ? "responding"
                  : item.status,
            }
          : item,
      ),
    );
  };

  const postMessage = () => {
    if (!selected || !msgBody.trim()) return;
    setMessages((prev) => [
      {
        id: `msg-${seq.current++}`,
        emergencyId: selected.id,
        sender: "Operator",
        body: msgBody.trim(),
        priority: msgPriority,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setMsgBody("");
  };

  const escalate = () => {
    if (!selected) return;
    setAlerts((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? { ...item, status: "escalated", severity: "critical" }
          : item,
      ),
    );
    setMessages((prev) => [
      {
        id: `msg-${seq.current++}`,
        emergencyId: selected.id,
        sender: "Escalation Desk",
        body: `ESCALATED: ${selected.title}. Executive and external responders engaged.`,
        priority: "priority",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    notified.current.delete(selected.id);
  };

  const scheduleDrill = () => {
    if (!drillTitle.trim() || !drillDate) return;
    const overdue = new Date(drillDate).getTime() < Date.now();
    setDrills((prev) => [
      {
        id: `drl-${seq.current++}`,
        title: drillTitle.trim(),
        type,
        scheduledAt: drillDate,
        readiness: 20,
        status: overdue ? "overdue" : "scheduled",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setDrillTitle("");
    setDrillDate("");
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Emergency Response System
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Alert, respond, communicate, muster, evacuate, drill — forged for crisis command.
            </p>
          </div>
          <HeatEdgeIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric
            label="Active"
            value={String(analytics.activeEmergencies)}
            critical={analytics.activeEmergencies > 0}
          />
          <Metric
            label="Critical"
            value={String(analytics.criticalCount)}
            critical={analytics.criticalCount > 0}
          />
          <Metric label="Missing" value={String(analytics.missingPersonnel)} critical={analytics.missingPersonnel > 0} />
          <Metric label="Avg Response" value={`${analytics.averageResponseMinutes}m`} />
        </div>
        <div className="mt-3">
          <VeriForgeProgressBar
            label="Response Status"
            value={analytics.averageResponsePercent}
          />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 1. Emergency Alerting */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Emergency Alerting
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => setSelectedId(alert.id)}
                className={cn(
                  "w-full border px-3 py-3 text-left",
                  selectedId === alert.id || alert.severity === "critical"
                    ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a1717_0%,#1a1010_100%)] shadow-[0_0_16px_rgba(30, 111, 184,.35)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                      {alert.title}
                    </p>
                    <p className="mt-1 text-xs text-[#b0b0b0]">
                      {alert.type} · {alert.location} · {alert.status}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                      timestamp: {alert.timestamp.slice(0, 19)} · userId: {alert.userId} ·
                      severity: {alert.severity} · location: {alert.location}
                    </p>
                  </div>
                  <span className="border border-[#1E6FB8] px-2 py-0.5 text-[10px] uppercase text-[#ffc9c9]">
                    {alert.severity}
                  </span>
                </div>
                <div className="mt-2">
                  <VeriForgeProgressBar label="Response" value={alert.responsePercent} />
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeSelect
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value as EmergencyType)}
                options={[
                  { label: "Fire", value: "fire" },
                  { label: "Medical", value: "medical" },
                  { label: "Chemical", value: "chemical" },
                  { label: "Security", value: "security" },
                  { label: "Environmental", value: "environmental" },
                ]}
              />
              <VeriForgeSelect
                label="Severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as EmergencySeverity)}
                options={[
                  { label: "Critical", value: "critical" },
                  { label: "High", value: "high" },
                  { label: "Moderate", value: "moderate" },
                  { label: "Low", value: "low" },
                ]}
              />
            </div>
            <VeriForgeTextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <VeriForgeTextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <VeriForgeTextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <VeriForgeButton className="w-full" onClick={raiseAlert}>
              Raise Alert · Notify Responders
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 2. Response Actions */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              2. Response Actions
            </h3>
            {selected ? (
              <VeriForgeButton size="sm" variant="secondary" onClick={escalate}>
                Escalate
              </VeriForgeButton>
            ) : null}
          </div>
          <div className="mb-3 space-y-2">
            {selectedActions.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "border bg-[#1f1f1f] px-3 py-2",
                  item.status === "critical"
                    ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{item.label}</p>
                    <p className="text-xs text-[#aaaaaa]">
                      {item.action} · {item.assignee} · {item.status}
                    </p>
                  </div>
                  {item.status !== "done" ? (
                    <VeriForgeButton size="sm" onClick={() => completeAction(item.id)}>
                      Complete
                    </VeriForgeButton>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeSelect
              label="Action"
              value={actionType}
              onChange={(e) => setActionType(e.target.value as ResponseActionType)}
              options={[
                { label: "Evacuate", value: "evacuate" },
                { label: "Isolate", value: "isolate" },
                { label: "Shut Down", value: "shut_down" },
                { label: "Notify", value: "notify" },
                { label: "Assist", value: "assist" },
              ]}
            />
            <VeriForgeTextField label="Label" value={actionLabel} onChange={(e) => setActionLabel(e.target.value)} />
            <VeriForgeTextField label="Assignee" value={actionAssignee} onChange={(e) => setActionAssignee(e.target.value)} />
            <VeriForgeButton className="w-full" onClick={addAction}>
              Add Response Action
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 3. Communication */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ForgeBoltIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              3. Communication Workflow
            </h3>
          </div>
          <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
            {selectedMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "border bg-[#1f1f1f] px-3 py-2",
                  msg.priority === "priority"
                    ? "border-[#1E6FB8] shadow-[inset_3px_0_0_#1E6FB8]"
                    : "border-[#424242]",
                )}
              >
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                  {msg.sender} · {msg.timestamp.slice(11, 19)}
                </p>
                <p className="mt-1 text-sm text-[#e0e0e0]">{msg.body}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Message" value={msgBody} onChange={(e) => setMsgBody(e.target.value)} />
            <VeriForgeSelect
              label="Priority"
              value={msgPriority}
              onChange={(e) => setMsgPriority(e.target.value as "normal" | "priority")}
              options={[
                { label: "Priority", value: "priority" },
                { label: "Normal", value: "normal" },
              ]}
            />
            <VeriForgeButton className="w-full" onClick={postMessage}>
              Send Message
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 4. Muster Point Tracking */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldGridIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              4. Muster Point Tracking
            </h3>
          </div>
          <div className="mb-3 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <div className="relative h-36 border border-[#424242] bg-[#121212]">
              <div className="absolute inset-x-4 top-4 h-px bg-[linear-gradient(90deg,transparent,#1E6FB8,transparent)]" />
              <div className="absolute inset-y-4 left-1/3 w-px bg-[#424242]" />
              <div className="absolute inset-y-4 right-1/4 w-px bg-[#424242]" />
              <div className="absolute bottom-3 left-4 border border-[#424242] bg-[#1A1A1A] px-2 py-1 text-[10px] text-[#d0d0d0]">
                Muster Alpha
              </div>
              <div className="absolute bottom-3 right-4 border border-[#424242] bg-[#1A1A1A] px-2 py-1 text-[10px] text-[#d0d0d0]">
                Muster Bravo
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] px-2 py-1 text-[10px] text-[#ffc9c9]">
                Bay 4 Event
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {muster.map((person) => (
              <div
                key={person.id}
                className={cn(
                  "flex items-center justify-between border px-3 py-2",
                  person.status === "missing"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <div>
                  <p className="text-sm text-[#f0f0f0]">{person.name}</p>
                  <p className="text-xs text-[#aaaaaa]">
                    {person.musterPoint} · {person.status}
                  </p>
                </div>
                <div className="flex gap-1">
                  {(["safe", "en_route", "missing"] as MusterStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setMuster((prev) =>
                          prev.map((row) =>
                            row.id === person.id ? { ...row, status } : row,
                          ),
                        )
                      }
                      className={cn(
                        "border px-2 py-0.5 text-[9px] uppercase",
                        person.status === status
                          ? status === "missing"
                            ? "border-[#1E6FB8] text-[#ffc9c9]"
                            : "border-[#4a654a] text-[#b8e0b8]"
                          : "border-[#424242] text-[#8f8f8f]",
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 5. Evacuation Routes */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <AnvilIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              5. Evacuation Routes
            </h3>
          </div>
          <div className="space-y-2">
            {routes.map((route) => (
              <div
                key={route.id}
                className={cn(
                  "border px-3 py-3",
                  route.status === "clear"
                    ? "border-[#424242] bg-[linear-gradient(90deg,#1f1f1f_0%,#171717_100%)]"
                    : "border-[#1E6FB8] bg-[linear-gradient(90deg,#2a1717_0%,#171717_100%)] shadow-[0_0_12px_rgba(30, 111, 184,.28)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{route.name}</p>
                    <p className="text-xs text-[#aaaaaa]">
                      {route.fromZone} → {route.toMuster}
                    </p>
                  </div>
                  <VeriForgeSelect
                    label="Status"
                    value={route.status}
                    onChange={(e) =>
                      setRoutes((prev) =>
                        prev.map((row) =>
                          row.id === route.id
                            ? { ...row, status: e.target.value as RouteStatus }
                            : row,
                        ),
                      )
                    }
                    options={[
                      { label: "Clear", value: "clear" },
                      { label: "Blocked", value: "blocked" },
                      { label: "Unsafe", value: "unsafe" },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </VeriForgeFrame>

        {/* 6. Drill Scheduling */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. Drill Scheduling
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {drills.map((drill) => (
              <div
                key={drill.id}
                className={cn(
                  "border bg-[#1f1f1f] px-3 py-2",
                  drill.status === "overdue"
                    ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{drill.title}</p>
                    <p className="text-xs text-[#aaaaaa]">
                      {drill.type} · {drill.scheduledAt} · {drill.status}
                    </p>
                  </div>
                  <VeriForgeButton
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setDrills((prev) =>
                        prev.map((row) =>
                          row.id === drill.id
                            ? {
                                ...row,
                                readiness: clamp(row.readiness + 10),
                                status:
                                  row.readiness + 10 >= 100
                                    ? "completed"
                                    : row.status === "overdue"
                                      ? "ready"
                                      : row.status,
                              }
                            : row,
                        ),
                      )
                    }
                  >
                    +10%
                  </VeriForgeButton>
                </div>
                <div className="mt-2">
                  <VeriForgeProgressBar label="Readiness" value={drill.readiness} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Drill Title" value={drillTitle} onChange={(e) => setDrillTitle(e.target.value)} />
            <VeriForgeTextField label="Scheduled" type="date" value={drillDate} onChange={(e) => setDrillDate(e.target.value)} />
            <VeriForgeButton className="w-full" onClick={scheduleDrill}>
              Schedule Drill
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      {/* 7. Analytics */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
          7. Emergency Analytics
        </h3>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Response Completion", value: analytics.averageResponsePercent },
            { label: "Drill Readiness", value: analytics.drillReadiness },
            {
              label: "Blocked / Unsafe Routes",
              value: Math.min(100, analytics.blockedRoutes * 33),
              critical: analytics.blockedRoutes > 0,
            },
            {
              label: "Incident Frequency Index",
              value: Math.min(100, analytics.incidentFrequency * 25),
            },
          ].map((row) => (
            <div
              key={row.label}
              className={cn(
                "border bg-[#1f1f1f] p-3",
                "critical" in row && row.critical ? "border-[#1E6FB8]" : "border-[#424242]",
              )}
            >
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">{row.label}</p>
              <p className="mt-1 text-lg text-[#FAFAFA]">{row.value}%</p>
              <div className="mt-2 h-2 border border-[#424242] bg-[#121212]">
                <div
                  className="h-full bg-[linear-gradient(90deg,#174F86_0%,#1E6FB8_100%)]"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#b8b8b8]">
          Escalations: {analytics.escalationCount} · Overdue drills: {analytics.overdueDrills} ·
          Avg response: {analytics.averageResponseMinutes} min. Status syncs to dashboard and
          mobile.
        </p>
      </VeriForgeFrame>
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

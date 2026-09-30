"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type TaskStatus = "assigned" | "in_progress" | "completed" | "overdue";
export type HazardRisk = "critical" | "high" | "moderate" | "low";
export type CheckInStatus = "checked_in" | "missed" | "due";
export type InspectionStatus = "current" | "due" | "overdue";
export type ForgeCheckStatus = "Pass" | "Fail" | "Pending";
export type ZoneTone = "restricted" | "active" | "neutral";

export type FieldTaskLocal = {
  id: string;
  name: string;
  location: string;
  hazards: string;
  equipment: string;
  dueAt: string;
  status: TaskStatus;
  completionPercent: number;
  lat: number;
  lng: number;
  timestamp: string;
  userId: number;
};

export type FieldCheckInLocal = {
  id: string;
  taskId: string;
  location: string;
  lat: number;
  lng: number;
  status: CheckInStatus;
  timestamp: string;
  userId: number;
};

export type FieldHazardLocal = {
  id: string;
  taskId: string | null;
  name: string;
  risk: HazardRisk;
  location: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
  userId: number;
};

export type FieldEquipmentLocal = {
  id: string;
  taskId: string | null;
  type: string;
  serial: string;
  inspectionStatus: InspectionStatus;
  usageHours: number;
  location: string;
  timestamp: string;
  userId: number;
};

export type FieldVerificationLocal = {
  id: string;
  taskId: string;
  forgeStatus: ForgeCheckStatus;
  notes: string;
  location: string;
  timestamp: string;
  userId: number;
};

export type MapZoneLocal = {
  id: string;
  name: string;
  tone: ZoneTone;
  lat: number;
  lng: number;
  location: string;
  timestamp: string;
  userId: number;
};

export type MapRouteLocal = {
  id: string;
  name: string;
  fromZone: string;
  toZone: string;
  restricted: boolean;
  location: string;
  timestamp: string;
  userId: number;
};

export type FieldLogLocal = {
  id: string;
  taskId: string | null;
  message: string;
  location: string;
  timestamp: string;
  userId: number;
};

export type FieldAnalyticsSnapshot = {
  totalTasks: number;
  overdueTasks: number;
  taskCompletion: number;
  missedCheckIns: number;
  criticalHazards: number;
  hazardFrequency: number;
  equipmentUsageHours: number;
  overdueInspections: number;
  verificationPassRate: number;
  fieldStatusScore: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.field-operations.analytics";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function taskStatus(dueAt: string, completion: number): TaskStatus {
  if (completion >= 100) return "completed";
  if (new Date(dueAt).getTime() < Date.now()) return "overdue";
  if (completion > 0) return "in_progress";
  return "assigned";
}

export function computeFieldAnalytics(input: {
  tasks: FieldTaskLocal[];
  checkIns: FieldCheckInLocal[];
  hazards: FieldHazardLocal[];
  equipment: FieldEquipmentLocal[];
  verifications: FieldVerificationLocal[];
}): FieldAnalyticsSnapshot {
  const passed = input.verifications.filter((v) => v.forgeStatus === "Pass").length;
  const taskCompletion =
    input.tasks.length === 0
      ? 0
      : clamp(input.tasks.reduce((s, t) => s + t.completionPercent, 0) / input.tasks.length);
  const criticalHazards = input.hazards.filter((h) => h.risk === "critical").length;
  const overdueTasks = input.tasks.filter((t) => t.status === "overdue").length;
  const missedCheckIns = input.checkIns.filter((c) => c.status === "missed").length;
  const overdueInspections = input.equipment.filter(
    (e) => e.inspectionStatus === "overdue",
  ).length;
  const verificationPassRate =
    input.verifications.length === 0
      ? 0
      : clamp((passed / input.verifications.length) * 100);
  return {
    totalTasks: input.tasks.length,
    overdueTasks,
    taskCompletion,
    missedCheckIns,
    criticalHazards,
    hazardFrequency: input.hazards.length,
    equipmentUsageHours: input.equipment.reduce((s, e) => s + e.usageHours, 0),
    overdueInspections,
    verificationPassRate,
    fieldStatusScore: clamp(
      taskCompletion * 0.4 +
        verificationPassRate * 0.3 +
        30 -
        criticalHazards * 8 -
        overdueTasks * 6 -
        missedCheckIns * 4 -
        overdueInspections * 5,
    ),
    timestamp: new Date().toISOString(),
  };
}

export function persistFieldAnalytics(snapshot: FieldAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:field-operations-analytics", { detail: snapshot }),
  );
}

export function readFieldAnalytics(): FieldAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FieldAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useFieldAnalyticsSync(
  fallback: FieldAnalyticsSnapshot = {
    totalTasks: 2,
    overdueTasks: 1,
    taskCompletion: 32,
    missedCheckIns: 1,
    criticalHazards: 1,
    hazardFrequency: 4,
    equipmentUsageHours: 61,
    overdueInspections: 1,
    verificationPassRate: 0,
    fieldStatusScore: 42,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<FieldAnalyticsSnapshot>(
    () => readFieldAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as FieldAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<FieldAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:field-operations-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:field-operations-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function seed() {
  const now = new Date().toISOString();
  return {
    tasks: [
      {
        id: "ft-1",
        name: "Furnace seal inspection",
        location: "Bay 2 Hot Zone",
        hazards: "Heat, sparks",
        equipment: "Thermal camera TC-9",
        dueAt: new Date(Date.now() + 4 * 3600000).toISOString(),
        status: "in_progress" as const,
        completionPercent: 45,
        lat: 39.742,
        lng: -104.991,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ft-2",
        name: "Crane path clear",
        location: "Yard North",
        hazards: "Overhead lift",
        equipment: "Radio pack RP-2",
        dueAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: "overdue" as const,
        completionPercent: 20,
        lat: 39.745,
        lng: -104.988,
        timestamp: now,
        userId: 1,
      },
    ] as FieldTaskLocal[],
    checkIns: [
      {
        id: "ci-1",
        taskId: "ft-1",
        location: "Bay 2 Hot Zone",
        lat: 39.7421,
        lng: -104.9912,
        status: "checked_in" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ci-2",
        taskId: "ft-2",
        location: "Yard North",
        lat: 39.745,
        lng: -104.988,
        status: "missed" as const,
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        userId: 1,
      },
      {
        id: "ci-3",
        taskId: "ft-1",
        location: "Bay 2 Hot Zone",
        lat: 39.742,
        lng: -104.991,
        status: "due" as const,
        timestamp: now,
        userId: 1,
      },
    ] as FieldCheckInLocal[],
    hazards: [
      {
        id: "fh-1",
        taskId: "ft-1",
        name: "Molten splash corridor",
        risk: "critical" as const,
        location: "Bay 2 Hot Zone",
        description: "Active pour window",
        lat: 39.7422,
        lng: -104.9914,
        timestamp: now,
        userId: 1,
      },
      {
        id: "fh-2",
        taskId: "ft-2",
        name: "Swing radius",
        risk: "high" as const,
        location: "Yard North",
        description: "Crane boom arc",
        lat: 39.7452,
        lng: -104.9882,
        timestamp: now,
        userId: 1,
      },
      {
        id: "fh-3",
        taskId: null,
        name: "Staging pad",
        risk: "low" as const,
        location: "West Pad",
        description: "Material laydown",
        lat: 39.74,
        lng: -104.995,
        timestamp: now,
        userId: 1,
      },
      {
        id: "fh-4",
        taskId: "ft-1",
        name: "Noise exposure",
        risk: "moderate" as const,
        location: "Bay 2 Hot Zone",
        description: "Compressor bank",
        lat: 39.7418,
        lng: -104.9908,
        timestamp: now,
        userId: 1,
      },
    ] as FieldHazardLocal[],
    equipment: [
      {
        id: "fe-1",
        taskId: "ft-1",
        type: "Thermal camera",
        serial: "TC-9",
        inspectionStatus: "current" as const,
        usageHours: 14,
        location: "Bay 2 Hot Zone",
        timestamp: now,
        userId: 1,
      },
      {
        id: "fe-2",
        taskId: "ft-2",
        type: "Radio pack",
        serial: "RP-2",
        inspectionStatus: "overdue" as const,
        usageHours: 38,
        location: "Yard North",
        timestamp: now,
        userId: 1,
      },
      {
        id: "fe-3",
        taskId: null,
        type: "Gas monitor",
        serial: "GM-4",
        inspectionStatus: "due" as const,
        usageHours: 9,
        location: "Tool crib",
        timestamp: now,
        userId: 1,
      },
    ] as FieldEquipmentLocal[],
    verifications: [
      {
        id: "fv-1",
        taskId: "ft-1",
        forgeStatus: "Pending" as const,
        notes: "Awaiting seal photo",
        location: "Bay 2 Hot Zone",
        timestamp: now,
        userId: 1,
      },
      {
        id: "fv-2",
        taskId: "ft-2",
        forgeStatus: "Fail" as const,
        notes: "Path not cleared",
        location: "Yard North",
        timestamp: now,
        userId: 1,
      },
    ] as FieldVerificationLocal[],
    zones: [
      {
        id: "mz-1",
        name: "Hot Zone",
        tone: "restricted" as const,
        lat: 22,
        lng: 30,
        location: "Bay 2",
        timestamp: now,
        userId: 1,
      },
      {
        id: "mz-2",
        name: "Yard North",
        tone: "active" as const,
        lat: 58,
        lng: 48,
        location: "Yard",
        timestamp: now,
        userId: 1,
      },
      {
        id: "mz-3",
        name: "Muster",
        tone: "neutral" as const,
        lat: 78,
        lng: 72,
        location: "Gate A",
        timestamp: now,
        userId: 1,
      },
    ] as MapZoneLocal[],
    routes: [
      {
        id: "mr-1",
        name: "Egress Alpha",
        fromZone: "Hot Zone",
        toZone: "Muster",
        restricted: false,
        location: "Bay 2 → Gate A",
        timestamp: now,
        userId: 1,
      },
      {
        id: "mr-2",
        name: "Crane underpass",
        fromZone: "Yard North",
        toZone: "Hot Zone",
        restricted: true,
        location: "Yard → Bay 2",
        timestamp: now,
        userId: 1,
      },
      {
        id: "mr-3",
        name: "Service lane",
        fromZone: "Muster",
        toZone: "Yard North",
        restricted: false,
        location: "Gate A → Yard",
        timestamp: now,
        userId: 1,
      },
    ] as MapRouteLocal[],
    logs: [
      {
        id: "fl-1",
        taskId: "ft-1",
        message: "Task assigned to field crew",
        location: "Bay 2 Hot Zone",
        timestamp: now,
        userId: 1,
      },
      {
        id: "fl-2",
        taskId: "ft-1",
        message: "Check-in recorded at Bay 2",
        location: "Bay 2 Hot Zone",
        timestamp: now,
        userId: 1,
      },
      {
        id: "fl-3",
        taskId: "ft-2",
        message: "Missed check-in flagged",
        location: "Yard North",
        timestamp: now,
        userId: 1,
      },
      {
        id: "fl-4",
        taskId: "ft-1",
        message: "Critical hazard mapped: molten splash",
        location: "Bay 2 Hot Zone",
        timestamp: now,
        userId: 1,
      },
      {
        id: "fl-5",
        taskId: "ft-2",
        message: "forgeCheck failed for crane path",
        location: "Yard North",
        timestamp: now,
        userId: 1,
      },
    ] as FieldLogLocal[],
  };
}

function Metric({
  label,
  value,
  critical,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border px-3 py-2",
        critical
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.25)]"
          : "border-[#424242] bg-[#1f1f1f]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">{label}</p>
      <p className="mt-1 font-[var(--vf-font-primary)] text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}

function StatusChip({ status }: { status: ForgeCheckStatus }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        status === "Pass"
          ? "border-[#424242] bg-[#1f1f1f] text-[#b8e0b8]"
          : status === "Fail"
            ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9] shadow-[0_0_8px_rgba(30, 111, 184,.35)]"
            : "border-[#424242] bg-[#151515] text-[#cfcfcf]",
      )}
    >
      {status}
    </span>
  );
}

export function VeriForgeFieldOperationsEngine() {
  const { push } = useVeriForgeNotifications();
  const initial = React.useMemo(() => seed(), []);
  const [tasks, setTasks] = React.useState(initial.tasks);
  const [checkIns, setCheckIns] = React.useState(initial.checkIns);
  const [hazards, setHazards] = React.useState(initial.hazards);
  const [equipment, setEquipment] = React.useState(initial.equipment);
  const [verifications, setVerifications] = React.useState(initial.verifications);
  const [zones, setZones] = React.useState(initial.zones);
  const [routes, setRoutes] = React.useState(initial.routes);
  const [logs, setLogs] = React.useState(initial.logs);
  const [selectedTask, setSelectedTask] = React.useState("ft-1");
  const notified = React.useRef<Set<string>>(new Set(["fh-1"]));
  const seq = React.useRef(40);

  const [taskName, setTaskName] = React.useState("");
  const [taskLocation, setTaskLocation] = React.useState("");
  const [taskHazards, setTaskHazards] = React.useState("");
  const [taskEquipment, setTaskEquipment] = React.useState("");
  const [taskDue, setTaskDue] = React.useState("");
  const [hzName, setHzName] = React.useState("");
  const [hzRisk, setHzRisk] = React.useState<HazardRisk>("high");
  const [hzDesc, setHzDesc] = React.useState("");
  const [eqType, setEqType] = React.useState("");
  const [eqSerial, setEqSerial] = React.useState("");
  const [eqStatus, setEqStatus] = React.useState<InspectionStatus>("current");
  const [logMessage, setLogMessage] = React.useState("");

  const active = tasks.find((t) => t.id === selectedTask) ?? tasks[0];
  const activeVerify =
    verifications.find((v) => v.taskId === active?.id) ?? verifications[0];

  const pushLog = (
    message: string,
    location: string,
    taskId: string | null,
    userId = 1,
  ) => {
    setLogs((prev) => [
      {
        id: `fl-${seq.current++}`,
        taskId,
        message,
        location,
        timestamp: new Date().toISOString(),
        userId,
      },
      ...prev,
    ]);
  };

  const analytics = React.useMemo(
    () =>
      computeFieldAnalytics({
        tasks,
        checkIns,
        hazards,
        equipment,
        verifications,
      }),
    [tasks, checkIns, hazards, equipment, verifications],
  );

  React.useEffect(() => {
    persistFieldAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const hazard of hazards) {
      if (hazard.risk !== "critical") continue;
      if (notified.current.has(hazard.id)) continue;
      notified.current.add(hazard.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL FIELD HAZARD",
        message: `${hazard.name} at ${hazard.location}: ${hazard.description}`,
        forgeStatus: "failed",
        userId: hazard.userId,
        actionLabel: "Open Field Ops",
      });
    }
  }, [hazards, push]);

  const assignTask = () => {
    if (!taskName.trim() || !taskLocation.trim() || !taskDue) return;
    const id = `ft-${seq.current++}`;
    const dueAt = new Date(taskDue).toISOString();
    const completion = 0;
    const status = taskStatus(dueAt, completion);
    const lat = 39.74 + Math.random() * 0.01;
    const lng = -104.99 + Math.random() * 0.01;
    const now = new Date().toISOString();
    setTasks((prev) => [
      {
        id,
        name: taskName.trim(),
        location: taskLocation.trim(),
        hazards: taskHazards.trim() || "TBD",
        equipment: taskEquipment.trim() || "TBD",
        dueAt,
        status,
        completionPercent: completion,
        lat,
        lng,
        timestamp: now,
        userId: 1,
      },
      ...prev,
    ]);
    setCheckIns((prev) => [
      {
        id: `ci-${seq.current++}`,
        taskId: id,
        location: taskLocation.trim(),
        lat,
        lng,
        status: "due",
        timestamp: now,
        userId: 1,
      },
      ...prev,
    ]);
    pushLog(`Task assigned: ${taskName.trim()}`, taskLocation.trim(), id);
    setSelectedTask(id);
    setTaskName("");
    setTaskLocation("");
    setTaskHazards("");
    setTaskEquipment("");
    setTaskDue("");
  };

  const bumpTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const completionPercent = clamp(task.completionPercent + 15);
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== id
          ? t
          : {
              ...t,
              completionPercent,
              status: taskStatus(t.dueAt, completionPercent),
              timestamp: new Date().toISOString(),
            },
      ),
    );
    pushLog(`Task progress ${completionPercent}%`, task.location, task.id);
  };

  const doCheckIn = () => {
    if (!active) return;
    const now = new Date().toISOString();
    const lat = active.lat + (Math.random() - 0.5) * 0.001;
    const lng = active.lng + (Math.random() - 0.5) * 0.001;
    setCheckIns((prev) => [
      {
        id: `ci-${seq.current++}`,
        taskId: active.id,
        location: active.location,
        lat,
        lng,
        status: "checked_in",
        timestamp: now,
        userId: 1,
      },
      ...prev.map((c) =>
        c.taskId === active.id && c.status === "due"
          ? { ...c, status: "checked_in" as const, timestamp: now }
          : c,
      ),
    ]);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === active.id && t.status === "assigned"
          ? { ...t, status: "in_progress", timestamp: now }
          : t,
      ),
    );
    pushLog(
      `Check-in at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      active.location,
      active.id,
    );
  };

  const raiseHazard = () => {
    if (!hzName.trim() || !hzDesc.trim() || !active) return;
    const id = `fh-${seq.current++}`;
    setHazards((prev) => [
      {
        id,
        taskId: active.id,
        name: hzName.trim(),
        risk: hzRisk,
        location: active.location,
        description: hzDesc.trim(),
        lat: active.lat + (Math.random() - 0.5) * 0.002,
        lng: active.lng + (Math.random() - 0.5) * 0.002,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    pushLog(`Hazard raised: ${hzName.trim()} (${hzRisk})`, active.location, active.id);
    setHzName("");
    setHzDesc("");
  };

  const trackEquipment = () => {
    if (!eqType.trim() || !eqSerial.trim() || !active) return;
    setEquipment((prev) => [
      {
        id: `fe-${seq.current++}`,
        taskId: active.id,
        type: eqType.trim(),
        serial: eqSerial.trim(),
        inspectionStatus: eqStatus,
        usageHours: 1,
        location: active.location,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    pushLog(
      `Equipment tracked: ${eqType.trim()} ${eqSerial.trim()}`,
      active.location,
      active.id,
    );
    setEqType("");
    setEqSerial("");
  };

  const bumpUsage = (id: string) => {
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              usageHours: e.usageHours + 1,
              timestamp: new Date().toISOString(),
            }
          : e,
      ),
    );
  };

  const runForgeCheck = () => {
    if (!active) return;
    const relatedHazards = hazards.filter((h) => h.taskId === active.id);
    const relatedEquip = equipment.filter((e) => e.taskId === active.id);
    const checkedIn = checkIns.some(
      (c) => c.taskId === active.id && c.status === "checked_in",
    );
    const critical = relatedHazards.some((h) => h.risk === "critical");
    const overdueEquip = relatedEquip.some((e) => e.inspectionStatus === "overdue");
    const forgeStatus: ForgeCheckStatus =
      checkedIn && !critical && !overdueEquip && active.completionPercent >= 50
        ? "Pass"
        : !checkedIn || critical || overdueEquip
          ? "Fail"
          : "Pending";
    const notes =
      forgeStatus === "Pass"
        ? "Field conditions verified"
        : forgeStatus === "Fail"
          ? "Failed: check-in, hazard, or equipment issue"
          : "Pending field evidence";
    setVerifications((prev) => [
      {
        id: `fv-${seq.current++}`,
        taskId: active.id,
        forgeStatus,
        notes,
        location: active.location,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    pushLog(`forgeCheck ${forgeStatus} for ${active.name}`, active.location, active.id);
    if (forgeStatus === "Fail") {
      push({
        category: "compliance",
        tone: "critical",
        title: "FIELD FORGECHECK FAILED",
        message: `${active.name} failed field verification at ${active.location}.`,
        forgeStatus: "failed",
        userId: 1,
      });
    }
  };

  const addManualLog = () => {
    if (!logMessage.trim() || !active) return;
    pushLog(logMessage.trim(), active.location, active.id);
    setLogMessage("");
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Field Operations Engine
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Tasks, check-ins, hazards, equipment, forgeCheck, GPS, logs, analytics.
            </p>
          </div>
          <ForgeBoltIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Tasks" value={String(analytics.totalTasks)} />
          <Metric
            label="Overdue"
            value={String(analytics.overdueTasks)}
            critical={analytics.overdueTasks > 0}
          />
          <Metric
            label="Critical Hazards"
            value={String(analytics.criticalHazards)}
            critical={analytics.criticalHazards > 0}
          />
          <Metric
            label="Missed Check-ins"
            value={String(analytics.missedCheckIns)}
            critical={analytics.missedCheckIns > 0}
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <VeriForgeProgressBar label="Task Completion" value={analytics.taskCompletion} />
          <VeriForgeProgressBar label="Field Status Score" value={analytics.fieldStatusScore} />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 1. Field Task Assignment */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Field Task Assignment
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTask(task.id)}
                className={cn(
                  "w-full border px-3 py-2 text-left",
                  selectedTask === task.id
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                    : task.status === "overdue"
                      ? "border-[#1E6FB8] bg-[#1f1f1f] shadow-[0_0_12px_rgba(30, 111, 184,.25)]"
                      : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-[#f0f0f0]">{task.name}</p>
                  <VeriForgeButton
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      bumpTask(task.id);
                    }}
                  >
                    +15%
                  </VeriForgeButton>
                </div>
                <p className="text-xs text-[#aaaaaa]">
                  {task.location} · {task.hazards} · {task.equipment}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  due {task.dueAt.slice(0, 16)} · {task.status} · userId: {task.userId}
                </p>
                <div className="mt-2">
                  <VeriForgeProgressBar label="Completion" value={task.completionPercent} />
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <VeriForgeTextField
              label="Task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <VeriForgeTextField
              label="Location"
              value={taskLocation}
              onChange={(e) => setTaskLocation(e.target.value)}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField
                label="Hazards"
                value={taskHazards}
                onChange={(e) => setTaskHazards(e.target.value)}
              />
              <VeriForgeTextField
                label="Equipment"
                value={taskEquipment}
                onChange={(e) => setTaskEquipment(e.target.value)}
              />
            </div>
            <VeriForgeTextField
              label="Due time"
              type="datetime-local"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={assignTask}>
              Assign Field Task
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 2. Digital Check-Ins */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Digital Check-Ins
          </h3>
          <VeriForgeDivider className="my-3" />
          <button
            type="button"
            onClick={doCheckIn}
            className="mb-3 w-full border border-[#6a6a6a] bg-[linear-gradient(145deg,#2a2a2a_0%,#171717_55%,#2a1717_100%)] px-4 py-4 text-center shadow-[0_0_16px_rgba(30, 111, 184,.25)]"
          >
            <p className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.14em] text-[#FAFAFA]">
              Check In — {active?.name ?? "Task"}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#ffc9c9]">
              Captures timestamp · GPS · userId
            </p>
          </button>
          <div className="space-y-2">
            {checkIns
              .filter((c) => !active || c.taskId === active.id)
              .map((ci) => (
                <div
                  key={ci.id}
                  className={cn(
                    "border px-3 py-2",
                    ci.status === "missed"
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                      : "border-[#424242] bg-[#1f1f1f]",
                  )}
                >
                  <p className="text-sm text-[#f0f0f0]">{ci.status.replaceAll("_", " ")}</p>
                  <p className="text-xs text-[#aaaaaa]">
                    {ci.lat.toFixed(4)}, {ci.lng.toFixed(4)} · {ci.location}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                    {ci.timestamp.slice(0, 19)} · userId: {ci.userId} · taskId: {ci.taskId}
                  </p>
                </div>
              ))}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 3. Hazard Alerts */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3. Hazard Alerts
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {hazards.map((hz) => (
              <div
                key={hz.id}
                className={cn(
                  "border px-3 py-2",
                  hz.risk === "critical" || hz.risk === "high"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{hz.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {hz.risk} · {hz.location} · {hz.description}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField
              label="Hazard name"
              value={hzName}
              onChange={(e) => setHzName(e.target.value)}
            />
            <VeriForgeSelect
              label="Risk"
              value={hzRisk}
              onChange={(e) => setHzRisk(e.target.value as HazardRisk)}
              options={[
                { label: "Critical", value: "critical" },
                { label: "High", value: "high" },
                { label: "Moderate", value: "moderate" },
                { label: "Low", value: "low" },
              ]}
            />
            <VeriForgeTextField
              label="Description"
              value={hzDesc}
              onChange={(e) => setHzDesc(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={raiseHazard}>
              Raise Hazard Alert
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 4. Equipment Usage */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. Equipment Usage Tracking
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {equipment.map((eq) => (
              <div
                key={eq.id}
                className={cn(
                  "flex items-center justify-between gap-2 border px-3 py-2",
                  eq.inspectionStatus === "overdue"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <div>
                  <p className="text-sm text-[#f0f0f0]">
                    {eq.type} · {eq.serial}
                  </p>
                  <p className="text-xs text-[#aaaaaa]">
                    inspection {eq.inspectionStatus} · {eq.usageHours}h · {eq.location}
                  </p>
                </div>
                <VeriForgeButton size="sm" variant="secondary" onClick={() => bumpUsage(eq.id)}>
                  +1h
                </VeriForgeButton>
              </div>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <VeriForgeTextField
              label="Equipment type"
              value={eqType}
              onChange={(e) => setEqType(e.target.value)}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField
                label="Serial"
                value={eqSerial}
                onChange={(e) => setEqSerial(e.target.value)}
              />
              <VeriForgeSelect
                label="Inspection"
                value={eqStatus}
                onChange={(e) => setEqStatus(e.target.value as InspectionStatus)}
                options={[
                  { label: "Current", value: "current" },
                  { label: "Due", value: "due" },
                  { label: "Overdue", value: "overdue" },
                ]}
              />
            </div>
            <VeriForgeButton className="w-full" onClick={trackEquipment}>
              Track Equipment
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 5. Field Verification */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. Field Verification
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <StatusChip status={activeVerify?.forgeStatus ?? "Pending"} />
            <VeriForgeButton onClick={runForgeCheck}>Run forgeCheck</VeriForgeButton>
          </div>
          <div className="space-y-2">
            {verifications
              .filter((v) => !active || v.taskId === active.id)
              .map((v) => (
                <div
                  key={v.id}
                  className={cn(
                    "border px-3 py-2",
                    v.forgeStatus === "Fail"
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                      : "border-[#424242] bg-[#1f1f1f]",
                  )}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <StatusChip status={v.forgeStatus} />
                    <span className="text-xs text-[#aaaaaa]">{v.notes}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                    {v.timestamp.slice(0, 19)} · {v.location} · userId: {v.userId}
                  </p>
                </div>
              ))}
          </div>
        </VeriForgeFrame>

        {/* 6. GPS Location Mapping */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. GPS Location Mapping
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="relative mb-3 h-48 overflow-hidden border border-[#424242] bg-[linear-gradient(160deg,#1f1f1f_0%,#141414_55%,#1a1212_100%)]">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(#424242_1px,transparent_1px),linear-gradient(90deg,#424242_1px,transparent_1px)] [background-size:24px_24px]" />
            {zones.map((z) => (
              <div
                key={z.id}
                className={cn(
                  "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border text-[8px] uppercase",
                  z.tone === "restricted"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.35)] text-[#ffc9c9] shadow-[0_0_14px_rgba(30, 111, 184,.55)]"
                    : z.tone === "active"
                      ? "border-[#1E6FB8] bg-[#2a1a1a] text-[#ffd0d0]"
                      : "border-[#424242] bg-[#2a2a2a] text-[#cfcfcf]",
                )}
                style={{ left: `${z.lat}%`, top: `${z.lng}%` }}
                title={z.name}
              >
                {z.name.slice(0, 2)}
              </div>
            ))}
            <p className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              GPS overlay · red = restricted
            </p>
          </div>
          <div className="space-y-2">
            {routes.map((rt, idx) => (
              <div
                key={rt.id}
                className={cn(
                  "flex items-center gap-2 border-l-2 px-2 py-1",
                  rt.restricted
                    ? "border-l-[#1E6FB8] bg-[rgba(30, 111, 184,.12)]"
                    : "border-l-[#8a8a8a] bg-[#1f1f1f]",
                )}
                style={{ marginLeft: `${idx * 6}px` }}
              >
                <ForgeBoltIcon
                  className={cn("h-3 w-3", rt.restricted ? "text-[#1E6FB8]" : "text-[#9a9a9a]")}
                />
                <div>
                  <p className="text-xs text-[#f0f0f0]">{rt.name}</p>
                  <p className="text-[10px] text-[#aaaaaa]">
                    {rt.fromZone} → {rt.toZone}
                    {rt.restricted ? " · restricted" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 7. Field Logs */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            7. Field Logs
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-[#424242] border-l-[#1E6FB8] bg-[#1f1f1f] px-3 py-2"
                style={{ borderLeftWidth: 3 }}
              >
                <p className="text-sm text-[#f0f0f0]">{log.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  {log.timestamp.slice(0, 19)} · userId: {log.userId} · taskId:{" "}
                  {log.taskId ?? "—"} · {log.location}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <VeriForgeTextField
                label="Log entry"
                value={logMessage}
                onChange={(e) => setLogMessage(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <VeriForgeButton onClick={addManualLog}>Add Log</VeriForgeButton>
            </div>
          </div>
        </VeriForgeFrame>

        {/* 8. Field Analytics */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              8. Field Analytics
            </h3>
            <HeatEdgeIcon className="text-[#1E6FB8]" />
          </div>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeProgressBar label="Task completion" value={analytics.taskCompletion} />
            <div>
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                <span>Hazard frequency</span>
                <span className="text-[#ffc9c9]">{analytics.hazardFrequency}</span>
              </div>
              <div className="h-2 border border-[#424242] bg-[#151515]">
                <div
                  className="h-full bg-[linear-gradient(90deg,#424242_0%,#1E6FB8_100%)]"
                  style={{ width: `${Math.min(100, analytics.hazardFrequency * 15)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                <span>Equipment usage</span>
                <span className="text-[#ffc9c9]">{analytics.equipmentUsageHours}h</span>
              </div>
              <div className="h-2 border border-[#424242] bg-[#151515]">
                <div
                  className="h-full bg-[linear-gradient(90deg,#424242_0%,#1E6FB8_100%)]"
                  style={{
                    width: `${Math.min(100, analytics.equipmentUsageHours)}%`,
                  }}
                />
              </div>
            </div>
            <VeriForgeProgressBar
              label="Verification pass rate"
              value={analytics.verificationPassRate}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <Metric
                label="Overdue inspections"
                value={String(analytics.overdueInspections)}
                critical={analytics.overdueInspections > 0}
              />
              <Metric
                label="Field status"
                value={`${analytics.fieldStatusScore}%`}
                critical={analytics.fieldStatusScore < 60}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
              Synced · {analytics.timestamp.slice(0, 19)} · dashboard + mobile
            </p>
          </div>
        </VeriForgeFrame>
      </div>

      {active ? (
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8f8f8f]">
          Active task metadata · timestamp: {active.timestamp.slice(0, 19)} · userId:{" "}
          {active.userId} · location: {active.location} · GPS: {active.lat.toFixed(4)},{" "}
          {active.lng.toFixed(4)}
        </p>
      ) : null}
      <div className="flex gap-3 text-[#1E6FB8]">
        <AnvilIcon />
        <ForgeBoltIcon />
        <ShieldGridIcon />
      </div>
    </div>
  );
}

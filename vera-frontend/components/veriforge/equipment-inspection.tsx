"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type EquipmentStatus = "active" | "maintenance" | "out_of_service" | "overdue";
export type ScheduleStatus = "scheduled" | "due" | "overdue" | "completed";
export type ChecklistResult = "pass" | "fail" | "na" | "pending";
export type DefectSeverity = "critical" | "major" | "minor";
export type CertStatus = "valid" | "expiring" | "expired";

export type EquipmentLocal = {
  id: string;
  name: string;
  type: string;
  serial: string;
  location: string;
  status: EquipmentStatus;
  nextInspectionAt: string;
  timestamp: string;
  userId: number;
};

export type ScheduleLocal = {
  id: string;
  equipmentId: string;
  title: string;
  dueAt: string;
  status: ScheduleStatus;
  assignee: string;
  timestamp: string;
  userId: number;
};

export type ChecklistItemLocal = {
  id: string;
  label: string;
  result: ChecklistResult;
};

export type InspectionLocal = {
  id: string;
  equipmentId: string;
  title: string;
  checklist: ChecklistItemLocal[];
  score: number;
  completionPercent: number;
  status: "in_progress" | "completed" | "failed";
  maintenanceLinked: boolean;
  timestamp: string;
  userId: number;
};

export type DefectLocal = {
  id: string;
  equipmentId: string;
  inspectionId: string | null;
  defectType: string;
  severity: DefectSeverity;
  description: string;
  photoName: string | null;
  status: "open" | "linked" | "closed";
  timestamp: string;
  userId: number;
};

export type CertLocal = {
  id: string;
  equipmentId: string;
  name: string;
  issuer: string;
  expiresAt: string;
  status: CertStatus;
  timestamp: string;
  userId: number;
};

export type InspectionAnalyticsSnapshot = {
  totalEquipment: number;
  overdueInspections: number;
  averageScore: number;
  averageCompletion: number;
  criticalDefects: number;
  openDefects: number;
  expiredCerts: number;
  maintenanceLinked: number;
  defectFrequency: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.inspection.analytics";

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function certStatus(expiresAt: string): CertStatus {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  if (expires < now) return "expired";
  if (expires < now + 30 * 86400000) return "expiring";
  return "valid";
}

function recalc(inspection: InspectionLocal): InspectionLocal {
  const scored = inspection.checklist.filter((i) => i.result === "pass" || i.result === "fail");
  const passed = scored.filter((i) => i.result === "pass").length;
  const score = scored.length === 0 ? 0 : clamp((passed / scored.length) * 100);
  const done = inspection.checklist.filter((i) => i.result !== "pending").length;
  const completionPercent =
    inspection.checklist.length === 0
      ? 0
      : clamp((done / inspection.checklist.length) * 100);
  return {
    ...inspection,
    score,
    completionPercent,
    status:
      completionPercent >= 100 ? (score < 70 ? "failed" : "completed") : "in_progress",
  };
}

export function computeInspectionAnalytics(input: {
  equipment: EquipmentLocal[];
  schedules: ScheduleLocal[];
  inspections: InspectionLocal[];
  defects: DefectLocal[];
  certifications: CertLocal[];
}): InspectionAnalyticsSnapshot {
  return {
    totalEquipment: input.equipment.length,
    overdueInspections: input.schedules.filter((s) => s.status === "overdue").length,
    averageScore:
      input.inspections.length === 0
        ? 0
        : Math.round(
            input.inspections.reduce((sum, i) => sum + i.score, 0) / input.inspections.length,
          ),
    averageCompletion:
      input.inspections.length === 0
        ? 0
        : Math.round(
            input.inspections.reduce((sum, i) => sum + i.completionPercent, 0) /
              input.inspections.length,
          ),
    criticalDefects: input.defects.filter((d) => d.severity === "critical").length,
    openDefects: input.defects.filter((d) => d.status === "open").length,
    expiredCerts: input.certifications.filter((c) => c.status === "expired").length,
    maintenanceLinked: input.inspections.filter((i) => i.maintenanceLinked).length,
    defectFrequency: input.defects.length,
    timestamp: new Date().toISOString(),
  };
}

export function persistInspectionAnalytics(snapshot: InspectionAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:inspection-analytics", { detail: snapshot }),
  );
}

export function readInspectionAnalytics(): InspectionAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InspectionAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useInspectionAnalyticsSync(
  fallback: InspectionAnalyticsSnapshot = {
    totalEquipment: 2,
    overdueInspections: 1,
    averageScore: 67,
    averageCompletion: 75,
    criticalDefects: 1,
    openDefects: 2,
    expiredCerts: 1,
    maintenanceLinked: 0,
    defectFrequency: 2,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<InspectionAnalyticsSnapshot>(
    () => readInspectionAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as InspectionAnalyticsSnapshot);
      } catch {
        // ignore
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<InspectionAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:inspection-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:inspection-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function seed() {
  const now = new Date().toISOString();
  const inspections: InspectionLocal[] = [
    recalc({
      id: "insp-1",
      equipmentId: "eq-1",
      title: "Crane A monthly",
      checklist: [
        { id: "chk-1", label: "Wire rope condition", result: "fail" },
        { id: "chk-2", label: "Limit switch function", result: "pass" },
        { id: "chk-3", label: "Hook latch integrity", result: "pending" },
        { id: "chk-4", label: "Emergency stop", result: "pass" },
      ],
      score: 0,
      completionPercent: 0,
      status: "in_progress",
      maintenanceLinked: false,
      timestamp: now,
      userId: 1,
    }),
  ];
  return {
    equipment: [
      {
        id: "eq-1",
        name: "Overhead Crane A",
        type: "crane",
        serial: "CRN-4401",
        location: "Bay 4",
        status: "overdue" as const,
        nextInspectionAt: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
      {
        id: "eq-2",
        name: "Hydraulic Press B",
        type: "press",
        serial: "PRS-2208",
        location: "Cell B",
        status: "active" as const,
        nextInspectionAt: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
    ] as EquipmentLocal[],
    schedules: [
      {
        id: "sch-1",
        equipmentId: "eq-1",
        title: "Monthly crane inspection",
        dueAt: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
        status: "overdue" as const,
        assignee: "M. Ortega",
        timestamp: now,
        userId: 1,
      },
      {
        id: "sch-2",
        equipmentId: "eq-2",
        title: "Quarterly press inspection",
        dueAt: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
        status: "scheduled" as const,
        assignee: "S. Kim",
        timestamp: now,
        userId: 1,
      },
    ] as ScheduleLocal[],
    inspections,
    defects: [
      {
        id: "def-1",
        equipmentId: "eq-1",
        inspectionId: "insp-1",
        defectType: "Wire rope fray",
        severity: "critical" as const,
        description: "Visible broken strands on hoist rope near drum.",
        photoName: "crane-rope.jpg",
        status: "open" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "def-2",
        equipmentId: "eq-2",
        inspectionId: null,
        defectType: "Guard misalignment",
        severity: "minor" as const,
        description: "Side guard sits 4mm off datum.",
        photoName: null,
        status: "open" as const,
        timestamp: now,
        userId: 1,
      },
    ] as DefectLocal[],
    certifications: [
      {
        id: "cert-1",
        equipmentId: "eq-1",
        name: "Load Test Certificate",
        issuer: "ForgeCert Labs",
        expiresAt: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
        status: "expired" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "cert-2",
        equipmentId: "eq-2",
        name: "Pressure Vessel Cert",
        issuer: "Alloy Inspect Co",
        expiresAt: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
        status: "valid" as const,
        timestamp: now,
        userId: 1,
      },
    ] as CertLocal[],
  };
}

export function VeriForgeEquipmentInspectionEngine() {
  const { push } = useVeriForgeNotifications();
  const initial = React.useMemo(() => seed(), []);
  const [equipment, setEquipment] = React.useState(initial.equipment);
  const [schedules, setSchedules] = React.useState(initial.schedules);
  const [inspections, setInspections] = React.useState(initial.inspections);
  const [defects, setDefects] = React.useState(initial.defects);
  const [certifications, setCertifications] = React.useState(initial.certifications);
  const [selectedEq, setSelectedEq] = React.useState("eq-1");
  const [selectedInsp, setSelectedInsp] = React.useState("insp-1");
  const notified = React.useRef<Set<string>>(new Set(["def-1", "cert-1"]));
  const seq = React.useRef(30);

  const [eqName, setEqName] = React.useState("");
  const [eqType, setEqType] = React.useState("crane");
  const [eqSerial, setEqSerial] = React.useState("");
  const [eqLocation, setEqLocation] = React.useState("");
  const [schTitle, setSchTitle] = React.useState("");
  const [schDue, setSchDue] = React.useState("");
  const [schAssignee, setSchAssignee] = React.useState("");
  const [defType, setDefType] = React.useState("");
  const [defSeverity, setDefSeverity] = React.useState<DefectSeverity>("major");
  const [defDesc, setDefDesc] = React.useState("");
  const [defPhoto, setDefPhoto] = React.useState("");
  const [certName, setCertName] = React.useState("");
  const [certIssuer, setCertIssuer] = React.useState("");
  const [certExpires, setCertExpires] = React.useState("");

  const selectedEquipment = equipment.find((e) => e.id === selectedEq) ?? equipment[0];
  const activeInspection =
    inspections.find((i) => i.id === selectedInsp) ??
    inspections.find((i) => i.equipmentId === selectedEq) ??
    inspections[0];

  const analytics = React.useMemo(
    () =>
      computeInspectionAnalytics({
        equipment,
        schedules,
        inspections,
        defects,
        certifications,
      }),
    [equipment, schedules, inspections, defects, certifications],
  );

  React.useEffect(() => {
    persistInspectionAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const defect of defects) {
      if (defect.severity !== "critical") continue;
      if (notified.current.has(defect.id)) continue;
      notified.current.add(defect.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL DEFECT",
        message: `${defect.defectType}: ${defect.description}`,
        forgeStatus: "failed",
        userId: defect.userId,
        actionLabel: "Open Inspections",
      });
    }
    for (const cert of certifications) {
      const status = certStatus(cert.expiresAt);
      if (status !== "expired") continue;
      if (notified.current.has(cert.id)) continue;
      notified.current.add(cert.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CERTIFICATION EXPIRED",
        message: `${cert.name} expired.`,
        forgeStatus: "failed",
        userId: cert.userId,
      });
    }
  }, [defects, certifications, push]);

  const registerEquipment = () => {
    if (!eqName.trim() || !eqSerial.trim() || !eqLocation.trim()) return;
    const id = `eq-${seq.current++}`;
    setEquipment((prev) => [
      {
        id,
        name: eqName.trim(),
        type: eqType,
        serial: eqSerial.trim(),
        location: eqLocation.trim(),
        status: "active",
        nextInspectionAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setSelectedEq(id);
    setEqName("");
    setEqSerial("");
    setEqLocation("");
  };

  const scheduleInspection = () => {
    if (!selectedEquipment || !schTitle.trim() || !schDue) return;
    const overdue = new Date(schDue).getTime() < Date.now();
    setSchedules((prev) => [
      {
        id: `sch-${seq.current++}`,
        equipmentId: selectedEquipment.id,
        title: schTitle.trim(),
        dueAt: schDue,
        status: overdue ? "overdue" : "scheduled",
        assignee: schAssignee.trim() || "Inspector",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    if (overdue) {
      setEquipment((prev) =>
        prev.map((e) =>
          e.id === selectedEquipment.id ? { ...e, status: "overdue" } : e,
        ),
      );
    }
    setSchTitle("");
    setSchDue("");
    setSchAssignee("");
  };

  const startInspection = () => {
    if (!selectedEquipment) return;
    const id = `insp-${seq.current++}`;
    const inspection = recalc({
      id,
      equipmentId: selectedEquipment.id,
      title: `${selectedEquipment.name} inspection`,
      checklist: [
        { id: `chk-${seq.current++}`, label: "Structural integrity", result: "pending" },
        { id: `chk-${seq.current++}`, label: "Safety devices", result: "pending" },
        { id: `chk-${seq.current++}`, label: "Guarding", result: "pending" },
        { id: `chk-${seq.current++}`, label: "Controls & E-stop", result: "pending" },
      ],
      score: 0,
      completionPercent: 0,
      status: "in_progress",
      maintenanceLinked: false,
      timestamp: new Date().toISOString(),
      userId: 1,
    });
    setInspections((prev) => [inspection, ...prev]);
    setSelectedInsp(id);
  };

  const setCheckResult = (itemId: string, result: ChecklistResult) => {
    if (!activeInspection) return;
    setInspections((prev) =>
      prev.map((insp) =>
        insp.id === activeInspection.id
          ? recalc({
              ...insp,
              checklist: insp.checklist.map((row) =>
                row.id === itemId ? { ...row, result } : row,
              ),
            })
          : insp,
      ),
    );
  };

  const reportDefect = () => {
    if (!selectedEquipment || !defType.trim() || !defDesc.trim()) return;
    const id = `def-${seq.current++}`;
    setDefects((prev) => [
      {
        id,
        equipmentId: selectedEquipment.id,
        inspectionId: activeInspection?.id ?? null,
        defectType: defType.trim(),
        severity: defSeverity,
        description: defDesc.trim(),
        photoName: defPhoto.trim() || null,
        status: "open",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setDefType("");
    setDefDesc("");
    setDefPhoto("");
  };

  const addCert = () => {
    if (!selectedEquipment || !certName.trim() || !certExpires) return;
    setCertifications((prev) => [
      {
        id: `cert-${seq.current++}`,
        equipmentId: selectedEquipment.id,
        name: certName.trim(),
        issuer: certIssuer.trim() || "Cert Body",
        expiresAt: certExpires,
        status: certStatus(certExpires),
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setCertName("");
    setCertIssuer("");
    setCertExpires("");
  };

  const linkMaintenance = () => {
    if (!activeInspection) return;
    setInspections((prev) =>
      prev.map((i) =>
        i.id === activeInspection.id ? { ...i, maintenanceLinked: true } : i,
      ),
    );
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === activeInspection.equipmentId ? { ...e, status: "maintenance" } : e,
      ),
    );
    setDefects((prev) =>
      prev.map((d) =>
        d.inspectionId === activeInspection.id && d.status === "open"
          ? { ...d, status: "linked" }
          : d,
      ),
    );
  };

  const calendarDays = React.useMemo(() => {
    const days: Array<{ date: string; overdue: boolean; count: number }> = [];
    const start = new Date();
    start.setDate(start.getDate() - 3);
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const matches = schedules.filter((s) => s.dueAt === key);
      days.push({
        date: key,
        overdue: matches.some((m) => m.status === "overdue") || d.getTime() < Date.now() - 86400000,
        count: matches.length,
      });
    }
    return days;
  }, [schedules]);

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Equipment Inspection Engine
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Registry, schedules, checklists, defects, certifications, scoring, and maintenance.
            </p>
          </div>
          <AnvilIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Equipment" value={String(analytics.totalEquipment)} />
          <Metric
            label="Overdue"
            value={String(analytics.overdueInspections)}
            critical={analytics.overdueInspections > 0}
          />
          <Metric
            label="Critical Defects"
            value={String(analytics.criticalDefects)}
            critical={analytics.criticalDefects > 0}
          />
          <Metric
            label="Expired Certs"
            value={String(analytics.expiredCerts)}
            critical={analytics.expiredCerts > 0}
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <VeriForgeProgressBar label="Avg Inspection Score" value={analytics.averageScore} />
          <VeriForgeProgressBar label="Avg Completion" value={analytics.averageCompletion} />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 1. Equipment Registry */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Equipment Registry
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {equipment.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedEq(item.id)}
                className={cn(
                  "w-full border px-3 py-2 text-left",
                  selectedEq === item.id
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                    : item.status === "overdue"
                      ? "border-[#1E6FB8] bg-[#1f1f1f] shadow-[0_0_12px_rgba(30, 111, 184,.25)]"
                      : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{item.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {item.type} · {item.serial} · {item.location} · {item.status}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  next: {item.nextInspectionAt} · equipmentId: {item.id}
                </p>
              </button>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <VeriForgeTextField label="Name" value={eqName} onChange={(e) => setEqName(e.target.value)} />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeSelect
                label="Type"
                value={eqType}
                onChange={(e) => setEqType(e.target.value)}
                options={[
                  { label: "Crane", value: "crane" },
                  { label: "Press", value: "press" },
                  { label: "Vehicle", value: "vehicle" },
                  { label: "Tooling", value: "tooling" },
                ]}
              />
              <VeriForgeTextField label="Serial" value={eqSerial} onChange={(e) => setEqSerial(e.target.value)} />
            </div>
            <VeriForgeTextField label="Location" value={eqLocation} onChange={(e) => setEqLocation(e.target.value)} />
            <VeriForgeButton className="w-full" onClick={registerEquipment}>
              Register Equipment
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 2. Inspection Scheduling */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Inspection Scheduling
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 grid grid-cols-7 gap-1 border border-[#424242] bg-[#151515] p-2">
            {calendarDays.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "border px-1 py-2 text-center",
                  day.count > 0 && day.overdue
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)]"
                    : day.count > 0
                      ? "border-[#1E6FB8] bg-[#1f1f1f]"
                      : "border-[#424242] bg-[#1A1A1A]",
                )}
              >
                <p className="text-[9px] text-[#9f9f9f]">{day.date.slice(8)}</p>
                <p className="text-[10px] text-[#FAFAFA]">{day.count || "·"}</p>
              </div>
            ))}
          </div>
          <div className="mb-3 space-y-2">
            {schedules.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "border px-3 py-2",
                  item.status === "overdue"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{item.title}</p>
                <p className="text-xs text-[#aaaaaa]">
                  due {item.dueAt} · {item.assignee} · {item.status}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Title" value={schTitle} onChange={(e) => setSchTitle(e.target.value)} />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField label="Due" type="date" value={schDue} onChange={(e) => setSchDue(e.target.value)} />
              <VeriForgeTextField label="Assignee" value={schAssignee} onChange={(e) => setSchAssignee(e.target.value)} />
            </div>
            <VeriForgeButton className="w-full" onClick={scheduleInspection}>
              Schedule For Selected Equipment
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 3. Digital Checklists + 6 Scoring */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              3. Digital Checklists · 6. Scoring
            </h3>
            <div className="flex gap-2">
              <VeriForgeButton size="sm" variant="secondary" onClick={startInspection}>
                Start Inspection
              </VeriForgeButton>
              <VeriForgeButton size="sm" onClick={linkMaintenance}>
                Link Maintenance
              </VeriForgeButton>
            </div>
          </div>
          {activeInspection ? (
            <>
              <div
                className={cn(
                  "mb-3 border p-3",
                  activeInspection.score < 70
                    ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a1717_0%,#171717_100%)] shadow-[0_0_14px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{activeInspection.title}</p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  timestamp: {activeInspection.timestamp.slice(0, 19)} · userId:{" "}
                  {activeInspection.userId} · equipmentId: {activeInspection.equipmentId}
                </p>
                <div className="mt-2">
                  <VeriForgeProgressBar label="Completion" value={activeInspection.completionPercent} />
                </div>
                <div className="mt-2">
                  <VeriForgeProgressBar label="Inspection Score" value={activeInspection.score} />
                </div>
                {activeInspection.maintenanceLinked ? (
                  <p className="mt-2 text-xs text-[#b8e0b8]">Linked to maintenance work order.</p>
                ) : null}
              </div>
              <div className="space-y-2">
                {activeInspection.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "border px-3 py-2",
                      item.result === "fail"
                        ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                        : item.result === "pass"
                          ? "border-[#424242] bg-[#1f1f1f]"
                          : "border-[#424242] bg-[#181818]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-[#f0f0f0]">{item.label}</p>
                      <div className="flex gap-1">
                        {(["pass", "fail", "na"] as ChecklistResult[]).map((result) => (
                          <button
                            key={result}
                            type="button"
                            onClick={() => setCheckResult(item.id, result)}
                            className={cn(
                              "border px-2 py-0.5 text-[9px] uppercase",
                              item.result === result
                                ? result === "fail"
                                  ? "border-[#1E6FB8] text-[#ffc9c9]"
                                  : "border-[#4a654a] text-[#b8e0b8]"
                                : "border-[#424242] text-[#8f8f8f]",
                            )}
                          >
                            {result}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#b8b8b8]">Start an inspection to load the checklist.</p>
          )}
        </VeriForgeFrame>

        {/* 4. Defect Reporting */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <HeatEdgeIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              4. Defect Reporting
            </h3>
          </div>
          <div className="mb-3 space-y-2">
            {defects.map((defect) => (
              <div
                key={defect.id}
                className={cn(
                  "border px-3 py-2",
                  defect.severity === "critical"
                    ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a1717_0%,#1a1010_100%)] shadow-[0_0_14px_rgba(30, 111, 184,.35)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{defect.defectType}</p>
                    <p className="text-xs text-[#aaaaaa]">
                      {defect.severity} · {defect.status}
                      {defect.photoName ? ` · ${defect.photoName}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-[#d0d0d0]">{defect.description}</p>
                  </div>
                  <span
                    className={cn(
                      "border px-2 py-0.5 text-[10px] uppercase",
                      defect.severity === "critical"
                        ? "border-[#1E6FB8] text-[#ffc9c9]"
                        : "border-[#424242] text-[#d0d0d0]",
                    )}
                  >
                    {defect.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <VeriForgeTextField label="Defect Type" value={defType} onChange={(e) => setDefType(e.target.value)} />
            <VeriForgeSelect
              label="Severity"
              value={defSeverity}
              onChange={(e) => setDefSeverity(e.target.value as DefectSeverity)}
              options={[
                { label: "Critical", value: "critical" },
                { label: "Major", value: "major" },
                { label: "Minor", value: "minor" },
              ]}
            />
            <VeriForgeTextField label="Description" value={defDesc} onChange={(e) => setDefDesc(e.target.value)} />
            <VeriForgeTextField
              label="Photo Upload"
              value={defPhoto}
              onChange={(e) => setDefPhoto(e.target.value)}
              placeholder="defect-photo.jpg"
            />
            <VeriForgeButton className="w-full" onClick={reportDefect}>
              Report Defect
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 5. Certification Tracking */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldGridIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              5. Certification Tracking
            </h3>
          </div>
          <div className="mb-3 space-y-2">
            {certifications.map((cert) => {
              const status = certStatus(cert.expiresAt);
              return (
                <div
                  key={cert.id}
                  className={cn(
                    "border bg-[linear-gradient(145deg,#222_0%,#171717_100%)] px-3 py-2",
                    status === "expired"
                      ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                      : "border-[#424242]",
                  )}
                >
                  <div className="mb-2 h-0.5 w-16 bg-[#1E6FB8]" />
                  <p className="text-sm text-[#f0f0f0]">{cert.name}</p>
                  <p className="text-xs text-[#aaaaaa]">
                    {cert.issuer} · expires {cert.expiresAt} · {status}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Certificate" value={certName} onChange={(e) => setCertName(e.target.value)} />
            <VeriForgeTextField label="Issuer" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} />
            <VeriForgeTextField
              label="Expires"
              type="date"
              value={certExpires}
              onChange={(e) => setCertExpires(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={addCert}>
              Add Certification
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 7. Analytics */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ForgeBoltIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              7. Inspection Analytics
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Defect Frequency", value: Math.min(100, analytics.defectFrequency * 25) },
              { label: "Inspection Completion", value: analytics.averageCompletion },
              {
                label: "Certification Health",
                value: clamp(
                  100 -
                    (analytics.expiredCerts / Math.max(certifications.length, 1)) * 100,
                ),
              },
              { label: "Avg Score", value: analytics.averageScore },
            ].map((row) => (
              <div
                key={row.label}
                className={cn(
                  "border bg-[#1f1f1f] p-3",
                  row.value < 60 ? "border-[#1E6FB8]" : "border-[#424242]",
                )}
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">
                  {row.label}
                </p>
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
            Open defects: {analytics.openDefects} · Maintenance linked:{" "}
            {analytics.maintenanceLinked}. Scores sync to dashboard and mobile.
          </p>
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

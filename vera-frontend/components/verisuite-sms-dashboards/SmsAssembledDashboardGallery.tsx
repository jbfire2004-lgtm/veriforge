"use client";

import { useMemo, useState, type ReactNode } from "react";
import { VS_COLORS, VS_DESIGN_LOCK } from "@/lib/verisuite-intelligence-ui/tokens";
import "@/lib/verisuite-intelligence-ui/tokens.css";
import {
  ActionManagementDashboardAssembled,
  CompetencyDashboardAssembled,
  ErpAiGeneratorDashboard,
  FlhaHazardIntelligenceDashboard,
  HomeDashboardAssembled,
  IncidentsDashboardAssembled,
  InspectionsDashboardAssembled,
  JhaSmartBuilderDashboard,
  SafetyMeetingsDashboardAssembled,
} from "./AssembledDashboards";

export type AssembledDashId =
  | "home"
  | "flha"
  | "jha"
  | "erp"
  | "inspections"
  | "incidents"
  | "meetings"
  | "actions"
  | "competency";

const DASHES: Array<{ id: AssembledDashId; label: string; module: string }> = [
  { id: "home", label: "VeriPM Homepage", module: "VeriPM" },
  { id: "flha", label: "FLHA Hazard Intel", module: "VeriPM" },
  { id: "jha", label: "JHA Smart Builder", module: "VeriPM" },
  { id: "erp", label: "ERP AI Generator", module: "VeriPM" },
  { id: "inspections", label: "Inspections / BBO / Focus", module: "VeriPM" },
  { id: "incidents", label: "Incidents + Investigation", module: "VeriPM" },
  { id: "meetings", label: "Meetings + Smart Topics", module: "VeriPM" },
  { id: "actions", label: "Corrective Action Mgmt", module: "VeriPM" },
  { id: "competency", label: "VeriCore Competency", module: "VeriCore" },
];

const MAP: Record<AssembledDashId, () => ReactNode> = {
  home: () => <HomeDashboardAssembled />,
  flha: () => <FlhaHazardIntelligenceDashboard />,
  jha: () => <JhaSmartBuilderDashboard />,
  erp: () => <ErpAiGeneratorDashboard />,
  inspections: () => <InspectionsDashboardAssembled />,
  incidents: () => <IncidentsDashboardAssembled />,
  meetings: () => <SafetyMeetingsDashboardAssembled />,
  actions: () => <ActionManagementDashboardAssembled />,
  competency: () => <CompetencyDashboardAssembled />,
};

export function SmsAssembledDashboardGallery() {
  const [id, setId] = useState<AssembledDashId>("home");
  const [viewport, setViewport] = useState<"desktop" | "tablet">("desktop");
  const active = useMemo(() => DASHES.find((d) => d.id === id), [id]);

  return (
    <div className="vs-gallery-root" style={{ minHeight: "100vh", background: VS_COLORS.navy }}>
      <div
        className="sticky top-0 z-20 border-b px-4 py-3"
        style={{ background: VS_COLORS.navy, borderColor: VS_COLORS.border }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <div className="mr-2">
            <p className="vs-eyebrow">VeriSuite · Assembled dashboards</p>
            <p className="text-sm font-semibold" style={{ color: VS_COLORS.white }}>
              Step 1 components · {VS_DESIGN_LOCK.version}
            </p>
          </div>
          <div className="flex gap-1">
            {(["desktop", "tablet"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className="rounded px-2.5 py-1 text-[11px] font-semibold uppercase"
                style={{
                  background: viewport === v ? VS_COLORS.blue : VS_COLORS.slate,
                  color: viewport === v ? VS_COLORS.navy : VS_COLORS.muted,
                  border: `1px solid ${VS_COLORS.border}`,
                }}
                onClick={() => setViewport(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="ml-auto text-[11px]" style={{ color: VS_COLORS.muted }}>
            {active?.module} · {active?.label}
          </p>
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl gap-1 overflow-x-auto pb-1">
          {DASHES.map((d) => (
            <button
              key={d.id}
              type="button"
              className="shrink-0 rounded px-2.5 py-1.5 text-[11px] font-semibold"
              style={{
                background: id === d.id ? VS_COLORS.blue : VS_COLORS.slate,
                color: id === d.id ? VS_COLORS.navy : VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              onClick={() => setId(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="mx-auto transition-all duration-300"
        style={{
          maxWidth: viewport === "desktop" ? "72rem" : "48rem",
          padding: viewport === "tablet" ? "1rem" : undefined,
        }}
      >
        <div
          className={viewport === "tablet" ? "overflow-hidden rounded border" : undefined}
          style={
            viewport === "tablet"
              ? { borderColor: VS_COLORS.border, boxShadow: "0 0 0 8px #0a1520" }
              : undefined
          }
        >
          {MAP[id]()}
        </div>
      </div>
    </div>
  );
}

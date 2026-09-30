"use client";

/**
 * VeriSuite SMS Upgrade — pixel-perfect interactive mockup gallery.
 * Uses live VeriSuite intelligence components + tokens for fidelity.
 */

import { useMemo, useState, type ReactNode } from "react";
import {
  ActionAgingHistogram,
  AiInsightPanel,
  BubbleChart,
  ComparisonPanel,
  ErpScenarioCards,
  FlhaEnergyWheel,
  InsightStrip,
  InspectionGrid,
  InspectionTrendCard,
  JhaHazardBlocks,
  KpiTile,
  LeadingHeatmap,
  MeetingTopicCards,
  RegionalMapPanel,
  RiskGauge,
  RootCauseActionFlow,
  SeverityBars,
  TrendPanel,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS, VS_DESIGN_LOCK } from "@/lib/verisuite-intelligence-ui/tokens";
import "@/lib/verisuite-intelligence-ui/tokens.css";
import { VeriSuiteUiKitHandoff } from "@/components/verisuite-sms-mockups/VeriSuiteUiKitHandoff";

export type MockScreenId =
  | "ui-kit"
  | "components"
  | "home"
  | "flha"
  | "jha"
  | "erp"
  | "inspections"
  | "incidents"
  | "meetings"
  | "actions"
  | "competency"
  | "cross"
  | "regional"
  | "insights";

const SCREENS: Array<{ id: MockScreenId; label: string; module: string }> = [
  { id: "ui-kit", label: "UI Kit (FINAL)", module: "Handoff" },
  { id: "components", label: "Component library", module: "System" },
  { id: "home", label: "VeriPM Home", module: "VeriPM" },
  { id: "flha", label: "FLHA Hazard Intel", module: "VeriPM" },
  { id: "jha", label: "JHA Template + Builder", module: "VeriPM" },
  { id: "erp", label: "Emergency ERP AI", module: "VeriPM" },
  { id: "inspections", label: "Inspections / BBO", module: "VeriPM" },
  { id: "incidents", label: "Incidents + Helper", module: "VeriPM" },
  { id: "meetings", label: "Safety Meetings", module: "VeriPM" },
  { id: "actions", label: "Action Management", module: "VeriPM" },
  { id: "competency", label: "VeriCore Competency", module: "VeriCore" },
  { id: "cross", label: "Cross-page AI", module: "Shared" },
  { id: "regional", label: "Regional drilldown", module: "Shared" },
  { id: "insights", label: "Smart insights", module: "Shared" },
];

const TREND = [1.8, 1.7, 1.9, 1.6, 1.5, 1.55, 1.4, 1.35, 1.42, 1.3, 1.28, 1.22];
const TREND_PTS = TREND.map((value, i) => ({
  period: `M${i + 1}`,
  value,
}));

function heatGrid(
  rowLabels: string[],
  colLabels: string[],
  seed = 1,
): {
  rows: string[];
  cols: string[];
  cells: Array<{ row: string; col: string; value: number; intensity: number }>;
} {
  const cells = rowLabels.flatMap((row, ri) =>
    colLabels.map((col, ci) => {
      const value = 40 + ((ri * 7 + ci * 11 + seed * 3) % 55);
      return {
        row,
        col,
        value,
        intensity: value / 100,
      };
    }),
  );
  return { rows: rowLabels, cols: colLabels, cells };
}

const LEADING_HEAT = heatGrid(
  ["FLHA", "Meetings", "BBO", "Actions", "Competency", "ERP"],
  ["W1", "W2", "W3", "W4"],
  2,
);

const COMPETENCY_HEAT = heatGrid(
  ["Ironworkers", "Electricians", "Operators", "Riggers", "Supervisors", "Apprentices"],
  ["Core", "Task", "Auth", "Medical"],
  5,
);

const AGING_BINS = [
  { bucket: "0–7d", corrective: 4, preventive: 2 },
  { bucket: "8–14d", corrective: 3, preventive: 2 },
  { bucket: "15–30d", corrective: 2, preventive: 2 },
  { bucket: "30d+", corrective: 2, preventive: 1 },
];

function MockChrome({
  title,
  eyebrow,
  description,
  actions,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <VsDashboardShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      meta="Mockup · VeriSuite SMS upgrade · pixel fidelity"
    >
      {actions ? <VsSection band="controls">{actions}</VsSection> : null}
      {children}
    </VsDashboardShell>
  );
}

function PrimaryBtn({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="vs-btn vs-btn-primary">
      {children}
    </button>
  );
}

function GhostBtn({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="vs-btn">
      {children}
    </button>
  );
}

function DangerBtn({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="vs-btn"
      style={{
        background: VS_COLORS.critical,
        borderColor: VS_COLORS.critical,
        color: VS_COLORS.white,
      }}
    >
      {children}
    </button>
  );
}

function ComponentsMock() {
  return (
    <MockChrome
      eyebrow="VeriSuite · Design system"
      title="Component library"
      description="KPI tiles, insight strips, gauges, trends, heatmaps, Sankey flows, regional drilldown, and smart insights — dark industrial language."
    >
      <VsSection band="kpi" label="KPI tiles">
        <KpiTile label="Incident rate /200k" value={1.22} delta={-0.14} tone="positive" sparkline={TREND} />
        <KpiTile label="Open actions" value={18} tone="caution" />
        <KpiTile label="Drill readiness" value={78} unit="%" tone="info" />
        <KpiTile label="SIF potential" value={3} tone="critical" />
      </VsSection>

      <InsightStrip
        chips={[
          { id: "1", label: "Scope", value: "Project", tone: "info" },
          { id: "2", label: "Quality", value: "86", tone: "positive" },
          { id: "3", label: "Aging", value: "4 overdue", tone: "caution" },
          { id: "4", label: "EMS", value: "5 contacts", tone: "neutral" },
        ]}
      />

      <VsSection band="trend" label="Trends · gauge · severity">
        <TrendPanel title="Incident rate /200k hrs" series={TREND_PTS} rangeLabel="12 mo" />
        <RiskGauge label="Risk index" score={62} band="Elevated" />
      </VsSection>

      <VsSection band="detail" label="Heatmap · bars · flow">
        <LeadingHeatmap
          title="Leading indicators"
          rows={LEADING_HEAT.rows}
          cols={LEADING_HEAT.cols}
          cells={LEADING_HEAT.cells}
        />
        <SeverityBars
          title="Severity mix"
          segments={[
            { label: "FA (12)", share: 12, color: VS_COLORS.emerald },
            { label: "MA (7)", share: 7, color: VS_COLORS.blue },
            { label: "LT (3)", share: 3, color: VS_COLORS.orange },
            { label: "Fatality (0)", share: 0.2, color: VS_COLORS.critical },
          ]}
        />
      </VsSection>

      <VsSection band="detail" label="Sankey · aging · bubble · inspection">
        <RootCauseActionFlow
          title="Root cause → actions"
          flows={[
            {
              rootCauseLabel: "Guarding / LOTO",
              correctiveCount: 5,
              preventiveCount: 3,
              avgEffectiveness: 72,
            },
            {
              rootCauseLabel: "Exclusion zones",
              correctiveCount: 3,
              preventiveCount: 4,
              avgEffectiveness: 68,
            },
            {
              rootCauseLabel: "Housekeeping",
              correctiveCount: 4,
              preventiveCount: 2,
              avgEffectiveness: 81,
            },
          ]}
        />
        <div className="space-y-3">
          <BubbleChart
            title="Hazard frequency × severity"
            points={[
              { id: "1", label: "Fall", x: 12, y: 78, r: 40, tone: "critical" },
              { id: "2", label: "Struck-by", x: 18, y: 55, r: 28, tone: "caution" },
              { id: "3", label: "Electrical", x: 6, y: 82, r: 22, tone: "critical" },
              { id: "4", label: "Ergo", x: 22, y: 35, r: 18, tone: "info" },
            ]}
          />
          <ActionAgingHistogram title="Action aging" bins={AGING_BINS} />
          <InspectionTrendCard
            title="BBO quality"
            completionPct={84}
            ratePer200k={1.1}
            aiFlagged={3}
            period="Current period"
          />
        </div>
      </VsSection>

      <VsSection band="narrative" label="Insights · comparison">
        <AiInsightPanel
          title="Smart insights"
          items={[
            {
              id: "i1",
              tone: "caution",
              headline: "Exclusion-zone near misses clustering",
              body: "Three events in lift corridor B — queue inspection focus and ERP muster drill.",
              confidence: 0.86,
            },
            {
              id: "i2",
              tone: "positive",
              headline: "Rate below industry",
              body: "Project rate 1.22 vs industry 1.85 /200k hrs.",
              confidence: 0.9,
            },
          ]}
        />
        <ComparisonPanel
          title="vs industry"
          mode="entity-vs-industry"
          rows={[
            { label: "Incident rate", left: 1.22, right: 1.85, unit: "/200k" },
            { label: "Near miss rate", left: 3.1, right: 4.2, unit: "/200k" },
            { label: "LTIFR", left: 0.38, right: 0.55 },
          ]}
        />
      </VsSection>

      <VsSection band="detail" label="Domain blocks · grid · topics · ERP · JHA · Energy">
        <InspectionGrid
          title="Inspection grid"
          rows={[
            {
              id: "1",
              date: "2026-07-14",
              type: "bbo",
              location: "Fab bay",
              findingsOpen: 2,
              qualityScore: 84,
              status: "complete",
            },
            {
              id: "2",
              date: "2026-07-12",
              type: "focus",
              location: "Lift corridor",
              findingsOpen: 5,
              qualityScore: 71,
              status: "in_review",
            },
          ]}
        />
        <MeetingTopicCards
          topics={[
            {
              id: "t1",
              title: "Machine guarding & LOTO jam clears",
              rationale: "From incident pattern",
              sourceModule: "incidents",
              confidence: 0.86,
            },
            {
              id: "t2",
              title: "Lift exclusion zones — corridor B",
              sourceModule: "near_miss",
              confidence: 0.81,
            },
          ]}
        />
      </VsSection>

      <VsSection band="detail" label="ERP · JHA · FLHA Energy Wheel">
        <ErpScenarioCards
          items={[
            {
              id: "e1",
              title: "Fall from height — structural",
              scenario: "fall",
              regionCode: "CA-AB",
              qualityScore: 86,
              drillReadinessPct: 72,
              status: "active",
              selected: true,
            },
            {
              id: "e2",
              title: "Electrical contact",
              scenario: "electrical",
              regionCode: "CA-AB",
              qualityScore: 79,
              drillReadinessPct: 60,
              status: "draft",
            },
          ]}
        />
        <div className="space-y-3">
          <JhaHazardBlocks
            hazards={[
              {
                id: "h1",
                label: "Fall from height",
                severity: "critical",
                energyTypes: ["Gravity"],
                controls: ["100% tie-off", "Guardrails"],
                ppe: ["Harness", "Hard hat"],
                source: "ai",
                confidence: 0.9,
                selected: true,
              },
              {
                id: "h2",
                label: "Struck-by suspended load",
                severity: "elevated",
                energyTypes: ["Motion", "Mechanical"],
                controls: ["Exclusion zone", "Spotter"],
                ppe: ["Hi-vis"],
                source: "template",
                confidence: 0.85,
              },
            ]}
          />
          <FlhaEnergyWheel
            compact
            energies={[
              { key: "gravity", label: "Gravity", score: 92 },
              { key: "motion", label: "Motion", score: 78 },
              { key: "mechanical", label: "Mechanical", score: 65 },
              { key: "electrical", label: "Electrical", score: 88 },
              { key: "pressure", label: "Pressure", score: 54, flagged: true },
              { key: "chemical", label: "Chemical", score: 71 },
            ]}
          />
        </div>
      </VsSection>
    </MockChrome>
  );
}

function HomeMock() {
  return (
    <MockChrome
      eyebrow="VeriPM · Home"
      title="Safety Intelligence Hub"
      description="Cross-module KPIs, leading indicators, predictive signals, and deep links into incidents, FLHA, inspections, and Action Management."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn>Open incidents</PrimaryBtn>
          <GhostBtn>Run ERP drill</GhostBtn>
          <GhostBtn>New FLHA</GhostBtn>
        </div>
      }
    >
      <InsightStrip
        chips={[
          { id: "r", label: "Rate /200k", value: "1.22", tone: "positive" },
          { id: "o", label: "Open incidents", value: "7", tone: "caution" },
          { id: "a", label: "Open actions", value: "18", tone: "info" },
          { id: "d", label: "Drill readiness", value: "78%", tone: "caution" },
        ]}
      />
      <VsSection band="kpi" label="Portfolio KPIs">
        <KpiTile label="Incident rate /200k" value={1.22} delta={-0.14} tone="positive" sparkline={TREND} />
        <KpiTile label="Near misses" value={24} delta={2} tone="caution" sparkline={[18, 20, 19, 22, 21, 24]} />
        <KpiTile label="Inspection findings" value={41} tone="info" />
        <KpiTile label="Training overdue" value={6} tone="critical" />
      </VsSection>
      <VsSection band="trend" label="Trends · leading heatmap">
        <TrendPanel title="Incident rate trajectory" series={TREND_PTS} rangeLabel="12 mo" />
        <LeadingHeatmap
          title="Leading indicator heat"
          rows={LEADING_HEAT.rows}
          cols={LEADING_HEAT.cols}
          cells={LEADING_HEAT.cells}
        />
      </VsSection>
      <VsSection band="narrative" label="Cross-page intelligence">
        <AiInsightPanel
          title="Hub insights"
          items={[
            {
              id: "h1",
              tone: "alert",
              headline: "ERP drill overdue · muster accountability gap",
              body: "Link site logs + toolbox sign-ins before next high-risk lift window.",
              confidence: 0.88,
              href: "/pm/emergency-response",
              hrefLabel: "Open Emergency Response →",
            },
            {
              id: "h2",
              tone: "caution",
              headline: "JHA → FLHA energy mismatch on Crew B",
              body: "Mechanical + gravity energies under-controlled on temporary access tasks.",
              confidence: 0.83,
              href: "/pm/jha-flha",
              hrefLabel: "Open JHA / FLHA →",
            },
          ]}
        />
        <ComparisonPanel
          title="vs industry"
          mode="entity-vs-industry"
          rows={[
            { label: "Incident rate", left: 1.22, right: 1.85, unit: "/200k" },
            { label: "Near miss rate", left: 3.1, right: 4.2, unit: "/200k" },
            { label: "LTIFR", left: 0.38, right: 0.55 },
          ]}
        />
      </VsSection>
    </MockChrome>
  );
}

function FlhaMock() {
  return (
    <MockChrome
      eyebrow="VeriPM · JHA / FLHA"
      title="FLHA Hazard Intelligence"
      description="Energy Wheel coverage, AI reviewer scoring, quality trends, and crew sign-in linkage."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn>New FLHA</PrimaryBtn>
          <GhostBtn>AI review queue</GhostBtn>
        </div>
      }
    >
      <VsSection band="kpi" label="FLHA quality">
        <KpiTile label="Avg quality" value={84} unit="/100" tone="positive" />
        <KpiTile label="Energy coverage" value={76} unit="%" tone="caution" />
        <KpiTile label="AI flags open" value={5} tone="critical" />
        <KpiTile label="Signed crews today" value={11} tone="info" />
      </VsSection>
      <VsSection band="detail" label="Energy Wheel · AI reviewer">
        <FlhaEnergyWheel
          energies={[
            { key: "gravity", label: "Gravity", score: 92 },
            { key: "motion", label: "Motion", score: 78 },
            { key: "mechanical", label: "Mechanical", score: 65 },
            { key: "electrical", label: "Electrical", score: 88 },
            { key: "pressure", label: "Pressure", score: 54, flagged: true },
            { key: "chemical", label: "Chemical", score: 71 },
          ]}
        />
        <AiInsightPanel
          title="AI FLHA reviewer"
          items={[
            {
              id: "f1",
              tone: "alert",
              headline: "Pressure energy understated",
              body: "Pneumatic line work listed without isolation step — align to JHA v3.",
              confidence: 0.91,
            },
            {
              id: "f2",
              tone: "caution",
              headline: "Sign-in incomplete vs gate log",
              body: "2 workers on site log missing from FLHA roster for Crew C.",
              confidence: 0.87,
            },
          ]}
        />
      </VsSection>
      <VsSection band="trend" label="Quality trend">
        <TrendPanel
          title="FLHA quality score"
          series={[78, 80, 79, 82, 83, 84, 81, 85, 84, 86, 84, 84].map((value, i) => ({
            period: `W${i + 1}`,
            value,
          }))}
          rangeLabel="12 wk"
        />
        <RiskGauge label="Hazard residual" score={38} band="Controlled" />
      </VsSection>
    </MockChrome>
  );
}

function JhaMock() {
  return (
    <MockChrome
      eyebrow="VeriPM · JHA"
      title="Industry Template Library + Smart Builder"
      description="Versioned industry templates, AI-assisted step builder, quality scoring, and ERP/FLHA linkage."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn>Smart Builder</PrimaryBtn>
          <GhostBtn>Browse templates</GhostBtn>
        </div>
      }
    >
      <VsSection band="kpi" label="Library health">
        <KpiTile label="Templates" value={128} tone="info" interactive />
        <KpiTile label="Avg quality" value={81} tone="positive" />
        <KpiTile label="Needs revision" value={9} tone="caution" />
        <KpiTile label="Linked ERPs" value={22} tone="neutral" />
      </VsSection>
      <VsSection band="detail" label="Templates · builder canvas">
        <div className="vs-panel overflow-hidden p-0">
          <table>
            <thead>
              <tr>
                <th>Template</th>
                <th>Industry</th>
                <th>Quality</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Structural steel erection", "Civil", 88, "v4.2"],
                ["Trenching & excavation", "Civil", 91, "v3.1"],
                ["Energized electrical", "Electrical", 79, "v2.8"],
                ["Mobile crane lift", "Lifting", 85, "v5.0"],
              ].map((row) => (
                <tr key={row[0]}>
                  <td className="vs-drill-target" style={{ color: VS_COLORS.white }}>
                    {row[0]}
                  </td>
                  <td style={{ color: VS_COLORS.muted }}>{row[1]}</td>
                  <td style={{ color: VS_COLORS.blue }}>{row[2]}</td>
                  <td style={{ color: VS_COLORS.muted }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="vs-panel p-4">
          <p className="vs-eyebrow">Smart Builder</p>
          <ol className="mt-3 space-y-2 text-sm" style={{ color: VS_COLORS.muted }}>
            <li style={{ color: VS_COLORS.white }}>1. Select work type + energies</li>
            <li>2. AI proposes tasks / hazards / controls / PPE</li>
            <li>3. Risk-rank residual · link ERP scenario</li>
            <li>4. Publish version · push to FieldOS FLHA</li>
          </ol>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <RiskGauge label="Draft quality" score={74} />
            <div className="space-y-2 text-xs" style={{ color: VS_COLORS.muted }}>
              <p className="vs-eyebrow">AI-04 suggestions</p>
              {["Task: Install perimeter cables", "Hazard: Fall from height", "Control: 100% tie-off"].map(
                (s) => (
                  <div
                    key={s}
                    className="rounded border px-2 py-1.5"
                    style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
                  >
                    {s}
                  </div>
                ),
              )}
              <button type="button" className="vs-btn vs-btn-primary mt-1 w-full justify-center">
                Accept suggestions
              </button>
            </div>
          </div>
        </div>
      </VsSection>
      <VsSection band="detail" label="Hazard blocks">
        <JhaHazardBlocks
          hazards={[
            {
              id: "h1",
              label: "Fall from height",
              severity: "critical",
              energyTypes: ["Gravity"],
              controls: ["100% tie-off", "Guardrails at leading edge"],
              ppe: ["Full-body harness", "Hard hat"],
              source: "ai",
              confidence: 0.91,
              selected: true,
            },
            {
              id: "h2",
              label: "Struck-by suspended load",
              severity: "elevated",
              energyTypes: ["Motion", "Mechanical"],
              controls: ["Exclusion zone", "Tag lines"],
              ppe: ["Hi-vis vest"],
              source: "template",
              confidence: 0.88,
            },
          ]}
        />
      </VsSection>
      <VsSection band="trend" label="Risk rank preview">
        <BubbleChart
          title="Task residual risk"
          xLabel="Likelihood"
          yLabel="Severity"
          points={[
            { id: "t1", label: "Erect columns", x: 8, y: 85, r: 36, tone: "critical" },
            { id: "t2", label: "Bolt-up", x: 14, y: 55, r: 22, tone: "caution" },
            { id: "t3", label: "Decking", x: 10, y: 70, r: 28, tone: "caution" },
          ]}
        />
        <AiInsightPanel
          title="Builder insights"
          items={[
            {
              id: "j1",
              tone: "caution",
              headline: "High residual — link ERP fall scenario",
              body: "SIF potential on erect columns. Generate ERP before approve.",
              confidence: 0.88,
              href: "/pm/emergency-response",
              hrefLabel: "Generate ERP →",
            },
          ]}
        />
      </VsSection>
    </MockChrome>
  );
}

function ErpMock() {
  return (
    <MockChrome
      eyebrow="VeriPM · Emergency Response"
      title="AI ERP Generator"
      description="Generate ERPs, plug local EMS, run drills with accountability from site logs, toolbox, and FLHA sign-ins."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn>Generate ERP</PrimaryBtn>
          <button
            type="button"
            className="vs-btn"
            style={{
              background: VS_COLORS.orange,
              borderColor: VS_COLORS.orange,
              color: VS_COLORS.navy,
            }}
          >
            Run ERP drill
          </button>
          <DangerBtn>Find in emergency</DangerBtn>
        </div>
      }
    >
      <VsSection band="kpi" label="ERP quality">
        <KpiTile label="ERP quality" value={86} unit="/100" tone="positive" />
        <KpiTile label="EMS contacts" value={5} tone="info" />
        <KpiTile label="Drill readiness" value={72} unit="%" tone="caution" />
        <KpiTile label="Muster accountability" value={0} unit="%" tone="neutral" />
      </VsSection>
      <VsSection band="detail" label="Scenario cards · EMS lookup">
        <ErpScenarioCards
          items={[
            {
              id: "fall",
              title: "Fall emergency — structural steel",
              scenario: "fall",
              regionCode: "CA-AB",
              qualityScore: 86,
              drillReadinessPct: 72,
              status: "active",
              selected: true,
            },
            {
              id: "elec",
              title: "Electrical contact",
              scenario: "electrical",
              regionCode: "CA-AB",
              qualityScore: 79,
              status: "draft",
            },
          ]}
        />
        <div className="vs-panel overflow-hidden p-0">
          <table>
            <thead>
              <tr>
                <th>In ERP</th>
                <th>Agency</th>
                <th>Phone</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Ambulance", "911", "8 min"],
                ["Fire", "911", "9 min"],
                ["Hospital ED", "+1-555-4821", "18 min"],
                ["Tech rescue", "+1-555-3902", "22 min"],
              ].map((r) => (
                <tr key={r[0]}>
                  <td>☐</td>
                  <td style={{ color: VS_COLORS.white }}>{r[0]}</td>
                  <td style={{ color: VS_COLORS.blue }}>{r[1]}</td>
                  <td style={{ color: VS_COLORS.muted }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </VsSection>
      <VsSection band="detail" label="Quality · script">
        <RiskGauge label="ERP quality" score={86} />
        <div className="vs-panel p-4 text-xs" style={{ color: VS_COLORS.muted }}>
          <p className="vs-eyebrow">Call EMS script</p>
          <p className="mt-2" style={{ color: VS_COLORS.white }}>
            Call 911 — Fall emergency at Active construction site, CA-AB. Muster Point A — site gate.
          </p>
        </div>
      </VsSection>
    </MockChrome>
  );
}

function InspectionsMock() {
  return (
    <MockChrome
      eyebrow="VeriPM · Inspections"
      title="Inspections / BBO / Focus Audit"
      description="Behavior-based observation quality, focus audits, findings aging, and Action Management linkage."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn>New inspection</PrimaryBtn>
          <GhostBtn>Focus audit pack</GhostBtn>
        </div>
      }
    >
      <VsSection band="kpi" label="Inspection KPIs">
        <KpiTile label="BBO quality" value={84} tone="positive" sparkline={[70, 72, 75, 78, 80, 84]} />
        <KpiTile label="Focus audits" value={12} tone="info" />
        <KpiTile label="Open findings" value={27} tone="caution" />
        <KpiTile label="Closed this period" value={39} tone="positive" />
      </VsSection>
      <VsSection band="trend" label="Trends">
        <InspectionTrendCard
          title="BBO depth score"
          completionPct={84}
          ratePer200k={0.9}
          aiFlagged={2}
          period="Trailing 4 weeks"
        />
        <TrendPanel
          title="Findings closed / week"
          series={[8, 9, 7, 11, 10, 12, 9, 13, 11, 14, 12, 15].map((value, i) => ({
            period: `W${i + 1}`,
            value,
          }))}
          rangeLabel="12 wk"
        />
      </VsSection>
      <VsSection band="detail" label="Focus risk bubbles · inspection grid">
        <BubbleChart
          title="Finding clusters"
          xLabel="Frequency"
          yLabel="Severity"
          points={[
            { id: "f1", label: "Access", x: 14, y: 62, r: 30, tone: "caution" },
            { id: "f2", label: "PPE", x: 9, y: 40, r: 18, tone: "info" },
            { id: "f3", label: "LOTO", x: 5, y: 88, r: 26, tone: "critical" },
          ]}
        />
        <InspectionGrid
          rows={[
            {
              id: "i1",
              date: "2026-07-14",
              type: "bbo",
              location: "Fab bay",
              findingsOpen: 1,
              qualityScore: 88,
              status: "complete",
            },
            {
              id: "i2",
              date: "2026-07-11",
              type: "focus",
              location: "Temporary access",
              findingsOpen: 4,
              qualityScore: 72,
              status: "in_review",
            },
            {
              id: "i3",
              date: "2026-07-09",
              type: "standard",
              location: "Staging",
              findingsOpen: 0,
              qualityScore: 91,
              status: "complete",
            },
          ]}
        />
      </VsSection>
      <VsSection band="narrative" label="Insights">
        <AiInsightPanel
          items={[
            {
              id: "ins1",
              tone: "caution",
              headline: "Focus audit: temporary access",
              body: "Repeat finding on overnight installs — queue preventive action.",
              confidence: 0.85,
              href: "/pm/action-management",
              hrefLabel: "Create preventive action →",
            },
          ]}
        />
      </VsSection>
    </MockChrome>
  );
}

function IncidentsMock() {
  return (
    <MockChrome
      eyebrow="VeriPM · Incidents"
      title="Incidents Dashboard + Investigation Helper"
      description="Overview, smart incident log with facet drill-down, and AI investigation assistance."
      actions={
        <div className="flex flex-wrap gap-2">
          <GhostBtn>Incident log</GhostBtn>
          <PrimaryBtn>Report incident</PrimaryBtn>
        </div>
      }
    >
      <VsSection band="kpi" label="Overview">
        <KpiTile label="Rate /200k" value={1.22} delta={-0.14} tone="positive" sparkline={TREND} />
        <KpiTile label="Open investigations" value={7} tone="caution" />
        <KpiTile label="Near misses" value={24} tone="info" />
        <KpiTile label="SIF potential" value={3} tone="critical" />
      </VsSection>
      <VsSection band="detail" label="Severity · AI helper">
        <SeverityBars
          title="Severity distribution"
          segments={[
            { label: "FA", share: 12, color: VS_COLORS.emerald },
            { label: "MA", share: 7, color: VS_COLORS.blue },
            { label: "LT", share: 3, color: VS_COLORS.orange },
          ]}
        />
        <AiInsightPanel
          title="Investigation helper"
          items={[
            {
              id: "ih1",
              tone: "caution",
              headline: "Suggested root cause: LOTO gap",
              body: "86% confidence from description pattern match vs prior MA events.",
              confidence: 0.86,
            },
            {
              id: "ih2",
              tone: "neutral",
              headline: "Link CA + meeting topic",
              body: "Machine guarding & LOTO during jam clears → Action Management.",
              confidence: 0.8,
            },
          ]}
        />
      </VsSection>
      <VsSection band="detail" label="Smart log preview">
        <div className="vs-panel overflow-hidden p-0 lg:col-span-2">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["2026-07-12", "Finger pinch — conveyor", "injury", "Fab bay", "closed"],
                ["2026-07-10", "Near miss — load path", "near_miss", "Lift corridor", "investigating"],
                ["2026-07-08", "Forklift contact", "property", "Staging", "pending review"],
              ].map((r) => (
                <tr key={r[1]}>
                  <td style={{ color: VS_COLORS.muted }}>{r[0]}</td>
                  <td style={{ color: VS_COLORS.white }}>{r[1]}</td>
                  <td style={{ color: VS_COLORS.muted }}>{r[2]}</td>
                  <td style={{ color: VS_COLORS.blue }}>{r[3]}</td>
                  <td style={{ color: VS_COLORS.orange }}>{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </VsSection>
    </MockChrome>
  );
}

function MeetingsMock() {
  return (
    <MockChrome
      eyebrow="VeriPM · Safety meetings"
      title="Meetings Dashboard + Smart Topic Generator"
      description="Attendance intelligence, topic effectiveness, and AI topics from incidents, FLHA, and inspections."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn>Generate topics</PrimaryBtn>
          <GhostBtn>Schedule meeting</GhostBtn>
        </div>
      }
    >
      <VsSection band="kpi" label="Meeting KPIs">
        <KpiTile label="Attendance" value={91} unit="%" tone="positive" sparkline={[84, 86, 88, 87, 90, 91]} />
        <KpiTile label="Topics delivered" value={16} tone="info" />
        <KpiTile label="AI suggestions" value={8} tone="neutral" />
        <KpiTile label="Linked incidents" value={5} tone="caution" />
      </VsSection>
      <VsSection band="detail" label="Smart topics">
        <MeetingTopicCards
          topics={[
            {
              id: "1",
              title: "Machine guarding & LOTO jam clears",
              rationale: "From incident · 86%",
              sourceModule: "incidents",
              confidence: 0.86,
            },
            {
              id: "2",
              title: "Lift exclusion zones — corridor B",
              rationale: "From near miss cluster",
              sourceModule: "near_miss",
              confidence: 0.81,
            },
            {
              id: "3",
              title: "Temporary access overnight installs",
              rationale: "From inspection focus",
              sourceModule: "inspections",
              confidence: 0.78,
            },
          ]}
        />
        <TrendPanel
          title="Attendance rate"
          series={[0.84, 0.86, 0.88, 0.87, 0.9, 0.91, 0.89, 0.92].map((value, i) => ({
            period: `W${i + 1}`,
            value: Math.round(value * 100),
          }))}
          rangeLabel="8 wk"
        />
      </VsSection>
    </MockChrome>
  );
}

function ActionsMock() {
  return (
    <MockChrome
      eyebrow="VeriPM · Action Management"
      title="Corrective & Preventive Actions"
      description="Create, assign, track, and close actions — aging, effectiveness, root-cause linkage."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn>Create action</PrimaryBtn>
          <GhostBtn>Recompute</GhostBtn>
        </div>
      }
    >
      <VsSection band="kpi" label="Action KPIs">
        <KpiTile label="Open" value={18} tone="caution" />
        <KpiTile label="Overdue" value={4} tone="critical" />
        <KpiTile label="Effectiveness" value={74} unit="%" tone="positive" />
        <KpiTile label="Closed 30d" value={22} tone="info" />
      </VsSection>
      <VsSection band="detail" label="Aging · root-cause flow">
        <ActionAgingHistogram title="Aging histogram" bins={AGING_BINS} />
        <RootCauseActionFlow
          title="Root cause → CA / PA"
          flows={[
            {
              rootCauseLabel: "Guarding / LOTO",
              correctiveCount: 5,
              preventiveCount: 3,
              avgEffectiveness: 72,
            },
            {
              rootCauseLabel: "Exclusion zones",
              correctiveCount: 3,
              preventiveCount: 4,
              avgEffectiveness: 68,
            },
          ]}
        />
      </VsSection>
    </MockChrome>
  );
}

function CompetencyMock() {
  return (
    <MockChrome
      eyebrow="VeriCore · Training"
      title="Competency Intelligence"
      description="Coverage heatmap, risk forecast, authorization gaps, and VeriPM cross-links."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn>Assign training</PrimaryBtn>
          <GhostBtn>Forecast risk</GhostBtn>
        </div>
      }
    >
      <VsSection band="kpi" label="Competency KPIs">
        <KpiTile label="Coverage" value={81} unit="%" tone="positive" />
        <KpiTile label="Overdue" value={14} tone="critical" />
        <KpiTile label="Auth gaps" value={6} tone="caution" />
        <KpiTile label="Risk forecast" value={42} tone="info" />
      </VsSection>
      <VsSection band="detail" label="Heatmap · gauge">
        <LeadingHeatmap
          title="Competency by role"
          rows={COMPETENCY_HEAT.rows}
          cols={COMPETENCY_HEAT.cols}
          cells={COMPETENCY_HEAT.cells}
        />
        <RiskGauge label="Competency risk" score={42} band="Moderate" />
      </VsSection>
    </MockChrome>
  );
}

function CrossMock() {
  return (
    <MockChrome
      eyebrow="VeriSuite · Shared"
      title="Cross-page intelligence panels"
      description="Same AI chain pattern on every module — signals, suggested next steps, and deep links."
    >
      <VsSection band="narrative" label="Intelligence chain">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["JHA", "High-risk ranking", "Generate ERP scenario"],
            ["FLHA", "Energy gap", "Queue inspection focus"],
            ["Incident", "Root cause", "Create CA + meeting topic"],
            ["Inspection", "Repeat finding", "Preventive action"],
            ["Meeting", "Low attendance", "FieldOS check-in push"],
            ["ERP", "Drill overdue", "Muster from site logs"],
          ].map(([mod, signal, next]) => (
            <div key={mod} className="vs-panel p-4">
              <p className="vs-eyebrow">{mod}</p>
              <p className="mt-2 text-sm font-semibold" style={{ color: VS_COLORS.white }}>
                {signal}
              </p>
              <p className="mt-1 text-xs" style={{ color: VS_COLORS.blue }}>
                → {next}
              </p>
            </div>
          ))}
        </div>
      </VsSection>
      <AiInsightPanel
        title="Unified AI panel"
        items={[
          {
            id: "c1",
            tone: "caution",
            headline: "Chain: FLHA → Inspection → Action",
            body: "Pressure energy gap on Crew C should open focus audit and PA within 48h.",
            confidence: 0.84,
          },
        ]}
      />
    </MockChrome>
  );
}

function RegionalMock() {
  const [active, setActive] = useState("CA-AB");
  return (
    <MockChrome
      eyebrow="VeriSuite · Regional"
      title="Regional drilldown maps"
      description="Global → continent → country → province → region → city → site — with availability gates."
    >
      <VsSection band="detail" label="Map drilldown">
        <RegionalMapPanel
          breadcrumbs={[
            { code: "GL", label: "Global" },
            { code: "NA", label: "North America" },
            { code: "CA", label: "Canada" },
            { code: "CA-AB", label: "Alberta" },
          ]}
          children={[
            { code: "YYC", label: "Calgary", level: "city", hotspotScore: 72 },
            { code: "YEG", label: "Edmonton", level: "city", hotspotScore: 41 },
            { code: "FTM", label: "Fort McMurray", level: "city", hotspotScore: 88 },
            { code: "SITE-12", label: "Site 12", level: "site", available: true, hotspotScore: 65 },
            { code: "SITE-19", label: "Site 19", level: "site", available: false },
          ]}
          activeCode={active}
          onSelect={setActive}
        />
        <div className="vs-panel p-4">
          <p className="vs-eyebrow">Active node</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: VS_COLORS.blue }}>
            {active}
          </p>
          <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
            Hover/select children to drill. Unavailable sites dim at 50% opacity.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["Rate", "1.18"],
              ["Open", "4"],
              ["Actions", "9"],
            ].map(([l, v]) => (
              <div key={l} className="rounded border p-2 text-center" style={{ borderColor: VS_COLORS.border }}>
                <p className="text-[10px] uppercase" style={{ color: VS_COLORS.muted }}>
                  {l}
                </p>
                <p className="text-lg font-semibold tabular-nums" style={{ color: VS_COLORS.white }}>
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </VsSection>
      <VsSection band="narrative" label="AI-18 regional intelligence">
        <AiInsightPanel
          title="Node insights"
          items={[
            {
              id: "r1",
              tone: "caution",
              headline: "Hotspot: Fort McMurray vs Alberta parent",
              body: "Incident rate +0.34 above province; overdue actions elevated.",
              confidence: 0.84,
            },
            {
              id: "r2",
              tone: "alert",
              headline: "Site 19 unavailable",
              body: "Entitlement gate — no metrics until license/data present.",
              confidence: 0.95,
            },
          ]}
        />
      </VsSection>
    </MockChrome>
  );
}

function InsightsMock() {
  return (
    <MockChrome
      eyebrow="VeriSuite · Insights"
      title="Smart insights panels"
      description="Tone-coded narratives with confidence — alert, caution, positive, neutral — reused across every hub."
    >
      <InsightStrip
        chips={[
          { id: "a", label: "Alert", value: "3 SIF", tone: "alert" },
          { id: "c", label: "Caution", value: "4 overdue", tone: "caution" },
          { id: "p", label: "Positive", value: "Rate ↓", tone: "positive" },
          { id: "n", label: "Neutral", value: "5 EMS", tone: "neutral" },
        ]}
      />
      <VsSection band="narrative" label="Panel compositions">
        <AiInsightPanel
          title="Multi-tone insight stack"
          items={[
            {
              id: "1",
              tone: "alert",
              headline: "Overdue investigations >14 days",
              body: "Assign investigators and close evidence gaps on 3 records.",
              confidence: 0.93,
            },
            {
              id: "2",
              tone: "caution",
              headline: "Hotspot: Lift corridor B",
              body: "Near-miss cluster — queue exclusion-zone inspection.",
              confidence: 0.86,
            },
            {
              id: "3",
              tone: "positive",
              headline: "Below industry benchmark",
              body: "Entity 1.22 vs industry 1.85 /200k hrs.",
              confidence: 0.9,
            },
            {
              id: "4",
              tone: "neutral",
              headline: "EMS contacts current",
              body: "Hospital and rescue numbers verified this quarter.",
              confidence: 0.95,
            },
          ]}
        />
      </VsSection>
    </MockChrome>
  );
}

const SCREEN_MAP: Record<MockScreenId, () => ReactNode> = {
  "ui-kit": () => <VeriSuiteUiKitHandoff />,
  components: () => <ComponentsMock />,
  home: () => <HomeMock />,
  flha: () => <FlhaMock />,
  jha: () => <JhaMock />,
  erp: () => <ErpMock />,
  inspections: () => <InspectionsMock />,
  incidents: () => <IncidentsMock />,
  meetings: () => <MeetingsMock />,
  actions: () => <ActionsMock />,
  competency: () => <CompetencyMock />,
  cross: () => <CrossMock />,
  regional: () => <RegionalMock />,
  insights: () => <InsightsMock />,
};

export function VeriSuiteSmsMockupGallery() {
  const [screen, setScreen] = useState<MockScreenId>("ui-kit");
  const [viewport, setViewport] = useState<"desktop" | "tablet">("desktop");

  const active = useMemo(() => SCREENS.find((s) => s.id === screen), [screen]);

  return (
    <div className="vs-gallery-root" style={{ minHeight: "100vh", background: VS_COLORS.navy }}>
      <div
        className="sticky top-0 z-20 border-b px-4 py-3"
        style={{
          background: VS_COLORS.navy,
          borderColor: VS_COLORS.border,
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <div className="mr-2">
            <p className="vs-eyebrow">VeriSuite · Step 1 authoritative</p>
            <p className="text-sm font-semibold" style={{ color: VS_COLORS.white }}>
              Pixel screens FINALIZED · {VS_DESIGN_LOCK.version}
            </p>
          </div>
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: VS_COLORS.emerald, color: VS_COLORS.navy }}
          >
            {VS_DESIGN_LOCK.status}
          </span>
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
            {active?.module} · {active?.label} · Navy / Slate / Electric Blue
          </p>
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl gap-1 overflow-x-auto pb-1">
          {SCREENS.map((s) => (
            <button
              key={s.id}
              type="button"
              className="shrink-0 rounded px-2.5 py-1.5 text-[11px] font-semibold"
              style={{
                background: screen === s.id ? VS_COLORS.blue : VS_COLORS.slate,
                color: screen === s.id ? VS_COLORS.navy : VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              onClick={() => setScreen(s.id)}
            >
              {s.label}
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
          {SCREEN_MAP[screen]()}
        </div>
      </div>
    </div>
  );
}

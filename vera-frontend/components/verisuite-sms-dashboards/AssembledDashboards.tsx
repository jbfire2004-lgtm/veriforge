"use client";

/**
 * Assembled VeriSuite SMS dashboards — Step 1 layouts using only
 * verisuite-intelligence-ui (Prompt 1) components.
 *
 * Band order (locked): Controls → KPI → Trend → Detail → Narrative
 * Every dashboard: KPI drilldown · AI insight panel · regional drilldown
 */

import { useState } from "react";
import {
  ActionAgingHistogram,
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
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  AGING_BINS,
  COMPETENCY_HEAT,
  ERP_SCENARIOS,
  FINDING_BUBBLES,
  FLHA_ENERGIES,
  HOME_INSIGHTS,
  INSPECTION_ROWS,
  JHA_HAZARDS,
  LEADING_HEAT,
  MEETING_TOPICS,
  REGION_BREADCRUMBS,
  REGION_CHILDREN,
  ROOT_CAUSE_FLOWS,
  TREND_PTS,
  TREND_RATE,
} from "@/lib/verisuite-sms-dashboards/demo-data";
import type { SmsAiUiInsight, SmsAcceptAction } from "@/lib/verisuite-sms-api";
import {
  DashActions,
  DashExpand,
  DashGhostLink,
  DashPrimaryLink,
} from "./DashChrome";

const SPARK = TREND_RATE;

function AssembledAiBand({
  page,
  title,
  fallback,
  accept,
  geoCode,
}: {
  page: string;
  title: string;
  fallback: SmsAiUiInsight[];
  accept?: SmsAcceptAction;
  geoCode?: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SmsAiIntegrationPanel
        page={page}
        companyId={1}
        projectId={1}
        plane="project"
        geoCode={geoCode}
        title={title}
        fallbackInsights={fallback}
        defaultAcceptAction={accept}
        showSpecialistBar
      />
      <SmsInteractionFlowPanel
        page={page}
        companyId={1}
        projectId={1}
        plane="project"
        title="Interaction flow"
        showCrossLinks={page === "home"}
      />
    </div>
  );
}

/** Regional drilldown — Prompt 1 RegionalMapPanel */
function RegionalPanel({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (code: string) => void;
}) {
  return (
    <RegionalMapPanel
      breadcrumbs={REGION_BREADCRUMBS}
      children={REGION_CHILDREN}
      activeCode={active}
      onSelect={onSelect}
    />
  );
}

function DrillNote({ label }: { label: string | null }) {
  return (
    <DashExpand open={label != null}>
      <div className="vs-panel p-4 text-sm" style={{ color: VS_COLORS.muted }}>
        Drilldown:{" "}
        <span style={{ color: VS_COLORS.blue }}>{label ?? "—"}</span>
        {" · "}rates /200k hrs · use ModuleNav for owning hub
      </div>
    </DashExpand>
  );
}

/** 1 · VeriPM Homepage — Safety Intelligence Hub */
export function HomeDashboardAssembled() {
  const [region, setRegion] = useState("CA-AB");
  const [drill, setDrill] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Home"
      title="Safety Intelligence Hub"
      description="Cross-module KPIs, leading indicators, predictive signals, and deep links into incidents, FLHA, inspections, and Action Management."
      meta="Assembled · Prompt 1 components · Step 1 layout"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashPrimaryLink href="/pm/incidents">Open incidents</DashPrimaryLink>
          <DashGhostLink href="/pm/emergency-response">Run ERP drill</DashGhostLink>
          <DashGhostLink href="/pm/jha-flha">New FLHA</DashGhostLink>
        </DashActions>
      </VsSection>

      <InsightStrip
        chips={[
          { id: "r", label: "Rate /200k", value: "1.22", tone: "positive", href: "/pm/incidents" },
          { id: "o", label: "Open incidents", value: "7", tone: "caution", href: "/pm/incidents?tab=history" },
          { id: "a", label: "Open actions", value: "18", tone: "info", href: "/pm/action-management" },
          { id: "d", label: "Drill readiness", value: "78%", tone: "caution", href: "/pm/emergency-response" },
        ]}
      />

      <VsSection band="kpi" label="Portfolio KPIs">
        <KpiTile
          label="Incident rate /200k"
          value={1.22}
          delta={-0.14}
          tone="positive"
          sparkline={SPARK}
          interactive
          onClick={() => setDrill(drill === "rate" ? null : "rate")}
        />
        <KpiTile
          label="Near misses"
          value={24}
          delta={2}
          tone="caution"
          sparkline={[18, 20, 19, 22, 21, 24]}
          interactive
          onClick={() => setDrill(drill === "nm" ? null : "nm")}
        />
        <KpiTile
          label="Inspection findings"
          value={41}
          tone="info"
          interactive
          onClick={() => setDrill(drill === "insp" ? null : "insp")}
        />
        <KpiTile
          label="Training overdue"
          value={6}
          tone="critical"
          interactive
          onClick={() => setDrill(drill === "train" ? null : "train")}
        />
      </VsSection>
      <DrillNote label={drill} />

      <VsSection band="trend" label="Trends · leading heatmap">
        <TrendPanel
          title="Incident rate trajectory"
          series={TREND_PTS}
          forecast={[{ period: "M13", value: 1.18 }]}
          anomalies={[{ period: "M3", label: "Spike" }]}
          rangeLabel="12 mo + forecast"
          onPointClick={(p) => setDrill(`trend:${p.period}=${p.value}`)}
          onAnomalyClick={(a) => setDrill(`anomaly:${a.period}`)}
        />
        <LeadingHeatmap
          title="Leading indicator heat"
          rows={LEADING_HEAT.rows}
          cols={LEADING_HEAT.cols}
          cells={LEADING_HEAT.cells}
          onCellClick={(c) => setDrill(`heat:${c.row}/${c.col}=${c.value}`)}
        />
      </VsSection>

      <VsSection band="detail" label="Regional · industry">
        <RegionalPanel active={region} onSelect={setRegion} />
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

      <VsSection band="narrative" label="Cross-page intelligence">
        <AssembledAiBand
          page="home"
          title="Hub insights"
          fallback={HOME_INSIGHTS}
          accept="create_action"
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

/** 2 · FLHA Hazard Intelligence */
export function FlhaHazardIntelligenceDashboard() {
  const [energy, setEnergy] = useState<string | null>("pressure");
  const [region, setRegion] = useState("CA-AB");
  const [drill, setDrill] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · JHA / FLHA"
      title="FLHA Hazard Intelligence"
      description="Energy Wheel coverage, AI reviewer scoring, quality trends, and crew sign-in linkage."
      meta="Assembled · Prompt 1 · Step 1"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashPrimaryLink href="/pm/jha-flha/new/flha">New FLHA</DashPrimaryLink>
          <DashGhostLink href="/pm/jha-flha">AI review queue</DashGhostLink>
        </DashActions>
      </VsSection>

      <VsSection band="kpi" label="FLHA quality">
        <KpiTile
          label="Avg quality"
          value={84}
          unit="/100"
          tone="positive"
          interactive
          onClick={() => setDrill(drill === "quality" ? null : "quality")}
        />
        <KpiTile
          label="Energy coverage"
          value={76}
          unit="%"
          tone="caution"
          interactive
          onClick={() => setDrill(drill === "coverage" ? null : "coverage")}
        />
        <KpiTile
          label="AI flags open"
          value={5}
          tone="critical"
          interactive
          onClick={() => setDrill(drill === "flags" ? null : "flags")}
        />
        <KpiTile label="Signed crews today" value={11} tone="info" interactive />
      </VsSection>
      <DrillNote label={drill ?? (energy ? `energy:${energy}` : null)} />

      <VsSection band="trend" label="Quality trend · residual">
        <TrendPanel
          title="FLHA quality score"
          series={[78, 80, 79, 82, 83, 84, 81, 85, 84, 86, 84, 84].map(
            (value, i) => ({ period: `W${i + 1}`, value }),
          )}
          rangeLabel="12 wk"
          onPointClick={(p) => setDrill(`quality:${p.period}`)}
        />
        <RiskGauge
          label="Hazard residual"
          score={38}
          band="Controlled"
          onClick={() => setDrill("residual-gauge")}
        />
      </VsSection>

      <VsSection band="detail" label="Energy Wheel · regional">
        <FlhaEnergyWheel
          energies={FLHA_ENERGIES}
          selectedKey={energy}
          onSelect={(key) => {
            setEnergy(key);
            setDrill(`energy:${key}`);
          }}
        />
        <RegionalPanel active={region} onSelect={setRegion} />
      </VsSection>

      <VsSection band="narrative" label="AI FLHA reviewer">
        <AssembledAiBand
          page="jha-flha"
          title="AI FLHA reviewer"
          fallback={[
            {
              id: "f1",
              tone: "alert",
              headline: "Pressure energy understated",
              body: "Pneumatic line work listed without isolation step — align to JHA v3.",
              confidence: 0.91,
              href: "/pm/jha-flha",
              hrefLabel: "Open linked JHA →",
            },
            {
              id: "f2",
              tone: "caution",
              headline: "Sign-in incomplete vs gate log",
              body: "2 workers on site log missing from FLHA roster for Crew C.",
              confidence: 0.87,
            },
          ]}
          accept="apply_flha_flag"
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

/** 3 · JHA Smart Builder + Template Library */
export function JhaSmartBuilderDashboard() {
  const [hazards, setHazards] = useState(JHA_HAZARDS);
  const [bubbleId, setBubbleId] = useState<string | null>("t1");
  const [region, setRegion] = useState("CA-AB");
  const [drill, setDrill] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · JHA"
      title="Industry Template Library + Smart Builder"
      description="Versioned industry templates, AI-assisted step builder, quality scoring, and ERP/FLHA linkage."
      meta="Assembled · Prompt 1 · Step 1"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashPrimaryLink href="/pm/jha-flha/new/jha">Smart Builder</DashPrimaryLink>
          <DashGhostLink href="/pm/jha-flha">Browse templates</DashGhostLink>
        </DashActions>
      </VsSection>

      <VsSection band="kpi" label="Library health">
        <KpiTile
          label="Templates"
          value={128}
          tone="info"
          interactive
          onClick={() => setDrill(drill === "templates" ? null : "templates")}
        />
        <KpiTile label="Avg quality" value={81} tone="positive" interactive />
        <KpiTile label="Needs revision" value={9} tone="caution" interactive />
        <KpiTile label="Linked ERPs" value={22} tone="neutral" interactive />
      </VsSection>
      <DrillNote label={drill} />

      <VsSection band="trend" label="Draft quality">
        <RiskGauge
          label="Draft quality"
          score={74}
          band="Needs polish"
          onClick={() => setDrill("draft-quality")}
        />
        <TrendPanel
          title="Template adoption"
          series={[40, 48, 55, 62, 70, 78, 85, 92, 100, 110, 118, 128].map(
            (value, i) => ({ period: `M${i + 1}`, value }),
          )}
          rangeLabel="12 mo"
          onPointClick={(p) => setDrill(`adoption:${p.period}`)}
        />
      </VsSection>

      <VsSection band="detail" label="Hazards · bubbles · regional">
        <JhaHazardBlocks
          hazards={hazards}
          onToggle={(id) => {
            setHazards((prev) =>
              prev.map((h) => ({
                ...h,
                selected: h.id === id ? !h.selected : h.selected,
              })),
            );
            setDrill(`hazard:${id}`);
          }}
        />
        <div className="space-y-3">
          <BubbleChart
            title="Task residual risk"
            xLabel="Likelihood"
            yLabel="Severity"
            selectedId={bubbleId}
            onSelect={(id) => {
              setBubbleId(id);
              setDrill(`bubble:${id}`);
            }}
            points={[
              { id: "t1", label: "Erect columns", x: 8, y: 85, r: 36, tone: "critical" },
              { id: "t2", label: "Bolt-up", x: 14, y: 55, r: 22, tone: "caution" },
              { id: "t3", label: "Decking", x: 10, y: 70, r: 28, tone: "caution" },
            ]}
          />
          <RegionalPanel active={region} onSelect={setRegion} />
        </div>
      </VsSection>

      <VsSection band="narrative" label="Builder insights">
        <AssembledAiBand
          page="jha-flha"
          title="Builder insights"
          fallback={[
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
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

/** 4 · ERP AI Generator */
export function ErpAiGeneratorDashboard() {
  const [scenarios, setScenarios] = useState(ERP_SCENARIOS);
  const [region, setRegion] = useState("CA-AB");
  const [drill, setDrill] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Emergency Response"
      title="AI ERP Generator"
      description="Generate ERPs, plug local EMS, run drills with accountability from site logs, toolbox, and FLHA sign-ins."
      meta="Assembled · Prompt 1 · Step 1"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashPrimaryLink href="/pm/emergency-response">Generate ERP</DashPrimaryLink>
          <DashGhostLink href="/pm/emergency-response">Run ERP drill</DashGhostLink>
        </DashActions>
      </VsSection>

      <VsSection band="kpi" label="ERP quality">
        <KpiTile
          label="ERP quality"
          value={86}
          unit="/100"
          tone="positive"
          interactive
          onClick={() => setDrill(drill === "quality" ? null : "quality")}
        />
        <KpiTile label="EMS contacts" value={5} tone="info" interactive />
        <KpiTile
          label="Drill readiness"
          value={72}
          unit="%"
          tone="caution"
          interactive
          onClick={() => setDrill(drill === "readiness" ? null : "readiness")}
        />
        <KpiTile label="Muster accountability" value={0} unit="%" tone="neutral" />
      </VsSection>
      <DrillNote label={drill} />

      <VsSection band="trend" label="Quality · readiness">
        <RiskGauge
          label="ERP quality"
          score={86}
          band="Ready"
          onClick={() => setDrill("erp-gauge")}
        />
        <TrendPanel
          title="Drill readiness %"
          series={[55, 58, 62, 65, 68, 70, 69, 71, 72, 70, 73, 72].map(
            (value, i) => ({ period: `W${i + 1}`, value }),
          )}
          rangeLabel="12 wk"
          onPointClick={(p) => setDrill(`readiness:${p.period}`)}
        />
      </VsSection>

      <VsSection band="detail" label="Scenarios · regional">
        <ErpScenarioCards
          items={scenarios}
          onSelect={(id) => {
            setScenarios((prev) =>
              prev.map((s) => ({ ...s, selected: s.id === id })),
            );
            setDrill(`scenario:${id}`);
          }}
        />
        <RegionalPanel active={region} onSelect={setRegion} />
      </VsSection>

      <VsSection band="narrative" label="ERP insights">
        <AssembledAiBand
          page="emergency"
          title="ERP insights"
          fallback={[
            {
              id: "e1",
              tone: "caution",
              headline: "Drill readiness below target",
              body: "Schedule muster drill using gate + toolbox + FLHA sign-ins.",
              confidence: 0.84,
            },
            {
              id: "e2",
              tone: "neutral",
              headline: "EMS contacts verified",
              body: "Hospital and rescue numbers current this quarter — never LLM-invented.",
              confidence: 0.95,
            },
          ]}
          accept="persist_erp"
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

/** 5 · Inspections / BBO / Focus Audit */
export function InspectionsDashboardAssembled() {
  const [selectedId, setSelectedId] = useState<string | null>("i2");
  const [bubbleId, setBubbleId] = useState<string | null>("f3");
  const [region, setRegion] = useState("CA-AB");
  const [drill, setDrill] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Inspections"
      title="Inspections / BBO / Focus Audit"
      description="Behavior-based observation quality, focus audits, findings aging, and Action Management linkage."
      meta="Assembled · Prompt 1 · Step 1"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashPrimaryLink href="/pm/inspections/new">New inspection</DashPrimaryLink>
          <DashGhostLink href="/pm/inspections/focus-audits">Focus audit pack</DashGhostLink>
        </DashActions>
      </VsSection>

      <VsSection band="kpi" label="Inspection KPIs">
        <KpiTile
          label="BBO quality"
          value={84}
          tone="positive"
          sparkline={[70, 72, 75, 78, 80, 84]}
          interactive
          onClick={() => setDrill(drill === "bbo" ? null : "bbo")}
        />
        <KpiTile label="Focus audits" value={12} tone="info" interactive />
        <KpiTile
          label="Open findings"
          value={27}
          tone="caution"
          interactive
          onClick={() => setDrill(drill === "findings" ? null : "findings")}
        />
        <KpiTile label="Closed this period" value={39} tone="positive" interactive />
      </VsSection>
      <DrillNote label={drill} />

      <VsSection band="trend" label="Trends">
        <InspectionTrendCard
          title="BBO depth score"
          completionPct={84}
          ratePer200k={0.9}
          aiFlagged={2}
          period="Trailing 4 weeks"
          sparkline={[70, 72, 75, 78, 80, 84]}
          interactive
          onClick={() => setDrill("bbo-trend-card")}
        />
        <TrendPanel
          title="Findings closed / week"
          series={[8, 9, 7, 11, 10, 12, 9, 13, 11, 14, 12, 15].map(
            (value, i) => ({ period: `W${i + 1}`, value }),
          )}
          rangeLabel="12 wk"
          onPointClick={(p) => setDrill(`closed:${p.period}`)}
        />
      </VsSection>

      <VsSection band="detail" label="Clusters · grid · regional">
        <BubbleChart
          title="Finding clusters"
          selectedId={bubbleId}
          onSelect={(id) => {
            setBubbleId(id);
            setDrill(`cluster:${id}`);
          }}
          points={FINDING_BUBBLES}
        />
        <div className="space-y-3">
          <InspectionGrid
            rows={INSPECTION_ROWS}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setDrill(`inspection:${id}`);
            }}
          />
          <RegionalPanel active={region} onSelect={setRegion} />
        </div>
      </VsSection>

      <VsSection band="narrative" label="Insights">
        <AssembledAiBand
          page="inspections"
          title="Insights"
          fallback={[
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
          accept="create_inspection_focus"
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

/** 6 · Incidents + Investigation Helper */
export function IncidentsDashboardAssembled() {
  const [region, setRegion] = useState("CA-AB");
  const [drill, setDrill] = useState<string | null>(null);
  const [sev, setSev] = useState<string | null>(null);
  const [flow, setFlow] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Incidents"
      title="Incidents Dashboard + Investigation Helper"
      description="Overview, severity mix, AI investigation assistance, and Action Management linkage."
      meta="Assembled · Prompt 1 · Step 1"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashGhostLink href="/pm/incidents?tab=history">Incident log</DashGhostLink>
          <DashPrimaryLink href="/pm/incidents/new">Report incident</DashPrimaryLink>
        </DashActions>
      </VsSection>

      <VsSection band="kpi" label="Overview">
        <KpiTile
          label="Rate /200k"
          value={1.22}
          delta={-0.14}
          tone="positive"
          sparkline={SPARK}
          interactive
          onClick={() => setDrill(drill === "rate" ? null : "rate")}
        />
        <KpiTile
          label="Open investigations"
          value={7}
          tone="caution"
          interactive
          onClick={() => setDrill(drill === "inv" ? null : "inv")}
        />
        <KpiTile label="Near misses" value={24} tone="info" interactive />
        <KpiTile
          label="SIF potential"
          value={3}
          tone="critical"
          interactive
          onClick={() => setDrill(drill === "sif" ? null : "sif")}
        />
      </VsSection>
      <DrillNote label={drill ?? sev ?? flow} />

      <VsSection band="trend" label="Rate · root-cause Sankey">
        <TrendPanel
          title="Incident rate /200k"
          series={TREND_PTS}
          anomalies={[{ period: "M3" }]}
          rangeLabel="12 mo"
          onPointClick={(p) => setDrill(`rate:${p.period}`)}
          onAnomalyClick={(a) => setDrill(`anomaly:${a.period}`)}
        />
        <RootCauseActionFlow
          title="Root cause → actions"
          flows={ROOT_CAUSE_FLOWS}
          selectedLabel={flow}
          onFlowClick={(f) => setFlow(f.rootCauseLabel)}
        />
      </VsSection>

      <VsSection band="detail" label="Severity · regional">
        <SeverityBars
          title="Severity distribution"
          selectedLabel={sev}
          onSegmentClick={(s) => setSev(s.label)}
          segments={[
            { label: "FA", share: 12, color: VS_COLORS.emerald },
            { label: "MA", share: 7, color: VS_COLORS.blue },
            { label: "LT", share: 3, color: VS_COLORS.orange },
            { label: "SIF", share: 2, color: VS_COLORS.critical },
          ]}
        />
        <RegionalPanel active={region} onSelect={setRegion} />
      </VsSection>

      <VsSection band="narrative" label="Investigation helper">
        <AssembledAiBand
          page="incidents"
          title="Investigation helper"
          fallback={[
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
              href: "/pm/action-management",
              hrefLabel: "Create corrective action →",
            },
          ]}
          accept="create_action"
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

/** 7 · Safety Meetings + Smart Topics */
export function SafetyMeetingsDashboardAssembled() {
  const [topics, setTopics] = useState(MEETING_TOPICS);
  const [region, setRegion] = useState("CA-AB");
  const [drill, setDrill] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Safety meetings"
      title="Meetings Dashboard + Smart Topic Generator"
      description="Attendance intelligence, topic effectiveness, and AI topics from incidents, FLHA, and inspections."
      meta="Assembled · Prompt 1 · Step 1"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashPrimaryLink href="/pm/safety-meetings/topics">Generate topics</DashPrimaryLink>
          <DashGhostLink href="/pm/safety-meetings/new">Schedule meeting</DashGhostLink>
        </DashActions>
      </VsSection>

      <VsSection band="kpi" label="Meeting KPIs">
        <KpiTile
          label="Attendance"
          value={91}
          unit="%"
          tone="positive"
          sparkline={[84, 86, 88, 87, 90, 91]}
          interactive
          onClick={() => setDrill(drill === "attendance" ? null : "attendance")}
        />
        <KpiTile label="Topics delivered" value={16} tone="info" interactive />
        <KpiTile label="AI suggestions" value={8} tone="neutral" interactive />
        <KpiTile label="Linked incidents" value={5} tone="caution" interactive />
      </VsSection>
      <DrillNote label={drill} />

      <VsSection band="trend" label="Attendance trend">
        <TrendPanel
          title="Attendance rate"
          series={[0.84, 0.86, 0.88, 0.87, 0.9, 0.91, 0.89, 0.92].map(
            (value, i) => ({
              period: `W${i + 1}`,
              value: Math.round(value * 100),
            }),
          )}
          rangeLabel="8 wk"
          onPointClick={(p) => setDrill(`attendance:${p.period}`)}
        />
        <RiskGauge
          label="Topic effectiveness"
          score={78}
          band="Strong"
          onClick={() => setDrill("topic-eff")}
        />
      </VsSection>

      <VsSection band="detail" label="Smart topics · regional">
        <MeetingTopicCards
          topics={topics}
          onSelect={(id) => {
            setTopics((prev) =>
              prev.map((t) => ({ ...t, selected: t.id === id })),
            );
            setDrill(`topic:${id}`);
          }}
        />
        <RegionalPanel active={region} onSelect={setRegion} />
      </VsSection>

      <VsSection band="narrative" label="Insights">
        <AssembledAiBand
          page="meetings"
          title="Insights"
          fallback={[
            {
              id: "m1",
              tone: "caution",
              headline: "Crew C attendance soft",
              body: "Push FieldOS check-in before next toolbox on exclusion zones.",
              confidence: 0.79,
            },
          ]}
          accept="create_meeting"
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

/** 8 · Corrective / Preventive Action Management */
export function ActionManagementDashboardAssembled() {
  const [region, setRegion] = useState("CA-AB");
  const [drill, setDrill] = useState<string | null>(null);
  const [aging, setAging] = useState<string | null>(null);
  const [flow, setFlow] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Action Management"
      title="Corrective & Preventive Actions"
      description="Create, assign, track, and close actions — aging, effectiveness, root-cause linkage."
      meta="Assembled · Prompt 1 · Step 1"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashPrimaryLink href="/pm/corrective-actions/new">Create action</DashPrimaryLink>
          <DashGhostLink href="/pm/action-management">Workflow</DashGhostLink>
        </DashActions>
      </VsSection>

      <VsSection band="kpi" label="Action KPIs">
        <KpiTile
          label="Open"
          value={18}
          tone="caution"
          interactive
          onClick={() => setDrill(drill === "open" ? null : "open")}
        />
        <KpiTile
          label="Overdue"
          value={4}
          tone="critical"
          interactive
          onClick={() => setDrill(drill === "overdue" ? null : "overdue")}
        />
        <KpiTile label="Effectiveness" value={74} unit="%" tone="positive" interactive />
        <KpiTile label="Closed 30d" value={22} tone="info" interactive />
      </VsSection>
      <DrillNote label={drill ?? aging ?? flow} />

      <VsSection band="trend" label="Aging histogram">
        <ActionAgingHistogram
          title="Aging histogram"
          bins={AGING_BINS}
          selectedBucket={aging}
          onBinClick={(b) => setAging(b.bucket)}
        />
        <TrendPanel
          title="Actions closed / week"
          series={[3, 4, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8].map((value, i) => ({
            period: `W${i + 1}`,
            value,
          }))}
          rangeLabel="12 wk"
          onPointClick={(p) => setDrill(`closed:${p.period}`)}
        />
      </VsSection>

      <VsSection band="detail" label="Sankey · regional">
        <RootCauseActionFlow
          title="Root cause → CA / PA"
          flows={ROOT_CAUSE_FLOWS}
          selectedLabel={flow}
          onFlowClick={(f) => setFlow(f.rootCauseLabel)}
        />
        <RegionalPanel active={region} onSelect={setRegion} />
      </VsSection>

      <VsSection band="narrative" label="Insights">
        <AssembledAiBand
          page="actions"
          title="Insights"
          fallback={[
            {
              id: "a1",
              tone: "alert",
              headline: "4 actions past SLA",
              body: "Escalate owners on Guarding / LOTO corrective set.",
              confidence: 0.92,
            },
          ]}
          accept="create_action"
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

/** 9 · VeriCore Competency */
export function CompetencyDashboardAssembled() {
  const [region, setRegion] = useState("CA-AB");
  const [cell, setCell] = useState<string | null>(null);
  const [drill, setDrill] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow="VeriCore · Training"
      title="Competency Intelligence"
      description="Coverage heatmap, risk forecast, authorization gaps, and VeriPM cross-links."
      meta="Assembled · Prompt 1 · Step 1"
    >
      <VsSection band="controls" label="Controls">
        <DashActions>
          <DashPrimaryLink href="/pm/training">Assign training</DashPrimaryLink>
          <DashGhostLink href="/pm/training">Forecast risk</DashGhostLink>
        </DashActions>
      </VsSection>

      <VsSection band="kpi" label="Competency KPIs">
        <KpiTile
          label="Coverage"
          value={81}
          unit="%"
          tone="positive"
          interactive
          onClick={() => setDrill(drill === "coverage" ? null : "coverage")}
        />
        <KpiTile
          label="Overdue"
          value={14}
          tone="critical"
          interactive
          onClick={() => setDrill(drill === "overdue" ? null : "overdue")}
        />
        <KpiTile label="Auth gaps" value={6} tone="caution" interactive />
        <KpiTile label="Risk forecast" value={42} tone="info" interactive />
      </VsSection>
      <DrillNote label={drill ?? cell} />

      <VsSection band="trend" label="Risk gauge · forecast">
        <RiskGauge
          label="Competency risk"
          score={42}
          band="Moderate"
          onClick={() => setDrill("risk-gauge")}
        />
        <TrendPanel
          title="Overdue certifications"
          series={[22, 20, 19, 18, 17, 16, 15, 16, 15, 14, 14, 14].map(
            (value, i) => ({ period: `M${i + 1}`, value }),
          )}
          rangeLabel="12 mo"
          onPointClick={(p) => setDrill(`overdue:${p.period}`)}
        />
      </VsSection>

      <VsSection band="detail" label="Heatmap · regional">
        <LeadingHeatmap
          title="Competency by role"
          rows={COMPETENCY_HEAT.rows}
          cols={COMPETENCY_HEAT.cols}
          cells={COMPETENCY_HEAT.cells}
          onCellClick={(c) => {
            const label = `${c.row} · ${c.col} = ${c.value}`;
            setCell(label);
            setDrill(label);
          }}
        />
        <RegionalPanel active={region} onSelect={setRegion} />
      </VsSection>

      <VsSection band="narrative" label="Insights">
        <AssembledAiBand
          page="training"
          title="Insights"
          fallback={[
            {
              id: "c1",
              tone: "caution",
              headline: "Auth gaps on high-risk lift window",
              body: "6 operators missing authorization before structural steel peak.",
              confidence: 0.87,
              href: "/pm/jha-flha",
              hrefLabel: "Review linked JHAs →",
            },
          ]}
          geoCode={region}
        />
      </VsSection>
    </VsDashboardShell>
  );
}

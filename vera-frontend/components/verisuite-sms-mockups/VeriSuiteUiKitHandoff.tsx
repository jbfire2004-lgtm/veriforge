"use client";

/**
 * Engineering UI kit handoff — Step 1 LOCKED design system.
 * Isolation gallery for every VeriSuite intelligence component.
 */

import { useState } from "react";
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
import {
  VS_COLORS,
  VS_DESIGN_LOCK,
  VS_LAYOUT,
  VS_MOTION,
  VS_RADIUS,
  VS_SPACE,
  VS_TYPE,
} from "@/lib/verisuite-intelligence-ui/tokens";

const HEAT = {
  rows: ["FLHA", "BBO", "Actions", "ERP"],
  cols: ["W1", "W2", "W3", "W4"],
  cells: ["FLHA", "BBO", "Actions", "ERP"].flatMap((row, ri) =>
    ["W1", "W2", "W3", "W4"].map((col, ci) => ({
      row,
      col,
      value: 50 + ((ri * 9 + ci * 7) % 40),
      intensity: (50 + ((ri * 9 + ci * 7) % 40)) / 100,
    })),
  ),
};

export function VeriSuiteUiKitHandoff() {
  const [bubbleId, setBubbleId] = useState<string | null>("b1");
  const [expanded, setExpanded] = useState(true);
  const [region, setRegion] = useState("CA-AB");
  const [heatCell, setHeatCell] = useState("—");
  const [trendPoint, setTrendPoint] = useState("—");
  const [gaugeBand, setGaugeBand] = useState("Elevated");
  const [flowLabel, setFlowLabel] = useState<string | null>(null);
  const [agingBucket, setAgingBucket] = useState<string | null>(null);
  const [sevLabel, setSevLabel] = useState<string | null>(null);
  const [inspectId, setInspectId] = useState<string | null>("1");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [erpId, setErpId] = useState<string | null>("e1");
  const [hazardId, setHazardId] = useState<string | null>(null);
  const [energyKey, setEnergyKey] = useState<string | null>("pressure");
  const [kpiMsg, setKpiMsg] = useState("Click a KPI to drill");
  const [busyInsight, setBusyInsight] = useState<string | null>(null);

  return (
    <VsDashboardShell
      eyebrow={`VeriSuite · UI Kit ${VS_DESIGN_LOCK.version}`}
      title="Engineering handoff — FINALIZED"
      description="Authoritative Step 1 design system: colors, type, spacing, components, and interaction states. Reusable across VeriPM, VeriCore, FieldOS, VeriHub."
      meta={`${VS_DESIGN_LOCK.status} · ${VS_DESIGN_LOCK.version} · ${VS_DESIGN_LOCK.authoritativeRoute}`}
    >
      <VsSection band="controls" label="Lock banner">
        <div
          className="vs-panel flex flex-wrap items-center gap-3 p-4"
          style={{ borderColor: VS_COLORS.blue }}
        >
          <span
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: VS_COLORS.blue,
              color: VS_COLORS.navy,
              borderRadius: VS_RADIUS,
            }}
          >
            {VS_DESIGN_LOCK.status}
          </span>
          <p className="text-sm" style={{ color: VS_COLORS.white }}>
            Pixel screens + components frozen for engineering. Palette: Navy{" "}
            {VS_DESIGN_LOCK.palette.navy} · Slate {VS_DESIGN_LOCK.palette.slate} ·
            Electric Blue {VS_DESIGN_LOCK.palette.electricBlue}.
          </p>
        </div>
      </VsSection>

      <VsSection band="detail" label="Color rules">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              ["navy", VS_COLORS.navy, "Canvas / shell"],
              ["slate", VS_COLORS.slate, "Panels"],
              ["blue", VS_COLORS.blue, "Accent / links / info"],
              ["orange", VS_COLORS.orange, "Caution"],
              ["emerald", VS_COLORS.emerald, "Positive"],
              ["critical", VS_COLORS.critical, "Alert / SIF"],
              ["white", VS_COLORS.white, "Primary text"],
              ["muted", VS_COLORS.muted, "Secondary text"],
              ["border", VS_COLORS.border, "Hairlines"],
              ["panel", VS_COLORS.panel, "Inputs / nested"],
            ] as const
          ).map(([name, hex, use]) => (
            <div key={name} className="vs-panel overflow-hidden p-0">
              <div className="h-12" style={{ background: hex }} />
              <div className="p-2">
                <p className="text-xs font-semibold" style={{ color: VS_COLORS.white }}>
                  {name}
                </p>
                <p className="font-mono text-[10px]" style={{ color: VS_COLORS.muted }}>
                  {hex}
                </p>
                <p className="text-[10px]" style={{ color: VS_COLORS.muted }}>
                  {use}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
          Forbidden: purple/indigo gradients, cream paper themes, Inter/Roboto as
          primary, rounded-full pills, multi-layer shadows.
        </p>
      </VsSection>

      <VsSection band="detail" label="Typography">
        <div className="vs-panel space-y-3 p-4">
          {(
            [
              ["display", "Safety Intelligence Hub"],
              ["title", "Section title"],
              ["subtitle", "Card / panel title"],
              ["body", "Body copy — IBM Plex Sans 14/1.5"],
              ["label", "EYEBROW / KPI LABEL"],
              ["kpi", "1.22"],
            ] as const
          ).map(([key, sample]) => {
            const t = VS_TYPE[key];
            return (
              <div key={key} className="flex flex-wrap items-baseline justify-between gap-2">
                <span
                  style={{
                    fontSize: t.size,
                    fontWeight: t.weight,
                    lineHeight: t.lineHeight,
                    letterSpacing: t.tracking,
                    color: key === "label" ? VS_COLORS.blue : VS_COLORS.white,
                    textTransform: key === "label" ? "uppercase" : undefined,
                  }}
                >
                  {sample}
                </span>
                <span className="font-mono text-[10px]" style={{ color: VS_COLORS.muted }}>
                  {key} · {t.size}px / {t.weight}
                </span>
              </div>
            );
          })}
          <p className="text-xs" style={{ color: VS_COLORS.muted }}>
            Font stack: IBM Plex Sans · Mono: IBM Plex Mono · Radius: {VS_RADIUS}
          </p>
        </div>
      </VsSection>

      <VsSection band="detail" label="Spacing & layout">
        <div className="vs-panel p-4">
          <div className="flex flex-wrap items-end gap-2">
            {([1, 2, 3, 4, 5, 6, 8] as const).map((k) => (
              <div key={k} className="flex flex-col items-center gap-1">
                <div
                  style={{
                    width: VS_SPACE[k],
                    height: VS_SPACE[k],
                    background: VS_COLORS.blue,
                    opacity: 0.7,
                    borderRadius: VS_RADIUS,
                  }}
                />
                <span className="font-mono text-[9px]" style={{ color: VS_COLORS.muted }}>
                  {k}={VS_SPACE[k]}
                </span>
              </div>
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-xs" style={{ color: VS_COLORS.muted }}>
            <li>Desktop shell max: {VS_LAYOUT.shellMaxDesktop}</li>
            <li>Tablet frame max: {VS_LAYOUT.shellMaxTablet}</li>
            <li>
              Band stack gap: {VS_LAYOUT.bandGap}px · KPI min width:{" "}
              {VS_LAYOUT.kpiMinWidth}px
            </li>
            <li>
              Touch target min: {VS_LAYOUT.touchTargetMin}px · Motion ease:{" "}
              {VS_MOTION.ease}
            </li>
          </ul>
        </div>
      </VsSection>

      <VsSection band="kpi" label="KPI tiles (hover · drill)">
        <KpiTile
          label="Incident rate /200k"
          value={1.22}
          delta={-0.14}
          tone="positive"
          sparkline={[1.8, 1.6, 1.4, 1.3, 1.22]}
          interactive
          onClick={() => setKpiMsg("Drilled: Incident rate")}
        />
        <KpiTile
          label="Open actions"
          value={18}
          tone="caution"
          interactive
          onClick={() => setKpiMsg("Drilled: Open actions")}
        />
        <KpiTile
          label="SIF potential"
          value={3}
          tone="critical"
          interactive
          onClick={() => setKpiMsg("Drilled: SIF")}
        />
        <KpiTile
          label="Drill readiness"
          value={78}
          unit="%"
          tone="info"
          interactive
          onClick={() => setKpiMsg("Drilled: Drill readiness")}
        />
      </VsSection>
      <p className="text-xs" style={{ color: VS_COLORS.blue }}>
        {kpiMsg}
      </p>

      <InsightStrip
        chips={[
          { id: "1", label: "Scope", value: "Project", tone: "info", href: "#scope" },
          { id: "2", label: "Quality", value: "86", tone: "positive" },
          { id: "3", label: "Aging", value: "4 overdue", tone: "caution" },
          { id: "4", label: "Alert", value: "3 SIF", tone: "alert" },
        ]}
      />

      <VsSection band="trend" label="Trend · gauge · inspection trend">
        <TrendPanel
          title="Incident rate /200k hrs"
          series={[1.8, 1.6, 1.5, 1.4, 1.35, 1.22].map((value, i) => ({
            period: `M${i + 1}`,
            value,
          }))}
          forecast={[{ period: "M7", value: 1.18 }]}
          anomalies={[{ period: "M3", label: "Spike" }]}
          rangeLabel="6 mo + forecast"
          onPointClick={(p) => setTrendPoint(`${p.period}=${p.value}`)}
          onAnomalyClick={(a) => setTrendPoint(`Anomaly ${a.period}`)}
        />
        <RiskGauge
          label="Risk index"
          score={62}
          band={gaugeBand}
          onClick={() =>
            setGaugeBand((b) => (b === "Elevated" ? "Review band" : "Elevated"))
          }
        />
        <InspectionTrendCard
          title="BBO completion"
          completionPct={86.4}
          ratePer200k={12.2}
          aiFlagged={3}
          period="Jul 2026"
          sparkline={[70, 74, 78, 80, 84, 86]}
          interactive
          onClick={() => setTrendPoint("Inspection trend drill")}
        />
      </VsSection>
      <p className="text-xs" style={{ color: VS_COLORS.muted }}>
        Trend / gauge selection: {trendPoint}
      </p>

      <VsSection band="detail" label="Heatmap · Sankey · severity">
        <LeadingHeatmap
          title="Leading indicators"
          rows={HEAT.rows}
          cols={HEAT.cols}
          cells={HEAT.cells}
          onCellClick={(c) => setHeatCell(`${c.row}/${c.col}=${c.value}`)}
        />
        <RootCauseActionFlow
          title="Root cause → actions"
          selectedLabel={flowLabel}
          onFlowClick={(f) => setFlowLabel(f.rootCauseLabel)}
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
        <SeverityBars
          title="Severity distribution"
          selectedLabel={sevLabel}
          onSegmentClick={(s) => setSevLabel(s.label)}
          segments={[
            { label: "Low", share: 40 },
            { label: "Moderate", share: 28 },
            { label: "Elevated", share: 20 },
            { label: "Critical", share: 12 },
          ]}
        />
      </VsSection>
      <p className="text-xs" style={{ color: VS_COLORS.muted }}>
        Heat cell: {heatCell} · Flow: {flowLabel ?? "—"} · Severity: {sevLabel ?? "—"}
      </p>

      <VsSection band="detail" label="Bubble · aging · comparison">
        <BubbleChart
          title="Hazard frequency × severity"
          xLabel="Frequency"
          yLabel="Severity"
          selectedId={bubbleId}
          onSelect={setBubbleId}
          points={[
            { id: "b1", label: "Fall", x: 12, y: 78, r: 40, tone: "critical" },
            { id: "b2", label: "Struck-by", x: 18, y: 55, r: 28, tone: "caution" },
            { id: "b3", label: "Electrical", x: 6, y: 82, r: 22, tone: "critical" },
            { id: "b4", label: "Ergo", x: 22, y: 35, r: 18, tone: "info" },
          ]}
        />
        <ActionAgingHistogram
          title="Action aging"
          selectedBucket={agingBucket}
          onBinClick={(b) => setAgingBucket(b.bucket)}
          bins={[
            { bucket: "0–7d", corrective: 4, preventive: 2 },
            { bucket: "8–14d", corrective: 3, preventive: 2 },
            { bucket: "15–30d", corrective: 2, preventive: 2 },
            { bucket: "30d+", corrective: 2, preventive: 1 },
          ]}
        />
        <ComparisonPanel
          title="Entity vs industry"
          mode="entity-vs-industry"
          rows={[
            {
              label: "Incident rate /200k",
              left: 1.22,
              right: 1.85,
              unit: "/200k",
            },
            {
              label: "TRIR",
              left: 0.9,
              right: 1.4,
            },
          ]}
        />
      </VsSection>

      <VsSection band="detail" label="Regional drilldown · expand">
        <RegionalMapPanel
          breadcrumbs={[
            { code: "GL", label: "Global" },
            { code: "NA", label: "North America" },
            { code: "CA", label: "Canada" },
            { code: "CA-AB", label: "Alberta" },
          ]}
          children={[
            { code: "YYC", label: "Calgary", level: "city" },
            { code: "YEG", label: "Edmonton", level: "city" },
            { code: "SITE-12", label: "Site 12", level: "site" },
          ]}
          activeCode={region}
          onSelect={setRegion}
        />
        <div className="space-y-3">
          <button
            type="button"
            className={`vs-panel vs-panel-interactive w-full p-4 text-left ${expanded ? "vs-panel-expanded" : ""}`}
            onClick={() => setExpanded((e) => !e)}
          >
            <p className="vs-eyebrow">Hover · expand · drill</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: VS_COLORS.white }}>
              Click to toggle expand state
            </p>
            <p className="mt-1 text-xs vs-drill-target" style={{ color: VS_COLORS.muted }}>
              Drill-target underline on hover
            </p>
          </button>
          <div className="vs-expand-panel" data-open={expanded ? "true" : "false"}>
            <div className="vs-panel p-4 text-xs" style={{ color: VS_COLORS.muted }}>
              Expanded detail region — smart-log drill-down, insight bodies, ERP
              steps. Motion: {VS_MOTION.band}.
            </div>
          </div>
        </div>
      </VsSection>

      <VsSection band="narrative" label="Smart insight cards (expand · accept · dismiss)">
        <AiInsightPanel
          title="Smart insights"
          busyId={busyInsight}
          onAccept={async (item) => {
            setBusyInsight(item.id);
            await new Promise((r) => setTimeout(r, 400));
            setBusyInsight(null);
          }}
          onDismiss={async (item) => {
            setBusyInsight(item.id);
            await new Promise((r) => setTimeout(r, 400));
            setBusyInsight(null);
          }}
          items={[
            {
              id: "1",
              tone: "alert",
              headline: "Overdue investigations >14 days",
              body: "Assign investigators — accept before any system write.",
              confidence: 0.93,
            },
            {
              id: "2",
              tone: "caution",
              headline: "Hotspot: Lift corridor B",
              body: "Near-miss cluster — queue focus audit.",
              confidence: 0.86,
            },
            {
              id: "3",
              tone: "positive",
              headline: "Below industry benchmark",
              body: "Entity 1.22 vs industry 1.85 /200k.",
              confidence: 0.9,
            },
          ]}
        />
      </VsSection>

      <VsSection band="detail" label="Inspection grid · meeting topics">
        <InspectionGrid
          title="Inspection grid"
          selectedId={inspectId}
          onSelect={setInspectId}
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
              date: "2026-07-10",
              type: "focus",
              location: "Corridor B",
              findingsOpen: 3,
              qualityScore: 70,
              status: "in_review",
            },
          ]}
        />
        <MeetingTopicCards
          onSelect={setTopicId}
          topics={[
            {
              id: "t1",
              title: "Exclusion zones — corridor B",
              sourceModule: "near_miss",
              confidence: 0.84,
              selected: topicId === "t1",
              rationale: "Near-miss cluster last 14 days.",
            },
            {
              id: "t2",
              title: "LOTO refresh — fab bay",
              sourceModule: "incident",
              confidence: 0.79,
              selected: topicId === "t2",
            },
          ]}
        />
      </VsSection>

      <VsSection band="detail" label="ERP · JHA · FLHA Energy Wheel">
        <ErpScenarioCards
          onSelect={setErpId}
          items={[
            {
              id: "e1",
              title: "Fall scenario",
              scenario: "fall",
              regionCode: "CA-AB",
              qualityScore: 86,
              status: "active",
              selected: erpId === "e1",
            },
            {
              id: "e2",
              title: "Electrical contact",
              scenario: "electrical",
              regionCode: "CA-AB",
              qualityScore: 74,
              status: "draft",
              selected: erpId === "e2",
            },
          ]}
        />
        <div className="space-y-3">
          <JhaHazardBlocks
            onToggle={(id) => setHazardId((h) => (h === id ? null : id))}
            hazards={[
              {
                id: "h1",
                label: "Fall from height",
                severity: "critical",
                controls: ["100% tie-off"],
                ppe: ["Harness"],
                source: "ai",
                confidence: 0.9,
                selected: hazardId === "h1",
                energyTypes: ["gravity"],
              },
              {
                id: "h2",
                label: "Struck-by mobile plant",
                severity: "elevated",
                controls: ["Spotter", "Exclusion zone"],
                ppe: ["Hi-vis"],
                source: "template",
                selected: hazardId === "h2",
                energyTypes: ["motion", "mechanical"],
              },
            ]}
          />
          <FlhaEnergyWheel
            selectedKey={energyKey}
            onSelect={setEnergyKey}
            energies={[
              { key: "gravity", label: "Gravity", score: 92 },
              { key: "pressure", label: "Pressure", score: 54, flagged: true },
              { key: "motion", label: "Motion", score: 78 },
              { key: "electrical", label: "Electrical", score: 88 },
              { key: "mechanical", label: "Mechanical", score: 81 },
              { key: "chemical", label: "Chemical", score: 70 },
              { key: "temperature", label: "Temperature", score: 66 },
              { key: "sound", label: "Sound", score: 90 },
              { key: "radiation", label: "Radiation", score: 95 },
              { key: "biological", label: "Biological", score: 88 },
            ]}
          />
        </div>
      </VsSection>

      <VsSection band="detail" label="Responsive contract">
        <div className="vs-panel overflow-x-auto p-0">
          <table>
            <thead>
              <tr>
                <th>Breakpoint</th>
                <th>Shell</th>
                <th>KPI</th>
                <th>Trends</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: VS_COLORS.white }}>Desktop ≥1024</td>
                <td>72rem</td>
                <td>auto-fit ≥140px</td>
                <td>2-col</td>
              </tr>
              <tr>
                <td style={{ color: VS_COLORS.white }}>Tablet 768–1023</td>
                <td>48rem frame</td>
                <td>2-col</td>
                <td>stack</td>
              </tr>
              <tr>
                <td style={{ color: VS_COLORS.white }}>Mobile ≤767</td>
                <td>fluid</td>
                <td>1–2 col</td>
                <td>stack · facet drawer</td>
              </tr>
            </tbody>
          </table>
        </div>
      </VsSection>
    </VsDashboardShell>
  );
}

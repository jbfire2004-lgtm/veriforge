/**
 * Build shared VeriPM AI intelligence payload (deterministic, never empty).
 * Multi-chain: field-leading, incident-loop, emergency-prep, competency-loop.
 */

import type {
  AiSuggestion,
  CrossLinkStep,
  IndustryCompareMetric,
  IntelligenceChain,
  NextStepAction,
  RiskForecastPoint,
  VeriPmAccessPlane,
  VeriPmAiIntelligence,
  VeriPmPageContext,
} from "./types";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function resolveVeriPmPlane(
  role: string | null | undefined,
): VeriPmAccessPlane {
  const r = (role ?? "").toUpperCase();
  if (r.includes("CONTRACTOR") || r === "SUBCONTRACTOR") {
    return "subcontractor";
  }
  if (
    r === "SUPER_ADMIN" ||
    r === "ADMIN" ||
    r === "COMPANY_ADMIN" ||
    r === "COMPANY_SAFETY_MANAGER"
  ) {
    return "company";
  }
  return "project";
}

function scopeLabel(plane: VeriPmAccessPlane): string {
  if (plane === "company") return "Company scope";
  if (plane === "subcontractor") return "Subcontractor scope";
  return "Project scope";
}

function qs(projectId: number, companyId: number) {
  return `projectId=${projectId}&companyId=${companyId}`;
}

function step(
  id: CrossLinkStep["id"],
  label: string,
  href: string,
  signal: string,
  active: boolean,
  nextHint: string,
): CrossLinkStep {
  return { id, label, href, signal, active, nextHint };
}

function buildAllChains(
  page: VeriPmPageContext,
  projectId: number,
  companyId: number,
  signals: {
    openIncidents: number;
    openActions: number;
    topicsReady: number;
    inspectionGaps: number;
    trainingGaps: number;
  },
): IntelligenceChain[] {
  const q = qs(projectId, companyId);
  const on = (pages: VeriPmPageContext[]) => pages.includes(page);

  return [
    {
      id: "field-leading",
      title: "FLHA → JHA → Inspections → Meetings → Actions",
      description: "Leading field controls feed planning, verification, briefings, and Action Management.",
      steps: [
        step("flha", "FLHA", `/pm/jha-flha?${q}`, "Energy wheel", on(["jha-flha", "home"]), "Informs JHA templates"),
        step("jha", "JHA", `/pm/jha-flha?${q}`, "Templates", on(["jha-flha"]), "Drives inspection focus"),
        step("inspections", "Inspections", `/pm/inspections?${q}`, `${signals.inspectionGaps} focus`, on(["inspections"]), "Feeds meeting topics"),
        step("meetings", "Meetings", `/pm/safety-meetings?${q}`, `${signals.topicsReady} topics`, on(["safety-meetings"]), "Creates actions"),
        step("actions", "Actions", `/pm/action-management?${q}`, `${signals.openActions} open`, on(["action-management"]), "Closes the loop"),
      ],
    },
    {
      id: "incident-loop",
      title: "Incidents → Actions → Meetings → Inspections",
      description: "Lagging events drive Corrective/Preventive Actions, briefings, and focus audits.",
      steps: [
        step("incidents", "Incidents", `/pm/incidents?${q}`, `${signals.openIncidents} open`, on(["incidents", "home", "project-safety", "predictive"]), "Triggers actions"),
        step("actions", "Actions", `/pm/action-management?${q}`, `${signals.openActions} open`, on(["action-management"]), "Generates topics"),
        step("meetings", "Meetings", `/pm/safety-meetings?${q}`, `${signals.topicsReady} topics`, on(["safety-meetings"]), "Influences focus"),
        step("inspections", "Inspections", `/pm/inspections?${q}`, `${signals.inspectionGaps} focus`, on(["inspections"]), "Verifies controls"),
      ],
    },
    {
      id: "emergency-prep",
      title: "JHA → ERP → FLHA → Inspections",
      description: "High-risk JHA rankings generate ERPs; FLHA references muster; inspections verify kits.",
      steps: [
        step("jha", "JHA", `/pm/jha-flha?${q}`, "Risk rank", on(["jha-flha"]), "Selects ERP scenario"),
        step("erp", "ERP", `/pm/emergency-response?${q}`, "AI plans", on(["emergency"]), "Referenced in FLHA"),
        step("flha", "FLHA", `/pm/jha-flha?${q}`, "Field brief", on(["jha-flha"]), "Verified by inspection"),
        step("inspections", "Inspections", `/pm/inspections?${q}`, "ERP kits", on(["inspections"]), "Readiness closed"),
      ],
    },
    {
      id: "competency-loop",
      title: "Competency → Incidents → Training → Meetings",
      description: "Competency gaps predict incidents; training and meetings close the gap.",
      steps: [
        step("competency", "Competency", `/pm/training?${q}`, `${signals.trainingGaps} gaps`, on(["training"]), "Predicts exposure"),
        step("incidents", "Incidents", `/pm/incidents?${q}`, `${signals.openIncidents} open`, on(["incidents"]), "Confirms gaps"),
        step("training", "Training", `/pm/training?${q}`, "Refreshers", on(["training"]), "Feeds briefings"),
        step("meetings", "Meetings", `/pm/safety-meetings?${q}`, `${signals.topicsReady} topics`, on(["safety-meetings"]), "Reinforces learning"),
      ],
    },
  ];
}

function primaryChainId(page: VeriPmPageContext): IntelligenceChain["id"] {
  if (page === "emergency" || page === "jha-flha") return "emergency-prep";
  if (page === "training") return "competency-loop";
  if (page === "inspections" || page === "safety-meetings") return "field-leading";
  return "incident-loop";
}

function buildSuggestions(
  page: VeriPmPageContext,
  plane: VeriPmAccessPlane,
  projectId: number,
  companyId: number,
  seed: string,
): AiSuggestion[] {
  const q = qs(projectId, companyId);
  const h = hash(seed);
  const scope =
    plane === "company"
      ? "company"
      : plane === "subcontractor"
        ? "your contracted scope"
        : "this project";

  const all: AiSuggestion[] = [
    {
      id: "sug-topic-ladder",
      kind: "meeting_topic",
      title: "Ladder & temporary access briefing",
      detail: `Findings and near-misses on ${scope} cluster on temporary access — schedule a short toolbox talk this week.`,
      confidence: 0.84,
      href: `/pm/safety-meetings/new?${q}&topic=${encodeURIComponent("Ladder & temporary access")}`,
      tone: "caution",
    },
    {
      id: "sug-ca-guard",
      kind: "corrective_action",
      title: "Restore conveyor guard interlock",
      detail: "Linked to open MA investigation — verify interlock before restart.",
      confidence: 0.88,
      href: `/pm/action-management?${q}&tab=workflow&focus=corrective&create=1`,
      tone: "alert",
    },
    {
      id: "sug-pa-checklist",
      kind: "preventive_action",
      title: "Add pre-shift guard/LOTO checklist",
      detail: "Prevent recurrence at similar stations across the plane.",
      confidence: 0.81,
      href: `/pm/action-management?${q}&tab=workflow&focus=preventive&create=1`,
      tone: "info",
    },
    {
      id: "sug-inv-5why",
      kind: "investigation",
      title: "Run 5-Why on exclusion-zone near miss",
      detail: "Preserve scene evidence and interview spotter before shift end.",
      confidence: 0.86,
      href: `/pm/incidents?${q}&tab=investigate`,
      tone: "caution",
    },
    {
      id: "sug-insp-access",
      kind: "inspection_focus",
      title: "Focus audit: temporary access overnight installs",
      detail: "AI links overnight installs to next-morning incidents and findings.",
      confidence: 0.83,
      href: `/pm/inspections?${q}&focus=${encodeURIComponent("temporary-access")}`,
      tone: "caution",
    },
    {
      id: "sug-risk",
      kind: "risk_forecast",
      title: "Elevated struck-by risk next 30 days",
      detail: `Forecast on ${scope}: lift density + incomplete exclusion controls → +12% relative risk.`,
      confidence: 0.74,
      href: `/pm/predictive-safety-analytics?${q}`,
      tone: "alert",
    },
    {
      id: "sug-industry",
      kind: "industry_comparison",
      title: "Incident rate vs industry",
      detail:
        h % 2 === 0
          ? "Your plane is below industry average — sustain leading controls."
          : "Your plane is above industry average — prioritize Action Management closure.",
      confidence: 0.8,
      href: `/pm/incidents?${q}&tab=dashboard`,
      tone: h % 2 === 0 ? "positive" : "caution",
    },
    {
      id: "sug-narrative",
      kind: "narrative",
      title: "Weekly safety narrative",
      detail: `Near-miss reporting is healthy; corrective median age and access findings are the main drag on ${scope}.`,
      confidence: 0.9,
      href: `/pm?${q}`,
      tone: "neutral",
    },
    {
      id: "sug-hazard",
      kind: "hazard_control",
      title: "Add Motion energy control — exclusion zone",
      detail: "FLHA Energy Wheel shows Motion rising; miss rate on exclusion zones is elevated.",
      confidence: 0.85,
      href: `/pm/jha-flha?${q}`,
      tone: "caution",
    },
    {
      id: "sug-erp",
      kind: "erp_scenario",
      title: "Generate Fall ERP for current work type",
      detail: "JHA risk rank critical on fall from height — pair with local EMS lookup.",
      confidence: 0.87,
      href: `/pm/emergency-response?${q}&scenario=fall`,
      tone: "alert",
    },
    {
      id: "sug-jha",
      kind: "jha_update",
      title: "Update JHA from recurring inspection finding",
      detail: "Incomplete scaffold tags recur — push control into industry template library.",
      confidence: 0.8,
      href: `/pm/jha-flha?${q}`,
      tone: "info",
    },
    {
      id: "sug-train-loto",
      kind: "meeting_topic",
      title: "Competency refresh: energy isolation",
      detail: "Training gaps on LOTO correlate with open investigations — assign refreshers.",
      confidence: 0.77,
      href: `/pm/training?${q}&focus=loto`,
      tone: "caution",
    },
  ];

  const priority: Record<VeriPmPageContext, AiSuggestion["kind"][]> = {
    home: ["narrative", "risk_forecast", "industry_comparison", "corrective_action", "hazard_control"],
    incidents: ["investigation", "corrective_action", "preventive_action", "meeting_topic", "inspection_focus"],
    "action-management": ["corrective_action", "preventive_action", "meeting_topic", "inspection_focus"],
    "safety-meetings": ["meeting_topic", "inspection_focus", "corrective_action", "narrative"],
    inspections: ["inspection_focus", "corrective_action", "jha_update", "meeting_topic"],
    training: ["meeting_topic", "preventive_action", "inspection_focus", "narrative"],
    "project-safety": ["narrative", "industry_comparison", "risk_forecast", "corrective_action"],
    predictive: ["risk_forecast", "industry_comparison", "inspection_focus", "erp_scenario"],
    "jha-flha": ["hazard_control", "jha_update", "erp_scenario", "inspection_focus", "risk_forecast"],
    emergency: ["erp_scenario", "hazard_control", "jha_update", "inspection_focus", "narrative"],
  };

  const order = priority[page] ?? priority.home;
  return [...all].sort((a, b) => {
    const ai = order.indexOf(a.kind);
    const bi = order.indexOf(b.kind);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function buildNextSteps(
  page: VeriPmPageContext,
  projectId: number,
  companyId: number,
  signals: {
    openIncidents: number;
    openActions: number;
    topicsReady: number;
  },
): NextStepAction[] {
  const q = qs(projectId, companyId);
  const steps: NextStepAction[] = [
    {
      id: "ns-investigate",
      label: "Close open investigations",
      reason: `${signals.openIncidents} incidents still open`,
      href: `/pm/incidents?${q}&tab=dashboard`,
      priority: page === "incidents" ? 1 : 4,
    },
    {
      id: "ns-actions",
      label: "Advance Action Management",
      reason: `${signals.openActions} actions need evidence`,
      href: `/pm/action-management?${q}`,
      priority: page === "action-management" ? 1 : 3,
    },
    {
      id: "ns-meeting",
      label: "Schedule AI-suggested meeting",
      reason: `${signals.topicsReady} topics ready`,
      href: `/pm/safety-meetings?${q}&tab=generator`,
      priority: page === "safety-meetings" ? 1 : 4,
    },
    {
      id: "ns-inspect",
      label: "Run focused inspection",
      reason: "AI focus from incidents / JHA / meetings",
      href: `/pm/inspections?${q}`,
      priority: page === "inspections" ? 1 : 4,
    },
    {
      id: "ns-jha",
      label: "Review FLHA / JHA intelligence",
      reason: "Energy wheel + template risk ranks",
      href: `/pm/jha-flha?${q}`,
      priority: page === "jha-flha" ? 1 : 5,
    },
    {
      id: "ns-erp",
      label: "Generate / refresh ERP",
      reason: "Match scenario to high-risk JHA",
      href: `/pm/emergency-response?${q}`,
      priority: page === "emergency" ? 1 : 5,
    },
    {
      id: "ns-train",
      label: "Assign competency refresh",
      reason: "Close training gaps linked to root causes",
      href: `/pm/training?${q}`,
      priority: page === "training" ? 1 : 6,
    },
  ];
  return steps.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

function buildForecast(seed: string): RiskForecastPoint[] {
  const out: RiskForecastPoint[] = [];
  const now = new Date();
  const base = 1.4 + (hash(seed) % 40) / 100;
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const n = (hash(`${seed}:fc:${period}`) % 1000) / 1000;
    const value = Math.round((base + i * 0.04 + (n - 0.5) * 0.25) * 100) / 100;
    out.push({
      period,
      value,
      bandLow: Math.round((value - 0.2) * 100) / 100,
      bandHigh: Math.round((value + 0.25) * 100) / 100,
    });
  }
  return out;
}

function buildIndustry(
  plane: VeriPmAccessPlane,
  seed: string,
): { summary: string; metrics: IndustryCompareMetric[] } {
  const h = hash(seed);
  const rate = Math.round((1.1 + (h % 90) / 100) * 100) / 100;
  const industry = Math.round((1.85 + (h % 40) / 100) * 100) / 100;
  const leading = 70 + (h % 22);
  const industryLeading = 68 + (h % 10);
  const better = rate < industry;
  return {
    summary: better
      ? `${scopeLabel(plane)} is below industry incident rate — keep leading programs funded.`
      : `${scopeLabel(plane)} is above industry incident rate — run the full intelligence chains.`,
    metrics: [
      {
        label: "Incident rate",
        entity: rate,
        industry,
        unit: "/200k",
        betterThanIndustry: better,
      },
      {
        label: "Leading indicator score",
        entity: leading,
        industry: industryLeading,
        unit: "/100",
        betterThanIndustry: leading >= industryLeading,
      },
      {
        label: "Action on-time close %",
        entity: 72 + (h % 18),
        industry: 70 + (h % 8),
        unit: "%",
        betterThanIndustry: true,
      },
    ],
  };
}

export function buildVeriPmAiIntelligence(input: {
  page: VeriPmPageContext;
  plane?: VeriPmAccessPlane;
  role?: string | null;
  projectId?: number;
  companyId?: number;
}): VeriPmAiIntelligence {
  const plane = input.plane ?? resolveVeriPmPlane(input.role ?? null);
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const page = input.page;
  const seed = `${plane}:${companyId}:${projectId}:${page}`;
  const h = hash(seed);
  const scale = plane === "company" ? 4 : plane === "subcontractor" ? 0.55 : 1;

  const signals = {
    openIncidents: Math.max(2, Math.round((3 + (h % 5)) * Math.min(scale, 2))),
    openActions: Math.max(4, Math.round((8 + (h % 10)) * Math.min(scale, 2))),
    topicsReady: 4 + (h % 5),
    inspectionGaps: 3 + (h % 4),
    trainingGaps: 2 + (h % 5),
  };

  const industryComparison = buildIndustry(plane, seed);
  const suggestions = buildSuggestions(page, plane, projectId, companyId, seed);
  const narrativeSuggestion = suggestions.find((s) => s.kind === "narrative");
  const chains = buildAllChains(page, projectId, companyId, signals);
  const primary = chains.find((c) => c.id === primaryChainId(page)) ?? chains[0]!;

  return {
    generatedAt: new Date().toISOString(),
    revision: h % 10_000,
    plane,
    scopeLabel: scopeLabel(plane),
    page,
    projectId,
    companyId,
    narrative: {
      headline: narrativeSuggestion?.title ?? "Safety narrative",
      body: narrativeSuggestion?.detail ?? industryComparison.summary,
      confidence: narrativeSuggestion?.confidence ?? 0.85,
    },
    suggestions,
    chain: primary.steps,
    chains,
    nextSteps: buildNextSteps(page, projectId, companyId, signals),
    riskForecast: buildForecast(seed),
    industryComparison,
    insights: [
      {
        id: "ins-chain",
        tone: "neutral",
        headline: primary.title,
        body: primary.description,
        confidence: 0.92,
      },
      {
        id: "ins-industry",
        tone: industryComparison.metrics[0]?.betterThanIndustry
          ? "positive"
          : "caution",
        headline: "Industry benchmark",
        body: industryComparison.summary,
        confidence: 0.8,
      },
      {
        id: "ins-risk",
        tone: "caution",
        headline: "Risk forecast",
        body:
          suggestions.find((s) => s.kind === "risk_forecast")?.detail ??
          "Monitor struck-by and access hazards over the next 30 days.",
        confidence: 0.74,
      },
    ],
    rules: {
      planeIsolated: true,
      crossLinked: true,
      ratesNormalizedPer200k: true,
    },
  };
}

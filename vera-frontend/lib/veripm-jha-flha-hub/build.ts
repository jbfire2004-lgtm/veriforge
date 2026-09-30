/**
 * Build JHA/FLHA hub (deterministic, never empty).
 */

import type {
  DirectControlStat,
  EnergyFrequency,
  FlhaAiReviewFlag,
  FlhaQualityScore,
  HazardPrediction,
  JhaFlhaHubDashboard,
  JhaIndustry,
  JhaQualityScore,
  JhaTemplate,
  JhaVersion,
  RiskRankRow,
  SmartJhaSuggestion,
  TrendPoint,
} from "./types";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function series(
  seed: string,
  n: number,
  base: number,
  drift: number,
  noise: number,
): TrendPoint[] {
  const out: TrendPoint[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
    const period = `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, "0")}`;
    const v =
      (hash(`${seed}:${period}`) % 1000) / 1000;
    const t = n - i;
    out.push({
      period,
      value: Math.max(0, Math.round((base + drift * (t / n) + (v - 0.5) * noise) * 10) / 10),
    });
  }
  return out;
}

const ENERGIES = [
  "Gravity",
  "Motion",
  "Mechanical",
  "Electrical",
  "Pressure",
  "Temperature",
  "Chemical",
  "Radiation",
  "Sound",
  "Biological",
];

const CONTROLS = [
  "Exclusion zone",
  "LOTO / energy isolation",
  "Fall protection",
  "Spotter / signal person",
  "PPE — face/eye",
  "Barricade / tagging",
  "Ventilation",
  "Ground disturbance permit",
];

function scopeLabel(plane: string) {
  if (plane === "company") return "Company scope";
  if (plane === "subcontractor") return "Subcontractor scope";
  return "Project scope";
}

function q(projectId: number, companyId: number) {
  return `projectId=${projectId}&companyId=${companyId}`;
}

function buildTemplates(seed: string): JhaTemplate[] {
  const h = hash(seed);
  const catalog: Array<Omit<JhaTemplate, "id" | "riskRank">> = [
    {
      industry: "construction",
      title: "Scaffold erection — exterior",
      description: "Erect tube-and-clamp scaffold on occupied site.",
      tasks: ["Inspect components", "Base plates & mud sills", "Erect frames", "Install planks & guardrails"],
      hazards: ["Fall from height", "Struck by materials", "Unstable base"],
      controls: ["Competent person", "Fall arrest", "Exclusion zone", "Tag system"],
      ppe: ["Hard hat", "Harness", "Safety boots", "Gloves"],
    },
    {
      industry: "mining",
      title: "Underground mucking — LHD",
      description: "Load-haul-dump in active heading.",
      tasks: ["Pre-use inspection", "Enter heading", "Load ore", "Haul to ore pass"],
      hazards: ["Ground fall", "Vehicle collision", "Dust / diesel", "Energy isolation"],
      controls: ["Ground support check", "Radio protocol", "Ventilation on", "Spotter"],
      ppe: ["Cap lamp", "Respirator", "Metatarsal boots", "Hearing protection"],
    },
    {
      industry: "manufacturing",
      title: "Conveyor jam clear",
      description: "Clear jam on production conveyor with LOTO.",
      tasks: ["Stop & isolate", "Verify zero energy", "Clear jam", "Restore & restart"],
      hazards: ["Entanglement", "Unexpected startup", "Sharp edges"],
      controls: ["LOTO verified", "Guard interlock", "Try-start", "Buddy check"],
      ppe: ["Cut-resistant gloves", "Safety glasses", "Steel toe"],
    },
    {
      industry: "utilities",
      title: "Live panel troubleshooting",
      description: "Diagnose energized MCC panel under permit.",
      tasks: ["Review one-line", "Establish arc flash boundary", "Test with CAT-rated meter", "Document findings"],
      hazards: ["Arc flash", "Shock", "Burns"],
      controls: ["Energized work permit", "Arc-rated PPE", "Standby observer", "Insulated tools"],
      ppe: ["AR clothing", "Face shield", "Voltage-rated gloves", "FR boots"],
    },
    {
      industry: "construction",
      title: "Trench excavation >1.2m",
      description: "Open excavation with sloping / shoring.",
      tasks: ["Locate utilities", "Excavate", "Shore / slope", "Daily inspection"],
      hazards: ["Cave-in", "Struck by equipment", "Atmospheric"],
      controls: ["Competent person", "Protective system", "Spoil setback", "Gas monitor"],
      ppe: ["Hard hat", "Hi-vis", "Boots", "Gas detector"],
    },
    {
      industry: "mining",
      title: "Drill & blast prep",
      description: "Charge holes and clear blast zone.",
      tasks: ["Load explosives", "Stem holes", "Clear zone", "Fire blast"],
      hazards: ["Explosive energy", "Flyrock", "Misfire"],
      controls: ["Blast plan", "Exclusion radius", "Radio silence", "Misfire procedure"],
      ppe: ["Hearing protection", "Safety glasses", "Hard hat"],
    },
    {
      industry: "manufacturing",
      title: "Hot work — welding bay",
      description: "Weld structural steel indoors.",
      tasks: ["Hot work permit", "Clear combustibles", "Weld", "Fire watch"],
      hazards: ["Fire", "Fumes", "Burns", "UV"],
      controls: ["Fire watch 60m", "Local exhaust", "Screens", "Extinguisher"],
      ppe: ["Welding helmet", "Leather apron", "Respirator", "Gauntlets"],
    },
    {
      industry: "utilities",
      title: "Confined space — vault entry",
      description: "Enter utility vault for inspection.",
      tasks: ["Atmosphere test", "Permit", "Enter with retrieval", "Exit & close"],
      hazards: ["Atmospheric", "Engulfment", "Energy"],
      controls: ["Permit required", "Attendant", "Retrieval gear", "Continuous monitor"],
      ppe: ["Harness", "Gas monitor", "Rescue tripod"],
    },
  ];
  return catalog.map((t, i) => ({
    ...t,
    id: `jha-tmpl-${hash(`${seed}:${t.title}`) % 9000 + 100}`,
    riskRank: 45 + ((h + i * 11) % 50),
    qualityScore: Math.min(98, 70 + ((h + i * 7) % 26)),
    currentVersion: `v${1 + (i % 3)}.${(h + i) % 5}`,
  }));
}

export function buildJhaFlhaHub(input: {
  plane?: "project" | "company" | "subcontractor";
  role?: string | null;
  projectId?: number;
  companyId?: number;
  industry?: JhaIndustry;
  workType?: string;
  region?: string;
}): JhaFlhaHubDashboard {
  const plane = input.plane ?? resolveVeriPmPlane(input.role);
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const industry = input.industry ?? "construction";
  const workType = input.workType ?? "General construction";
  const region = input.region ?? "CA-AB";
  const seed = `jhaflha:${plane}:${companyId}:${projectId}:${industry}`;
  const h = hash(seed);
  const qs = q(projectId, companyId);
  const scale = plane === "company" ? 3.2 : plane === "subcontractor" ? 0.6 : 1;

  const energyFrequency: EnergyFrequency[] = ENERGIES.map((energy, i) => {
    const week = Math.round((2 + ((h + i * 3) % 8)) * scale);
    const month = week * 4 + ((h + i) % 5);
    const year = month * 10 + ((h + i * 7) % 20);
    return { energy, week, month, year, sharePct: 0 };
  });
  const yearTotal = energyFrequency.reduce((s, e) => s + e.year, 0) || 1;
  for (const e of energyFrequency) {
    e.sharePct = Math.round((e.year / yearTotal) * 1000) / 10;
  }
  energyFrequency.sort((a, b) => b.year - a.year);

  const topEnergies = energyFrequency.slice(0, 5).map((e) => ({
    energy: e.energy,
    count: e.month,
    sharePct: e.sharePct,
  }));

  const directControls: DirectControlStat[] = CONTROLS.map((control, i) => {
    const applied = Math.round((12 + ((h + i * 5) % 20)) * scale);
    const missed = Math.round((1 + ((h + i * 3) % 6)) * Math.min(scale, 1.5));
    const trendingDown = i % 3 === 0 || missed > applied * 0.25;
    return {
      control,
      applied,
      missed,
      trendingDown,
      trend: series(
        `${seed}:ctl:${control}`,
        8,
        applied / 4,
        trendingDown ? -0.8 : 0.3,
        1.2,
      ),
    };
  });
  const controlsTrendingDown = directControls.filter((c) => c.trendingDown);

  const hazardPredictions: HazardPrediction[] = [
    {
      id: "hp-1",
      hazard: "Fall from temporary access",
      workType,
      region,
      likelihood: 3 + (h % 3),
      severity: 4,
      riskScore: 0,
      rationale: `Region ${region} + ${workType}: overnight installs correlate with incomplete morning tags.`,
      suggestedControls: ["Competent person sign-off", "Fall protection", "Morning access inspection"],
    },
    {
      id: "hp-2",
      hazard: "Struck-by — suspended load",
      workType,
      region,
      likelihood: 3,
      severity: 5,
      riskScore: 0,
      rationale: "Lift density elevated; exclusion zone compliance trending down.",
      suggestedControls: ["Exclusion zone", "Tag lines", "Spotter radio check"],
    },
    {
      id: "hp-3",
      hazard: "Energy isolation failure",
      workType,
      region,
      likelihood: 2 + (h % 2),
      severity: 5,
      riskScore: 0,
      rationale: "Industry peer incidents on jam-clear without LOTO verification.",
      suggestedControls: ["LOTO checklist", "Try-start", "Buddy verification"],
    },
  ].map((p) => ({
    ...p,
    riskScore: p.severity * p.likelihood,
  }));

  const controlAdequacy = Math.min(100, 70 + (h % 24));
  const quality: FlhaQualityScore = {
    overall: Math.min(98, 72 + (h % 22)),
    completeness: Math.min(100, 78 + (h % 18)),
    controlCoverage: controlAdequacy,
    controlAdequacy,
    energyAccuracy: Math.min(100, 75 + (h % 20)),
    repetitionScore: Math.min(100, 60 + (h % 30)),
    narrative:
      "FLHA quality is driven by energy identification accuracy, control adequacy, and repetition detection. Missed controls on Motion and Gravity are the main drag.",
  };

  const aiReviewer: FlhaAiReviewFlag[] = [
    {
      id: "rev-miss",
      severity: "alert",
      category: "missing_control",
      title: "Missing exclusion zone on Motion energy",
      detail: `${controlsTrendingDown[0]?.control ?? "Exclusion zone"} miss rate elevated vs applied.`,
      suggestedFix: "Require tagged exclusion zone photo evidence before lift start.",
      href: `/pm/inspections?${qs}&focus=exclusion-zones`,
    },
    {
      id: "rev-weak",
      severity: "caution",
      category: "weak_hazard",
      title: "Weak hazard description detected",
      detail: "Recent FLHAs use generic “be careful” language instead of energy + exposure path.",
      suggestedFix: "Rewrite hazards using Energy Wheel + exposure pathway format.",
      href: `/pm/jha-flha/new/flha?${qs}`,
    },
    {
      id: "rev-rep",
      severity: "caution",
      category: "repeated_flha",
      title: "Repeated FLHA pattern",
      detail: `Repetition score ${quality.repetitionScore}/100 — same crew reused prior FLHA without refreshing controls.`,
      suggestedFix: "Force refresh when work type or region changes; push JHA version bump.",
      href: `/pm/jha-flha?${qs}`,
    },
  ];

  const allTemplates = buildTemplates(seed);

  const smartSuggestions: SmartJhaSuggestion[] = [
    {
      id: "sg-task",
      kind: "task",
      label: "Verify zero energy before jam clear",
      reason: "Predicted from Electrical + Mechanical energy frequency",
      confidence: 0.86,
    },
    {
      id: "sg-haz",
      kind: "hazard",
      label: "Uncontrolled swing of suspended load",
      reason: `AI hazard predictor · ${workType} · ${region}`,
      confidence: 0.82,
    },
    {
      id: "sg-ctl",
      kind: "control",
      label: "Establish tagged exclusion zone before lift",
      reason: "Top missed direct control this month",
      confidence: 0.88,
    },
    {
      id: "sg-ppe",
      kind: "ppe",
      label: "Chin-strap hard hat + Class E",
      reason: "Industry template + regional wind advisories",
      confidence: 0.74,
    },
  ];

  const riskRanking: RiskRankRow[] = hazardPredictions.map((p) => ({
    hazard: p.hazard,
    severity: p.severity,
    likelihood: p.likelihood,
    score: p.riskScore,
    band:
      p.riskScore >= 16
        ? "critical"
        : p.riskScore >= 10
          ? "elevated"
          : p.riskScore >= 6
            ? "moderate"
            : "low",
  }));

  const versions: JhaVersion[] = allTemplates.slice(0, 5).flatMap((t, i) => [
    {
      id: `ver-${t.id}-a`,
      templateId: t.id,
      version: t.currentVersion,
      changedAt: new Date(Date.now() - (i + 1) * 86400000 * 12).toISOString().slice(0, 10),
      summary: "Updated controls from inspection findings + FLHA AI reviewer",
      authorRole: "Safety coordinator",
    },
    {
      id: `ver-${t.id}-b`,
      templateId: t.id,
      version: `v${Math.max(1, parseInt(t.currentVersion.replace(/\D/g, "") || "1", 10) - 1)}.0`,
      changedAt: new Date(Date.now() - (i + 3) * 86400000 * 30).toISOString().slice(0, 10),
      summary: "Baseline industry template import",
      authorRole: "System",
    },
  ]);

  const jhaQuality: JhaQualityScore = {
    overall: Math.min(98, 74 + (h % 20)),
    completeness: Math.min(100, 80 + (h % 16)),
    controlAdequacy: Math.min(100, 72 + (h % 22)),
    industryAlignment: Math.min(100, 78 + (h % 18)),
    narrative:
      "JHA quality reflects task/hazard/control/PPE completeness, control adequacy vs Energy Wheel, and alignment with industry templates.",
  };

  return {
    generatedAt: new Date().toISOString(),
    revision: h % 10_000,
    projectId,
    companyId,
    plane,
    scopeLabel: scopeLabel(plane),
    periodLabel: "Week / month / year",
    flha: {
      energyFrequency,
      topEnergies,
      directControls,
      controlsTrendingDown,
      hazardPredictions,
      quality,
      aiReviewer,
      completionTrend: series(`${seed}:flha-comp`, 12, 18 * scale, 2, 4),
    },
    jha: {
      templates: allTemplates,
      smartSuggestions,
      riskRanking,
      versions: versions.slice(0, 8),
      quality: jhaQuality,
      builderSeed: {
        workType,
        region,
        industry,
        suggestedTitle: `${industry} — ${workType} JHA`,
      },
    },
    links: {
      inspections: `/pm/inspections?${qs}`,
      meetings: `/pm/safety-meetings?${qs}`,
      actions: `/pm/action-management?${qs}`,
      incidents: `/pm/incidents?${qs}`,
      emergency: `/pm/emergency-response?${qs}`,
      training: `/pm/training?${qs}`,
      newFlha: `/pm/jha-flha/new/flha?${qs}`,
      newJha: `/pm/jha-flha/new/jha?${qs}`,
    },
    insights: [
      {
        id: "ins-energy",
        tone: "caution",
        headline: `Top energy: ${topEnergies[0]?.energy ?? "Gravity"}`,
        body: `${topEnergies[0]?.energy} leads frequency this month. Pair FLHA briefings with focused inspections on related controls.`,
        confidence: 0.85,
      },
      {
        id: "ins-quality",
        tone: quality.overall >= 80 ? "positive" : "caution",
        headline: `FLHA quality ${quality.overall}/100`,
        body: quality.narrative,
        confidence: 0.8,
      },
      {
        id: "ins-reviewer",
        tone: "alert",
        headline: `${aiReviewer.length} AI reviewer flags`,
        body: aiReviewer.map((f) => f.title).join(" · "),
        confidence: 0.86,
      },
      {
        id: "ins-link",
        tone: "neutral",
        headline: "Cross-page loop",
        body: "FLHA → JHA updates → ERP → Safety meetings → Inspection focus → Training modules.",
        confidence: 0.9,
      },
    ],
    rules: { neverEmpty: true, planeIsolated: true },
  };
}

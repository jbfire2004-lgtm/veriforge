import { API_URL } from "./api";
import { fetchJson } from "./core";

const BASE = `${API_URL}/api/v1/pm/sif-heca`;

export type SifHecaEvent = {
  id: string;
  title: string;
  status: string;
  sourceType: string;
  sourceId: string;
  projectId: number;
  sifScore?: {
    sifScore: number;
    sifCategory: string;
    requiresSupervisorReview: boolean;
    requiredControls?: string[];
    requiredActions?: string[];
    explainability: Array<{ rule: string; points: number; detail: string }>;
  };
  hecaScore?: {
    hecaCategoryCode: string;
    hecaCategoryLabel: string;
    hecaRiskScore: number;
    highEnergyFlag: boolean;
    requiredControls?: string[];
    requiredCorrective?: string[];
  };
};

export async function listSifHecaEvents(projectId: number) {
  return fetchJson<SifHecaEvent[]>(`${BASE}/events?projectId=${projectId}`);
}

export async function getSifHecaEvent(id: string) {
  return fetchJson<SifHecaEvent>(`${BASE}/events/${id}`);
}

export type SifHecaEvaluateResult = {
  sif_score: number;
  sif_category: string;
  heca_category: string;
  heca_category_label: string;
  heca_risk_score?: number;
  required_controls: string[];
  required_corrective_actions: string[];
  high_energy_flag: boolean;
  requires_supervisor_review: boolean;
  explainability?: {
    sif?: Array<{ rule: string; points: number; detail: string }>;
    heca?: Array<{ rule: string; detail: string }>;
    csra?: Array<{ rule: string; detail: string }>;
  };
  control_findings?: string[];
  csra?: CsraAssessment;
};

export type CsraProximity = "contact" | "near" | "zone" | "remote";

export type CsraEnergySource = {
  type: string;
  label: string;
  highEnergy: boolean;
  magnitude: number;
  evidence: string[];
};

export type CsraClassifiedControl = {
  description: string;
  controlType: string;
  controlClass: "direct" | "alternative";
  adequate: boolean;
  verified: boolean;
  linkedEnergies: string[];
};

export type CsraRecommendation = {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  controlClass: "direct" | "alternative";
  controlType: string;
  description: string;
  energyType: string;
  reason: string;
};

export type HecaAssessmentDocument = {
  documentType: "HECA_CSRA";
  title: string;
  generatedAt: string;
  methodology: "CSRA";
  revision: string;
  summary: {
    highEnergy: boolean;
    sifApplies: boolean;
    sifCategory: string;
    sifScore: number;
    directControlCount: number;
    alternativeControlCount: number;
    missingDirectControls: number;
    supervisorReviewRequired: boolean;
    readyForWork: boolean;
  };
  sections: Array<{
    id: string;
    title: string;
    body: string;
    bullets?: string[];
  }>;
};

export type CsraAssessment = {
  methodology: "CSRA";
  highEnergySources: CsraEnergySource[];
  exposure: {
    level: number;
    proximity: CsraProximity;
    score: number;
    narrative: string;
  };
  controls: {
    classified: CsraClassifiedControl[];
    directCount: number;
    alternativeCount: number;
    hasDirectForHighEnergy: boolean;
    adequate: boolean;
    findings: string[];
  };
  sifPotential: {
    applies: boolean;
    category: string;
    score: number;
    indicators: string[];
    narrative: string;
    requiresSupervisorReview: boolean;
  };
  recommendations: CsraRecommendation[];
  document: HecaAssessmentDocument;
};

export type SifHecaInferredHazard = {
  description: string;
  category: string;
  severity: number;
  likelihood: number;
  energy_types: string[];
  sif_indicator?: string;
  heca_category?: string;
  reason: string;
};

export type SifHecaInferredControl = {
  description: string;
  control_type: string;
  linked_hazard: string;
  reason: string;
};

export type SifHecaScopeAnalysis = {
  engine: string[];
  job_steps: string[];
  inferred_hazards: SifHecaInferredHazard[];
  inferred_controls: SifHecaInferredControl[];
  energy_types: string[];
  max_severity: number;
  max_likelihood: number;
  heca_assessment: {
    primary_category: string;
    primary_label: string;
    secondary_categories: string[];
    high_energy: boolean;
    narrative: string;
  };
  sif_protocol: {
    applies: boolean;
    category: string;
    indicators: string[];
    narrative: string;
    requires_supervisor_review: boolean;
  };
  scope_fit_summary: string;
  warnings: string[];
};

export type SifHecaScopeAnalysisResponse = {
  analysis: SifHecaScopeAnalysis;
  evaluation: SifHecaEvaluateResult;
  csra?: CsraAssessment;
};

export async function analyzeSifHecaScope(body: {
  companyId: number;
  projectId: number;
  title: string;
  jobDescription?: string;
  workScope?: string;
  locationNote?: string;
  environmentNote?: string;
  equipmentNote?: string;
}) {
  return fetchJson<SifHecaScopeAnalysisResponse>(`${BASE}/analyze-scope`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function assessCsraHeca(body: {
  companyId: number;
  projectId: number;
  title: string;
  description?: string;
  workScope?: string;
  locationNote?: string;
  environmentNote?: string;
  equipmentNote?: string;
  energyTypes?: string[];
  exposureLevel?: 1 | 2 | 3 | 4 | 5;
  proximity?: CsraProximity;
  controls?: Array<{
    description?: string;
    controlType: string;
    adequate?: boolean;
    effectivenessScore?: number;
    verified?: boolean;
    energyTypes?: string[];
  }>;
}) {
  return fetchJson<CsraAssessment>(`${BASE}/csra-assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function evaluateSifHeca(body: {
  companyId: number;
  projectId: number;
  title: string;
  description?: string;
  hazardSeverity: number;
  hazardLikelihood: number;
  energyTypes: string[];
  controls?: Array<{
    controlType: string;
    adequate?: boolean;
    effectivenessScore?: number;
  }>;
}) {
  return fetchJson<SifHecaEvaluateResult>(`${BASE}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchSifEnergyWheel() {
  return fetchJson<{ segments: Array<Record<string, unknown>> }>(`${BASE}/energy-wheel`);
}

export async function scoreSifHeca(body: {
  companyId: number;
  projectId: number;
  sourceType: string;
  sourceId: string;
  sourceItemId?: string;
  title: string;
  description?: string;
  hazardSeverity: number;
  hazardLikelihood: number;
  energyTypes: string[];
  controls?: Array<{
    controlType: string;
    adequate?: boolean;
    effectivenessScore?: number;
  }>;
}) {
  return fetchJson<SifHecaEvent>(`${BASE}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function reviewSifHecaEvent(
  id: string,
  action: "approve" | "reject" | "request_changes",
  notes?: string,
) {
  return fetchJson<SifHecaEvent>(`${BASE}/events/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, notes }),
  });
}

export async function fetchSifHecaAnalytics(projectId: number) {
  return fetchJson<{
    projectId: number;
    totalEvents: number;
    sifHighCount: number;
    highEnergyCount: number;
    averageSifScore: number;
    hecaDistribution: Record<string, number>;
    projectSifScore: number;
  }>(`${BASE}/analytics/project/${projectId}`);
}

export async function fetchSifHecaLibraries(companyId: number, projectId?: number) {
  const q = projectId ? `&projectId=${projectId}` : "";
  const [indicators, categories] = await Promise.all([
    fetchJson<Array<Record<string, unknown>>>(
      `${BASE}/library/indicators?companyId=${companyId}${q}`,
    ),
    fetchJson<Array<Record<string, unknown>>>(
      `${BASE}/library/heca-categories?companyId=${companyId}${q}`,
    ),
  ]);
  return { indicators, categories };
}

export type VeraOrchestratorAnalysis = {
  moduleType: string;
  recordId: string;
  facts: string[];
  analysis: string[];
  actions: string[];
};

export async function fetchSifHecaOrchestrator(eventId: string) {
  return fetchJson<VeraOrchestratorAnalysis>(`${BASE}/events/${eventId}/orchestrator`);
}

export function buildSifHecaOrchestratorFromAnalysis(
  result: SifHecaScopeAnalysisResponse,
  title: string,
): VeraOrchestratorAnalysis {
  const { analysis, evaluation } = result;
  const facts = [
    `Activity: ${title}`,
    `${analysis.inferred_hazards.length} inferred hazard(s), ${analysis.inferred_controls.length} control(s)`,
    `Energy types: ${analysis.energy_types.join(", ") || "none"}`,
    `Max risk matrix: ${analysis.max_severity}×${analysis.max_likelihood}`,
    analysis.job_steps.length
      ? `Job steps: ${analysis.job_steps.slice(0, 3).join("; ")}`
      : "Job steps: not inferred",
  ];
  if (analysis.warnings.length) {
    facts.push(`Warnings: ${analysis.warnings.join("; ")}`);
  }

  const analysisLines = [
    analysis.sif_protocol.applies
      ? `SIF POTENTIAL — ${analysis.sif_protocol.narrative}`
      : `Routine SIF profile — ${analysis.sif_protocol.narrative}`,
    `SIF category: ${analysis.sif_protocol.category} · score ${evaluation.sif_score}`,
    `HECA: ${analysis.heca_assessment.primary_label}${
      analysis.heca_assessment.high_energy ? " · HIGH ENERGY" : ""
    }`,
    analysis.heca_assessment.narrative,
    ...(result.csra
      ? [
          `CSRA: ${result.csra.controls.directCount} Direct / ${result.csra.controls.alternativeCount} Alternative controls`,
          result.csra.exposure.narrative,
          ...result.csra.recommendations
            .slice(0, 3)
            .map((r) => `Recommend (${r.controlClass}): ${r.description}`),
        ]
      : []),
    ...analysis.warnings.slice(0, 3),
  ];

  const actions = [
    ...(evaluation.required_controls ?? []).map((c) => `Implement control: ${c}`),
    ...(evaluation.required_corrective_actions ?? []).map((a) => `Corrective action: ${a}`),
    evaluation.requires_supervisor_review
      ? "Supervisor review required before work proceeds."
      : "Verify controls in field before starting work.",
    "Create SIF/HECA record to track approval and CAPA.",
  ];

  return {
    moduleType: analysis.heca_assessment.high_energy ? "HECA" : "SIF",
    recordId: "preview",
    facts,
    analysis: analysisLines,
    actions,
  };
}

export async function syncSifHecaOffline(body: Record<string, unknown>) {
  return fetchJson<SifHecaEvent>(`${BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

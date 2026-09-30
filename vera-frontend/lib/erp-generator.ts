/**
 * ERP generator client — POST /api/v1/sms/erp/generate
 */
import { API_URL } from "./api";
import { fetchJson } from "./core";

const BASE = `${API_URL}/api/v1/sms`;

export type ErpScenario =
  | "electrical"
  | "fall"
  | "trench"
  | "chemical"
  | "rollover"
  | "general";

export type ErpGeneratorUserInputs = {
  musterPoints?: Array<{ name: string; description?: string }>;
  equipment?: Array<{ name: string; location?: string; qty?: number }>;
  roles?: Array<{ role: string; primaryName?: string; backupName?: string }>;
  communication?: {
    radioChannel?: string;
    phoneTree?: string;
    assemblySignal?: string;
    allClearSignal?: string;
  };
  additionalHazards?: string[];
  siteAddress?: string;
};

export type ErpFullDocument = {
  documentType: "ERP";
  title: string;
  generatedAt: string;
  revision: string;
  summary: {
    scenario: string;
    regionCode: string;
    projectName: string;
    qualityScore: number;
    dangerousOccurrences: string[];
    utilityContactCount: number;
    readinessScore: number | null;
    supervisorReviewRequired: boolean;
    ohsFramework?: string;
    mustReportDangerousOccurrence?: boolean;
  };
  project: {
    id: number;
    name: string;
    code: string | null;
    client: string | null;
    companyName: string | null;
    siteName: string | null;
    siteAddress: string | null;
    regionCode: string;
  };
  hazards: string[];
  readiness: {
    score: number | null;
    notes: string[];
    openHighEnergyCount: number;
  };
  ohs: Array<{
    code: string;
    label: string;
    guidance: string;
    mustReport?: boolean;
    urgency?: string;
    authority?: string;
    frameworkLabel?: string;
    preserveScene?: boolean;
    requiredActions?: string[];
  }>;
  dangerousOccurrenceAssessment?: {
    flagged: boolean;
    mustReportAny: boolean;
    narrative: string;
    disclaimer: string;
  };
  contactRouting?: {
    hazards: string[];
    summary: string[];
    contacts: Array<{
      id: string;
      hazard: string;
      role: string;
      priority: number;
      name: string;
      phone: string | null;
      dialHint: string;
      reason: string;
      verified: boolean;
    }>;
  };
  utilityContacts: Array<{
    id: string;
    agency: string;
    name: string;
    phone: string;
    notes: string;
  }>;
  emsContacts: Array<{
    id: string;
    agency?: string;
    name?: string;
    phone?: string;
  }>;
  userInputs: {
    musterPoints: Array<{ name: string; description?: string }>;
    equipment: Array<{ name: string; location?: string; qty?: number }>;
    roles: Array<{ role: string; primaryName?: string; backupName?: string }>;
    communication: {
      radioChannel: string;
      phoneTree: string;
      assemblySignal: string;
      allClearSignal: string;
    };
  };
  responseSteps: Array<{ order: number; title: string; detail: string }>;
  sections: Array<{
    id: string;
    title: string;
    body: string;
    bullets?: string[];
  }>;
};

export type ErpGenerateResponse = {
  draft: {
    title: string;
    steps: string[];
    musterPoint: string;
    emsContacts: Array<{ id: string }>;
    emsCallScript: string;
    hazards: string[];
    scenario: string;
    workType?: string;
    regionCode: string;
    projectId: number;
  };
  document: ErpFullDocument;
  qualityScore: number;
  notes: string[];
  suggestionId?: string;
  modelId?: string;
};

type Envelope<T> = { data: T };

function unwrap<T>(payload: Envelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as Envelope<T>).data;
  }
  return payload as T;
}

export async function generateErpDocument(body: {
  projectId: number;
  companyId?: number;
  workType: string;
  regionCode: string;
  projectScope?: string;
  scenario: ErpScenario;
  hazards?: string[];
  includeEmsIds?: string[];
  title?: string;
  userInputs?: ErpGeneratorUserInputs;
}) {
  const raw = await fetchJson<Envelope<ErpGenerateResponse> | ErpGenerateResponse>(
    `${BASE}/erp/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return unwrap(raw);
}

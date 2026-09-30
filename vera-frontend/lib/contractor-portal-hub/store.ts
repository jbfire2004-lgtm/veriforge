/**
 * Preview store for contractor onboarding progress + program document submissions.
 */

import type { OnboardingStepId, SubmittedDocument } from "./types";

type PortalState = {
  completedSteps: OnboardingStepId[];
  documents: SubmittedDocument[];
};

const g = globalThis as unknown as {
  __contractorPortalHubStore?: Map<string, PortalState>;
};

function store(): Map<string, PortalState> {
  if (!g.__contractorPortalHubStore) {
    g.__contractorPortalHubStore = new Map();
  }
  return g.__contractorPortalHubStore;
}

function key(contractorCompanyId: number, primeCompanyId: number) {
  return `${primeCompanyId}:${contractorCompanyId}`;
}

function defaultDocs(contractorCompanyId: number): SubmittedDocument[] {
  const now = Date.now();
  return [
    {
      id: `doc-${contractorCompanyId}-ins`,
      kind: "insurance",
      title: "General liability certificate",
      status: "accepted",
      submittedAt: new Date(now - 20 * 86400000).toISOString(),
      expiresAt: new Date(now + 200 * 86400000).toISOString(),
      archiveHref: `/pm/documents?q=insurance&kind=attachment`,
    },
  ];
}

export function getPortalState(
  contractorCompanyId: number,
  primeCompanyId: number,
): PortalState {
  const k = key(contractorCompanyId, primeCompanyId);
  const s = store();
  if (!s.has(k)) {
    s.set(k, {
      completedSteps: ["company_profile"],
      documents: defaultDocs(contractorCompanyId),
    });
  }
  return s.get(k)!;
}

export function completeOnboardingStep(
  contractorCompanyId: number,
  primeCompanyId: number,
  stepId: OnboardingStepId,
): PortalState {
  const state = getPortalState(contractorCompanyId, primeCompanyId);
  if (!state.completedSteps.includes(stepId)) {
    state.completedSteps = [...state.completedSteps, stepId];
  }
  return state;
}

export function submitProgramDocument(input: {
  contractorCompanyId: number;
  primeCompanyId: number;
  kind: string;
  title: string;
  expiresAt?: string | null;
}): SubmittedDocument {
  const state = getPortalState(
    input.contractorCompanyId,
    input.primeCompanyId,
  );
  const doc: SubmittedDocument = {
    id: `doc-${Date.now()}`,
    kind: input.kind,
    title: input.title.trim() || `${input.kind} submission`,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    expiresAt: input.expiresAt ?? null,
    archiveHref: `/pm/documents?q=${encodeURIComponent(input.kind)}&kind=attachment`,
  };
  state.documents = [doc, ...state.documents];

  // Completing docs advances onboarding
  if (input.kind === "insurance" || input.kind === "wcb") {
    completeOnboardingStep(
      input.contractorCompanyId,
      input.primeCompanyId,
      "insurance_wcb",
    );
  }
  if (input.kind === "hse_manual" || input.kind === "orientation") {
    completeOnboardingStep(
      input.contractorCompanyId,
      input.primeCompanyId,
      "hse_program",
    );
  }
  return doc;
}

export const REQUIRED_PROGRAM_DOCS = [
  { code: "insurance", label: "Insurance / COI", mandatory: true },
  { code: "wcb", label: "WCB / workers’ compensation", mandatory: true },
  { code: "hse_manual", label: "HSE program manual", mandatory: true },
  { code: "orientation", label: "Site orientation acknowledgment", mandatory: true },
  { code: "other", label: "Other program evidence", mandatory: false },
] as const;

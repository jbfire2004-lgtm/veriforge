/**
 * Contractor Portal hub — onboarding, training verification,
 * document submission, safety performance (CSS).
 */

export type OnboardingStepId =
  | "company_profile"
  | "insurance_wcb"
  | "hse_program"
  | "crew_training"
  | "prime_approval";

export type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  description: string;
  status: "not_started" | "in_progress" | "complete" | "blocked";
  href?: string;
};

export type TrainingVerificationRow = {
  id: string;
  workerLabel: string;
  certification: string;
  status: "verified" | "expiring" | "expired" | "pending";
  expiresAt: string | null;
  href: string;
};

export type SubmittedDocument = {
  id: string;
  kind: string;
  title: string;
  status: "submitted" | "under_review" | "accepted" | "rejected";
  submittedAt: string;
  expiresAt: string | null;
  archiveHref: string;
};

export type SafetyPerformanceSnapshot = {
  overallScore: number;
  grade: string;
  status: string;
  contractorName: string;
  pillars: Array<{ id: string; label: string; score: number }>;
  href: string;
  scoredAt: string;
} | null;

export type ContractorPortalHubDashboard = {
  generatedAt: string;
  scopeLabel: string;
  contractorCompanyId: number | null;
  primeCompanyId: number | null;
  projectId: number | null;
  onboarding: {
    progressPct: number;
    steps: OnboardingStep[];
  };
  training: {
    workersTotal: number;
    expired: number;
    expiringSoon: number;
    verified: number;
    rows: TrainingVerificationRow[];
    ingestHref: string;
    verificationHref: string;
    competencyHref: string;
  };
  documents: {
    required: Array<{ code: string; label: string; mandatory: boolean }>;
    submitted: SubmittedDocument[];
    archiveHref: string;
  };
  safety: SafetyPerformanceSnapshot;
  ops: {
    openActions: number;
    overdue: number;
    unacknowledgedFindings: number;
  };
  links: {
    archive: string;
    trainingIngest: string;
    verification: string;
    competency: string;
    css: string;
  };
};

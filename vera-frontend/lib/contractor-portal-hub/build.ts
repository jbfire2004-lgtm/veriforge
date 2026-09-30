import type {
  ContractorPortalHubDashboard,
  OnboardingStep,
  OnboardingStepId,
  TrainingVerificationRow,
} from "./types";
import { getPortalState, REQUIRED_PROGRAM_DOCS } from "./store";
import type { ContractorSafetyScoreDto } from "@/lib/contractor-safety-score/types";

const STEP_DEFS: Array<{
  id: OnboardingStepId;
  label: string;
  description: string;
  href?: string;
}> = [
  {
    id: "company_profile",
    label: "Company profile",
    description: "Confirm legal name, safety contact, and trade scope.",
  },
  {
    id: "insurance_wcb",
    label: "Insurance & WCB",
    description: "Submit current certificates of insurance and compensation coverage.",
    href: "#documents",
  },
  {
    id: "hse_program",
    label: "HSE program documents",
    description: "Upload HSE manual, orientations, and program policies.",
    href: "#documents",
  },
  {
    id: "crew_training",
    label: "Crew training verification",
    description: "Upload and verify crew certificates for required roles.",
    href: "/core/training-ingest",
  },
  {
    id: "prime_approval",
    label: "Prime approval",
    description: "Await prime contractor review of your program package.",
  },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildTrainingRows(
  contractorCompanyId: number,
  expired: number,
  expiring: number,
): TrainingVerificationRow[] {
  const seed = hash(`train:${contractorCompanyId}`);
  const rows: TrainingVerificationRow[] = [];
  const names = ["Crew A lead", "Welder · Bay 2", "Rigger · Night", "Electrician", "Safety designate"];
  const certs = ["WHMIS", "First Aid", "Fall Protection", "Confined Space", "Hot Work"];
  for (let i = 0; i < 5; i++) {
    let status: TrainingVerificationRow["status"] = "verified";
    if (i < expired) status = "expired";
    else if (i < expired + expiring) status = "expiring";
    else if ((seed + i) % 7 === 0) status = "pending";
    const days = status === "expired" ? -10 - i : status === "expiring" ? 12 + i : 180 + i * 20;
    rows.push({
      id: `tv-${contractorCompanyId}-${i}`,
      workerLabel: names[i]!,
      certification: certs[i]!,
      status,
      expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
      href: `/core/training-competency?companyId=${contractorCompanyId}`,
    });
  }
  return rows;
}

function buildOnboardingSteps(
  completed: OnboardingStepId[],
  trainingOk: boolean,
): OnboardingStep[] {
  return STEP_DEFS.map((def) => {
    if (completed.includes(def.id)) {
      return { ...def, status: "complete" as const };
    }
    if (def.id === "crew_training" && !trainingOk) {
      return { ...def, status: "in_progress" as const };
    }
    if (def.id === "prime_approval") {
      const ready =
        completed.includes("insurance_wcb") &&
        completed.includes("hse_program") &&
        (completed.includes("crew_training") || trainingOk);
      return {
        ...def,
        status: ready ? ("in_progress" as const) : ("blocked" as const),
      };
    }
    return { ...def, status: "not_started" as const };
  });
}

export function buildContractorPortalHub(input: {
  contractorCompanyId: number;
  primeCompanyId: number;
  projectId?: number | null;
  scopeLabel: string;
  compliance: {
    workersTotal: number;
    trainingExpired: number;
    trainingExpiringSoon: number;
  };
  ops: { openActions: number; overdue: number; unacknowledgedFindings: number };
  css: ContractorSafetyScoreDto | null;
}): ContractorPortalHubDashboard {
  const {
    contractorCompanyId,
    primeCompanyId,
    projectId,
    scopeLabel,
    compliance,
    ops,
    css,
  } = input;

  const state = getPortalState(contractorCompanyId, primeCompanyId);
  const trainingOk =
    compliance.trainingExpired === 0 && compliance.trainingExpiringSoon <= 2;
  if (trainingOk && !state.completedSteps.includes("crew_training")) {
    state.completedSteps = [...state.completedSteps, "crew_training"];
  }

  const steps = buildOnboardingSteps(state.completedSteps, trainingOk);
  const completeCount = steps.filter((s) => s.status === "complete").length;
  const progressPct = Math.round((completeCount / steps.length) * 100);

  const verified = Math.max(
    0,
    compliance.workersTotal -
      compliance.trainingExpired -
      compliance.trainingExpiringSoon,
  );

  return {
    generatedAt: new Date().toISOString(),
    scopeLabel,
    contractorCompanyId,
    primeCompanyId,
    projectId: projectId ?? null,
    onboarding: { progressPct, steps },
    training: {
      workersTotal: compliance.workersTotal,
      expired: compliance.trainingExpired,
      expiringSoon: compliance.trainingExpiringSoon,
      verified,
      rows: buildTrainingRows(
        contractorCompanyId,
        compliance.trainingExpired,
        compliance.trainingExpiringSoon,
      ),
      ingestHref: "/core/training-ingest",
      verificationHref: "/core/verification",
      competencyHref: "/core/training-competency",
    },
    documents: {
      required: REQUIRED_PROGRAM_DOCS.map((d) => ({ ...d })),
      submitted: state.documents,
      archiveHref: `/pm/documents?q=contractor`,
    },
    safety: css
      ? {
          overallScore: css.overallScore,
          grade: css.grade,
          status: css.status,
          contractorName: css.contractorName,
          pillars: Object.values(css.pillars).map((p) => ({
            id: p.id,
            label: p.label,
            score: p.score,
          })),
          href: css.href || `/core/contractor-scores?contractorCompanyId=${contractorCompanyId}`,
          scoredAt: css.scoredAt,
        }
      : null,
    ops,
    links: {
      archive: "/pm/documents",
      trainingIngest: "/core/training-ingest",
      verification: "/core/verification",
      competency: "/core/training-competency",
      css: `/core/contractor-scores?contractorCompanyId=${contractorCompanyId}`,
    },
  };
}

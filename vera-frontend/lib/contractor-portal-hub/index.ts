export type * from "./types";
export { buildContractorPortalHub } from "./build";
export {
  completeOnboardingStep,
  submitProgramDocument,
  getPortalState,
  REQUIRED_PROGRAM_DOCS,
} from "./store";

import { getServerAuthSession } from "@/lib/server-session";
import { apiGetSafe } from "@/lib/api";
import { getScore } from "@/lib/contractor-safety-score/store";
import { buildContractorPortalHub } from "./build";
import type { ContractorPortalHubDashboard } from "./types";

type Membership = {
  id: string;
  primeCompanyId: number;
  contractorCompanyId: number;
  projectId?: number | null;
  primeCompany?: { id: number; name: string };
  contractorCompany?: { id: number; name: string };
  project?: { id: number; name: string } | null;
};

type PortalDash = {
  inbox: { total: number; overdue: number };
  findings: { unacknowledged: number };
  compliance: {
    workersTotal: number;
    trainingExpired: number;
    trainingExpiringSoon: number;
  };
};

export async function loadContractorPortalHub(input?: {
  contractorCompanyId?: number;
  primeCompanyId?: number;
  projectId?: number;
}): Promise<ContractorPortalHubDashboard> {
  const session = await getServerAuthSession();

  const [memRes, dashRes] = await Promise.all([
    apiGetSafe<Membership[]>(
      "/api/v1/pm/contractor-portal/memberships",
      session,
    ),
    apiGetSafe<PortalDash>("/api/v1/pm/contractor-portal/dashboard", session),
  ]);

  const memberships =
    memRes.ok && Array.isArray(memRes.data) ? memRes.data : [];
  const mem =
    memberships.find(
      (m) =>
        (!input?.contractorCompanyId ||
          m.contractorCompanyId === input.contractorCompanyId) &&
        (!input?.primeCompanyId || m.primeCompanyId === input.primeCompanyId) &&
        (input?.projectId == null || m.projectId === input.projectId),
    ) ?? memberships[0];

  const contractorCompanyId =
    input?.contractorCompanyId ?? mem?.contractorCompanyId ?? 2;
  const primeCompanyId = input?.primeCompanyId ?? mem?.primeCompanyId ?? 1;
  const projectId = input?.projectId ?? mem?.projectId ?? null;

  const dash = dashRes.ok && dashRes.data ? dashRes.data : null;
  const css =
    getScore(contractorCompanyId, projectId ?? null) ??
    getScore(contractorCompanyId, null);

  const scopeLabel = mem
    ? [
        mem.contractorCompany?.name ?? `Contractor #${contractorCompanyId}`,
        mem.primeCompany?.name ? `↔ ${mem.primeCompany.name}` : null,
        mem.project?.name ? `· ${mem.project.name}` : null,
      ]
        .filter(Boolean)
        .join(" ")
    : `Contractor #${contractorCompanyId}`;

  return buildContractorPortalHub({
    contractorCompanyId,
    primeCompanyId,
    projectId,
    scopeLabel,
    compliance: {
      workersTotal: dash?.compliance.workersTotal ?? 12,
      trainingExpired: dash?.compliance.trainingExpired ?? 1,
      trainingExpiringSoon: dash?.compliance.trainingExpiringSoon ?? 2,
    },
    ops: {
      openActions: dash?.inbox.total ?? 0,
      overdue: dash?.inbox.overdue ?? 0,
      unacknowledgedFindings: dash?.findings.unacknowledged ?? 0,
    },
    css,
  });
}

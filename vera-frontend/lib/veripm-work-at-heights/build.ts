import type { WahHubDashboard, WahIndustryPlaybook } from "./types";
import { WAH_DISCLAIMER, WAH_INDUSTRY_PLAYBOOKS } from "./types";

/** Offline / BFF fallback when Nest hub is unreachable. */
export function buildWorkAtHeightsHub(input: {
  projectId: number;
  companyId: number;
  industry?: string;
}): WahHubDashboard {
  const playbook =
    WAH_INDUSTRY_PLAYBOOKS.find((p) => p.id === input.industry) ??
    WAH_INDUSTRY_PLAYBOOKS[0];
  const { companyId, projectId } = input;
  return {
    companyId,
    projectId,
    disclaimer: WAH_DISCLAIMER,
    industry: playbook.id,
    playbook,
    playbooks: WAH_INDUSTRY_PLAYBOOKS,
    kpis: {
      savedWorksheets: 0,
      draftOrRecent: 0,
      approvedSpecs: 0,
      pendingSpecReview: 0,
    },
    recentWorksheets: [],
    links: {
      clearance: `/pm/work-at-heights/clearance?companyId=${companyId}&projectId=${projectId}`,
      equipment: `/pm/work-at-heights/equipment?companyId=${companyId}&projectId=${projectId}`,
      industries: `/pm/work-at-heights/industries?companyId=${companyId}&projectId=${projectId}`,
      controls: `/pm/work-at-heights/controls?companyId=${companyId}&projectId=${projectId}`,
      records: `/pm/work-at-heights/records?companyId=${companyId}&projectId=${projectId}`,
      focusAudits: `/pm/inspections/focus-audits?companyId=${companyId}&projectId=${projectId}`,
      emergencyFall: `/pm/emergency-response?companyId=${companyId}&projectId=${projectId}&scenario=fall`,
      jha: `/pm/jha-flha?companyId=${companyId}&projectId=${projectId}`,
      permits: `/pm/permits?companyId=${companyId}&projectId=${projectId}`,
      training: `/pm/training?companyId=${companyId}&projectId=${projectId}`,
    },
  };
}

export function listPlaybooks(): WahIndustryPlaybook[] {
  return WAH_INDUSTRY_PLAYBOOKS;
}

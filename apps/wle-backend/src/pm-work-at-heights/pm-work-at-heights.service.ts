import { Injectable } from '@nestjs/common';
import { FallClearanceService } from '../fall-clearance/fall-clearance.service';
import { EquipmentCatalogService } from '../fall-clearance/equipment-catalog.service';
import {
  WAH_INDUSTRY_PLAYBOOKS,
  type WahIndustryId,
} from './wah-industry-playbooks';

@Injectable()
export class PmWorkAtHeightsService {
  constructor(
    private readonly clearance: FallClearanceService,
    private readonly equipment: EquipmentCatalogService,
  ) {}

  async getHub(companyId: number, projectId: number, industry?: string) {
    const [worksheets, approved, allEquipment] = await Promise.all([
      this.clearance.listWorksheets({ companyId, projectId }),
      this.equipment.list(),
      this.equipment.list({ includeAllStatuses: true }),
    ]);

    const pendingReview = allEquipment.filter(
      (e) => e.status === 'PENDING_REVIEW',
    ).length;
    const playbooks = WAH_INDUSTRY_PLAYBOOKS;
    const selected =
      playbooks.find((p) => p.id === industry) ?? playbooks[0];

    return {
      companyId,
      projectId,
      disclaimer: this.clearance.getDisclaimer(),
      industry: selected.id as WahIndustryId,
      playbook: selected,
      playbooks,
      kpis: {
        savedWorksheets: worksheets.filter((w) => w.status === 'SAVED').length,
        draftOrRecent: worksheets.length,
        approvedSpecs: approved.length,
        pendingSpecReview: pendingReview,
      },
      recentWorksheets: worksheets.slice(0, 8),
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

  listPlaybooks() {
    return WAH_INDUSTRY_PLAYBOOKS;
  }

  getPlaybook(id: string) {
    return (
      WAH_INDUSTRY_PLAYBOOKS.find((p) => p.id === id) ??
      WAH_INDUSTRY_PLAYBOOKS[0]
    );
  }
}

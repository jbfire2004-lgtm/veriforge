import { PmProjectHazardCategory } from '@prisma/client';

const CATEGORY_MAP: Record<string, PmProjectHazardCategory> = {
  energy: 'energy',
  environmental: 'environmental',
  equipment: 'equipment',
  chemical: 'chemical',
  behavioral: 'behavioral',
  organizational: 'site_specific',
  site_specific: 'site_specific',
};

export class CompanyProjectSyncEngine {
  mapHazardCategory(companyCategory: string): PmProjectHazardCategory {
    return CATEGORY_MAP[companyCategory] ?? 'site_specific';
  }

  zoneTemplateToAccessRule(template: {
    templateCode: string;
    zoneType: string;
    requiresFlhaHours: number;
    requiresJha: boolean;
    requiresSdsAck: boolean;
    highRisk: boolean;
    requiredPpe: unknown;
    requiredTraining: unknown;
  }) {
    return {
      zoneCode: template.templateCode,
      zoneType: template.zoneType,
      requiresFlhaHours: template.requiresFlhaHours,
      requiresJha: template.requiresJha,
      requiresSdsAck: template.requiresSdsAck,
      highRisk: template.highRisk,
      requiredPpe: template.requiredPpe,
      requiresTrainingCodes: template.requiredTraining,
    };
  }
}

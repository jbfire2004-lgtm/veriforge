import { PmProjectSafetyRiskLevel } from '@prisma/client';

export type CompanyProfileGeneratorInput = {
  projectCount?: number;
  workerCount?: number;
  incidentCount12m?: number;
  sifCount12m?: number;
  industryType?: string;
};

export type GeneratedCompanyProfile = {
  corporateRiskLevel: PmProjectSafetyRiskLevel;
  ppeStandards: string[];
  enforcementRules: Record<string, unknown>;
  defaultTrainingMatrix: Array<{
    roleType: string;
    category: string;
    trainingCode: string;
    trainingName: string;
    expiresInDays: number;
  }>;
};

export class CompanyProfileGeneratorEngine {
  generate(input: CompanyProfileGeneratorInput): GeneratedCompanyProfile {
    let score = 0;
    if ((input.incidentCount12m ?? 0) > 5) score += 30;
    if ((input.sifCount12m ?? 0) > 0) score += 35;
    if ((input.projectCount ?? 0) > 5) score += 15;
    if ((input.workerCount ?? 0) > 100) score += 10;

    const corporateRiskLevel: PmProjectSafetyRiskLevel =
      score >= 60
        ? 'critical'
        : score >= 40
        ? 'high'
        : score >= 20
        ? 'medium'
        : 'low';

    return {
      corporateRiskLevel,
      ppeStandards:
        corporateRiskLevel === 'critical'
          ? ['HARD_HAT', 'SAFETY_GLASSES', 'GLOVES', 'HI_VIS', 'STEEL_TOE']
          : ['HARD_HAT', 'SAFETY_GLASSES', 'HI_VIS'],
      enforcementRules: {
        blockAccessWithoutOrientation: true,
        blockAccessWithoutPolicyAck: true,
        requireSupervisorOverrideOnTrainingGap: true,
        requireSafetyOverrideOnSif:
          corporateRiskLevel === 'critical' || corporateRiskLevel === 'high',
        autoCapaOnRepeatDenial: true,
        syncHazardsToProjects: true,
        syncZoneTemplatesToProjects: true,
      },
      defaultTrainingMatrix: [
        {
          roleType: 'worker',
          category: 'general_safety',
          trainingCode: 'ORIENTATION',
          trainingName: 'Company orientation',
          expiresInDays: 365,
        },
        {
          roleType: 'supervisor',
          category: 'general_safety',
          trainingCode: 'SUPERVISOR_SAFETY',
          trainingName: 'Supervisor safety leadership',
          expiresInDays: 730,
        },
        {
          roleType: 'equipment_operator',
          category: 'equipment_operation',
          trainingCode: 'EQUIP_AUTH',
          trainingName: 'Equipment authorization',
          expiresInDays: 365,
        },
        {
          roleType: 'visitor',
          category: 'general_safety',
          trainingCode: 'SITE_ORIENTATION',
          trainingName: 'Visitor site orientation',
          expiresInDays: 30,
        },
      ],
    };
  }
}

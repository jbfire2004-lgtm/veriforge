import { PmProjectSafetyRiskLevel } from '@prisma/client';

export type ProfileGeneratorInput = {
  projectType?: string;
  scopeOfWork?: Record<string, unknown>;
  equipmentCount?: number;
  subcontractorCount?: number;
  incidentCount12m?: number;
  sifEventCount12m?: number;
  environmental?: Record<string, unknown>;
};

export type GeneratedProfileRequirements = {
  riskLevel: PmProjectSafetyRiskLevel;
  requiredJhaTypes: string[];
  requiredInspections: Array<{ type: string; cadenceDays: number }>;
  requiredTraining: string[];
  requiredEquipmentCerts: string[];
  requiredPpe: string[];
  requiredEmergencyPlans: boolean;
  requiredSdsAcks: boolean;
  requiredToolboxTalks: { frequencyDays: number };
  enforcementRules: Record<string, unknown>;
  zoneRules: Array<Record<string, unknown>>;
  equipmentRules: Record<string, unknown>;
  trainingRules: Record<string, unknown>;
  emergencyRules: Record<string, unknown>;
};

export class ProfileGeneratorEngine {
  generate(input: ProfileGeneratorInput): GeneratedProfileRequirements {
    let score = 0;
    if (input.incidentCount12m && input.incidentCount12m > 3) score += 25;
    if (input.sifEventCount12m && input.sifEventCount12m > 0) score += 40;
    if ((input.equipmentCount ?? 0) > 10) score += 15;
    if ((input.subcontractorCount ?? 0) > 2) score += 10;
    const env = input.environmental ?? {};
    if (env.extremeWeather || env.confinedSpace) score += 20;

    const riskLevel: PmProjectSafetyRiskLevel =
      score >= 60
        ? 'critical'
        : score >= 40
        ? 'high'
        : score >= 20
        ? 'medium'
        : 'low';

    const jhaTypes =
      riskLevel === 'critical' || riskLevel === 'high'
        ? ['FLHA', 'JHA', 'TASK_JHA']
        : ['FLHA', 'JHA'];

    const inspections: GeneratedProfileRequirements['requiredInspections'] = [
      { type: 'site_general', cadenceDays: 7 },
    ];
    if (riskLevel === 'high' || riskLevel === 'critical') {
      inspections.push({ type: 'equipment', cadenceDays: 14 });
      inspections.push({ type: 'high_risk_task', cadenceDays: 1 });
    }

    const training =
      riskLevel === 'critical'
        ? ['ORIENTATION', 'FALL_PROTECTION', 'CONFINED_SPACE', 'HAZCOM']
        : riskLevel === 'high'
        ? ['ORIENTATION', 'FALL_PROTECTION', 'HAZCOM']
        : ['ORIENTATION'];

    return {
      riskLevel,
      requiredJhaTypes: jhaTypes,
      requiredInspections: inspections,
      requiredTraining: training,
      requiredEquipmentCerts:
        (input.equipmentCount ?? 0) > 0
          ? ['ANNUAL_INSPECTION', 'OPERATOR_AUTH']
          : [],
      requiredPpe:
        riskLevel === 'critical'
          ? ['HARD_HAT', 'SAFETY_GLASSES', 'GLOVES', 'HI_VIS']
          : ['HARD_HAT', 'SAFETY_GLASSES'],
      requiredEmergencyPlans: true,
      requiredSdsAcks: (env.chemicalStorage as boolean) ?? riskLevel !== 'low',
      requiredToolboxTalks: {
        frequencyDays: riskLevel === 'critical' ? 7 : 14,
      },
      enforcementRules: {
        blockAccessWithoutFlha: true,
        blockAccessWithoutOrientation: true,
        requireSupervisorOverrideOnDenial:
          riskLevel === 'high' || riskLevel === 'critical',
        sifGateEnabled: input.sifEventCount12m
          ? input.sifEventCount12m > 0
          : true,
      },
      zoneRules: [
        {
          zoneCode: 'SITE',
          requiresFlhaHours: riskLevel === 'critical' ? 8 : 24,
          requiresJha: riskLevel !== 'low',
          highRisk: riskLevel === 'high' || riskLevel === 'critical',
        },
      ],
      equipmentRules: {
        requireInspectionCurrent: true,
        requireLotoClear: true,
        blockOutOfService: true,
      },
      trainingRules: {
        enforceExpiry: true,
        graceDays: 0,
      },
      emergencyRules: {
        requirePlanAck: true,
        autoMusterOnDeclare: true,
        lockSiteOnEmergency: riskLevel === 'critical' || riskLevel === 'high',
      },
    };
  }
}

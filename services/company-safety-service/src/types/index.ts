export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface CompanySafetyBundle {
  companyId: string;
  profile: Record<string, unknown> | null;
  hazards: Record<string, unknown>[];
  controls: Record<string, unknown>[];
  trainingMatrix: Record<string, unknown>[];
  policies: Record<string, unknown>[];
  sds: Record<string, unknown>[];
  emergencyPlans: Record<string, unknown>[];
  equipmentRules: Record<string, unknown>[];
  zoneTemplates: Record<string, unknown>[];
  counts: Record<string, number>;
}

export interface HazardScoreResult {
  sifPotential: boolean;
  hecaCategory: string;
}

export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type EnergyType =
  | 'gravity'
  | 'motion'
  | 'mechanical'
  | 'electrical'
  | 'chemical'
  | 'thermal'
  | 'pressure'
  | 'radiation'
  | 'biological';

export interface EnergyDetection {
  energyType: EnergyType;
  exposureLevel: number;
  highEnergyFlag: boolean;
  severityScore: number;
  autoDetected: boolean;
}

export interface SifHecaResult {
  riskScore: number;
  sifScore: number;
  sifPotential: boolean;
  hecaCategory: string;
  supervisorReviewRequired: boolean;
  requireCapa: boolean;
  explanation: string[];
}

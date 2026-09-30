export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface EquipmentScoreSummary {
  equipmentId: string;
  companyId: string;
  conditionScore: number;
  status: string;
  factors: {
    inspectionScore: number;
    certificationScore: number;
    lockoutPenalty: number;
    overduePenalty: number;
  };
  lastInspectionDate: string | null;
  nextInspectionDue: string | null;
  activeLockout: boolean;
  expiredCertifications: number;
  activeAuthorizations: number;
}

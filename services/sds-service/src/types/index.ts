export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface ExtractedHazard {
  code: string;
  category: string;
  description: string;
  source: string;
}

export interface ExtractedControl {
  type: string;
  description: string;
  source: string;
}

export interface WorkerSdsSummary {
  workerId: string;
  companyId: string;
  zoneId?: string;
  totalRequired: number;
  acknowledgedCount: number;
  compliant: boolean;
  missingSds: string[];
  expiredSds: string[];
  expiringSoonSds: string[];
  documents: Array<{
    id: string;
    productName: string;
    acknowledged: boolean;
    expired: boolean;
    expiringSoon: boolean;
    expiryDate: string | null;
  }>;
}

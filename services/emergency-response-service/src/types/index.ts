export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface EmergencyStatusSummary {
  emergencyId: string;
  companyId: string;
  projectId: string | null;
  type: string;
  severity: string;
  status: string;
  description: string | null;
  triggeredBy: string;
  triggeredAt: string;
  allClearAt: string | null;
  closedAt: string | null;
  muster: {
    activeSessionId: string | null;
    checkedIn: number;
    expected: number;
    missingWorkers: string[];
    attendanceRate: number;
  };
  notifications: {
    total: number;
    sent: number;
    pending: number;
  };
  siteLockoutActive: boolean;
}

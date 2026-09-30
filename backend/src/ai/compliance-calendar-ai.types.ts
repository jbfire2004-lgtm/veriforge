export type ComplianceCalendarAiInput = {
  companyId: number;
  projectId?: number;
  horizonDays?: number;
};

export type UpcomingExpiry = {
  entity_type:
    | 'training'
    | 'insurance'
    | 'permit'
    | 'orientation'
    | 'credential'
    | 'equipment_cert';
  entity_id: string | number;
  label: string;
  expires_at: string;
  days_until_expiry: number;
  status: 'expired' | 'expiring_soon' | 'upcoming';
  worker_id?: number;
  worker_name?: string;
  project_id?: number;
};

export type ComplianceRiskItem = {
  risk_code: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  entity_type: string;
  entity_id?: string | number;
  predicted_impact: string;
  suggested_bulk_action?: string;
};

export type ComplianceNotification = {
  recipient_role: 'worker' | 'supervisor' | 'project_manager';
  recipient_id?: number;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  channel: 'in_app' | 'email';
  due_by?: string;
  related_entity_type?: string;
  related_entity_id?: string | number;
};

export type BulkActionSuggestion = {
  action: string;
  scope: string;
  affected_count: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
};

/** Core JSON contract for the compliance calendar engine. */
export type ComplianceCalendarAiJson = {
  upcoming_expiries: UpcomingExpiry[];
  risk_items: ComplianceRiskItem[];
  notifications: ComplianceNotification[];
};

export type ComplianceCalendarAiResult = ComplianceCalendarAiJson & {
  calendar_id: string;
  company_id: number;
  project_id?: number;
  horizon_days: number;
  bulk_actions: BulkActionSuggestion[];
  field_summary: string;
  source: 'rule_engine';
  model: null;
};

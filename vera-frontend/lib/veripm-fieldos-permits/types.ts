/**
 * VERIPM ↔ FieldOS permit integration — preview types + in-memory store.
 * Production path: Nest `/api/v1/pm/fieldos-permits` + Prisma `veripm_permits`.
 */

export type VeripmPermitRiskLevel = "low" | "medium" | "high" | "critical";

export type VeripmPermitStatus =
  | "draft"
  | "queued"
  | "open"
  | "in_progress"
  | "awaiting_signatures"
  | "active"
  | "closed"
  | "cancelled"
  | "sync_error";

export type FieldOsActivity = {
  signatures: Array<{ role: string; name?: string; signedAt?: string }>;
  photos: Array<{ id: string; url: string; caption?: string }>;
  notes: string[];
  hazard_controls_applied: string[];
  completed_at?: string | null;
  lastWebhookAt?: string;
};

export type VeripmFieldOsPermit = {
  permit_id: string;
  company_id: number;
  project_id: number;
  job_id: string | null;
  asset_id: string | null;
  contractor_id: number | null;
  pm_permit_id: string | null;
  fieldos_task_id: string | null;
  permit_type: string;
  risk_level: VeripmPermitRiskLevel;
  status: VeripmPermitStatus;
  required_signatures: string[];
  required_documents: string[];
  required_ppe: string[];
  start_time: string | null;
  end_time: string | null;
  created_by_user_id: number | null;
  fieldos_metadata: Record<string, unknown>;
  safety_links: Record<string, unknown>;
  work_order_ids: string[];
  created_at: string;
  updated_at: string;
  live_fieldos_status: string | null;
  title?: string;
};

export type PermitStatusCounts = Record<string, number>;

/**
 * Risk-weighted CSS impact from permit performance (shared with Nest logic).
 */

export type PermitCssEvent =
  | "closed_clean"
  | "closed_with_incident"
  | "sync_error"
  | "cancelled"
  | "signatures_complete"
  | "hazard_controls_logged";

export function computePermitCssDelta(args: {
  riskLevel: string;
  event: PermitCssEvent;
}): number {
  const riskWeight =
    args.riskLevel === "critical"
      ? 2.0
      : args.riskLevel === "high"
        ? 1.5
        : args.riskLevel === "medium"
          ? 1.0
          : 0.5;

  const base: Record<PermitCssEvent, number> = {
    closed_clean: 4,
    signatures_complete: 1.5,
    hazard_controls_logged: 1,
    closed_with_incident: -12,
    sync_error: -3,
    cancelled: -2,
  };

  return Math.round(base[args.event] * riskWeight * 10) / 10;
}

export const FIELDOS_PERMIT_FIELD_MAP = {
  permit_id: "external_permit_id",
  company_id: "company_id",
  project_id: "project_id",
  job_id: "job_id",
  asset_id: "asset_id",
  contractor_id: "contractor_id",
  permit_type: "permit_type",
  risk_level: "risk_level",
  required_signatures: "required_signatures",
  required_documents: "required_documents",
  required_ppe: "required_ppe",
  start_time: "start_time",
  end_time: "end_time",
  title: "title",
} as const;

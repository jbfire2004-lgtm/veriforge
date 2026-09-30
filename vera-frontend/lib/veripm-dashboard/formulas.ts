export const VERIPM_FORMULAS: Record<
  string,
  { formulaId: string; label: string; formula: string; sourceQuery: string; unit: string }
> = {
  "pm.completion_rate": {
    formulaId: "pm.completion_rate.v1",
    label: "PM completion rate",
    formula: "pm_completed_on_time / pm_due_in_period × 100",
    sourceQuery: "SELECT work_orders WHERE type=preventive AND due IN period",
    unit: "%",
  },
  "pm.overdue_count": {
    formulaId: "pm.overdue_count.v1",
    label: "Overdue PM tasks",
    formula: "count(open past dueAt)",
    sourceQuery: "SELECT work_orders WHERE overdue",
    unit: "count",
  },
  "asset.downtime_hours": {
    formulaId: "pm.downtime_hours.v1",
    label: "Asset downtime",
    formula: "Σ downtime_intervals",
    sourceQuery: "SELECT downtime_events IN period",
    unit: "hours",
  },
  "asset.downtime_pct": {
    formulaId: "pm.downtime_pct.v1",
    label: "Downtime %",
    formula: "downtime_hours / available_hours × 100",
    sourceQuery: "downtime_hours / (assets × period_hours)",
    unit: "%",
  },
  "asset.failure_rate": {
    formulaId: "pm.failure_rate.v1",
    label: "Failure rate",
    formula: "(failures / operating_hours) × 1000",
    sourceQuery: "SELECT failures IN period",
    unit: "/1k hrs",
  },
  "pm.technician_workload": {
    formulaId: "pm.tech_workload.v1",
    label: "Technician workload",
    formula: "open_work_orders / active_technicians",
    sourceQuery: "SELECT open WOs / technicians",
    unit: "WOs/tech",
  },
  "pm.warranty_expiring": {
    formulaId: "pm.warranty.v1",
    label: "Warranty expirations",
    formula: "count(warranty_end in next 90d)",
    sourceQuery: "SELECT assets WHERE warranty_end < now+90d",
    unit: "count",
  },
  "pm_safety.incident_count": {
    formulaId: "pm.safety.incident.v1",
    label: "Maintenance-related incidents",
    formula: "count(maintenance_linked_incidents)",
    sourceQuery: "SELECT incidents JOIN pm_safety_links",
    unit: "count",
  },
  "pm_safety.incident_rate": {
    formulaId: "pm.safety.incident_rate.v1",
    label: "Maint. incident rate",
    formula: "(maint_incidents / work_hours) × 200000",
    sourceQuery: "maintenance_linked_incidents / hours × 200k",
    unit: "/200k hrs",
  },
  "pm_safety.high_risk_pm": {
    formulaId: "pm.safety.high_risk.v1",
    label: "High-risk PM tasks",
    formula: "count(high_risk work orders)",
    sourceQuery: "SELECT work_orders WHERE high_risk=true",
    unit: "count",
  },
  "pm_safety.flha_jha_linked": {
    formulaId: "pm.safety.flha_jha.v1",
    label: "FLHA/JHA linked to PM",
    formula: "count(FLHA/JHA with WO or equipment link)",
    sourceQuery: "SELECT flha_jha JOIN work_orders",
    unit: "count",
  },
  "pm.permits_by_status": {
    formulaId: "pm.permits.status.v1",
    label: "Permits (FieldOS-linked)",
    formula: "count(veripm_permits) grouped by status",
    sourceQuery: "SELECT status, count(*) FROM veripm_permits GROUP BY status",
    unit: "count",
  },
  "pm.permits_active": {
    formulaId: "pm.permits.active.v1",
    label: "Active / open permits",
    formula: "count(status in active|open|in_progress|awaiting_signatures)",
    sourceQuery: "SELECT veripm_permits WHERE status IN (...)",
    unit: "count",
  },
  "pm.permits_high_risk": {
    formulaId: "pm.permits.high_risk.v1",
    label: "High-risk open permits",
    formula: "count(risk_level high|critical AND not closed)",
    sourceQuery: "SELECT veripm_permits WHERE risk_level IN (high,critical)",
    unit: "count",
  },
};

export function getPmFormula(key: string) {
  return (
    VERIPM_FORMULAS[key] ?? {
      formulaId: `pm.unknown.${key}`,
      label: key,
      formula: "See metric definition",
      sourceQuery: "N/A",
      unit: "",
    }
  );
}

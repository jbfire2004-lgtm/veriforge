/**
 * Canonical metric formulas for VERICore Dashboard drill-downs.
 */

export type FormulaDef = {
  formulaId: string;
  key: string;
  label: string;
  formula: string;
  unit: string;
  direction?: "higher_better" | "lower_better";
};

/** Canonical name — aligns with `VERA_CORE_*` feed/API enums. */
export const VERA_CORE_FORMULAS: Record<string, FormulaDef> = {
  "training.compliant_pct": {
    formulaId: "vc.training.compliant_pct.v1",
    key: "training.compliant_pct",
    label: "Fully compliant",
    formula: "workers_fully_compliant / workers_in_scope × 100",
    unit: "%",
    direction: "higher_better",
  },
  "training.overdue_pct": {
    formulaId: "vc.training.overdue_pct.v1",
    key: "training.overdue_pct",
    label: "Overdue training",
    formula: "workers_with_≥1_overdue / workers_in_scope × 100",
    unit: "%",
    direction: "lower_better",
  },
  "sms.flha_completed": {
    formulaId: "vc.sms.flha_completed.v1",
    key: "sms.flha_completed",
    label: "FLHAs completed",
    formula: "count(FLHA status=completed in period)",
    unit: "count",
  },
  "sms.jha_completed": {
    formulaId: "vc.sms.jha_completed.v1",
    key: "sms.jha_completed",
    label: "JHAs completed",
    formula: "count(JHA status=completed in period)",
    unit: "count",
  },
  "sms.high_risk_flha": {
    formulaId: "vc.sms.high_risk_flha.v1",
    key: "sms.high_risk_flha",
    label: "High-risk FLHAs",
    formula: "count(FLHA with HECA/high-energy flag in period)",
    unit: "count",
    direction: "lower_better",
  },
  "sms.flha_jha_per_1k": {
    formulaId: "vc.sms.flha_jha_per_1k.v1",
    key: "sms.flha_jha_per_1k",
    label: "FLHA/JHA per 1k hrs",
    formula: "(completed_flha_jha_count / work_hours) × 1000",
    unit: "/1k hrs",
    direction: "higher_better",
  },
  "sms.incident_rate": {
    formulaId: "vc.sms.incident_rate.v1",
    key: "sms.incident_rate",
    label: "Incident rate",
    formula: "(recordable_incidents / work_hours) × 200000",
    unit: "/200k hrs",
    direction: "lower_better",
  },
  "sms.near_miss_rate": {
    formulaId: "vc.sms.near_miss_rate.v1",
    key: "sms.near_miss_rate",
    label: "Near miss rate",
    formula: "(near_miss_count / work_hours) × 200000",
    unit: "/200k hrs",
    direction: "higher_better",
  },
  "sms.capa_closure_days": {
    formulaId: "vc.sms.capa_closure_days.v1",
    key: "sms.capa_closure_days",
    label: "CAPA closure time",
    formula: "avg(closed_at − opened_at) for CAPAs closed in period",
    unit: "days",
    direction: "lower_better",
  },
  "sms.toolbox_talks": {
    formulaId: "vc.sms.toolbox.v1",
    key: "sms.toolbox_talks",
    label: "Toolbox talks completed",
    formula: "count(toolbox_talks completed in period)",
    unit: "count",
    direction: "higher_better",
  },
  "sms.permits_protected": {
    formulaId: "vc.sms.permits_protected.v1",
    key: "sms.permits_protected",
    label: "Permit-protected work",
    formula: "count(active FieldOS-linked permits)",
    unit: "count",
    direction: "higher_better",
  },
  "sms.permits_high_risk": {
    formulaId: "vc.sms.permits_high_risk.v1",
    key: "sms.permits_high_risk",
    label: "High-risk permits open",
    formula: "count(high|critical risk permits not closed)",
    unit: "count",
    direction: "lower_better",
  },
  "contractor.program_score": {
    formulaId: "css.overall.v1",
    key: "contractor.program_score",
    label: "Contractor program score",
    formula: "Σ (pillar_score × weight) — ISNetworld-style CSS",
    unit: "score",
    direction: "higher_better",
  },
  "contractor.incident_rate": {
    formulaId: "vc.contractor.incident_rate.v1",
    key: "contractor.incident_rate",
    label: "Contractor incident rate",
    formula: "(contractor_recordables / contractor_hours) × 200000",
    unit: "/200k hrs",
    direction: "lower_better",
  },
  "contractor.training_compliant_pct": {
    formulaId: "vc.contractor.training.v1",
    key: "contractor.training_compliant_pct",
    label: "Contractor training compliance",
    formula: "contractor_workers_compliant / contractor_workers_on_sites × 100",
    unit: "%",
    direction: "higher_better",
  },
  "contractor.flha_jha_completion": {
    formulaId: "vc.contractor.flha_jha.v1",
    key: "contractor.flha_jha_completion",
    label: "Contractor FLHA/JHA completion",
    formula: "completed / expected for contractor crews",
    unit: "%",
    direction: "higher_better",
  },
};

/** @deprecated Use `VERA_CORE_FORMULAS`. */
export const VERI_CORE_FORMULAS = VERA_CORE_FORMULAS;

export function getFormula(key: string): FormulaDef {
  return (
    VERA_CORE_FORMULAS[key] ?? {
      formulaId: `vc.unknown.${key}`,
      key,
      label: key,
      formula: "See metric definition",
      unit: "",
    }
  );
}

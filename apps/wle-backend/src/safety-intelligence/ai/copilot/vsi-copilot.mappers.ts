import type {
  BboCopilotOutput,
  CailIntelligenceEnvelope,
  EquipmentCopilotOutput,
  FormHazardCopilotOutput,
  IncidentCopilotOutput,
  InspectionCopilotOutput,
  LessonsLearnedCopilotOutput,
  PredictiveRiskCopilotOutput,
  PresentationCopilotOutput,
  VsiCopilotModule,
  VsiRiskCategory,
} from './vsi-copilot.types';

export function severityToScore(severity?: string): number {
  const s = (severity ?? 'medium').toLowerCase();
  if (s === 'critical') return 5;
  if (s === 'high') return 4;
  if (s === 'medium') return 3;
  if (s === 'low') return 2;
  return 3;
}

export function scoreToSeverity(
  score: number,
): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 5) return 'critical';
  if (score >= 4) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function normalizeRiskCategory(value?: string): VsiRiskCategory {
  const v = (value ?? 'other').toLowerCase();
  if (v.includes('behav')) return 'behavior';
  if (v.includes('equip')) return 'equipment';
  if (v.includes('env')) return 'environment';
  if (v.includes('proc')) return 'process';
  if (v.includes('ppe')) return 'ppe';
  if (v.includes('ergo')) return 'ergonomic';
  return 'other';
}

export function toCailEnvelope(
  module: VsiCopilotModule,
  output: unknown,
): CailIntelligenceEnvelope {
  const base: CailIntelligenceEnvelope = {
    hazard_type: '',
    risk_category: 'other',
    severity_score: 3,
    root_cause_category: '',
    root_cause_explanation: '',
    recommended_corrective_actions: [],
    recommended_preventive_actions: [],
    tags: [],
    lessons_learned: '',
    predictive_risk_flags: [],
  };

  if (module === 'inspection') {
    const o = output as InspectionCopilotOutput;
    return {
      ...base,
      hazard_type: o.hazard_type ?? '',
      risk_category: normalizeRiskCategory(o.risk_category),
      severity_score: o.severity_score ?? 3,
      recommended_corrective_actions: o.recommended_corrective_action
        ? [o.recommended_corrective_action]
        : [],
      tags: o.tags ?? [],
    };
  }

  if (module === 'bbo') {
    const o = output as BboCopilotOutput;
    return {
      ...base,
      hazard_type: o.behavior_type ?? '',
      risk_category: normalizeRiskCategory(o.root_cause_category),
      root_cause_category: o.root_cause_category ?? '',
      root_cause_explanation: o.root_cause_explanation ?? '',
      recommended_corrective_actions: o.recommended_actions ?? [],
      tags: o.tags ?? [],
    };
  }

  if (module === 'incident') {
    const o = output as IncidentCopilotOutput;
    return {
      ...base,
      hazard_type: 'incident',
      severity_score: severityToScore(o.sif_potential),
      root_cause_category: 'incident',
      root_cause_explanation: o.root_cause_primary ?? '',
      recommended_corrective_actions: o.corrective_actions ?? [],
      recommended_preventive_actions: o.preventive_actions ?? [],
      lessons_learned: o.lessons_learned ?? '',
      predictive_risk_flags: o.predictive_risk_flags ?? [],
      tags: ['incident', o.sif_potential],
    };
  }

  if (module === 'equipment') {
    const o = output as EquipmentCopilotOutput;
    return {
      ...base,
      hazard_type: o.failure_mode ?? '',
      risk_category: normalizeRiskCategory(o.risk_category),
      severity_score: o.severity_score ?? 3,
      recommended_corrective_actions: o.recommended_corrective_actions ?? [],
      recommended_preventive_actions: o.recommended_preventive_actions ?? [],
      tags: o.tags ?? [],
    };
  }

  if (module === 'form_hazard') {
    const o = output as FormHazardCopilotOutput;
    return {
      ...base,
      hazard_type: o.hazard_type ?? '',
      risk_category: normalizeRiskCategory(o.root_cause_category),
      severity_score: o.severity_score ?? 3,
      root_cause_category: o.root_cause_category ?? '',
      recommended_corrective_actions: o.recommended_corrective_actions ?? [],
      recommended_preventive_actions: o.recommended_preventive_actions ?? [],
      tags: o.tags ?? [],
    };
  }

  if (module === 'lessons_learned') {
    const o = output as LessonsLearnedCopilotOutput;
    return {
      ...base,
      lessons_learned: o.summary ?? '',
      root_cause_explanation: o.what_went_wrong ?? '',
      recommended_corrective_actions: o.what_fixed_it ? [o.what_fixed_it] : [],
      recommended_preventive_actions: o.how_to_prevent_recurrence
        ? [o.how_to_prevent_recurrence]
        : [],
      tags: o.applicable_to ?? [],
    };
  }

  if (module === 'presentation') {
    const o = output as PresentationCopilotOutput;
    return {
      ...base,
      lessons_learned: o.executive_summary ?? '',
      predictive_risk_flags: o.top_risks ?? [],
      recommended_preventive_actions: o.recommended_actions_next_30_days ?? [],
      tags: o.key_trends ?? [],
    };
  }

  if (module === 'predictive_risk') {
    const o = output as PredictiveRiskCopilotOutput;
    return {
      ...base,
      predictive_risk_flags: [
        ...(o.emerging_risks ?? []),
        ...(o.early_warning_flags ?? []),
      ],
      recommended_preventive_actions: o.recommended_preventive_actions ?? [],
      tags: o.high_risk_tasks ?? [],
    };
  }

  if (module === 'cail_analyze') {
    return { ...base, ...(output as CailIntelligenceEnvelope) };
  }

  return base;
}

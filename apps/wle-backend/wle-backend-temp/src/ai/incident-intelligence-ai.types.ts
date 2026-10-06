import type { IncidentSifEngineInput } from '../pm-safety-events/incident-sif-engine.types';

export type IncidentRecurrenceRisk = 'low' | 'medium' | 'high' | 'critical';

/** Primary incident intelligence output — structured JSON. */
export type IncidentIntelligenceJson = {
  incident_type: string;
  sif_potential: 'yes' | 'no' | 'unknown';
  root_causes: string[];
  recommended_actions: string[];
  recurrence_risk: IncidentRecurrenceRisk;
};

export type IncidentIntelligenceAiInput = {
  eventId?: string;
  engineInput?: IncidentSifEngineInput;
};

export type LinkedTrainingGap = {
  worker_id?: number;
  worker_name?: string;
  training_code: string;
  training_name: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
};

export type IncidentIntelligenceAiResult = IncidentIntelligenceJson & {
  intelligence_id: string;
  source: 'rule_engine';
  model: null;
  training_gaps: LinkedTrainingGap[];
  similar_incidents_count: number;
  severity_assessment: string;
  field_summary: string;
  sif_reasoning: string;
};

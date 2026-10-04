/**
 * End-to-end safety response flow for incidents and investigations.
 * Status values match `Incident.status` in Prisma.
 */
export const INCIDENT_STATUS = {
  OPEN: 'OPEN',
  IN_REVIEW: 'IN_REVIEW',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  CLOSED: 'CLOSED',
} as const;

export type IncidentStatus =
  (typeof INCIDENT_STATUS)[keyof typeof INCIDENT_STATUS];

/** Human-readable phase for operators and UIs. */
export type SafetyPhaseId =
  | 'REPORTED'
  | 'TRIAGE'
  | 'INVESTIGATION'
  | 'CORRECTIVE_ACTION'
  | 'CLOSED';

export interface SafetyWorkflowStep {
  id: SafetyPhaseId;
  title: string;
  description: string;
  /** Incident.status while primarily in this phase (investigation can overlap). */
  incidentStatus: IncidentStatus;
}

export interface SafetyTransition {
  from: IncidentStatus;
  to: IncidentStatus;
  label: string;
  /** Suggested when moving into this transition. */
  requiresInvestigationHint?: boolean;
}

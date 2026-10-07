import { BadRequestException, Injectable } from '@nestjs/common';
import { IncidentsService } from '../incidents/incidents.service';
import { InvestigationsService } from '../investigations/investigations.service';
import {
  INCIDENT_STATUS,
  IncidentStatus,
  SafetyPhaseId,
  SafetyTransition,
  SafetyWorkflowStep,
} from './safety-workflow.types';

/** Directed edges: only these moves are allowed. */
const ALLOWED_EDGES: SafetyTransition[] = [
  {
    from: INCIDENT_STATUS.OPEN,
    to: INCIDENT_STATUS.IN_REVIEW,
    label: 'Submit for triage',
  },
  {
    from: INCIDENT_STATUS.IN_REVIEW,
    to: INCIDENT_STATUS.ACTION_REQUIRED,
    label: 'Require corrective action',
    requiresInvestigationHint: true,
  },
  {
    from: INCIDENT_STATUS.IN_REVIEW,
    to: INCIDENT_STATUS.CLOSED,
    label: 'Close (no further action)',
  },
  {
    from: INCIDENT_STATUS.ACTION_REQUIRED,
    to: INCIDENT_STATUS.IN_REVIEW,
    label: 'Re-review after action',
  },
  {
    from: INCIDENT_STATUS.ACTION_REQUIRED,
    to: INCIDENT_STATUS.CLOSED,
    label: 'Verify and close',
  },
];

const STEPS: SafetyWorkflowStep[] = [
  {
    id: 'REPORTED',
    title: 'Reported',
    description:
      'Event logged; initial details captured at the site or in the app.',
    incidentStatus: INCIDENT_STATUS.OPEN,
  },
  {
    id: 'TRIAGE',
    title: 'Triage & classification',
    description: 'Supervisor reviews severity, context, and ownership.',
    incidentStatus: INCIDENT_STATUS.IN_REVIEW,
  },
  {
    id: 'INVESTIGATION',
    title: 'Investigation',
    description:
      'Formal review, evidence, and root-cause (parallel to triage/corrective track).',
    incidentStatus: INCIDENT_STATUS.IN_REVIEW,
  },
  {
    id: 'CORRECTIVE_ACTION',
    title: 'Corrective action',
    description:
      'Follow-ups assigned; controls verified before return to work.',
    incidentStatus: INCIDENT_STATUS.ACTION_REQUIRED,
  },
  {
    id: 'CLOSED',
    title: 'Closed',
    description:
      'Residual risk accepted or eliminated; record retained for audit.',
    incidentStatus: INCIDENT_STATUS.CLOSED,
  },
];

@Injectable()
export class SafetyWorkflowService {
  constructor(
    private readonly incidents: IncidentsService,
    private readonly investigations: InvestigationsService,
  ) {}

  getDefinition() {
    return {
      version: 1,
      incidentStatuses: Object.values(INCIDENT_STATUS),
      steps: STEPS,
      transitions: ALLOWED_EDGES,
      rules: [
        'Only the listed transitions are permitted; reopening a closed incident requires a new report or admin override.',
        'HIGH or CRITICAL severity should trigger an investigation before closure when risks affect multiple workers or equipment.',
        'Closure should be tied to completed corrective actions or documented risk acceptance.',
      ],
    };
  }

  private statusToPhase(status: string): SafetyPhaseId {
    switch (status) {
      case INCIDENT_STATUS.OPEN:
        return 'REPORTED';
      case INCIDENT_STATUS.IN_REVIEW:
        return 'TRIAGE';
      case INCIDENT_STATUS.ACTION_REQUIRED:
        return 'CORRECTIVE_ACTION';
      case INCIDENT_STATUS.CLOSED:
        return 'CLOSED';
      default:
        return 'REPORTED';
    }
  }

  /**
   * Resolved view for one incident: phase, next actions, investigation linkage.
   */
  async getIncidentState(incidentId: number) {
    const incident = await this.incidents.findOne(incidentId);
    const investigations =
      (incident as { investigations?: { id: number; status: string }[] })
        .investigations ?? [];

    const status = incident.status as IncidentStatus;
    const next = ALLOWED_EDGES.filter((e) => e.from === status);

    const openInvestigations = investigations.filter(
      (i) => i.status === 'OPEN',
    );

    const phase = this.statusToPhase(status);
    const activePhase: SafetyPhaseId =
      openInvestigations.length > 0 && phase === 'TRIAGE'
        ? 'INVESTIGATION'
        : phase;

    return {
      incidentId,
      phase: activePhase,
      incidentStatus: status,
      severity: incident.severity,
      openInvestigationCount: openInvestigations.length,
      openInvestigationIds: openInvestigations.map((i) => i.id),
      availableTransitions: next.map((e) => ({
        to: e.to,
        label: e.label,
        suggestsInvestigation:
          !!e.requiresInvestigationHint &&
          (incident.severity === 'HIGH' || incident.severity === 'CRITICAL'),
      })),
      incident,
      investigations,
    };
  }

  /**
   * Advance incident status with transition validation; optionally start investigation.
   */
  async advance(
    incidentId: number,
    nextStatus: IncidentStatus,
    options?: { startInvestigation?: boolean; investigatorId?: number },
  ) {
    const incident = await this.incidents.findOne(incidentId);
    const current = incident.status as IncidentStatus;

    const allowed = ALLOWED_EDGES.some(
      (e) => e.from === current && e.to === nextStatus,
    );
    if (!allowed) {
      throw new BadRequestException(
        `Invalid transition: ${current} → ${nextStatus}`,
      );
    }

    const updated = await this.incidents.changeStatus(incidentId, nextStatus);

    let investigation: Awaited<
      ReturnType<InvestigationsService['startInvestigation']>
    > | null = null;

    if (options?.startInvestigation) {
      const inv = await this.investigations.startInvestigation(incidentId);
      investigation = inv;
      if (options.investigatorId != null) {
        investigation = await this.investigations.assignInvestigator(
          inv.id,
          options.investigatorId,
        );
      }
    }

    return {
      incident: updated,
      investigation,
    };
  }
}

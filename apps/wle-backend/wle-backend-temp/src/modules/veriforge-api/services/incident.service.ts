import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type IncidentSeverity = 'critical' | 'moderate' | 'low';
export type IncidentStatus =
  | 'reported'
  | 'investigating'
  | 'actions'
  | 'resolved'
  | 'closed';
export type InvestigationStep =
  | 'assign_investigator'
  | 'collect_evidence'
  | 'review'
  | 'finalize';

export type IncidentEvidence = {
  id: string;
  fileName: string;
  format: string;
  uploadedAt: string;
  userId: number;
};

export type CorrectiveAction = {
  id: string;
  name: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'done';
  createdAt: string;
};

export type IncidentRecord = {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: IncidentSeverity;
  involvedPersonnel: string[];
  status: IncidentStatus;
  investigationStep: InvestigationStep;
  investigator: string | null;
  evidence: IncidentEvidence[];
  correctiveActions: CorrectiveAction[];
  timestamp: string;
  userId: number;
  updatedAt: string;
  resolvedAt: string | null;
};

export type IncidentAnalytics = {
  totalIncidents: number;
  openIncidents: number;
  criticalCount: number;
  moderateCount: number;
  lowCount: number;
  averageResolutionHours: number;
  investigationProgress: number;
  severityDistribution: Array<{ severity: IncidentSeverity; count: number }>;
  frequencyByStatus: Array<{ status: IncidentStatus; count: number }>;
  timestamp: string;
  userId: number | null;
};

const INVESTIGATION_ORDER: InvestigationStep[] = [
  'assign_investigator',
  'collect_evidence',
  'review',
  'finalize',
];

@Injectable()
export class IncidentService {
  private nextIncidentId = 2;
  private nextEvidenceId = 1;
  private nextActionId = 1;

  private incidents: IncidentRecord[] = [
    {
      id: 'inc-1',
      title: 'Hot-work spark near fuel staging',
      description:
        'Spark cluster observed during cutting near temporary fuel drums.',
      location: 'Forge Cell B / Bay 3',
      severity: 'critical',
      involvedPersonnel: ['Maya Ironwood', 'Dylan Forge'],
      status: 'investigating',
      investigationStep: 'collect_evidence',
      investigator: 'Rhea Calder',
      evidence: [],
      correctiveActions: [],
      timestamp: new Date().toISOString(),
      userId: 1,
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    },
  ];

  constructor(private readonly notifications: NotificationService) {}

  list() {
    return [...this.incidents];
  }

  getById(id: string) {
    const incident = this.incidents.find((item) => item.id === id);
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  create(
    input: {
      title: string;
      description: string;
      location: string;
      severity: IncidentSeverity;
      involvedPersonnel: string[];
      evidenceFileName?: string;
      evidenceFormat?: string;
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const evidence: IncidentEvidence[] = [];
    if (input.evidenceFileName) {
      evidence.push({
        id: `ev-${this.nextEvidenceId++}`,
        fileName: input.evidenceFileName,
        format: input.evidenceFormat ?? 'jpg',
        uploadedAt: now,
        userId,
      });
    }

    const incident: IncidentRecord = {
      id: `inc-${this.nextIncidentId++}`,
      title: input.title,
      description: input.description,
      location: input.location,
      severity: input.severity,
      involvedPersonnel: input.involvedPersonnel,
      status: 'reported',
      investigationStep: 'assign_investigator',
      investigator: null,
      evidence,
      correctiveActions: [],
      timestamp: now,
      userId,
      updatedAt: now,
      resolvedAt: null,
    };
    this.incidents.unshift(incident);

    if (incident.severity === 'critical') {
      this.notifications.enqueue({
        title: 'CRITICAL INCIDENT',
        message: `${incident.title} reported at ${incident.location}. Immediate investigation required.`,
        category: 'system',
        forgeStatus: 'failed',
      });
    }

    return incident;
  }

  assignInvestigator(incidentId: string, investigator: string, userId: number) {
    const incident = this.getById(incidentId);
    incident.investigator = investigator;
    incident.status = 'investigating';
    incident.investigationStep = 'collect_evidence';
    incident.updatedAt = new Date().toISOString();
    incident.userId = userId;
    return incident;
  }

  uploadEvidence(
    incidentId: string,
    input: { fileName: string; format: string },
    userId: number,
  ) {
    const incident = this.getById(incidentId);
    const evidence: IncidentEvidence = {
      id: `ev-${this.nextEvidenceId++}`,
      fileName: input.fileName,
      format: input.format,
      uploadedAt: new Date().toISOString(),
      userId,
    };
    incident.evidence.unshift(evidence);
    if (incident.investigationStep === 'collect_evidence') {
      incident.investigationStep = 'review';
    }
    incident.status = 'investigating';
    incident.updatedAt = new Date().toISOString();
    return { incident, evidence };
  }

  advanceInvestigation(incidentId: string, userId: number) {
    const incident = this.getById(incidentId);
    const index = INVESTIGATION_ORDER.indexOf(incident.investigationStep);
    if (index < INVESTIGATION_ORDER.length - 1) {
      incident.investigationStep = INVESTIGATION_ORDER[index + 1];
    }
    if (incident.investigationStep === 'finalize') {
      incident.status = 'actions';
    } else {
      incident.status = 'investigating';
    }
    incident.updatedAt = new Date().toISOString();
    incident.userId = userId;
    return incident;
  }

  addCorrectiveAction(
    incidentId: string,
    input: { name: string; responsiblePerson: string; dueDate: string },
    userId: number,
  ) {
    const incident = this.getById(incidentId);
    const action: CorrectiveAction = {
      id: `ca-${this.nextActionId++}`,
      name: input.name,
      responsiblePerson: input.responsiblePerson,
      dueDate: input.dueDate,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    incident.correctiveActions.unshift(action);
    incident.status = 'actions';
    incident.updatedAt = new Date().toISOString();
    incident.userId = userId;
    return { incident, action };
  }

  completeCorrectiveAction(
    incidentId: string,
    actionId: string,
    userId: number,
  ) {
    const incident = this.getById(incidentId);
    const action = incident.correctiveActions.find(
      (item) => item.id === actionId,
    );
    if (!action)
      throw new NotFoundException(`Corrective action ${actionId} not found`);
    action.status = 'done';
    const allDone = incident.correctiveActions.every(
      (item) => item.status === 'done',
    );
    if (allDone && incident.correctiveActions.length > 0) {
      incident.status = 'resolved';
      incident.resolvedAt = new Date().toISOString();
    }
    incident.updatedAt = new Date().toISOString();
    incident.userId = userId;
    return incident;
  }

  analytics(userId: number | null = null): IncidentAnalytics {
    const total = this.incidents.length;
    const open = this.incidents.filter(
      (item) => item.status !== 'closed' && item.status !== 'resolved',
    ).length;
    const criticalCount = this.incidents.filter(
      (item) => item.severity === 'critical',
    ).length;
    const moderateCount = this.incidents.filter(
      (item) => item.severity === 'moderate',
    ).length;
    const lowCount = this.incidents.filter(
      (item) => item.severity === 'low',
    ).length;

    const resolved = this.incidents.filter((item) => item.resolvedAt);
    const averageResolutionHours =
      resolved.length === 0
        ? 0
        : Math.round(
            resolved.reduce((sum, item) => {
              const start = new Date(item.timestamp).getTime();
              const end = new Date(item.resolvedAt as string).getTime();
              return sum + (end - start) / (1000 * 60 * 60);
            }, 0) / resolved.length,
          );

    const stepWeights: Record<InvestigationStep, number> = {
      assign_investigator: 25,
      collect_evidence: 50,
      review: 75,
      finalize: 100,
    };
    const investigationProgress =
      total === 0
        ? 0
        : Math.round(
            this.incidents.reduce(
              (sum, item) => sum + stepWeights[item.investigationStep],
              0,
            ) / total,
          );

    const statuses: IncidentStatus[] = [
      'reported',
      'investigating',
      'actions',
      'resolved',
      'closed',
    ];

    return {
      totalIncidents: total,
      openIncidents: open,
      criticalCount,
      moderateCount,
      lowCount,
      averageResolutionHours,
      investigationProgress,
      severityDistribution: [
        { severity: 'critical', count: criticalCount },
        { severity: 'moderate', count: moderateCount },
        { severity: 'low', count: lowCount },
      ],
      frequencyByStatus: statuses.map((status) => ({
        status,
        count: this.incidents.filter((item) => item.status === status).length,
      })),
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}

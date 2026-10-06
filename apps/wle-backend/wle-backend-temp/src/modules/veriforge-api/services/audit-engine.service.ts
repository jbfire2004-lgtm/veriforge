import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type AuditCategory =
  | 'verification'
  | 'training'
  | 'compliance'
  | 'incident'
  | 'system';

export type AuditSeverity = 'critical' | 'high' | 'normal' | 'info';

export type AuditEntry = {
  id: string;
  source: AuditCategory;
  action: string;
  details: string;
  category: AuditCategory;
  severity: AuditSeverity;
  timestamp: string;
  userId: number;
  requirementId: string | null;
  findingId: string | null;
};

export type AuditEvidence = {
  id: string;
  entryId: string;
  fileName: string;
  format: string;
  timestamp: string;
  userId: number;
  requirementId: string | null;
};

export type AuditCorrectiveAction = {
  id: string;
  entryId: string;
  name: string;
  owner: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'done';
  createdAt: string;
};

export type AuditScoreSnapshot = {
  score: number;
  completeness: number;
  totalEntries: number;
  criticalFindings: number;
  evidenceCount: number;
  openActions: number;
  timestamp: string;
  userId: number | null;
};

export type AuditReport = {
  id: string;
  generatedAt: string;
  userId: number;
  score: AuditScoreSnapshot;
  entries: AuditEntry[];
  evidence: AuditEvidence[];
  correctiveActions: AuditCorrectiveAction[];
  summary: string;
};

@Injectable()
export class AuditEngineService {
  private nextEntryId = 5;
  private nextEvidenceId = 1;
  private nextActionId = 1;
  private nextReportId = 1;

  private entries: AuditEntry[] = [
    {
      id: 'aud-1',
      source: 'verification',
      action: 'forgeCheck.failed',
      details: 'forgeStatus failed on PPE validation workflow.',
      category: 'verification',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId: 'cmp-1',
      findingId: 'find-1',
    },
    {
      id: 'aud-2',
      source: 'training',
      action: 'module.completed',
      details: 'Lockout-Tagout completed with passing score.',
      category: 'training',
      severity: 'info',
      timestamp: new Date().toISOString(),
      userId: 2,
      requirementId: null,
      findingId: null,
    },
    {
      id: 'aud-3',
      source: 'compliance',
      action: 'requirement.updated',
      details: 'Emergency drill requirement enabled.',
      category: 'compliance',
      severity: 'normal',
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId: 'cmp-2',
      findingId: null,
    },
    {
      id: 'aud-4',
      source: 'incident',
      action: 'incident.reported',
      details: 'Hot-work spark near fuel staging reported.',
      category: 'incident',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId: null,
      findingId: 'find-2',
    },
  ];

  private evidence: AuditEvidence[] = [];
  private correctiveActions: AuditCorrectiveAction[] = [];
  private reports: AuditReport[] = [];

  constructor(private readonly notifications: NotificationService) {}

  listEntries() {
    return [...this.entries];
  }

  ingest(
    input: {
      source: AuditCategory;
      action: string;
      details: string;
      severity?: AuditSeverity;
      requirementId?: string | null;
      findingId?: string | null;
    },
    userId: number,
  ) {
    const severity =
      input.severity ?? this.inferSeverity(input.source, input.action);
    const entry: AuditEntry = {
      id: `aud-${this.nextEntryId++}`,
      source: input.source,
      action: input.action,
      details: input.details,
      category: input.source,
      severity,
      timestamp: new Date().toISOString(),
      userId,
      requirementId: input.requirementId ?? null,
      findingId: input.findingId ?? null,
    };
    this.entries.unshift(entry);

    if (severity === 'critical') {
      this.notifications.enqueue({
        title: 'CRITICAL AUDIT FINDING',
        message: `${entry.action}: ${entry.details}`,
        category: 'system',
        forgeStatus: 'failed',
      });
    }

    return entry;
  }

  listEvidence() {
    return [...this.evidence];
  }

  uploadEvidence(
    input: {
      entryId: string;
      fileName: string;
      format: string;
      requirementId?: string | null;
    },
    userId: number,
  ) {
    const entry = this.entries.find((item) => item.id === input.entryId);
    if (!entry)
      throw new NotFoundException(`Audit entry ${input.entryId} not found`);

    const item: AuditEvidence = {
      id: `aev-${this.nextEvidenceId++}`,
      entryId: input.entryId,
      fileName: input.fileName,
      format: input.format,
      timestamp: new Date().toISOString(),
      userId,
      requirementId: input.requirementId ?? entry.requirementId,
    };
    this.evidence.unshift(item);
    return item;
  }

  listCorrectiveActions() {
    return [...this.correctiveActions];
  }

  linkCorrectiveAction(
    input: {
      entryId: string;
      name: string;
      owner: string;
      dueDate: string;
    },
    userId: number,
  ) {
    const entry = this.entries.find((item) => item.id === input.entryId);
    if (!entry)
      throw new NotFoundException(`Audit entry ${input.entryId} not found`);

    const action: AuditCorrectiveAction = {
      id: `aca-${this.nextActionId++}`,
      entryId: input.entryId,
      name: input.name,
      owner: input.owner,
      dueDate: input.dueDate,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.correctiveActions.unshift(action);

    this.ingest(
      {
        source: 'system',
        action: 'corrective_action.linked',
        details: `Linked "${input.name}" to ${input.entryId}`,
        severity: 'normal',
        requirementId: entry.requirementId,
        findingId: entry.findingId,
      },
      userId,
    );

    return action;
  }

  completeCorrectiveAction(actionId: string, userId: number) {
    const action = this.correctiveActions.find((item) => item.id === actionId);
    if (!action) {
      throw new NotFoundException(`Corrective action ${actionId} not found`);
    }
    action.status = 'done';
    this.ingest(
      {
        source: 'system',
        action: 'corrective_action.completed',
        details: `Completed corrective action ${actionId}`,
        severity: 'info',
      },
      userId,
    );
    return action;
  }

  score(userId: number | null = null): AuditScoreSnapshot {
    const totalEntries = this.entries.length;
    const criticalFindings = this.entries.filter(
      (item) => item.severity === 'critical',
    ).length;
    const highFindings = this.entries.filter(
      (item) => item.severity === 'high',
    ).length;
    const evidenceCount = this.evidence.length;
    const openActions = this.correctiveActions.filter(
      (item) => item.status !== 'done',
    ).length;
    const linkedFindings = this.entries.filter((item) =>
      this.correctiveActions.some((action) => action.entryId === item.id),
    ).length;

    const completeness =
      totalEntries === 0
        ? 0
        : Math.round(
            ((evidenceCount + linkedFindings) / Math.max(totalEntries * 2, 1)) *
              100,
          );

    const raw =
      100 -
      criticalFindings * 18 -
      highFindings * 8 -
      openActions * 5 +
      Math.min(evidenceCount * 3, 15);
    const score = Math.max(0, Math.min(100, Math.round(raw)));

    return {
      score,
      completeness: Math.max(0, Math.min(100, completeness)),
      totalEntries,
      criticalFindings,
      evidenceCount,
      openActions,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  trail() {
    return [...this.entries]
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      .map((entry, index) => ({
        ...entry,
        nodeIndex: index,
        active:
          entry.severity === 'critical' || index === this.entries.length - 1,
      }));
  }

  exportReport(userId: number) {
    const score = this.score(userId);
    const report: AuditReport = {
      id: `rpt-${this.nextReportId++}`,
      generatedAt: new Date().toISOString(),
      userId,
      score,
      entries: this.listEntries(),
      evidence: this.listEvidence(),
      correctiveActions: this.listCorrectiveActions(),
      summary: `Audit completeness ${score.completeness}% · score ${score.score}% · critical ${score.criticalFindings}`,
    };
    this.reports.unshift(report);
    this.ingest(
      {
        source: 'system',
        action: 'audit.report.exported',
        details: `Exported report ${report.id}`,
        severity: 'info',
      },
      userId,
    );
    return report;
  }

  listReports() {
    return [...this.reports];
  }

  private inferSeverity(source: AuditCategory, action: string): AuditSeverity {
    const lower = `${source} ${action}`.toLowerCase();
    if (/(fail|critical|breach|overdue|incident\.reported)/.test(lower)) {
      return 'critical';
    }
    if (/(warning|high|expir)/.test(lower)) return 'high';
    if (/(complete|verified|pass|info)/.test(lower)) return 'info';
    return 'normal';
  }
}

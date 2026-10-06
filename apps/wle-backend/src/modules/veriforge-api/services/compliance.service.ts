import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type ForgeComplianceStatus = 'Pass' | 'Fail' | 'Pending';

export type ComplianceRequirement = {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ComplianceAssignment = {
  id: string;
  requirementId: string;
  targetType: 'user' | 'role' | 'department';
  targetId: string;
  targetLabel: string;
  assignedAt: string;
  userId: number;
  timestamp: string;
};

export type ComplianceDocument = {
  id: string;
  requirementId: string;
  userId: number;
  fileName: string;
  format: string;
  expiresAt: string | null;
  uploadedAt: string;
  forgeStatus: ForgeComplianceStatus;
  validity: boolean;
  timestamp: string;
};

export type ComplianceAuditEntry = {
  id: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
  userId: number;
  requirementId: string | null;
};

export type ComplianceScoreSnapshot = {
  score: number;
  totalRequirements: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  failedDocuments: number;
  expiringSoon: number;
  timestamp: string;
  userId: number | null;
  requirementId: string | null;
};

@Injectable()
export class ComplianceService {
  private nextRequirementId = 3;
  private nextAssignmentId = 1;
  private nextDocumentId = 1;
  private nextAuditId = 1;

  private requirements: ComplianceRequirement[] = [
    {
      id: 'cmp-1',
      name: 'Mandatory PPE validation',
      category: 'safety',
      description: 'Validate PPE credentials before site access.',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cmp-2',
      name: 'Monthly emergency drill',
      category: 'training',
      description: 'Confirm emergency drill completion each month.',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private assignments: ComplianceAssignment[] = [];
  private documents: ComplianceDocument[] = [];
  private auditLogs: ComplianceAuditEntry[] = [
    {
      id: 'audit-1',
      action: 'engine.initialized',
      details: { forgeStatus: 'verified' },
      timestamp: new Date().toISOString(),
      userId: 0,
      requirementId: null,
    },
  ];

  constructor(private readonly notifications: NotificationService) {}

  listRequirements() {
    return [...this.requirements];
  }

  createRequirement(
    input: { name: string; category: string; description: string },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const requirement: ComplianceRequirement = {
      id: `cmp-${this.nextRequirementId++}`,
      name: input.name,
      category: input.category,
      description: input.description,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };
    this.requirements.unshift(requirement);
    this.writeAudit({
      action: 'requirement.created',
      userId,
      requirementId: requirement.id,
      details: { name: requirement.name, category: requirement.category },
    });
    return requirement;
  }

  updateRequirement(
    input: {
      id: string;
      enabled?: boolean;
      name?: string;
      description?: string;
    },
    userId: number,
  ) {
    const requirement = this.requirements.find((item) => item.id === input.id);
    if (!requirement) {
      return {
        requirementId: input.id,
        enabled: false,
        forgeStatus: 'failed' as const,
      };
    }
    if (typeof input.enabled === 'boolean') requirement.enabled = input.enabled;
    if (input.name) requirement.name = input.name;
    if (input.description) requirement.description = input.description;
    requirement.updatedAt = new Date().toISOString();
    this.writeAudit({
      action: 'requirement.updated',
      userId,
      requirementId: requirement.id,
      details: { enabled: requirement.enabled },
    });
    return {
      requirementId: requirement.id,
      enabled: requirement.enabled,
      forgeStatus: 'forged' as const,
      timestamp: requirement.updatedAt,
      userId,
    };
  }

  assignRequirement(
    input: {
      requirementId: string;
      targetType: 'user' | 'role' | 'department';
      targetId: string;
      targetLabel: string;
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const assignment: ComplianceAssignment = {
      id: `asg-${this.nextAssignmentId++}`,
      requirementId: input.requirementId,
      targetType: input.targetType,
      targetId: input.targetId,
      targetLabel: input.targetLabel,
      assignedAt: now,
      userId,
      timestamp: now,
    };
    this.assignments.unshift(assignment);
    this.writeAudit({
      action: 'requirement.assigned',
      userId,
      requirementId: input.requirementId,
      details: {
        targetType: input.targetType,
        targetId: input.targetId,
        targetLabel: input.targetLabel,
      },
    });
    return assignment;
  }

  listAssignments() {
    return [...this.assignments];
  }

  uploadDocument(
    input: {
      requirementId: string;
      fileName: string;
      format: string;
      expiresAt?: string | null;
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const check = this.runDocumentChecks({
      format: input.format,
      expiresAt: input.expiresAt ?? null,
    });
    const document: ComplianceDocument = {
      id: `doc-${this.nextDocumentId++}`,
      requirementId: input.requirementId,
      userId,
      fileName: input.fileName,
      format: input.format,
      expiresAt: input.expiresAt ?? null,
      uploadedAt: now,
      forgeStatus: check.forgeStatus,
      validity: check.validity,
      timestamp: now,
    };
    this.documents.unshift(document);
    this.writeAudit({
      action: 'document.uploaded',
      userId,
      requirementId: input.requirementId,
      details: {
        documentId: document.id,
        forgeStatus: document.forgeStatus,
        format: document.format,
      },
    });
    this.emitExpiryAlerts();
    return document;
  }

  listDocuments() {
    return [...this.documents];
  }

  verifyDocument(documentId: string, userId: number) {
    const document = this.documents.find((item) => item.id === documentId);
    if (!document) {
      return {
        documentId,
        forgeStatus: 'Fail' as ForgeComplianceStatus,
        timestamp: new Date().toISOString(),
        userId,
        requirementId: null,
      };
    }
    const check = this.runDocumentChecks({
      format: document.format,
      expiresAt: document.expiresAt,
    });
    document.forgeStatus = check.forgeStatus;
    document.validity = check.validity;
    document.timestamp = new Date().toISOString();
    this.writeAudit({
      action: 'document.verified',
      userId,
      requirementId: document.requirementId,
      details: {
        documentId: document.id,
        forgeStatus: document.forgeStatus,
      },
    });
    this.emitExpiryAlerts();
    return {
      documentId: document.id,
      forgeStatus: document.forgeStatus,
      timestamp: document.timestamp,
      userId,
      requirementId: document.requirementId,
    };
  }

  score(userId: number | null = null): ComplianceScoreSnapshot {
    const enabledRequirements = this.requirements.filter(
      (item) => item.enabled,
    );
    const verified = this.documents.filter(
      (item) => item.forgeStatus === 'Pass',
    ).length;
    const pending = this.documents.filter(
      (item) => item.forgeStatus === 'Pending',
    ).length;
    const failed = this.documents.filter(
      (item) => item.forgeStatus === 'Fail',
    ).length;
    const expiringSoon = this.documents.filter((item) =>
      this.isExpiringSoon(item.expiresAt),
    ).length;

    const denominator = Math.max(enabledRequirements.length, 1);
    const raw =
      (verified / denominator) * 100 -
      failed * 8 -
      pending * 3 -
      expiringSoon * 5;
    const score = Math.max(0, Math.min(100, Math.round(raw)));

    return {
      score,
      totalRequirements: enabledRequirements.length,
      verifiedDocuments: verified,
      pendingDocuments: pending,
      failedDocuments: failed,
      expiringSoon,
      timestamp: new Date().toISOString(),
      userId,
      requirementId: null,
    };
  }

  listAuditLogs() {
    return [...this.auditLogs];
  }

  runWorkflowAutomation(userId: number) {
    const score = this.score(userId);
    this.emitExpiryAlerts();
    this.writeAudit({
      action: 'workflow.automation.ran',
      userId,
      requirementId: null,
      details: {
        score: score.score,
        expiringSoon: score.expiringSoon,
        forgeStatus: score.score >= 70 ? 'verified' : 'failed',
      },
    });
    return {
      score,
      alertsEmitted: score.expiringSoon,
      forgeStatus: score.score >= 70 ? 'verified' : 'failed',
      timestamp: new Date().toISOString(),
      userId,
      requirementId: null,
    };
  }

  private runDocumentChecks(input: {
    format: string;
    expiresAt: string | null;
  }): { forgeStatus: ForgeComplianceStatus; validity: boolean } {
    const allowed = new Set(['pdf', 'png', 'jpg', 'jpeg']);
    const formatOk = allowed.has(input.format.toLowerCase());
    if (!formatOk) {
      return { forgeStatus: 'Fail', validity: false };
    }
    if (!input.expiresAt) {
      return { forgeStatus: 'Pending', validity: true };
    }
    const expiresAt = new Date(input.expiresAt).getTime();
    if (Number.isNaN(expiresAt) || expiresAt < Date.now()) {
      return { forgeStatus: 'Fail', validity: false };
    }
    return { forgeStatus: 'Pass', validity: true };
  }

  private isExpiringSoon(expiresAt: string | null) {
    if (!expiresAt) return false;
    const expires = new Date(expiresAt).getTime();
    if (Number.isNaN(expires)) return false;
    const inThirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
    return expires <= inThirtyDays && expires >= Date.now();
  }

  private emitExpiryAlerts() {
    const expiring = this.documents.filter((item) =>
      this.isExpiringSoon(item.expiresAt),
    );
    for (const document of expiring) {
      this.notifications.enqueue({
        title: 'COMPLIANCE EXPIRY ALERT',
        message: `${document.fileName} for ${document.requirementId} expires soon.`,
        category: 'compliance',
        forgeStatus: 'failed',
      });
      this.writeAudit({
        action: 'expiry.alert.emitted',
        userId: document.userId,
        requirementId: document.requirementId,
        details: {
          documentId: document.id,
          expiresAt: document.expiresAt,
        },
      });
    }
  }

  private writeAudit(input: {
    action: string;
    userId: number;
    requirementId: string | null;
    details: Record<string, unknown>;
  }) {
    this.auditLogs.unshift({
      id: `audit-${this.nextAuditId++}`,
      action: input.action,
      details: {
        ...input.details,
        timestamp: new Date().toISOString(),
        userId: input.userId,
        requirementId: input.requirementId,
      },
      timestamp: new Date().toISOString(),
      userId: input.userId,
      requirementId: input.requirementId,
    });
  }
}

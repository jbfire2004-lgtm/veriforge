import type {
  ComplianceArtifactStatus,
  ComplianceArtifactType,
} from '@prisma/client';
import { prisma } from '../db/prisma';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { auditService } from './audit.service';
import { complianceScorecardService } from './compliance-scorecard.service';
import { complianceNotificationService } from './compliance-notification.service';
import { REQUIRED_COMPLIANCE_TYPES } from '../compliance/weights';
import { logger } from '../utils/logger';

const ARTIFACT_TYPES: ComplianceArtifactType[] = [
  'insurance',
  'wcb',
  'cor',
  'scsa',
  'custom',
];

export class ComplianceService {
  async upload(input: {
    orgId: string;
    uploadedById?: string;
    type: ComplianceArtifactType;
    fileUrl: string;
    expiryDate?: string | Date | null;
    label?: string;
    ip?: string;
    userAgent?: string;
  }) {
    if (!ARTIFACT_TYPES.includes(input.type)) {
      throw new BadRequestError('Invalid compliance type');
    }
    const fileUrl = input.fileUrl?.trim();
    if (!fileUrl || fileUrl.length < 4) {
      throw new BadRequestError('fileUrl is required');
    }

    const org = await prisma.organization.findUnique({ where: { id: input.orgId } });
    if (!org) throw new NotFoundError('Organization not found');

    let expiryDate: Date | null = null;
    if (input.expiryDate) {
      expiryDate = new Date(input.expiryDate);
      if (Number.isNaN(expiryDate.getTime())) {
        throw new BadRequestError('Invalid expiryDate');
      }
    }

    const artifact = await prisma.complianceArtifact.create({
      data: {
        orgId: input.orgId,
        type: input.type,
        label: input.label?.trim() || null,
        fileUrl,
        expiryDate,
        status: 'pending_review',
        uploadedById: input.uploadedById ?? null,
      },
    });

    await complianceScorecardService.recalculate(input.orgId);
    await complianceNotificationService
      .notifyReviewPending(artifact.id)
      .catch((err) =>
        logger.warn('compliance review_pending notify failed', {
          error: err instanceof Error ? err.message : String(err),
        }),
      );

    await auditService.log({
      action: 'compliance.upload',
      orgId: input.orgId,
      actorId: input.uploadedById,
      resource: 'compliance_artifact',
      resourceId: artifact.id,
      ip: input.ip,
      userAgent: input.userAgent,
      meta: { type: input.type },
    });

    return { artifact };
  }

  async listForOrg(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, slug: true },
    });
    if (!org) throw new NotFoundError('Organization not found');

    const artifacts = await prisma.complianceArtifact.findMany({
      where: { orgId },
      orderBy: [{ type: 'asc' }, { updatedAt: 'desc' }],
      include: {
        uploadedBy: { select: { id: true, email: true, fullName: true } },
        reviewer: { select: { id: true, email: true, fullName: true } },
      },
    });

    const scorecard = await complianceScorecardService.getOrCalculate(orgId);
    const reminders = this.buildReminders(artifacts);

    return {
      organization: org,
      artifacts,
      scorecard,
      reminders,
      requiredTypes: REQUIRED_COMPLIANCE_TYPES,
    };
  }

  buildReminders(
    artifacts: { id: string; type: string; status: string; expiryDate: Date | null; label: string | null }[],
  ) {
    const now = Date.now();
    const soon = 30 * 86_400_000;
    const reminders: {
      artifactId: string;
      type: string;
      label: string | null;
      kind: 'expiring_soon' | 'expired' | 'pending_review';
      expiryDate: Date | null;
    }[] = [];

    for (const a of artifacts) {
      if (a.status === 'pending_review') {
        reminders.push({
          artifactId: a.id,
          type: a.type,
          label: a.label,
          kind: 'pending_review',
          expiryDate: a.expiryDate,
        });
      }
      if (a.expiryDate) {
        const t = a.expiryDate.getTime();
        if (t < now || a.status === 'expired') {
          reminders.push({
            artifactId: a.id,
            type: a.type,
            label: a.label,
            kind: 'expired',
            expiryDate: a.expiryDate,
          });
        } else if (t - now <= soon) {
          reminders.push({
            artifactId: a.id,
            type: a.type,
            label: a.label,
            kind: 'expiring_soon',
            expiryDate: a.expiryDate,
          });
        }
      }
    }
    return reminders;
  }

  async review(input: {
    artifactId: string;
    reviewerId: string;
    decision: 'approve' | 'reject';
    notes?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const artifact = await prisma.complianceArtifact.findUnique({
      where: { id: input.artifactId },
    });
    if (!artifact) throw new NotFoundError('Compliance artifact not found');

    const status: ComplianceArtifactStatus =
      input.decision === 'approve' ? 'valid' : 'rejected';

    // If approving but already past expiry, mark expired instead
    let finalStatus: ComplianceArtifactStatus = status;
    if (
      status === 'valid' &&
      artifact.expiryDate &&
      artifact.expiryDate.getTime() < Date.now()
    ) {
      finalStatus = 'expired';
    }

    const updated = await prisma.complianceArtifact.update({
      where: { id: artifact.id },
      data: {
        status: finalStatus,
        reviewerId: input.reviewerId,
        reviewNotes: input.notes?.trim() || null,
        reviewedAt: new Date(),
      },
    });

    await complianceScorecardService.recalculate(artifact.orgId);

    if (input.decision === 'approve') {
      await complianceNotificationService.notifyApproved(updated.id).catch(() => undefined);
    } else {
      await complianceNotificationService.notifyRejected(updated.id).catch(() => undefined);
    }

    await auditService.log({
      action: `compliance.review.${input.decision}`,
      orgId: artifact.orgId,
      actorId: input.reviewerId,
      resource: 'compliance_artifact',
      resourceId: artifact.id,
      ip: input.ip,
      userAgent: input.userAgent,
      meta: { status: finalStatus },
    });

    return { artifact: updated };
  }

  async update(input: {
    artifactId: string;
    orgId: string;
    actorId?: string;
    fileUrl?: string;
    expiryDate?: string | Date | null;
    label?: string;
    type?: ComplianceArtifactType;
    ip?: string;
    userAgent?: string;
  }) {
    const artifact = await prisma.complianceArtifact.findUnique({
      where: { id: input.artifactId },
    });
    if (!artifact) throw new NotFoundError('Compliance artifact not found');
    if (artifact.orgId !== input.orgId) {
      throw new ForbiddenError('Artifact does not belong to this organization');
    }

    let expiryDate: Date | null | undefined = undefined;
    if (input.expiryDate !== undefined) {
      if (input.expiryDate === null || input.expiryDate === '') {
        expiryDate = null;
      } else {
        expiryDate = new Date(input.expiryDate);
        if (Number.isNaN(expiryDate.getTime())) {
          throw new BadRequestError('Invalid expiryDate');
        }
      }
    }

    const updated = await prisma.complianceArtifact.update({
      where: { id: artifact.id },
      data: {
        fileUrl: input.fileUrl?.trim() || undefined,
        expiryDate,
        label: input.label === undefined ? undefined : input.label.trim() || null,
        type: input.type,
        // Re-submit for review when material fields change
        status:
          input.fileUrl || input.expiryDate !== undefined || input.type
            ? 'pending_review'
            : undefined,
        reviewerId: input.fileUrl ? null : undefined,
        reviewedAt: input.fileUrl ? null : undefined,
      },
    });

    await complianceScorecardService.recalculate(artifact.orgId);

    await auditService.log({
      action: 'compliance.update',
      orgId: artifact.orgId,
      actorId: input.actorId,
      resource: 'compliance_artifact',
      resourceId: artifact.id,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return { artifact: updated };
  }

  /**
   * Mark past-due artifacts expired and refresh scorecards.
   */
  async checkExpiries() {
    const now = new Date();
    const due = await prisma.complianceArtifact.findMany({
      where: {
        expiryDate: { lt: now },
        status: { in: ['valid', 'pending_review'] },
      },
    });

    const orgIds = new Set<string>();
    for (const a of due) {
      await prisma.complianceArtifact.update({
        where: { id: a.id },
        data: { status: 'expired' },
      });
      orgIds.add(a.orgId);
      await complianceNotificationService.notifyExpired(a.id).catch(() => undefined);
    }

    // Warning for artifacts expiring within 30 days
    const soonEnd = new Date(now.getTime() + 30 * 86_400_000);
    const soon = await prisma.complianceArtifact.findMany({
      where: {
        status: 'valid',
        expiryDate: { gte: now, lte: soonEnd },
      },
    });
    for (const a of soon) {
      orgIds.add(a.orgId);
      await complianceNotificationService
        .notifyExpiryWarning(a.id)
        .catch(() => undefined);
    }

    for (const orgId of orgIds) {
      await complianceScorecardService.recalculate(orgId);
    }

    return {
      expired: due.length,
      warned: soon.length,
      orgsRecalculated: orgIds.size,
    };
  }

  async listPendingReview(opts?: { skip?: number; take?: number }) {
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 50, 100);
    const [items, total] = await Promise.all([
      prisma.complianceArtifact.findMany({
        where: { status: 'pending_review' },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        include: {
          organization: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.complianceArtifact.count({ where: { status: 'pending_review' } }),
    ]);
    return { items, total, skip, take };
  }
}

export const complianceService = new ComplianceService();

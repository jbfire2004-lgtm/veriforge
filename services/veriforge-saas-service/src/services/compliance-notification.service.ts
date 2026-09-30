import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import { notificationTriggers } from './notification-triggers.service';

/**
 * Idempotent compliance notifications via NotificationTriggers + log table.
 */
export class ComplianceNotificationService {
  private async sendOnce(input: {
    orgId: string;
    artifactId: string;
    kind: 'expiry_warning' | 'expired' | 'review_pending' | 'approved' | 'rejected';
    recipientEmail: string;
    meta?: Record<string, unknown>;
  }) {
    try {
      await prisma.complianceNotificationLog.create({
        data: {
          orgId: input.orgId,
          artifactId: input.artifactId,
          kind: input.kind,
          recipientEmail: input.recipientEmail,
          meta: input.meta ?? undefined,
        },
      });

      if (input.kind === 'expiry_warning' || input.kind === 'expired') {
        await notificationTriggers.onComplianceExpiry({
          orgId: input.orgId,
          artifactId: input.artifactId,
          kind: input.kind,
          artifactType:
            typeof input.meta?.type === 'string' ? input.meta.type : undefined,
        });
      } else {
        const { notificationService } = await import('./notification.service');
        await notificationService.createNotification({
          orgId: input.orgId,
          type: 'compliance_expiry',
          title: `Compliance: ${input.kind.replace(/_/g, ' ')}`,
          message: `Compliance artifact ${input.artifactId} — ${input.kind}.`,
          dedupeKey: `compliance-${input.kind}-${input.artifactId}`,
          meta: { kind: input.kind, artifactId: input.artifactId, ...input.meta },
          email: {
            to: input.recipientEmail,
            subject: `Compliance: ${input.kind.replace(/_/g, ' ')}`,
          },
        });
      }

      logger.info('compliance notification', {
        kind: input.kind,
        orgId: input.orgId,
        artifactId: input.artifactId,
        to: input.recipientEmail,
      });
      return true;
    } catch (err) {
      logger.debug('compliance notification skipped (duplicate or error)', {
        kind: input.kind,
        artifactId: input.artifactId,
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }

  private async orgContact(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        billingEmail: true,
        contactEmail: true,
        name: true,
      },
    });
    return org;
  }

  async notifyReviewPending(artifactId: string) {
    const artifact = await prisma.complianceArtifact.findUnique({
      where: { id: artifactId },
    });
    if (!artifact) return false;
    const org = await this.orgContact(artifact.orgId);
    const email = org?.contactEmail || org?.billingEmail || 'compliance@veriforge.local';
    return this.sendOnce({
      orgId: artifact.orgId,
      artifactId,
      kind: 'review_pending',
      recipientEmail: email,
      meta: { type: artifact.type },
    });
  }

  async notifyApproved(artifactId: string) {
    const artifact = await prisma.complianceArtifact.findUnique({
      where: { id: artifactId },
    });
    if (!artifact) return false;
    const org = await this.orgContact(artifact.orgId);
    const email = org?.contactEmail || org?.billingEmail || 'compliance@veriforge.local';
    return this.sendOnce({
      orgId: artifact.orgId,
      artifactId,
      kind: 'approved',
      recipientEmail: email,
      meta: { type: artifact.type },
    });
  }

  async notifyRejected(artifactId: string) {
    const artifact = await prisma.complianceArtifact.findUnique({
      where: { id: artifactId },
    });
    if (!artifact) return false;
    const org = await this.orgContact(artifact.orgId);
    const email = org?.contactEmail || org?.billingEmail || 'compliance@veriforge.local';
    return this.sendOnce({
      orgId: artifact.orgId,
      artifactId,
      kind: 'rejected',
      recipientEmail: email,
      meta: { type: artifact.type },
    });
  }

  async notifyExpired(artifactId: string) {
    const artifact = await prisma.complianceArtifact.findUnique({
      where: { id: artifactId },
    });
    if (!artifact) return false;
    const org = await this.orgContact(artifact.orgId);
    const email = org?.contactEmail || org?.billingEmail || 'compliance@veriforge.local';
    return this.sendOnce({
      orgId: artifact.orgId,
      artifactId,
      kind: 'expired',
      recipientEmail: email,
      meta: { type: artifact.type },
    });
  }

  async notifyExpiryWarning(artifactId: string) {
    const artifact = await prisma.complianceArtifact.findUnique({
      where: { id: artifactId },
    });
    if (!artifact) return false;
    const org = await this.orgContact(artifact.orgId);
    const email = org?.contactEmail || org?.billingEmail || 'compliance@veriforge.local';
    return this.sendOnce({
      orgId: artifact.orgId,
      artifactId,
      kind: 'expiry_warning',
      recipientEmail: email,
      meta: { type: artifact.type },
    });
  }
}

export const complianceNotificationService = new ComplianceNotificationService();

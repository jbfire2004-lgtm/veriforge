import { prisma } from '../db/prisma';
import { notificationService } from './notification.service';
import { logger } from '../utils/logger';

/**
 * Domain event → in-app + email notification fan-out.
 */
export class NotificationTriggers {
  async onComplianceExpiry(input: {
    orgId: string;
    artifactId: string;
    kind: 'expiry_warning' | 'expired';
    artifactType?: string;
  }) {
    const org = await this.orgContact(input.orgId);
    const title =
      input.kind === 'expired'
        ? 'Compliance artifact expired'
        : 'Compliance artifact expiring soon';
    const message = `Artifact ${input.artifactId}${
      input.artifactType ? ` (${input.artifactType})` : ''
    } is ${input.kind === 'expired' ? 'expired' : 'expiring soon'}.`;

    await notificationService.createNotification({
      orgId: input.orgId,
      type: 'compliance_expiry',
      title,
      message,
      dedupeKey: `compliance-${input.kind}-${input.artifactId}`,
      meta: { artifactId: input.artifactId, kind: input.kind },
      email: org?.email
        ? { to: org.email, subject: title }
        : undefined,
    });

    // Notify hiring clients with awards against this contractor org
    const awards = await prisma.contractAward.findMany({
      where: { contractorOrgId: input.orgId, status: 'awarded' },
      select: { hiringClientId: true },
      distinct: ['hiringClientId'],
      take: 50,
    });

    for (const award of awards) {
      const users = await prisma.hiringClientUser.findMany({
        where: { hiringClientId: award.hiringClientId, status: 'active' },
        select: { id: true, email: true },
        take: 20,
      });
      for (const user of users) {
        await notificationService.createNotification({
          orgId: input.orgId,
          userId: user.id,
          type: 'compliance_expiry',
          title,
          message: `${org?.name ?? 'Contractor'}: ${message}`,
          dedupeKey: `compliance-hc-${input.kind}-${input.artifactId}-${user.id}`,
          meta: {
            artifactId: input.artifactId,
            hiringClientId: award.hiringClientId,
          },
          email: { to: user.email, subject: title },
        });
      }
    }

    logger.info('trigger.compliance_expiry', {
      orgId: input.orgId,
      artifactId: input.artifactId,
      kind: input.kind,
      hiringClients: awards.length,
    });
  }

  async onScorecardUpdate(input: {
    orgId: string;
    globalScore: number;
    complianceScore: number;
    previousGlobalScore?: number | null;
  }) {
    if (
      input.previousGlobalScore != null &&
      input.previousGlobalScore === input.globalScore
    ) {
      return;
    }

    const org = await this.orgContact(input.orgId);
    const delta =
      input.previousGlobalScore != null
        ? input.globalScore - input.previousGlobalScore
        : null;
    const title = 'Safety scorecard updated';
    const message =
      delta == null
        ? `Global score is now ${input.globalScore} (compliance ${input.complianceScore}).`
        : `Global score changed from ${input.previousGlobalScore} to ${input.globalScore} (${delta >= 0 ? '+' : ''}${delta}). Compliance ${input.complianceScore}.`;

    const day = new Date().toISOString().slice(0, 10);
    await notificationService.createNotification({
      orgId: input.orgId,
      type: 'scorecard_update',
      title,
      message,
      dedupeKey: `scorecard-${input.orgId}-${input.globalScore}-${day}`,
      meta: {
        globalScore: input.globalScore,
        complianceScore: input.complianceScore,
        previousGlobalScore: input.previousGlobalScore ?? null,
      },
      email: org?.email ? { to: org.email, subject: title } : undefined,
    });
  }

  async onModuleChange(input: {
    orgId: string;
    updates: { code: string; enabled: boolean }[];
    actorId?: string;
  }) {
    const owner = await this.orgOwner(input.orgId);
    const org = await this.orgContact(input.orgId);
    const summary = input.updates
      .map((u) => `${u.code}:${u.enabled ? 'on' : 'off'}`)
      .join(', ');
    const title = 'Module entitlements updated';
    const message = `Modules changed: ${summary}`;

    await notificationService.createNotification({
      orgId: input.orgId,
      userId: owner?.id,
      type: 'module_update',
      title,
      message,
      dedupeKey: `module-${input.orgId}-${Date.now()}`,
      meta: { updates: input.updates, actorId: input.actorId },
      email: (owner?.email || org?.email)
        ? {
            to: owner?.email || org!.email!,
            subject: title,
          }
        : undefined,
    });
  }

  async onBillingIssue(input: {
    orgId: string;
    billingStatus: string;
    action: 'suspended' | 'reactivated' | 'past_due' | 'updated';
  }) {
    const owner = await this.orgOwner(input.orgId);
    const org = await this.orgContact(input.orgId);
    const title =
      input.action === 'reactivated'
        ? 'Billing restored — modules reactivated'
        : 'Billing issue — action required';
    const message = `Billing status is ${input.billingStatus} (${input.action}).`;

    await notificationService.createNotification({
      orgId: input.orgId,
      userId: owner?.id,
      type: 'billing_issue',
      title,
      message,
      dedupeKey: `billing-${input.action}-${input.orgId}-${input.billingStatus}`,
      meta: input,
      email: (owner?.email || org?.email)
        ? {
            to: owner?.email || org!.email!,
            subject: title,
          }
        : undefined,
    });
  }

  private async orgContact(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        name: true,
        billingEmail: true,
        contactEmail: true,
      },
    });
    if (!org) return null;
    return {
      name: org.name,
      email: org.billingEmail || org.contactEmail || null,
    };
  }

  private async orgOwner(orgId: string) {
    const user = await prisma.user.findFirst({
      where: {
        orgId,
        status: 'active',
        orgRoleLinks: { some: { orgRole: { systemCode: 'owner' } } },
      },
      select: { id: true, email: true },
      orderBy: { createdAt: 'asc' },
    });
    if (user) return user;
    return prisma.user.findFirst({
      where: { orgId, status: 'active' },
      select: { id: true, email: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const notificationTriggers = new NotificationTriggers();

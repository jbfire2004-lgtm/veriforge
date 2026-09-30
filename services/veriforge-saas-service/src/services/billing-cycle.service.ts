import type { SubscriptionStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { moduleService } from './module.service';
import { subscriptionService } from './subscription.service';
import { notificationTriggers } from './notification-triggers.service';
import { logger } from '../utils/logger';

const OVERDUE: SubscriptionStatus[] = ['past_due', 'unpaid'];
const PAID: SubscriptionStatus[] = ['active', 'trialing'];

/**
 * Daily billing cycle: suspend modules when overdue, restore when paid.
 */
export class BillingCycleService {
  async checkBillingCycles() {
    const [suspended, reactivated] = await Promise.all([
      this.suspendOverdue(),
      this.reactivatePaid(),
    ]);
    return { suspended, reactivated };
  }

  private async suspendOverdue() {
    const profiles = await prisma.subscriptionProfile.findMany({
      where: { billingStatus: { in: OVERDUE } },
      include: {
        organization: { select: { id: true, status: true, name: true } },
      },
    });

    let count = 0;
    for (const profile of profiles) {
      const org = profile.organization;
      const enabled = await prisma.organizationModule.count({
        where: { orgId: org.id, effectiveTo: null, enabled: true },
      });

      if (enabled > 0) {
        await moduleService.lockAllModules(org.id, 'billing_overdue');
        count += 1;
      }

      if (org.status !== 'suspended') {
        await prisma.organization.update({
          where: { id: org.id },
          data: { status: 'suspended' },
        });
      }

      await notificationTriggers.onBillingIssue({
        orgId: org.id,
        billingStatus: profile.billingStatus,
        action: 'suspended',
      });

      logger.info('billing cycle suspended modules', {
        orgId: org.id,
        billingStatus: profile.billingStatus,
      });
    }

    return count;
  }

  private async reactivatePaid() {
    const profiles = await prisma.subscriptionProfile.findMany({
      where: { billingStatus: { in: PAID } },
      include: {
        organization: {
          select: {
            id: true,
            status: true,
            name: true,
            isTrialActive: true,
            trialEnd: true,
          },
        },
      },
    });

    let count = 0;
    const now = new Date();

    for (const profile of profiles) {
      const org = profile.organization;

      if (
        profile.billingPlan === 'trial' &&
        !org.isTrialActive &&
        org.trialEnd &&
        org.trialEnd.getTime() < now.getTime()
      ) {
        continue;
      }

      const enabled = await prisma.organizationModule.count({
        where: { orgId: org.id, effectiveTo: null, enabled: true },
      });

      if (enabled === 0 || org.status === 'suspended') {
        await subscriptionService.restoreModulesFromProfile(org.id);
        if (org.status === 'suspended') {
          await prisma.organization.update({
            where: { id: org.id },
            data: { status: 'active' },
          });
        }
        count += 1;

        await notificationTriggers.onBillingIssue({
          orgId: org.id,
          billingStatus: profile.billingStatus,
          action: 'reactivated',
        });

        logger.info('billing cycle reactivated modules', {
          orgId: org.id,
          billingStatus: profile.billingStatus,
        });
      }
    }

    return count;
  }
}

export const billingCycleService = new BillingCycleService();

import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { PRODUCT_MODULE_CODES } from '../subscription/product-modules';
import { subscriptionService } from './subscription.service';
import { logger } from '../utils/logger';

/**
 * Snapshot module usage metrics into analytics table.
 */
export class ModuleUsageTrackerService {
  async trackHourlyUsage(at = new Date()) {
    const periodStart = new Date(at);
    periodStart.setMinutes(0, 0, 0);
    const periodEnd = new Date(periodStart.getTime() + 60 * 60_000);

    const orgs = await prisma.organization.findMany({
      where: { status: { in: ['active', 'suspended'] } },
      select: { id: true },
      take: 5_000,
    });

    let written = 0;

    for (const org of orgs) {
      const profile = await subscriptionService.ensureProfile(org.id);
      const usage = await subscriptionService.getUsageSnapshot(org.id);

      for (const code of PRODUCT_MODULE_CODES) {
        if (!profile.modulesEnabled[code]) continue;
        const slice = usage[code] ?? { metric: 'events', value: 0 };
        const activeUsers =
          code === 'core'
            ? slice.value
            : await prisma.user.count({
                where: { orgId: org.id, status: 'active' },
              });

        await prisma.moduleUsageMetric.upsert({
          where: {
            orgId_moduleCode_periodStart: {
              orgId: org.id,
              moduleCode: code,
              periodStart,
            },
          },
          create: {
            orgId: org.id,
            moduleCode: code,
            periodStart,
            periodEnd,
            eventCount: slice.value,
            activeUsers,
            meta: {
              metric: slice.metric,
              billingPlan: profile.billingPlan,
              billingStatus: profile.billingStatus,
            } as Prisma.InputJsonValue,
          },
          update: {
            periodEnd,
            eventCount: slice.value,
            activeUsers,
            recordedAt: at,
            meta: {
              metric: slice.metric,
              billingPlan: profile.billingPlan,
              billingStatus: profile.billingStatus,
            } as Prisma.InputJsonValue,
          },
        });
        written += 1;
      }
    }

    logger.info('module usage tracked', {
      orgs: orgs.length,
      rows: written,
      periodStart: periodStart.toISOString(),
    });

    return { orgs: orgs.length, rows: written, periodStart, periodEnd };
  }
}

export const moduleUsageTrackerService = new ModuleUsageTrackerService();

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CailStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/notification-types';

@Injectable()
export class CailOverdueScheduler {
  private readonly logger = new Logger(CailOverdueScheduler.name);
  private runningOverdue = false;
  private runningDueSoon = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async markOverdueEntries() {
    if (this.runningOverdue) return;
    this.runningOverdue = true;
    try {
      const now = new Date();
      const toMark = await this.prisma.cailEntry.findMany({
        where: {
          status: { in: [CailStatus.open, CailStatus.in_progress] },
          dueDate: { lt: now },
        },
        select: {
          id: true,
          title: true,
          assignedUserId: true,
          ownerCompanyId: true,
          projectId: true,
          dueDate: true,
        },
        take: 500,
      });

      if (!toMark.length) return;

      await this.prisma.cailEntry.updateMany({
        where: { id: { in: toMark.map((e) => e.id) } },
        data: {
          status: CailStatus.overdue,
          overdueAt: now,
        },
      });

      this.logger.log(`Marked ${toMark.length} CAIL entries as overdue`);
      await this.notifyOverdue(toMark, now);
    } catch (e) {
      this.logger.error(`CAIL overdue job failed: ${e}`);
    } finally {
      this.runningOverdue = false;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async notifyDueSoonEntries() {
    if (this.runningDueSoon) return;
    this.runningDueSoon = true;
    try {
      const now = new Date();
      const until = new Date(now);
      until.setDate(until.getDate() + 3);
      const dayKey = now.toISOString().slice(0, 10);

      const entries = await this.prisma.cailEntry.findMany({
        where: {
          status: { in: [CailStatus.open, CailStatus.in_progress] },
          dueDate: { gte: now, lte: until },
        },
        select: {
          id: true,
          title: true,
          assignedUserId: true,
          ownerCompanyId: true,
          dueDate: true,
        },
        take: 500,
      });

      for (const entry of entries) {
        const dueLabel = entry.dueDate
          ? entry.dueDate.toLocaleDateString()
          : 'soon';
        const body = `"${entry.title}" is due ${dueLabel}.`;

        if (entry.assignedUserId) {
          await this.notifications.notifyUsers({
            userIds: [entry.assignedUserId],
            type: NOTIFICATION_TYPES.CAIL_DUE_SOON,
            title: 'CAIL due soon',
            body,
            dedupeKey: `cail-due-soon:${entry.id}:${dayKey}`,
            payload: {
              cailId: entry.id,
              dueDate: entry.dueDate?.toISOString(),
            },
            companyId: entry.ownerCompanyId,
          });
        }

        await this.notifications.notifyCompanySupervisors(
          entry.ownerCompanyId,
          {
            type: NOTIFICATION_TYPES.CAIL_DUE_SOON,
            title: 'CAIL due soon (team)',
            body,
            dedupeKey: `cail-due-soon-super:${entry.id}:${dayKey}`,
            payload: { cailId: entry.id },
            companyId: entry.ownerCompanyId,
          },
        );
      }
    } catch (e) {
      this.logger.error(`CAIL due-soon job failed: ${e}`);
    } finally {
      this.runningDueSoon = false;
    }
  }

  private async notifyOverdue(
    entries: Array<{
      id: string;
      title: string;
      assignedUserId: number | null;
      ownerCompanyId: number;
      dueDate: Date | null;
    }>,
    now: Date,
  ) {
    const dayKey = now.toISOString().slice(0, 10);

    for (const entry of entries) {
      const body = `"${entry.title}" is past due.`;

      if (entry.assignedUserId) {
        await this.notifications.notifyUsers({
          userIds: [entry.assignedUserId],
          type: NOTIFICATION_TYPES.CAIL_OVERDUE,
          title: 'CAIL overdue',
          body,
          dedupeKey: `cail-overdue:${entry.id}:${dayKey}`,
          payload: { cailId: entry.id, dueDate: entry.dueDate?.toISOString() },
          companyId: entry.ownerCompanyId,
        });
      }

      await this.notifications.notifyCompanySupervisors(entry.ownerCompanyId, {
        type: NOTIFICATION_TYPES.CAIL_OVERDUE,
        title: 'CAIL overdue (team)',
        body,
        dedupeKey: `cail-overdue-super:${entry.id}:${dayKey}`,
        payload: { cailId: entry.id },
        companyId: entry.ownerCompanyId,
      });
    }
  }
}

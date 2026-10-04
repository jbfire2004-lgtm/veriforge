import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RenewalRecommendationStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventBusService } from '../../../common/events/event-bus.service';
import { CertificationService } from './certification.service';
import { NotificationService } from './notification.service';

export interface RenewalScanSummary {
  certificationsScanned: number;
  recommendationsCreated: number;
  notificationsSent: number;
}

const RENEWAL_WINDOWS = [30, 60, 90];

@Injectable()
export class RenewalDetectionService {
  private readonly logger = new Logger(RenewalDetectionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly certifications: CertificationService,
    private readonly notifications: NotificationService,
    private readonly events: EventBusService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM, { name: 'renewal-detection-nightly' })
  async runNightlyScan(): Promise<RenewalScanSummary> {
    const certs = await this.certifications.getActiveCertifications();
    const now = Date.now();
    const summary: RenewalScanSummary = {
      certificationsScanned: certs.length,
      recommendationsCreated: 0,
      notificationsSent: 0,
    };

    for (const cert of certs) {
      if (!cert.expiresAt) continue;
      const daysUntilExpiry = Math.ceil(
        (cert.expiresAt.getTime() - now) / 86_400_000,
      );
      if (!RENEWAL_WINDOWS.includes(daysUntilExpiry)) continue;

      const created = await this.upsertRecommendation(cert, daysUntilExpiry);
      if (!created) continue;
      summary.recommendationsCreated += 1;

      await this.notifications.sendExpiringSoon(String(cert.workerId), cert.id);
      await this.markNotified(created.id);
      this.events.emit('renewal.expiring', {
        workerId: String(cert.workerId),
        certificationId: cert.id,
      });
      summary.notificationsSent += 1;
    }

    this.logger.log(`Renewal scan complete: ${JSON.stringify(summary)}`);
    return summary;
  }

  async getWorkerRecommendations(workerId: number) {
    return this.prisma.renewalRecommendation.findMany({
      where: {
        workerId,
        status: {
          in: [
            RenewalRecommendationStatus.PENDING,
            RenewalRecommendationStatus.NOTIFIED,
          ],
        },
      },
      orderBy: [{ expiresAt: 'asc' }, { windowDays: 'asc' }],
    });
  }

  private async upsertRecommendation(
    cert: {
      id: string;
      workerId: number;
      certType: string;
      expiresAt: Date | null;
      companyId: number | null;
    },
    windowDays: number,
  ): Promise<{ id: string } | null> {
    if (!cert.expiresAt) return null;
    try {
      const record = await this.prisma.renewalRecommendation.upsert({
        where: {
          certificationId_windowDays: { certificationId: cert.id, windowDays },
        },
        create: {
          workerId: cert.workerId,
          certificationId: cert.id,
          certType: cert.certType,
          expiresAt: cert.expiresAt,
          windowDays,
          companyId: cert.companyId,
          status: RenewalRecommendationStatus.PENDING,
        },
        update: { expiresAt: cert.expiresAt, certType: cert.certType },
      });
      return { id: record.id };
    } catch (error) {
      this.logger.error(
        `Failed to upsert recommendation for cert ${cert.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private async markNotified(recommendationId: string): Promise<void> {
    await this.prisma.renewalRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: RenewalRecommendationStatus.NOTIFIED,
        notifiedAt: new Date(),
      },
    });
  }
}

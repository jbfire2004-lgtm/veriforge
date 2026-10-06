import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreReadinessService } from './core-readiness.service';
import { EventBusMetricsService } from '../vera-event-bus/event-bus-metrics.service';
import { ProviderIntegrationHubService } from './provider-integration-hub.service';

export type VeraCoreHubMetrics = {
  generatedAt: string;
  companyId: number | null;
  workers: number;
  verifiedTraining30d: number;
  openVerifications: number;
  readinessScore: number;
  readinessState: string;
  providerChannelsHealthy: number;
  providerChannelsTotal: number;
  eventBus: {
    emitted: number;
    published: number;
    dlq: number;
  };
};

@Injectable()
export class VeraCoreHubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readiness: CoreReadinessService,
    private readonly eventMetrics: EventBusMetricsService,
    private readonly providerHub: ProviderIntegrationHubService,
  ) {}

  async getHubMetrics(
    companyId?: number,
    userId?: number,
  ): Promise<VeraCoreHubMetrics> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const companyFilter = companyId
      ? {
          OR: [
            { companyId },
            { companyLinks: { some: { companyId, active: true } } },
          ],
        }
      : {};

    const trainingWhere = companyId ? { companyId } : {};

    const [
      workers,
      verifiedTraining30d,
      openVerifications,
      readinessSummary,
      providerHub,
    ] = await Promise.all([
      this.prisma.worker.count({ where: companyFilter }),
      this.prisma.trainingRecord.count({
        where: {
          ...trainingWhere,
          lastVerificationStatus: 'VERIFIED',
          verifiedAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.trainingRecord.count({
        where: {
          ...trainingWhere,
          OR: [
            { lastVerificationStatus: null },
            {
              lastVerificationStatus: {
                in: ['ATTENTION', 'INVALID', 'PENDING'],
              },
            },
          ],
        },
      }),
      this.readiness.summary(companyId, userId),
      companyId
        ? this.providerHub.getSummary(companyId)
        : Promise.resolve(null),
    ]);

    const readinessScore = this.extractReadinessScore(readinessSummary);
    const readinessState = this.extractReadinessState(readinessSummary);
    const channels = providerHub?.channels ?? [];
    const eventSnap = this.eventMetrics.getSnapshot();

    return {
      generatedAt: new Date().toISOString(),
      companyId: companyId ?? null,
      workers,
      verifiedTraining30d,
      openVerifications,
      readinessScore,
      readinessState,
      providerChannelsHealthy: channels.filter((c) => c.status === 'healthy')
        .length,
      providerChannelsTotal: channels.length,
      eventBus: {
        emitted: eventSnap.emitted,
        published: eventSnap.published,
        dlq: eventSnap.dlq,
      },
    };
  }

  private extractReadinessScore(
    summary: Awaited<ReturnType<CoreReadinessService['summary']>>,
  ): number {
    const dims = summary.dimensions ?? [];
    if (dims.length === 0) {
      return Math.round(summary.workers?.score ?? 0);
    }
    const avg =
      dims.reduce((sum, d) => sum + (d.score ?? 0), 0) /
      Math.max(1, dims.length);
    return Math.round(avg);
  }

  private extractReadinessState(
    summary: Awaited<ReturnType<CoreReadinessService['summary']>>,
  ): string {
    const dims = summary.dimensions ?? [];
    if (
      dims.some((d) => d.state === 'NON_COMPLIANT' || d.state === 'AT_RISK')
    ) {
      return 'at_risk';
    }
    return 'ok';
  }
}

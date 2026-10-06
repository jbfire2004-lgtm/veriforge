import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import { EventBusService } from '../api-platform/events/event-bus.service';
import type { ProviderIntegrationHubSummary } from './provider-integration-hub.types';

@Injectable()
export class ProviderIntegrationHubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBusService,
  ) {}

  async getSummary(companyId: number): Promise<ProviderIntegrationHubSummary> {
    const since90 = new Date();
    since90.setDate(since90.getDate() - 90);
    const since24h = new Date();
    since24h.setHours(since24h.getHours() - 24);

    const [
      providers,
      ingestionRuns,
      validationFailures,
      pendingVerification,
      providerRecords,
      unionHallReceipts90d,
      providerPortalRecords90d,
      unionHallReceipts24h,
    ] = await Promise.all([
      this.prisma.trainingProvider.findMany({
        where: { active: true },
        include: {
          complianceStatuses: { orderBy: { assessedAt: 'desc' }, take: 1 },
          _count: {
            select: {
              trainingRecords: {
                where: { companyId, issuedAt: { gte: since90 } },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
        take: 100,
      }),
      this.prisma.trainingIngestionRun.findMany({
        where: { companyId, createdAt: { gte: since90 } },
        orderBy: { createdAt: 'desc' },
        take: 25,
        include: { _count: { select: { createdRecords: true } } },
      }),
      this.prisma.trainingValidationResult.findMany({
        where: {
          outcome: { in: ['REJECTED', 'NEEDS_REVIEW'] },
          validatedAt: { gte: since90 },
          trainingRecord: { companyId },
        },
        orderBy: { validatedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          outcome: true,
          subjectType: true,
          trainingProviderId: true,
          trainingRecordId: true,
          missingStandardCodes: true,
          validatedAt: true,
        },
      }),
      this.prisma.trainingRecord.count({
        where: {
          companyId,
          completedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      }),
      this.prisma.trainingRecord.groupBy({
        by: ['trainingProviderId'],
        where: {
          companyId,
          trainingProviderId: { not: null },
          issuedAt: { gte: since90 },
        },
        _count: { id: true },
        _max: { issuedAt: true },
      }),
      this.prisma.unionHallTrainingReceipt.count({
        where: {
          createdAt: { gte: since90 },
          trainingRecord: { companyId },
        },
      }),
      this.prisma.trainingRecord.count({
        where: {
          companyId,
          trainingProviderId: { not: null },
          ingestionRunId: null,
          issuedAt: { gte: since90 },
        },
      }),
      this.prisma.unionHallTrainingReceipt.count({
        where: {
          createdAt: { gte: since24h },
          trainingRecord: { companyId },
        },
      }),
    ]);

    const lastProviderRecord = new Map(
      providerRecords.map((r) => [r.trainingProviderId, r._max.issuedAt]),
    );
    const providerRecordCounts = new Map(
      providerRecords.map((r) => [r.trainingProviderId, r._count.id]),
    );

    const ingestionCompleted = ingestionRuns.filter(
      (r) => r.status === 'COMPLETED',
    ).length;
    const ingestionFailed = ingestionRuns.filter(
      (r) => r.status === 'FAILED',
    ).length;
    const ingestionTotal = ingestionRuns.length || 1;

    const portalUploads = Math.max(
      ingestionRuns.filter((r) => r.sourceChannel === 'provider_portal').length,
      providerPortalRecords90d,
    );
    const csvUploads = ingestionRuns.filter(
      (r) => r.sourceChannel === 'csv',
    ).length;
    const fileUploads = ingestionRuns.filter(
      (r) => r.sourceChannel === 'upload' || r.sourceChannel === 'ocr',
    ).length;

    const channels = [
      this.channelHealth(
        'provider_portal',
        'Provider portal API',
        portalUploads,
        ingestionRuns,
        since24h,
      ),
      this.channelHealth(
        'training_ingestion',
        'Bulk file ingestion',
        fileUploads,
        ingestionRuns,
        since24h,
      ),
      this.channelHealth(
        'csv_import',
        'CSV / email ingest',
        csvUploads,
        ingestionRuns,
        since24h,
      ),
      this.unionHallChannelHealth(
        unionHallReceipts90d,
        unionHallReceipts24h,
        since24h,
      ),
    ];

    const summary: ProviderIntegrationHubSummary = {
      generatedAt: new Date().toISOString(),
      companyId,
      channels,
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        approvalStatus: p.approvalStatus,
        active: p.active,
        recordCount90d:
          providerRecordCounts.get(p.id) ?? p._count.trainingRecords,
        lastRecordAt:
          (lastProviderRecord.get(p.id) ?? null)?.toISOString() ?? null,
        complianceStatus: p.complianceStatuses[0]?.status ?? null,
      })),
      recentIngestion: ingestionRuns.map((r) => ({
        id: r.id,
        status: r.status,
        sourceChannel: r.sourceChannel,
        originalFilename: r.originalFilename,
        createdAt: r.createdAt.toISOString(),
        completedAt: r.completedAt?.toISOString() ?? null,
        recordsCreated: r._count.createdRecords,
        errorMessage: r.errorMessage,
      })),
      recentValidationFailures: validationFailures.map((v) => ({
        id: v.id,
        outcome: v.outcome,
        subjectType: v.subjectType,
        trainingProviderId: v.trainingProviderId,
        trainingRecordId: v.trainingRecordId,
        missingStandardCodes: v.missingStandardCodes,
        validatedAt: v.validatedAt.toISOString(),
      })),
      metrics: {
        providersActive: providers.filter(
          (p) => p.approvalStatus === 'APPROVED',
        ).length,
        providersPendingApproval: providers.filter(
          (p) => p.approvalStatus === 'PENDING',
        ).length,
        ingestionSuccessRate90d: Math.round(
          (ingestionCompleted / ingestionTotal) * 100,
        ),
        recordsFromProviders90d: providerRecords.reduce(
          (n, r) => n + r._count.id,
          0,
        ),
        validationFailures90d: validationFailures.length,
        pendingVerification,
      },
      eventFlow: [
        'provider.upload → training-ingestion.run → training-record.created',
        'training-record.created → verification.validate → wallet.sync',
        'verification.attention → notification.inbox → supervisor review',
        'verification.complete → company-compliance.refresh → readiness.recalculate',
        'verification.complete → credential-nft.project (stub chain)',
      ],
    };

    this.events.emit({
      name: DomainEvent.PROVIDER_HUB_SUMMARY,
      occurredAt: summary.generatedAt,
      companyId,
      entityType: 'provider_hub',
      entityId: companyId,
      data: { metrics: summary.metrics },
    });

    return summary;
  }

  private unionHallChannelHealth(
    activityCount90d: number,
    activityCount24h: number,
    since24h: Date,
  ) {
    let status: 'healthy' | 'degraded' | 'offline' = 'healthy';
    if (activityCount90d === 0) status = 'offline';
    else if (activityCount24h === 0) status = 'degraded';

    return {
      key: 'union_hall',
      label: 'Union hall receipts',
      status,
      lastActivityAt: activityCount24h > 0 ? since24h.toISOString() : null,
      pendingCount: 0,
      failedCount24h: 0,
    };
  }

  private channelHealth(
    key: string,
    label: string,
    activityCount: number,
    runs: Array<{ status: string; createdAt: Date; sourceChannel: string }>,
    since24h: Date,
  ) {
    const channelRuns = runs.filter((r) =>
      key === 'provider_portal'
        ? r.sourceChannel === 'provider_portal'
        : key === 'csv_import'
        ? r.sourceChannel === 'csv'
        : key === 'training_ingestion'
        ? r.sourceChannel === 'upload' || r.sourceChannel === 'ocr'
        : false,
    );
    const failed24h = channelRuns.filter(
      (r) => r.status === 'FAILED' && r.createdAt >= since24h,
    ).length;
    const pending = channelRuns.filter(
      (r) => r.status === 'PENDING' || r.status === 'PROCESSING',
    ).length;
    const last = channelRuns[0]?.createdAt ?? null;

    let status: 'healthy' | 'degraded' | 'offline' = 'healthy';
    if (activityCount === 0 && key !== 'union_hall') status = 'offline';
    else if (failed24h > 2 || pending > 5) status = 'degraded';

    return {
      key,
      label,
      status,
      lastActivityAt: last?.toISOString() ?? null,
      pendingCount: pending,
      failedCount24h: failed24h,
    };
  }
}

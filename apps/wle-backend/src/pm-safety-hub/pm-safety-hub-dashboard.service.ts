import { Injectable } from '@nestjs/common';
import { PmSafetyHubDomain, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmSafetyHubDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async buildSnapshot(filters: { companyId: number; projectId?: number }) {
    const { companyId, projectId } = filters;
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const projectFilter = projectId ? { projectId } : {};
    const capaWhere = {
      companyId,
      deletedAt: null,
      ...projectFilter,
    };

    const [
      inspectionsOpen,
      inspectionsOverdue,
      investigationsOpen,
      investigationsHighSif,
      capaOpen,
      capaOverdue,
      capaCritical,
      contractorDispatches,
      contractorUnackedFindings,
      substancePending,
      substanceNonNegative,
      trainingExpired,
      trainingExpiring,
      equipmentNonCompliant,
      equipmentLockouts,
      evidenceCount,
      latestForecast,
      sclConditionalLoss,
      hecaHighEnergyFlags,
      openCail,
      recentCapa,
      timeline,
    ] = await Promise.all([
      this.prisma.pmInspection.count({
        where: {
          companyId,
          deletedAt: null,
          status: { in: ['submitted', 'review_required'] },
          ...projectFilter,
        },
      }),
      this.prisma.pmInspectionDeficiency.count({
        where: {
          status: { in: ['open', 'assigned', 'in_progress'] },
          dueAt: { lt: now },
          inspection: { companyId, deletedAt: null, ...projectFilter },
        },
      }),
      this.prisma.pmSafetyEvent.count({
        where: {
          companyId,
          deletedAt: null,
          status: { notIn: ['closed'] },
          ...projectFilter,
        },
      }),
      this.prisma.pmSafetyEvent.count({
        where: {
          companyId,
          deletedAt: null,
          OR: [
            { sifEventId: { not: null } },
            { severity: { in: ['high', 'critical'] } },
          ],
          ...projectFilter,
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          ...capaWhere,
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          ...capaWhere,
          status: { notIn: ['verified', 'closed', 'cancelled'] },
          dueAt: { lt: now },
        },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          ...capaWhere,
          severityLevel: { in: ['critical', 'high'] },
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
      }),
      this.prisma.pmInspectionContractorDispatch.count({
        where: {
          status: { in: ['sent', 'acknowledged', 'in_progress', 'overdue'] },
          correctiveAction: { companyId, ...projectFilter },
        },
      }),
      this.prisma.pmInspectionDeficiency.count({
        where: {
          subcontractorCompanyId: { not: null },
          status: { in: ['open', 'in_progress'] },
          contractorAcknowledgments: { none: {} },
          inspection: { companyId, ...projectFilter },
        },
      }),
      this.prisma.pmSubstanceTestEvent.count({
        where: {
          companyId,
          status: { notIn: ['completed', 'cancelled'] },
          ...projectFilter,
        },
      }),
      this.prisma.pmSubstanceTestResult.count({
        where: {
          outcome: { in: ['non_negative', 'refusal', 'tampered'] },
          testEvent: { companyId, ...projectFilter },
        },
      }),
      this.prisma.trainingRecord.count({
        where: {
          companyId,
          expiresAt: { lt: now },
          ...(projectId ? { projectId } : {}),
        },
      }),
      this.prisma.trainingRecord.count({
        where: {
          companyId,
          expiresAt: { gte: now, lte: soon },
          ...(projectId ? { projectId } : {}),
        },
      }),
      this.prisma.companyEquipmentAuditView.count({
        where: {
          companyId,
          OR: [{ preUseCompliant7d: false }, { formalCompliant: false }],
        },
      }),
      this.prisma.equipment.count({
        where: {
          companyId,
          lockedOutAt: { not: null },
        },
      }),
      this.prisma.pmSafetyEvidenceIndex.count({
        where: { companyId, ...(projectId ? { projectId } : {}) },
      }),
      this.prisma.pmPredictiveSafetyForecast.findFirst({
        where: { companyId, ...(projectId ? { projectId } : {}) },
        orderBy: { weekStart: 'desc' },
      }),
      this.prisma.pmSmsRiskContext.count({
        where: {
          companyId,
          sclState: { in: ['conditional', 'loss'] },
          ...projectFilter,
        },
      }),
      this.prisma.pmSmsRiskContext.count({
        where: {
          companyId,
          hecaInvolved: true,
          highEnergyFlag: true,
          ...projectFilter,
        },
      }),
      this.prisma.cailEntry.count({
        where: {
          ownerCompanyId: companyId,
          status: { in: ['open', 'in_progress', 'overdue'] },
          ...(projectId ? { projectId } : {}),
        },
      }),
      this.prisma.pmCorrectiveAction.findMany({
        where: {
          ...capaWhere,
          status: { notIn: ['verified', 'closed', 'cancelled'] },
        },
        select: {
          id: true,
          title: true,
          status: true,
          severityLevel: true,
          dueAt: true,
          sourceModule: true,
        },
        orderBy: [{ priorityScore: 'desc' }, { dueAt: 'asc' }],
        take: 8,
      }),
      this.prisma.pmSafetyHubEventLog.findMany({
        where: { companyId, ...(projectId ? { projectId } : {}) },
        orderBy: { occurredAt: 'desc' },
        take: 25,
      }),
    ]);

    const domains = {
      inspection: {
        open: inspectionsOpen,
        overdueFindings: inspectionsOverdue,
        href: '/pm/inspections',
      },
      investigation: {
        open: investigationsOpen,
        highSif: investigationsHighSif,
        href: '/pm/incidents',
      },
      corrective_action: {
        open: capaOpen,
        overdue: capaOverdue,
        critical: capaCritical,
        href: '/pm/corrective-actions',
      },
      predictive: {
        riskIndex: latestForecast?.riskIndex ?? null,
        riskLevel: latestForecast?.riskLevel ?? null,
        weekStart: latestForecast?.weekStart?.toISOString() ?? null,
        sclConditionalLoss,
        hecaHighEnergyFlags,
        href: '/pm/predictive-safety-analytics',
      },
      sms_core: {
        sclConditionalLoss,
        hecaHighEnergyFlags,
        href: '/pm/sms',
      },
      contractor: {
        openDispatches: contractorDispatches,
        unacknowledgedFindings: contractorUnackedFindings,
        href: '/contractor',
      },
      substance_testing: {
        pending: substancePending,
        nonNegative: substanceNonNegative,
        href: '/pm/substance-testing',
      },
      competency: {
        trainingExpired,
        trainingExpiringSoon: trainingExpiring,
        href: '/pm/worker-safety-profile',
      },
      equipment: {
        nonCompliant: equipmentNonCompliant,
        lockouts: equipmentLockouts,
        href: '/pm/equipment-safety',
      },
    };

    const alertScore =
      capaOverdue * 3 +
      capaCritical * 2 +
      inspectionsOverdue * 2 +
      investigationsHighSif * 2 +
      substanceNonNegative * 3 +
      equipmentLockouts * 2;

    const snapshot = {
      generatedAt: now.toISOString(),
      companyId,
      projectId: projectId ?? null,
      summary: {
        alertScore,
        openCapa: capaOpen,
        openCail,
        evidenceIndexed: evidenceCount,
        domainsNeedingAttention: Object.entries(domains).filter(([, v]) =>
          Object.values(v).some((n) => typeof n === 'number' && n > 0),
        ).length,
      },
      domains,
      capaQueue: recentCapa,
      timeline,
    };

    await this.prisma.pmSafetyHubSnapshot.upsert({
      where: {
        companyId_projectId: {
          companyId,
          projectId: projectId ?? null,
        },
      },
      create: {
        companyId,
        projectId: projectId ?? null,
        snapshotJson: snapshot as Prisma.InputJsonValue,
      },
      update: {
        snapshotJson: snapshot as Prisma.InputJsonValue,
        generatedAt: now,
      },
    });

    return snapshot;
  }

  async getCachedOrBuild(filters: {
    companyId: number;
    projectId?: number;
    maxAgeMinutes?: number;
  }) {
    const cached = await this.prisma.pmSafetyHubSnapshot.findUnique({
      where: {
        companyId_projectId: {
          companyId: filters.companyId,
          projectId: filters.projectId ?? null,
        },
      },
    });

    const maxAge = (filters.maxAgeMinutes ?? 15) * 60 * 1000;
    if (cached && Date.now() - cached.generatedAt.getTime() < maxAge) {
      return cached.snapshotJson as Record<string, unknown>;
    }

    return this.buildSnapshot(filters);
  }

  async logEvent(input: {
    companyId: number;
    projectId?: number;
    eventName: string;
    domain?: PmSafetyHubDomain;
    entityType?: string;
    entityId?: string;
    actorId?: number;
    payload?: Record<string, unknown>;
  }) {
    return this.prisma.pmSafetyHubEventLog.create({
      data: {
        companyId: input.companyId,
        projectId: input.projectId,
        eventName: input.eventName,
        domain: input.domain,
        entityType: input.entityType,
        entityId: input.entityId,
        actorId: input.actorId,
        payloadJson: (input.payload ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async getTimeline(filters: {
    companyId: number;
    projectId?: number;
    take?: number;
  }) {
    return this.prisma.pmSafetyHubEventLog.findMany({
      where: {
        companyId: filters.companyId,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
      },
      orderBy: { occurredAt: 'desc' },
      take: filters.take ?? 50,
    });
  }
}

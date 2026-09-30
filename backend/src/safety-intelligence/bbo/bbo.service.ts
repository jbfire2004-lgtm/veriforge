import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BboBehaviorCategory, ObservationPolarity, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
import type { CreateBboDto } from '../dto/create-bbo.dto';

@Injectable()
export class BboService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: CailEmitterService,
    private readonly scope: CailScopeService,
    private readonly copilotEnrich: CailCopilotEnrichmentService,
  ) {}

  async list(
    actor: CailActor,
    filters: {
      projectId?: number;
      polarity?: string;
      behaviorCategory?: string;
    },
  ) {
    const where: Prisma.BboObservationWhereInput = {};
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.polarity) {
      where.polarity = filters.polarity as ObservationPolarity;
    }
    if (filters.behaviorCategory) {
      where.behaviorCategory = filters.behaviorCategory as BboBehaviorCategory;
    }
    if (!this.scope.isPrime(actor) && actor.companyId) {
      where.OR = [
        { observerCompanyId: actor.companyId },
        { ownerCompanyId: actor.companyId },
      ];
    }
    return this.prisma.bboObservation.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        observedBy: { select: { id: true, username: true } },
        cailEntry: { select: { id: true, status: true } },
      },
      orderBy: { observedAt: 'desc' },
      take: 100,
    });
  }

  async create(dto: CreateBboDto, actor: CailActor) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (dto.polarity === ObservationPolarity.at_risk && !dto.ownerCompanyId) {
      throw new BadRequestException(
        'ownerCompanyId is required for at-risk BBO',
      );
    }

    const bbo = await this.prisma.bboObservation.create({
      data: {
        projectId: dto.projectId,
        observedByUserId: actor.id,
        observerCompanyId: actor.companyId ?? project.companyId,
        polarity: dto.polarity,
        behaviorDescription: dto.behaviorDescription,
        locationNote: dto.locationNote,
        workActivity: dto.workActivity,
        workersObservedCount: dto.workersObservedCount,
        behaviorCategory: dto.behaviorCategory,
        safeBehaviors: dto.safeBehaviors,
        atRiskBehaviors: dto.atRiskBehaviors,
        antecedents: dto.antecedents ?? undefined,
        feedbackGiven: dto.feedbackGiven ?? false,
        feedbackNotes: dto.feedbackNotes,
        workerResponse: dto.workerResponse,
        actionAgreed: dto.actionAgreed,
        actionOwnerUserId: dto.actionOwnerUserId,
        actionDueAt: dto.actionDueAt ? new Date(dto.actionDueAt) : undefined,
        steeringEscalate: dto.steeringEscalate ?? false,
        siteId: dto.siteId,
        equipmentId: dto.equipmentId,
        workerId: dto.workerId,
        ownerCompanyId: dto.ownerCompanyId,
        assignedUserId: dto.assignedUserId,
        severity: dto.severity,
        riskCategory: dto.riskCategory,
        observedAt: dto.observedAt ? new Date(dto.observedAt) : new Date(),
      },
    });

    const enrichPayload = {
      behaviorDescription: dto.behaviorDescription,
      polarity: dto.polarity,
      severity: dto.severity,
      riskCategory: dto.riskCategory,
      locationNote: dto.locationNote,
      projectId: dto.projectId,
      companyId: dto.ownerCompanyId ?? actor.companyId,
      workActivity: dto.workActivity,
      behaviorCategory: dto.behaviorCategory,
      antecedents: dto.antecedents,
      feedbackGiven: dto.feedbackGiven,
      actionAgreed: dto.actionAgreed,
      steeringEscalate: dto.steeringEscalate,
    };

    if (dto.polarity === ObservationPolarity.at_risk && dto.ownerCompanyId) {
      const titleParts = [
        dto.behaviorCategory ? `[${dto.behaviorCategory}]` : null,
        dto.behaviorDescription.slice(0, 450),
      ].filter(Boolean);
      const cail = await this.emitter.emit({
        projectId: dto.projectId,
        ownerCompanyId: dto.ownerCompanyId,
        sourceType: 'bbo',
        sourceId: bbo.id,
        title: titleParts.join(' '),
        description: [
          dto.behaviorDescription,
          dto.atRiskBehaviors
            ? `At-risk behaviours:\n${dto.atRiskBehaviors}`
            : null,
          dto.antecedents?.length
            ? `Antecedents: ${dto.antecedents.join(', ')}`
            : null,
          dto.actionAgreed ? `Action agreed: ${dto.actionAgreed}` : null,
          dto.steeringEscalate ? 'Steering committee escalation requested.' : null,
        ]
          .filter(Boolean)
          .join('\n\n'),
        severity: dto.severity,
        riskCategory: dto.riskCategory,
        assignedUserId: dto.assignedUserId ?? dto.actionOwnerUserId,
        createdByUserId: actor.id,
        siteId: dto.siteId,
        locationNote: dto.locationNote,
        equipmentId: dto.equipmentId,
        workerId: dto.workerId,
      });

      const updated = await this.prisma.bboObservation.update({
        where: { id: bbo.id },
        data: { cailEntryId: cail.id },
        include: {
          cailEntry: { select: { id: true, status: true, title: true } },
        },
      });

      this.copilotEnrich.scheduleBboEnrich(bbo.id, cail.id, enrichPayload);

      return updated;
    }

    this.copilotEnrich.scheduleBboEnrich(bbo.id, undefined, enrichPayload);

    return bbo;
  }

  async getMetrics(projectId: number) {
    const [total, safe, atRisk, categoryGroups] = await Promise.all([
      this.prisma.bboObservation.count({ where: { projectId } }),
      this.prisma.bboObservation.count({
        where: { projectId, polarity: 'safe' },
      }),
      this.prisma.bboObservation.count({
        where: { projectId, polarity: 'at_risk' },
      }),
      this.prisma.bboObservation.groupBy({
        by: ['behaviorCategory'],
        where: {
          projectId,
          polarity: 'at_risk',
          behaviorCategory: { not: null },
        },
        _count: { _all: true },
        orderBy: { _count: { behaviorCategory: 'desc' } },
        take: 7,
      }),
    ]);
    return {
      projectId,
      total,
      safe,
      atRisk,
      positiveRatio: total > 0 ? safe / total : 0,
      atRiskByCategory: categoryGroups.map((g) => ({
        category: g.behaviorCategory,
        count: g._count._all,
      })),
    };
  }
}

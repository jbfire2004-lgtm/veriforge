import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PmInvestigationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RcaEngine } from './rca.engine';
import { PmInvestigationCapaIntegrationService } from './pm-investigation-capa-integration.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';
import { SmsInvestigationIntegrationService } from '../pm-sms-core/sms-investigation-integration.service';

@Injectable()
export class PmSafetyEventsInvestigationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rca: RcaEngine,
    @Optional()
    private readonly capaIntegration?: PmInvestigationCapaIntegrationService,
    @Optional() private readonly ecosystem?: SafetyEcosystemEventsService,
    @Optional()
    private readonly smsInvestigation?: SmsInvestigationIntegrationService,
  ) {}

  async getOrCreate(eventId: string, leadInvestigatorId?: number) {
    const existing = await this.prisma.pmSafetyEventInvestigation.findUnique({
      where: { eventId },
      include: { leadInvestigator: { select: { id: true, username: true } } },
    });
    if (existing) return existing;

    return this.prisma.pmSafetyEventInvestigation.create({
      data: {
        eventId,
        status: 'evidence_gathering',
        currentStep: 0,
        leadInvestigatorId,
        startedAt: new Date(),
      },
      include: { leadInvestigator: { select: { id: true, username: true } } },
    });
  }

  async update(
    eventId: string,
    data: {
      status?: PmInvestigationStatus;
      currentStep?: number;
      narrative?: string;
      immediateActions?: string;
      executiveSummary?: string;
      guidedAnswersJson?: Record<string, unknown>;
      leadInvestigatorId?: number;
    },
  ) {
    await this.getOrCreate(eventId);
    const row = await this.prisma.pmSafetyEventInvestigation.update({
      where: { eventId },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.currentStep !== undefined
          ? { currentStep: data.currentStep }
          : {}),
        ...(data.narrative !== undefined ? { narrative: data.narrative } : {}),
        ...(data.immediateActions !== undefined
          ? { immediateActions: data.immediateActions }
          : {}),
        ...(data.executiveSummary !== undefined
          ? { executiveSummary: data.executiveSummary }
          : {}),
        ...(data.leadInvestigatorId !== undefined
          ? { leadInvestigatorId: data.leadInvestigatorId }
          : {}),
        ...(data.guidedAnswersJson !== undefined
          ? {
              guidedAnswersJson:
                data.guidedAnswersJson as Prisma.InputJsonValue,
            }
          : {}),
      },
      include: { leadInvestigator: { select: { id: true, username: true } } },
    });

    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
      select: { companyId: true, projectId: true },
    });
    if (event) {
      this.ecosystem?.emitInvestigationUpdated({
        eventId,
        companyId: event.companyId,
        projectId: event.projectId,
        status: row.status,
      });
    }

    return row;
  }

  async guidedQuestions(eventId: string) {
    if (this.smsInvestigation) {
      return this.smsInvestigation.guidedQuestionsWithSms(eventId);
    }

    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
    });
    if (!event) throw new NotFoundException('Event not found');

    const investigation = await this.getOrCreate(eventId);
    const questions = this.rca.guidedQuestions(event.eventType);
    const suggestedFactors = this.rca.suggestContributingFactors({
      eventType: event.eventType,
      description: event.description ?? event.title,
      guidedAnswers: investigation.guidedAnswersJson as Record<string, string>,
    });

    return {
      eventType: event.eventType,
      currentStep: investigation.currentStep,
      pathways: this.rca.taprootPathways(),
      questions,
      suggestedContributingFactors: suggestedFactors,
    };
  }

  async saveGuidedAnswers(
    eventId: string,
    answers: Record<string, string>,
    actorId?: number,
  ) {
    const investigation = await this.getOrCreate(eventId, actorId);
    const merged = {
      ...(investigation.guidedAnswersJson as Record<string, string>),
      ...answers,
    };

    const event = await this.prisma.pmSafetyEvent.findUnique({
      where: { id: eventId },
    });
    const suggestedFactors = this.rca.suggestContributingFactors({
      eventType: event!.eventType,
      description: event!.description ?? event!.title,
      guidedAnswers: merged,
    });

    for (const factor of suggestedFactors.slice(0, 5)) {
      const exists =
        await this.prisma.pmSafetyEventContributingFactor.findFirst({
          where: { eventId, label: factor.label },
        });
      if (!exists) {
        await this.prisma.pmSafetyEventContributingFactor.create({
          data: {
            eventId,
            label: factor.label,
            category: factor.pathway,
            notes: `Auto-suggested (${Math.round(
              factor.confidence * 100,
            )}% confidence)`,
          },
        });
      }
    }

    const step = Math.min(
      this.rca.guidedQuestions(event!.eventType).length,
      investigation.currentStep + 1,
    );

    return this.update(eventId, {
      guidedAnswersJson: merged,
      currentStep: step,
      status: step >= 3 ? 'analysis' : 'evidence_gathering',
    });
  }

  async regenerateCausalTree(eventId: string) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
      include: {
        rootCauses: true,
        contributingFactors: true,
      },
    });
    if (!event) throw new NotFoundException('Event not found');

    const tree = this.rca.buildCausalTree({
      eventTitle: event.title,
      rootCauses: event.rootCauses.map((r) => ({
        id: r.id,
        description: r.description,
        category: r.category,
        pathway: (r.taprootJson as { pathway?: string })?.pathway,
      })),
      contributingFactors: event.contributingFactors,
    });

    await this.getOrCreate(eventId);
    return this.prisma.pmSafetyEventInvestigation.update({
      where: { eventId },
      data: {
        causalTreeJson: tree as unknown as Prisma.InputJsonValue,
        status: 'root_cause',
      },
    });
  }

  async getCausalTree(eventId: string) {
    const inv = await this.getOrCreate(eventId);
    if (
      inv.causalTreeJson &&
      typeof inv.causalTreeJson === 'object' &&
      Object.keys(inv.causalTreeJson as object).length > 0
    ) {
      return inv.causalTreeJson;
    }
    const updated = await this.regenerateCausalTree(eventId);
    return updated.causalTreeJson;
  }

  async suggestFactorsAndRca(eventId: string) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
      include: { contributingFactors: true, investigation: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    const lib = await this.prisma.pmRootCauseLibraryEntry.findMany({
      where: { companyId: event.companyId, active: true },
      take: 100,
    });

    const suggestions = this.rca.suggestRootCauses({
      description: event.description ?? event.title,
      eventType: event.eventType,
      contributingFactors: event.contributingFactors.map((f) => f.label),
      guidedAnswers: (event.investigation?.guidedAnswersJson ?? {}) as Record<
        string,
        string
      >,
      library: lib,
    });

    return {
      pathways: this.rca.taprootPathways(),
      rootCauseSuggestions: suggestions,
      contributingFactors: this.rca.suggestContributingFactors({
        eventType: event.eventType,
        description: event.description ?? event.title,
        guidedAnswers: (event.investigation?.guidedAnswersJson ?? {}) as Record<
          string,
          string
        >,
      }),
    };
  }
}

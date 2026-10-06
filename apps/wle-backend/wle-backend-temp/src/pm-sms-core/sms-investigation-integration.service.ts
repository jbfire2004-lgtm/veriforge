import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PmSclState, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RcaEngine } from '../pm-safety-events/rca.engine';
import {
  SmsEnergyWheelService,
  type EnergyWheelEntry,
} from './sms-energy-wheel.service';
import { SmsRiskContextService } from './sms-risk-context.service';
import { SmsNotificationRouterService } from './sms-notification-router.service';

@Injectable()
export class SmsInvestigationIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rca: RcaEngine,
    private readonly energyWheel: SmsEnergyWheelService,
    private readonly riskContext: SmsRiskContextService,
    @Optional() private readonly notify?: SmsNotificationRouterService,
  ) {}

  async classifyScl(
    eventId: string,
    input: {
      sclState: PmSclState;
      triggers?: string[];
      precursors?: string[];
      potentialSeverity?: string;
      actorId?: number;
    },
  ) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
    });
    if (!event) throw new NotFoundException('Event not found');

    const mandatoryInvestigation =
      input.sclState === 'loss' ||
      input.sclState === 'conditional' ||
      event.severity === 'critical' ||
      event.severity === 'high';

    const updated = await this.prisma.pmSafetyEvent.update({
      where: { id: eventId },
      data: {
        sclState: input.sclState,
        sclTriggersJson: input.triggers ?? [],
        sclPrecursorsJson: input.precursors ?? [],
        sclPotentialSeverity: input.potentialSeverity as never,
        mandatoryInvestigation,
      },
    });

    const investigation =
      await this.prisma.pmSafetyEventInvestigation.findUnique({
        where: { eventId },
      });
    if (investigation) {
      await this.prisma.pmSafetyEventInvestigation.update({
        where: { eventId },
        data: {
          sclClassificationJson: {
            state: input.sclState,
            triggers: input.triggers,
            precursors: input.precursors,
            potentialSeverity: input.potentialSeverity,
            classifiedAt: new Date().toISOString(),
            classifiedBy: input.actorId,
          } as Prisma.InputJsonValue,
        },
      });
    }

    await this.riskContext.upsert({
      companyId: event.companyId,
      projectId: event.projectId,
      entityType: 'safety_event',
      entityId: eventId,
      sclState: input.sclState,
      sclTriggers: input.triggers,
      sclPrecursors: input.precursors,
      sclPotentialSeverity: input.potentialSeverity,
      requiresInvestigation: mandatoryInvestigation,
    });

    if (mandatoryInvestigation && this.notify) {
      await this.notify.dispatch({
        companyId: event.companyId,
        projectId: event.projectId,
        eventKey: 'investigation.mandatory',
        title: `Investigation required: ${event.title}`,
        body: `SCL classification (${input.sclState}) requires formal investigation.`,
        entityType: 'safety_event',
        entityId: eventId,
      });
    }

    return updated;
  }

  async saveEnergyWheel(eventId: string, entries: EnergyWheelEntry[]) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
    });
    if (!event) throw new NotFoundException('Event not found');

    const profile = this.energyWheel.buildProfile(entries);

    await this.prisma.pmSafetyEvent.update({
      where: { id: eventId },
      data: {
        energyProfileJson: profile as unknown as Prisma.InputJsonValue,
      },
    });

    const investigation =
      await this.prisma.pmSafetyEventInvestigation.findUnique({
        where: { eventId },
      });
    if (investigation) {
      await this.prisma.pmSafetyEventInvestigation.update({
        where: { eventId },
        data: { energyWheelJson: profile as unknown as Prisma.InputJsonValue },
      });
    }

    await this.riskContext.upsert({
      companyId: event.companyId,
      projectId: event.projectId,
      entityType: 'safety_event',
      entityId: eventId,
      energyTypes: entries.map((e) => e.energyType),
      energyControlState: entries.find((e) => e.controlState === 'uncontrolled')
        ? 'uncontrolled'
        : entries.find((e) => e.controlState === 'partially_controlled')
        ? 'partially_controlled'
        : 'controlled',
      highEnergyFlag: profile.highEnergy,
      missingControls: profile.systemicGaps,
    });

    return profile;
  }

  async saveHecaVerification(
    eventId: string,
    input: {
      hecaInvolved: boolean;
      hecaCategoryCode?: string;
      verificationAnswers: Record<string, string | boolean>;
      signOffUserId?: number;
    },
  ) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
    });
    if (!event) throw new NotFoundException('Event not found');

    const investigation = await this.prisma.pmSafetyEventInvestigation.upsert({
      where: { eventId },
      create: { eventId, status: 'evidence_gathering' },
      update: {},
    });

    await this.prisma.pmSafetyEventInvestigation.update({
      where: { eventId },
      data: {
        hecaVerificationJson: {
          ...input,
          verifiedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });

    if (input.hecaCategoryCode) {
      await this.prisma.pmSafetyEvent.update({
        where: { id: eventId },
        data: { hecaCategoryCode: input.hecaCategoryCode },
      });
    }

    await this.riskContext.upsert({
      companyId: event.companyId,
      projectId: event.projectId,
      entityType: 'investigation',
      entityId: investigation.id,
      hecaInvolved: input.hecaInvolved,
      hecaCategoryCode: input.hecaCategoryCode,
    });

    return investigation;
  }

  guidedQuestionsWithSms(eventId: string) {
    return this.prisma.pmSafetyEvent
      .findFirst({
        where: { id: eventId, deletedAt: null },
      })
      .then(async (event) => {
        if (!event) throw new NotFoundException('Event not found');
        const base = this.rca.guidedQuestions(event.eventType);
        const extra = [];
        if (event.sclState === 'conditional' || event.sclState === 'loss') {
          extra.push({
            id: 'scl_barrier_failure',
            prompt: 'Which barrier failed between conditional and loss state?',
            pathway: 'management_systems' as const,
            required: true,
          });
        }
        if (event.hecaCategoryCode) {
          extra.push({
            id: 'heca_control_verification',
            prompt: 'Were all HECA-required controls verified before the task?',
            pathway: 'procedures' as const,
            required: true,
          });
        }
        const energyProfile = event.energyProfileJson as {
          entries?: EnergyWheelEntry[];
        };
        if (energyProfile?.entries?.length) {
          extra.push({
            id: 'energy_control_gap',
            prompt: 'Which energy controls were missing or failed?',
            pathway: 'equipment_failure' as const,
          });
        }
        return {
          eventType: event.eventType,
          sclState: event.sclState,
          hecaCategoryCode: event.hecaCategoryCode,
          pathways: this.rca.taprootPathways(),
          questions: [...base, ...extra],
          energyCatalog: this.energyWheel.catalog(),
        };
      });
  }
}

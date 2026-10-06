import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';

export type SmsNotifyPayload = {
  companyId: number;
  projectId?: number;
  eventKey: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  userIds?: number[];
  hecaEscalation?: boolean;
  metadata?: Record<string, unknown>;
};

const DEFAULT_ROUTES: Array<{
  eventKey: string;
  templateKey: string;
  roles: string[];
  channels: string[];
}> = [
  {
    eventKey: 'capa.overdue',
    templateKey: 'sms_capa_overdue',
    roles: ['SUPERVISOR', 'PROJECT_MANAGER'],
    channels: ['in_app', 'email'],
  },
  {
    eventKey: 'inspection.finding.critical',
    templateKey: 'sms_inspection_critical',
    roles: ['SUPERVISOR', 'SAFETY'],
    channels: ['in_app', 'email', 'push'],
  },
  {
    eventKey: 'contractor.dispatch.sent',
    templateKey: 'sms_contractor_dispatch',
    roles: ['CONTRACTOR_ADMIN'],
    channels: ['in_app', 'email'],
  },
  {
    eventKey: 'investigation.mandatory',
    templateKey: 'sms_investigation_required',
    roles: ['SUPERVISOR', 'PROJECT_MANAGER', 'ADMIN'],
    channels: ['in_app', 'email'],
  },
  {
    eventKey: 'substance.non_negative',
    templateKey: 'sms_substance_non_negative',
    roles: ['ADMIN', 'COMPANY_ADMIN'],
    channels: ['in_app', 'email'],
  },
  {
    eventKey: 'predictive.high_risk',
    templateKey: 'sms_predictive_alert',
    roles: ['SUPERVISOR', 'PROJECT_MANAGER'],
    channels: ['in_app', 'email'],
  },
  {
    eventKey: 'heca.high_energy.escalation',
    templateKey: 'sms_heca_escalation',
    roles: ['SUPERVISOR', 'PROJECT_MANAGER', 'ADMIN'],
    channels: ['in_app', 'email', 'push'],
  },
];

@Injectable()
export class SmsNotificationRouterService {
  private readonly logger = new Logger(SmsNotificationRouterService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notifications?: NotificationsService,
    @Optional() private readonly ecosystem?: SafetyEcosystemEventsService,
  ) {}

  async listRoutes(companyId: number) {
    return this.prisma.pmSmsNotificationRoute.findMany({
      where: { companyId, active: true },
      orderBy: { eventKey: 'asc' },
    });
  }

  async ensureDefaultRoutes(companyId: number) {
    for (const route of DEFAULT_ROUTES) {
      await this.prisma.pmSmsNotificationRoute.upsert({
        where: { companyId_eventKey: { companyId, eventKey: route.eventKey } },
        create: {
          companyId,
          eventKey: route.eventKey,
          templateKey: route.templateKey,
          rolesJson: route.roles,
          channelsJson: route.channels,
        },
        update: {},
      });
    }
    return this.listRoutes(companyId);
  }

  async dispatch(payload: SmsNotifyPayload) {
    const route = await this.prisma.pmSmsNotificationRoute.findUnique({
      where: {
        companyId_eventKey: {
          companyId: payload.companyId,
          eventKey: payload.eventKey,
        },
      },
    });

    const channels = (route?.channelsJson as string[]) ?? ['in_app'];
    const roles = (route?.rolesJson as string[]) ?? [];

    if (payload.hecaEscalation && route?.escalateOnHecaHighEnergy) {
      await this.dispatch({
        ...payload,
        eventKey: 'heca.high_energy.escalation',
        title: `[HECA Escalation] ${payload.title}`,
      });
    }

    if (payload.userIds?.length && this.notifications) {
      try {
        await this.notifications.notifyUsers({
          userIds: payload.userIds,
          companyId: payload.companyId,
          type: payload.eventKey,
          title: payload.title,
          body: payload.body,
          channels: channels as never[],
          payload: {
            ...payload.metadata,
            entityType: payload.entityType,
            entityId: payload.entityId,
            templateKey: route?.templateKey,
            roles,
          },
        });
      } catch (err) {
        this.logger.warn(`Notification dispatch failed: ${err}`);
      }
    }

    this.ecosystem?.invalidateHub(payload.companyId, payload.projectId, {
      notification: payload.eventKey,
    });

    return { channels, roles, templateKey: route?.templateKey };
  }
}

import {
  EmergencyStatus,
  EmergencyType,
  EmergencySeverity,
  NotificationStatus,
} from '@prisma/client';
import { integrationClients } from '../clients/integration.clients';
import {
  missingWorkerEngine,
  notificationEngine,
  mapLockoutMode,
  defaultAttendanceStatus,
} from '../engines/emergency.engine';
import { emergencyRepository } from '../models/emergency.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type { EmergencyStatusSummary } from '../types';
import { logger } from '../utils/logger';

async function requireActiveEvent(id: string, companyId: string) {
  const event = await emergencyRepository.findEvent(id, companyId);
  if (!event) throw new NotFoundError('Emergency event not found');
  if (event.status === EmergencyStatus.closed) {
    throw new BadRequestError('Emergency event is closed');
  }
  return event;
}

async function dispatchNotifications(
  emergencyId: string,
  message: string,
  recipients: string[],
) {
  for (const recipient of recipients) {
    const status = await integrationClients.sendNotification({
      emergencyId,
      channel: 'webhook',
      recipient,
      message,
    });

    await emergencyRepository.createNotification({
      emergencyId,
      channel: 'webhook',
      recipient,
      message,
      status:
        status === 'sent'
          ? NotificationStatus.sent
          : status === 'failed'
            ? NotificationStatus.failed
            : NotificationStatus.pending,
      sentAt: status === 'sent' ? new Date() : undefined,
    });
  }
}

export const emergencyService = {
  async declare(input: {
    companyId: string;
    projectId?: string;
    type: EmergencyType;
    severity?: EmergencySeverity;
    description?: string;
    triggeredBy: string;
    token: string;
    notifyRecipients?: string[];
    expectedRoster?: string[];
    activateLockout?: boolean;
  }) {
    const event = await emergencyRepository.createEvent({
      companyId: input.companyId,
      projectId: input.projectId,
      type: input.type,
      severity: input.severity ?? EmergencySeverity.high,
      description: input.description,
      triggeredBy: input.triggeredBy,
    });

    let siteLockoutActive = false;
    if (input.activateLockout !== false) {
      siteLockoutActive = await integrationClients.activateSiteLockout({
        companyId: input.companyId,
        projectId: input.projectId,
        mode: mapLockoutMode(input.type),
        token: input.token,
      });
    }

    const message = notificationEngine.buildEmergencyMessage({
      type: event.type,
      severity: event.severity,
      projectId: event.projectId,
      description: event.description,
    });

    const recipients = input.notifyRecipients ?? ['site-supervisor'];
    await dispatchNotifications(event.id, message, recipients);

    logger.info('emergency declared', { emergencyId: event.id, type: input.type });

    return {
      id: event.id,
      companyId: event.companyId,
      projectId: event.projectId,
      type: event.type,
      severity: event.severity,
      status: event.status,
      triggeredAt: event.triggeredAt.toISOString(),
      siteLockoutActive,
    };
  },

  async allClear(id: string, companyId: string, token: string) {
    const event = await requireActiveEvent(id, companyId);

    await emergencyRepository.updateEventStatus(id, companyId, {
      status: EmergencyStatus.all_clear,
      allClearAt: new Date(),
    });

    const siteLockoutCleared = await integrationClients.clearSiteLockout({
      companyId,
      projectId: event.projectId,
      token,
    });

    await dispatchNotifications(id, `ALL CLEAR for emergency ${id}`, ['site-supervisor']);

    return { emergencyId: id, status: 'all_clear', siteLockoutCleared };
  },

  async close(id: string, companyId: string, token: string) {
    const event = await requireActiveEvent(id, companyId);

    const openSession = await emergencyRepository.findOpenMusterSession(id);
    if (openSession) {
      await emergencyRepository.closeMusterSession(openSession.id);
    }

    await emergencyRepository.updateEventStatus(id, companyId, {
      status: EmergencyStatus.closed,
      closedAt: new Date(),
    });

    await integrationClients.clearSiteLockout({
      companyId,
      projectId: event.projectId,
      token,
    });

    return { emergencyId: id, status: 'closed' };
  },

  async startMuster(input: {
    emergencyId: string;
    companyId: string;
    musterPoint: string;
    expectedRoster: string[];
  }) {
    await requireActiveEvent(input.emergencyId, input.companyId);

    const existing = await emergencyRepository.findOpenMusterSession(input.emergencyId);
    if (existing) {
      throw new BadRequestError('Muster session already active');
    }

    const session = await emergencyRepository.createMusterSession({
      emergencyId: input.emergencyId,
      musterPoint: input.musterPoint,
      expectedRoster: input.expectedRoster,
    });

    return {
      sessionId: session.id,
      emergencyId: session.emergencyId,
      musterPoint: session.musterPoint,
      expectedCount: input.expectedRoster.length,
      startedAt: session.startedAt.toISOString(),
    };
  },

  async musterCheckin(input: {
    emergencyId: string;
    companyId: string;
    workerId: string;
    status?: string;
    sessionId?: string;
  }) {
    await requireActiveEvent(input.emergencyId, input.companyId);

    let session = input.sessionId
      ? (await emergencyRepository.findEvent(input.emergencyId, input.companyId))?.musterSessions.find(
          (s) => s.id === input.sessionId,
        )
      : await emergencyRepository.findOpenMusterSession(input.emergencyId);

    if (!session) throw new BadRequestError('No active muster session');

    const attendance = await emergencyRepository.upsertAttendance({
      sessionId: session.id,
      workerId: input.workerId,
      status: defaultAttendanceStatus(input.status),
    });

    return {
      id: attendance.id,
      sessionId: attendance.sessionId,
      workerId: attendance.workerId,
      status: attendance.status,
      checkInTime: attendance.checkInTime.toISOString(),
    };
  },

  async createPlan(input: {
    companyId: string;
    projectId?: string;
    planType: string;
    title: string;
    content?: unknown;
    filePath?: string;
    version?: number;
  }) {
    const plan = await emergencyRepository.createPlan(input);
    return {
      id: plan.id,
      companyId: plan.companyId,
      projectId: plan.projectId,
      planType: plan.planType,
      title: plan.title,
      version: plan.version,
      filePath: plan.filePath,
      createdAt: plan.createdAt.toISOString(),
    };
  },

  async createEquipment(input: {
    companyId: string;
    projectId?: string;
    equipmentType: string;
    location?: string;
    status?: string;
    lastInspected?: string;
  }) {
    const equipment = await emergencyRepository.createEquipment({
      ...input,
      lastInspected: input.lastInspected ? new Date(input.lastInspected) : undefined,
    });

    return {
      id: equipment.id,
      companyId: equipment.companyId,
      projectId: equipment.projectId,
      equipmentType: equipment.equipmentType,
      location: equipment.location,
      status: equipment.status,
      lastInspected: equipment.lastInspected?.toISOString() ?? null,
    };
  },

  async getStatus(id: string, companyId: string, _token: string): Promise<EmergencyStatusSummary> {
    const event = await emergencyRepository.findEvent(id, companyId);
    if (!event) throw new NotFoundError('Emergency event not found');

    const openSession = event.musterSessions.find((s) => s.status === 'open') ?? event.musterSessions[0];
    const expectedRoster = (openSession?.expectedRoster as string[]) ?? [];
    const checkedIn = openSession?.attendance.filter((a) => a.status === 'present' || a.status === 'evacuated') ?? [];
    const checkedInIds = checkedIn.map((a) => a.workerId);

    const { missingWorkers, attendanceRate } = missingWorkerEngine.detect({
      expectedRoster,
      checkedInWorkerIds: checkedInIds,
    });

    const notifications = event.notifications;

    return {
      emergencyId: event.id,
      companyId: event.companyId,
      projectId: event.projectId,
      type: event.type,
      severity: event.severity,
      status: event.status,
      description: event.description,
      triggeredBy: event.triggeredBy,
      triggeredAt: event.triggeredAt.toISOString(),
      allClearAt: event.allClearAt?.toISOString() ?? null,
      closedAt: event.closedAt?.toISOString() ?? null,
      muster: {
        activeSessionId: openSession?.id ?? null,
        checkedIn: checkedIn.length,
        expected: expectedRoster.length,
        missingWorkers,
        attendanceRate,
      },
      notifications: {
        total: notifications.length,
        sent: notifications.filter((n) => n.status === NotificationStatus.sent).length,
        pending: notifications.filter((n) => n.status === NotificationStatus.pending).length,
      },
      siteLockoutActive: event.status === EmergencyStatus.active,
    };
  },
};

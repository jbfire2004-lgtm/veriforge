import {
  EmergencyStatus,
  EmergencyType,
  EmergencySeverity,
  MusterSessionStatus,
  MusterAttendanceStatus,
  NotificationStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? []) as Prisma.InputJsonValue;
}

export const emergencyRepository = {
  createEvent(data: {
    companyId: string;
    projectId?: string;
    type: EmergencyType;
    severity: EmergencySeverity;
    description?: string;
    triggeredBy: string;
  }) {
    return prisma.emergencyEvent.create({ data });
  },

  findEvent(id: string, companyId: string) {
    return prisma.emergencyEvent.findFirst({
      where: { id, companyId },
      include: {
        musterSessions: {
          include: { attendance: true },
          orderBy: { startedAt: 'desc' },
        },
        notifications: true,
      },
    });
  },

  updateEventStatus(
    id: string,
    companyId: string,
    data: Partial<{
      status: EmergencyStatus;
      allClearAt: Date;
      closedAt: Date;
    }>,
  ) {
    return prisma.emergencyEvent.updateMany({ where: { id, companyId }, data });
  },

  createMusterSession(data: {
    emergencyId: string;
    musterPoint: string;
    expectedRoster: string[];
  }) {
    return prisma.musterSession.create({
      data: {
        emergencyId: data.emergencyId,
        musterPoint: data.musterPoint,
        expectedRoster: json(data.expectedRoster),
      },
    });
  },

  findOpenMusterSession(emergencyId: string) {
    return prisma.musterSession.findFirst({
      where: { emergencyId, status: MusterSessionStatus.open },
      include: { attendance: true },
      orderBy: { startedAt: 'desc' },
    });
  },

  closeMusterSession(id: string) {
    return prisma.musterSession.update({
      where: { id },
      data: { status: MusterSessionStatus.closed, endedAt: new Date() },
    });
  },

  upsertAttendance(data: {
    sessionId: string;
    workerId: string;
    status: MusterAttendanceStatus;
    checkInTime?: Date;
  }) {
    return prisma.musterAttendance.upsert({
      where: {
        sessionId_workerId: { sessionId: data.sessionId, workerId: data.workerId },
      },
      create: data,
      update: {
        status: data.status,
        checkInTime: data.checkInTime ?? new Date(),
      },
    });
  },

  createPlan(data: {
    companyId: string;
    projectId?: string;
    planType: string;
    title: string;
    content?: unknown;
    filePath?: string;
    version?: number;
  }) {
    return prisma.emergencyPlan.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        planType: data.planType,
        title: data.title,
        content: json(data.content ?? {}),
        filePath: data.filePath,
        version: data.version ?? 1,
      },
    });
  },

  createEquipment(data: {
    companyId: string;
    projectId?: string;
    equipmentType: string;
    location?: string;
    status?: string;
    lastInspected?: Date;
  }) {
    return prisma.emergencyEquipment.create({ data });
  },

  createNotification(data: {
    emergencyId: string;
    channel: string;
    recipient: string;
    message: string;
    status: NotificationStatus;
    sentAt?: Date;
  }) {
    return prisma.emergencyNotification.create({ data });
  },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyService = void 0;
const client_1 = require("@prisma/client");
const integration_clients_1 = require("../clients/integration.clients");
const emergency_engine_1 = require("../engines/emergency.engine");
const emergency_repository_1 = require("../models/emergency.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
async function requireActiveEvent(id, companyId) {
    const event = await emergency_repository_1.emergencyRepository.findEvent(id, companyId);
    if (!event)
        throw new errors_1.NotFoundError('Emergency event not found');
    if (event.status === client_1.EmergencyStatus.closed) {
        throw new errors_1.BadRequestError('Emergency event is closed');
    }
    return event;
}
async function dispatchNotifications(emergencyId, message, recipients) {
    for (const recipient of recipients) {
        const status = await integration_clients_1.integrationClients.sendNotification({
            emergencyId,
            channel: 'webhook',
            recipient,
            message,
        });
        await emergency_repository_1.emergencyRepository.createNotification({
            emergencyId,
            channel: 'webhook',
            recipient,
            message,
            status: status === 'sent'
                ? client_1.NotificationStatus.sent
                : status === 'failed'
                    ? client_1.NotificationStatus.failed
                    : client_1.NotificationStatus.pending,
            sentAt: status === 'sent' ? new Date() : undefined,
        });
    }
}
exports.emergencyService = {
    async declare(input) {
        const event = await emergency_repository_1.emergencyRepository.createEvent({
            companyId: input.companyId,
            projectId: input.projectId,
            type: input.type,
            severity: input.severity ?? client_1.EmergencySeverity.high,
            description: input.description,
            triggeredBy: input.triggeredBy,
        });
        let siteLockoutActive = false;
        if (input.activateLockout !== false) {
            siteLockoutActive = await integration_clients_1.integrationClients.activateSiteLockout({
                companyId: input.companyId,
                projectId: input.projectId,
                mode: (0, emergency_engine_1.mapLockoutMode)(input.type),
                token: input.token,
            });
        }
        const message = emergency_engine_1.notificationEngine.buildEmergencyMessage({
            type: event.type,
            severity: event.severity,
            projectId: event.projectId,
            description: event.description,
        });
        const recipients = input.notifyRecipients ?? ['site-supervisor'];
        await dispatchNotifications(event.id, message, recipients);
        logger_1.logger.info('emergency declared', { emergencyId: event.id, type: input.type });
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
    async allClear(id, companyId, token) {
        const event = await requireActiveEvent(id, companyId);
        await emergency_repository_1.emergencyRepository.updateEventStatus(id, companyId, {
            status: client_1.EmergencyStatus.all_clear,
            allClearAt: new Date(),
        });
        const siteLockoutCleared = await integration_clients_1.integrationClients.clearSiteLockout({
            companyId,
            projectId: event.projectId,
            token,
        });
        await dispatchNotifications(id, `ALL CLEAR for emergency ${id}`, ['site-supervisor']);
        return { emergencyId: id, status: 'all_clear', siteLockoutCleared };
    },
    async close(id, companyId, token) {
        const event = await requireActiveEvent(id, companyId);
        const openSession = await emergency_repository_1.emergencyRepository.findOpenMusterSession(id);
        if (openSession) {
            await emergency_repository_1.emergencyRepository.closeMusterSession(openSession.id);
        }
        await emergency_repository_1.emergencyRepository.updateEventStatus(id, companyId, {
            status: client_1.EmergencyStatus.closed,
            closedAt: new Date(),
        });
        await integration_clients_1.integrationClients.clearSiteLockout({
            companyId,
            projectId: event.projectId,
            token,
        });
        return { emergencyId: id, status: 'closed' };
    },
    async startMuster(input) {
        await requireActiveEvent(input.emergencyId, input.companyId);
        const existing = await emergency_repository_1.emergencyRepository.findOpenMusterSession(input.emergencyId);
        if (existing) {
            throw new errors_1.BadRequestError('Muster session already active');
        }
        const session = await emergency_repository_1.emergencyRepository.createMusterSession({
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
    async musterCheckin(input) {
        await requireActiveEvent(input.emergencyId, input.companyId);
        let session = input.sessionId
            ? (await emergency_repository_1.emergencyRepository.findEvent(input.emergencyId, input.companyId))?.musterSessions.find((s) => s.id === input.sessionId)
            : await emergency_repository_1.emergencyRepository.findOpenMusterSession(input.emergencyId);
        if (!session)
            throw new errors_1.BadRequestError('No active muster session');
        const attendance = await emergency_repository_1.emergencyRepository.upsertAttendance({
            sessionId: session.id,
            workerId: input.workerId,
            status: (0, emergency_engine_1.defaultAttendanceStatus)(input.status),
        });
        return {
            id: attendance.id,
            sessionId: attendance.sessionId,
            workerId: attendance.workerId,
            status: attendance.status,
            checkInTime: attendance.checkInTime.toISOString(),
        };
    },
    async createPlan(input) {
        const plan = await emergency_repository_1.emergencyRepository.createPlan(input);
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
    async createEquipment(input) {
        const equipment = await emergency_repository_1.emergencyRepository.createEquipment({
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
    async getStatus(id, companyId, _token) {
        const event = await emergency_repository_1.emergencyRepository.findEvent(id, companyId);
        if (!event)
            throw new errors_1.NotFoundError('Emergency event not found');
        const openSession = event.musterSessions.find((s) => s.status === 'open') ?? event.musterSessions[0];
        const expectedRoster = openSession?.expectedRoster ?? [];
        const checkedIn = openSession?.attendance.filter((a) => a.status === 'present' || a.status === 'evacuated') ?? [];
        const checkedInIds = checkedIn.map((a) => a.workerId);
        const { missingWorkers, attendanceRate } = emergency_engine_1.missingWorkerEngine.detect({
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
                sent: notifications.filter((n) => n.status === client_1.NotificationStatus.sent).length,
                pending: notifications.filter((n) => n.status === client_1.NotificationStatus.pending).length,
            },
            siteLockoutActive: event.status === client_1.EmergencyStatus.active,
        };
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctiveActionService = void 0;
const client_1 = require("@prisma/client");
const capa_repository_1 = require("../models/capa.repository");
const priority_engine_1 = require("../engines/priority.engine");
const escalation_engine_1 = require("../engines/escalation.engine");
const verification_engine_1 = require("../engines/verification.engine");
const status_transition_engine_1 = require("../engines/status-transition.engine");
const attachment_engine_1 = require("../engines/attachment.engine");
const offline_sync_engine_1 = require("../engines/offline-sync.engine");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function toCapaDto(capa) {
    return {
        id: capa.id,
        companyId: capa.companyId,
        projectId: capa.projectId,
        sourceType: capa.sourceType,
        sourceId: capa.sourceId,
        actionType: capa.actionType,
        title: capa.title,
        description: capa.description,
        severity: capa.severity,
        priority: capa.priority,
        hazardId: capa.hazardId,
        controlId: capa.controlId,
        equipmentId: capa.equipmentId,
        workerId: capa.workerId,
        dueDate: capa.dueDate?.toISOString() ?? null,
        status: capa.status,
        escalationLevel: capa.escalationLevel,
        createdBy: capa.createdBy,
        assignments: capa.assignments.map((a) => ({
            id: a.id,
            assigneeId: a.assigneeId,
            assignedBy: a.assignedBy,
            assignedAt: a.assignedAt.toISOString(),
        })),
        escalations: capa.escalations.map((e) => ({
            id: e.id,
            level: e.level,
            reason: e.reason,
            triggeredAt: e.triggeredAt.toISOString(),
        })),
        verifications: capa.verifications.map((v) => ({
            id: v.id,
            verifiedBy: v.verifiedBy,
            verifiedAt: v.verifiedAt.toISOString(),
            notes: v.notes,
            outcome: v.outcome,
        })),
        attachments: capa.attachments.map((a) => ({
            id: a.id,
            fileName: a.fileName,
            mimeType: a.mimeType,
            storageKey: a.storageKey,
            phase: a.phase,
            createdAt: a.createdAt.toISOString(),
        })),
        moduleLinks: capa.moduleLinks.map((l) => ({
            id: l.id,
            moduleType: l.moduleType,
            linkedId: l.linkedId,
            metadata: l.metadata,
        })),
        allowedTransitions: status_transition_engine_1.statusTransitionEngine.allowedNext(capa.status),
        createdAt: capa.createdAt.toISOString(),
        updatedAt: capa.updatedAt.toISOString(),
    };
}
async function transitionStatus(id, companyId, to) {
    const capa = await capa_repository_1.capaRepository.findById(id, companyId);
    if (!capa)
        throw new errors_1.NotFoundError('Corrective action not found');
    try {
        status_transition_engine_1.statusTransitionEngine.assertTransition(capa.status, to);
    }
    catch {
        throw new errors_1.BadRequestError(`Cannot transition from ${capa.status} to ${to}`);
    }
    await capa_repository_1.capaRepository.update(id, companyId, { status: to });
}
exports.correctiveActionService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async create(input) {
        const priority = priority_engine_1.priorityEngine.compute({
            severity: input.severity,
            actionType: input.actionType,
            sifLinked: input.sifLinked,
            hecaLinked: input.hecaLinked,
            equipmentUnsafe: !!input.equipmentId,
        });
        const capa = await capa_repository_1.capaRepository.create({
            companyId: input.companyId,
            projectId: input.projectId,
            sourceType: input.sourceType,
            sourceId: input.sourceId,
            actionType: input.actionType,
            title: input.title,
            description: input.description,
            severity: priority.severity,
            priority: priority.priority,
            hazardId: input.hazardId,
            controlId: input.controlId,
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            dueDate: input.dueDate ? new Date(input.dueDate) : priority.dueDate,
            status: input.publish === false ? client_1.CorrectiveActionStatus.draft : client_1.CorrectiveActionStatus.open,
            createdBy: input.createdBy,
        });
        if (input.hazardId) {
            await capa_repository_1.capaRepository.addModuleLink({
                correctiveActionId: capa.id,
                moduleType: 'hazard',
                linkedId: input.hazardId,
            }).catch(() => undefined);
        }
        if (input.controlId) {
            await capa_repository_1.capaRepository.addModuleLink({
                correctiveActionId: capa.id,
                moduleType: 'control',
                linkedId: input.controlId,
            }).catch(() => undefined);
        }
        for (const link of input.moduleLinks ?? []) {
            try {
                await capa_repository_1.capaRepository.addModuleLink({
                    correctiveActionId: capa.id,
                    moduleType: link.moduleType,
                    linkedId: link.linkedId,
                    metadata: (link.metadata ?? {}),
                });
            }
            catch (e) {
                if (e && typeof e === 'object' && 'code' in e && e.code !== 'P2002')
                    throw e;
            }
        }
        for (const attachment of input.attachments ?? []) {
            await this.addAttachment({
                correctiveActionId: capa.id,
                companyId: input.companyId,
                attachment,
            });
        }
        logger_1.logger.info('corrective action created', {
            correctiveActionId: capa.id,
            sourceType: input.sourceType,
            priority: priority.priority,
        });
        const reloaded = await capa_repository_1.capaRepository.reload(capa.id, input.companyId);
        return toCapaDto(reloaded);
    },
    async assign(input) {
        const capa = await capa_repository_1.capaRepository.findById(input.correctiveActionId, input.companyId);
        if (!capa)
            throw new errors_1.NotFoundError('Corrective action not found');
        if (['closed', 'verified', 'cancelled'].includes(capa.status)) {
            throw new errors_1.ConflictError(`Cannot assign CAPA in status: ${capa.status}`);
        }
        await capa_repository_1.capaRepository.addAssignment({
            correctiveActionId: input.correctiveActionId,
            assigneeId: input.assigneeId,
            assignedBy: input.assignedBy,
        });
        if (capa.status === client_1.CorrectiveActionStatus.open || capa.status === client_1.CorrectiveActionStatus.draft) {
            await transitionStatus(input.correctiveActionId, input.companyId, client_1.CorrectiveActionStatus.assigned);
        }
        logger_1.logger.info('corrective action assigned', {
            correctiveActionId: input.correctiveActionId,
            assigneeId: input.assigneeId,
        });
        const reloaded = await capa_repository_1.capaRepository.reload(input.correctiveActionId, input.companyId);
        return toCapaDto(reloaded);
    },
    async escalate(input) {
        const capa = await capa_repository_1.capaRepository.findById(input.correctiveActionId, input.companyId);
        if (!capa)
            throw new errors_1.NotFoundError('Corrective action not found');
        const trigger = input.level != null
            ? { level: input.level, reason: input.reason ?? 'Manual escalation', shouldNotify: true }
            : escalation_engine_1.escalationEngine.evaluate({
                dueDate: capa.dueDate,
                severity: capa.severity,
                sifLinked: capa.sourceType === 'sif_heca',
                hecaLinked: capa.sourceType === 'sif_heca',
                equipmentUnsafe: !!capa.equipmentId,
                currentLevel: capa.escalationLevel,
                status: capa.status,
            });
        if (!trigger) {
            throw new errors_1.BadRequestError('No escalation warranted for this corrective action');
        }
        if (trigger.level <= capa.escalationLevel) {
            throw new errors_1.ConflictError(`Already escalated to level ${capa.escalationLevel}`);
        }
        await capa_repository_1.capaRepository.addEscalation({
            correctiveActionId: input.correctiveActionId,
            level: trigger.level,
            reason: input.reason ?? trigger.reason,
        });
        await capa_repository_1.capaRepository.update(input.correctiveActionId, input.companyId, {
            escalationLevel: trigger.level,
            priority: trigger.level >= 4 ? 'critical' : capa.priority,
        });
        logger_1.logger.info('corrective action escalated', {
            correctiveActionId: input.correctiveActionId,
            level: trigger.level,
        });
        const reloaded = await capa_repository_1.capaRepository.reload(input.correctiveActionId, input.companyId);
        return { ...toCapaDto(reloaded), escalation: trigger };
    },
    async verify(input) {
        verification_engine_1.verificationEngine.assertRole(input.verifierRoles);
        const capa = await capa_repository_1.capaRepository.findById(input.correctiveActionId, input.companyId);
        if (!capa)
            throw new errors_1.NotFoundError('Corrective action not found');
        const outcome = input.outcome ?? 'approved';
        if (['closed', 'verified', 'cancelled'].includes(capa.status)) {
            throw new errors_1.ConflictError(`Cannot verify CAPA in status: ${capa.status}`);
        }
        if (capa.status === client_1.CorrectiveActionStatus.assigned) {
            await transitionStatus(input.correctiveActionId, input.companyId, client_1.CorrectiveActionStatus.in_progress);
        }
        await capa_repository_1.capaRepository.addVerification({
            correctiveActionId: input.correctiveActionId,
            verifiedBy: input.verifiedBy,
            notes: input.notes,
            outcome,
        });
        const nextStatus = verification_engine_1.verificationEngine.outcomeToStatus(outcome);
        await capa_repository_1.capaRepository.update(input.correctiveActionId, input.companyId, {
            status: nextStatus,
        });
        logger_1.logger.info('corrective action verified', {
            correctiveActionId: input.correctiveActionId,
            outcome,
        });
        const reloaded = await capa_repository_1.capaRepository.reload(input.correctiveActionId, input.companyId);
        return toCapaDto(reloaded);
    },
    async addAttachment(input) {
        const capa = await capa_repository_1.capaRepository.findById(input.correctiveActionId, input.companyId);
        if (!capa)
            throw new errors_1.NotFoundError('Corrective action not found');
        const registered = await attachment_engine_1.attachmentEngine.registerEvidence({
            correctiveActionId: input.correctiveActionId,
            companyId: input.companyId,
            attachment: input.attachment,
        });
        await capa_repository_1.capaRepository.addAttachment({
            correctiveActionId: input.correctiveActionId,
            fileName: input.attachment.fileName,
            mimeType: input.attachment.mimeType,
            storageKey: registered.storageKey ?? input.attachment.storageKey,
            dataUrl: input.attachment.dataUrl,
            phase: input.attachment.phase ?? 'evidence',
        });
        if (capa.status === client_1.CorrectiveActionStatus.assigned ||
            capa.status === client_1.CorrectiveActionStatus.open) {
            await capa_repository_1.capaRepository.update(input.correctiveActionId, input.companyId, {
                status: client_1.CorrectiveActionStatus.in_progress,
            });
        }
        const reloaded = await capa_repository_1.capaRepository.reload(input.correctiveActionId, input.companyId);
        return toCapaDto(reloaded);
    },
    async getById(id, companyId) {
        const capa = await capa_repository_1.capaRepository.findById(id, companyId);
        if (!capa)
            throw new errors_1.NotFoundError('Corrective action not found');
        return toCapaDto(capa);
    },
    async syncOffline(input) {
        const results = [];
        let synced = 0;
        let failed = 0;
        for (const action of input.actions) {
            const result = await offline_sync_engine_1.offlineSyncEngine.processAction({
                deviceId: input.deviceId,
                companyId: input.companyId,
                userId: input.userId,
                action,
            });
            results.push(result);
            if (result.ok)
                synced++;
            else
                failed++;
        }
        return {
            deviceId: input.deviceId,
            batchId: input.batchId,
            synced,
            failed,
            results,
            canCompleteSync: failed === 0,
        };
    },
};

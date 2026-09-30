"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permitService = void 0;
const client_1 = require("@prisma/client");
const permit_repository_1 = require("../models/permit.repository");
const safety_gate_engine_1 = require("../engines/safety-gate.engine");
const approval_engine_1 = require("../engines/approval.engine");
const offline_sync_engine_1 = require("../engines/offline-sync.engine");
const publisher_1 = require("../events/publisher");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function toEventPayload(permit) {
    return {
        permitId: permit.id,
        companyId: permit.companyId,
        projectId: permit.projectId,
        permitType: permit.permitType,
        status: permit.status,
        pmTaskId: permit.pmTaskId,
        workerId: permit.workerId,
    };
}
function toPermitDto(permit) {
    return {
        id: permit.id,
        companyId: permit.companyId,
        projectId: permit.projectId,
        workPackageId: permit.workPackageId,
        pmTaskId: permit.pmTaskId,
        permitType: permit.permitType,
        title: permit.title,
        description: permit.description,
        location: permit.location,
        status: permit.status,
        requestedBy: permit.requestedBy,
        workerId: permit.workerId,
        jhaId: permit.jhaId,
        hazardId: permit.hazardId,
        controlId: permit.controlId,
        equipmentId: permit.equipmentId,
        validFrom: permit.validFrom?.toISOString() ?? null,
        validTo: permit.validTo?.toISOString() ?? null,
        approvals: permit.approvals.map((a) => ({
            id: a.id,
            approvedBy: a.approvedBy,
            role: a.role,
            outcome: a.outcome,
            notes: a.notes,
            approvedAt: a.approvedAt.toISOString(),
        })),
        safetyRequirements: permit.safetyRequirements.map((r) => ({
            id: r.id,
            requirementType: r.requirementType,
            linkedId: r.linkedId,
            satisfied: r.satisfied,
            metadata: r.metadata,
            checkedAt: r.checkedAt.toISOString(),
        })),
        allowedTransitions: approval_engine_1.approvalEngine.allowedNext(permit.status),
        createdAt: permit.createdAt.toISOString(),
        updatedAt: permit.updatedAt.toISOString(),
    };
}
async function transitionStatus(id, companyId, to) {
    const permit = await permit_repository_1.permitRepository.findById(id, companyId);
    if (!permit)
        throw new errors_1.NotFoundError('Work permit not found');
    try {
        approval_engine_1.approvalEngine.assertTransition(permit.status, to);
    }
    catch {
        throw new errors_1.BadRequestError(`Cannot transition from ${permit.status} to ${to}`);
    }
    await permit_repository_1.permitRepository.update(id, companyId, { status: to });
}
async function persistSafetyGate(id, gate) {
    for (const check of gate.checks) {
        await permit_repository_1.permitRepository.upsertSafetyRequirement({
            permitId: id,
            requirementType: check.requirementType,
            linkedId: check.linkedId,
            satisfied: check.satisfied,
            metadata: {
                reason: check.reason,
                ...(check.metadata ?? {}),
            },
        });
    }
}
exports.permitService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async create(input) {
        const permit = await permit_repository_1.permitRepository.create({
            companyId: input.companyId,
            projectId: input.projectId,
            workPackageId: input.workPackageId,
            pmTaskId: input.pmTaskId,
            permitType: input.permitType,
            title: input.title,
            description: input.description,
            location: input.location,
            status: client_1.WorkPermitStatus.draft,
            requestedBy: input.requestedBy,
            workerId: input.workerId,
            jhaId: input.jhaId,
            hazardId: input.hazardId,
            controlId: input.controlId,
            equipmentId: input.equipmentId,
            validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
            validTo: input.validTo ? new Date(input.validTo) : undefined,
        });
        logger_1.logger.info('work permit created', {
            permitId: permit.id,
            permitType: input.permitType,
        });
        const reloaded = await permit_repository_1.permitRepository.reload(permit.id, input.companyId);
        return toPermitDto(reloaded);
    },
    async getSafetyGate(input) {
        const permit = await permit_repository_1.permitRepository.findById(input.permitId, input.companyId);
        if (!permit)
            throw new errors_1.NotFoundError('Work permit not found');
        const gate = await safety_gate_engine_1.safetyGateEngine.evaluate({
            companyId: input.companyId,
            token: input.token,
            jhaId: permit.jhaId,
            workerId: permit.workerId,
            hazardId: permit.hazardId,
            controlId: permit.controlId,
            equipmentId: permit.equipmentId,
            pmTaskId: permit.pmTaskId,
            workerRole: input.workerRole,
        });
        await persistSafetyGate(permit.id, gate);
        const reloaded = await permit_repository_1.permitRepository.reload(permit.id, input.companyId);
        return { ...gate, permit: toPermitDto(reloaded) };
    },
    async requestApproval(input) {
        const permit = await permit_repository_1.permitRepository.findById(input.permitId, input.companyId);
        if (!permit)
            throw new errors_1.NotFoundError('Work permit not found');
        try {
            approval_engine_1.approvalEngine.assertCanRequestApproval(permit.status);
        }
        catch (e) {
            throw new errors_1.BadRequestError(e instanceof Error ? e.message : 'Cannot request approval');
        }
        const gate = await safety_gate_engine_1.safetyGateEngine.evaluate({
            companyId: input.companyId,
            token: input.token,
            jhaId: permit.jhaId,
            workerId: permit.workerId,
            hazardId: permit.hazardId,
            controlId: permit.controlId,
            equipmentId: permit.equipmentId,
            pmTaskId: permit.pmTaskId,
        });
        await persistSafetyGate(permit.id, gate);
        await transitionStatus(input.permitId, input.companyId, client_1.WorkPermitStatus.pending_approval);
        const reloaded = await permit_repository_1.permitRepository.reload(input.permitId, input.companyId);
        const payload = toEventPayload(reloaded);
        await publisher_1.eventPublisher.permitRequested(payload);
        logger_1.logger.info('permit approval requested', { permitId: input.permitId });
        return toPermitDto(reloaded);
    },
    async approve(input) {
        const permit = await permit_repository_1.permitRepository.findById(input.permitId, input.companyId);
        if (!permit)
            throw new errors_1.NotFoundError('Work permit not found');
        try {
            approval_engine_1.approvalEngine.assertCanApprove(permit.status);
        }
        catch (e) {
            throw new errors_1.BadRequestError(e instanceof Error ? e.message : 'Cannot approve');
        }
        const outcome = input.outcome ?? 'approved';
        if (outcome === 'approved') {
            const gate = await safety_gate_engine_1.safetyGateEngine.evaluate({
                companyId: input.companyId,
                token: input.token,
                jhaId: permit.jhaId,
                workerId: permit.workerId,
                hazardId: permit.hazardId,
                controlId: permit.controlId,
                equipmentId: permit.equipmentId,
                pmTaskId: permit.pmTaskId,
            });
            await persistSafetyGate(permit.id, gate);
            if (!gate.passed) {
                throw new errors_1.BadRequestError(`Safety gate failed: ${gate.blockReasons.join('; ')}`);
            }
        }
        await permit_repository_1.permitRepository.addApproval({
            permitId: input.permitId,
            approvedBy: input.approvedBy,
            role: input.role,
            outcome,
            notes: input.notes,
        });
        const nextStatus = approval_engine_1.approvalEngine.outcomeToStatus({
            outcome,
            role: input.role,
            notes: input.notes,
        });
        await permit_repository_1.permitRepository.update(input.permitId, input.companyId, {
            status: nextStatus,
        });
        const reloaded = await permit_repository_1.permitRepository.reload(input.permitId, input.companyId);
        if (outcome === 'approved') {
            await publisher_1.eventPublisher.permitApproved(toEventPayload(reloaded));
        }
        logger_1.logger.info('permit approval recorded', { permitId: input.permitId, outcome });
        return toPermitDto(reloaded);
    },
    async activate(input) {
        const permit = await permit_repository_1.permitRepository.findById(input.permitId, input.companyId);
        if (!permit)
            throw new errors_1.NotFoundError('Work permit not found');
        if (approval_engine_1.approvalEngine.isExpired(permit.validTo)) {
            await transitionStatus(input.permitId, input.companyId, client_1.WorkPermitStatus.expired);
            throw new errors_1.ConflictError('Permit validity period has expired');
        }
        try {
            approval_engine_1.approvalEngine.assertCanActivate(permit.status);
        }
        catch (e) {
            throw new errors_1.BadRequestError(e instanceof Error ? e.message : 'Cannot activate');
        }
        const gate = await safety_gate_engine_1.safetyGateEngine.evaluate({
            companyId: input.companyId,
            token: input.token,
            jhaId: permit.jhaId,
            workerId: permit.workerId,
            hazardId: permit.hazardId,
            controlId: permit.controlId,
            equipmentId: permit.equipmentId,
            pmTaskId: permit.pmTaskId,
        });
        if (!gate.passed) {
            throw new errors_1.BadRequestError(`Safety gate failed: ${gate.blockReasons.join('; ')}`);
        }
        await transitionStatus(input.permitId, input.companyId, client_1.WorkPermitStatus.active);
        const reloaded = await permit_repository_1.permitRepository.reload(input.permitId, input.companyId);
        await publisher_1.eventPublisher.permitActive(toEventPayload(reloaded));
        logger_1.logger.info('permit activated', { permitId: input.permitId });
        return toPermitDto(reloaded);
    },
    async suspend(input) {
        const permit = await permit_repository_1.permitRepository.findById(input.permitId, input.companyId);
        if (!permit)
            throw new errors_1.NotFoundError('Work permit not found');
        try {
            approval_engine_1.approvalEngine.assertCanSuspend(permit.status);
        }
        catch (e) {
            throw new errors_1.BadRequestError(e instanceof Error ? e.message : 'Cannot suspend');
        }
        await transitionStatus(input.permitId, input.companyId, client_1.WorkPermitStatus.suspended);
        logger_1.logger.info('permit suspended', { permitId: input.permitId, reason: input.reason });
        const reloaded = await permit_repository_1.permitRepository.reload(input.permitId, input.companyId);
        return toPermitDto(reloaded);
    },
    async close(input) {
        const permit = await permit_repository_1.permitRepository.findById(input.permitId, input.companyId);
        if (!permit)
            throw new errors_1.NotFoundError('Work permit not found');
        try {
            approval_engine_1.approvalEngine.assertCanClose(permit.status);
        }
        catch (e) {
            throw new errors_1.ConflictError(e instanceof Error ? e.message : 'Cannot close');
        }
        await transitionStatus(input.permitId, input.companyId, client_1.WorkPermitStatus.closed);
        logger_1.logger.info('permit closed', { permitId: input.permitId });
        const reloaded = await permit_repository_1.permitRepository.reload(input.permitId, input.companyId);
        return toPermitDto(reloaded);
    },
    async getById(id, companyId) {
        const permit = await permit_repository_1.permitRepository.findById(id, companyId);
        if (!permit)
            throw new errors_1.NotFoundError('Work permit not found');
        return toPermitDto(permit);
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
                token: input.token,
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

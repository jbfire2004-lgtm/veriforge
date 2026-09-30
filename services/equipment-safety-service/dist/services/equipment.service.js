"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentService = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const equipment_engine_1 = require("../engines/equipment.engine");
const equipment_repository_1 = require("../models/equipment.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapEquipment(e) {
    if (!e)
        return null;
    return {
        id: e.id,
        companyId: e.companyId,
        projectId: e.projectId,
        type: e.type,
        model: e.model,
        serialNumber: e.serialNumber,
        status: e.status,
        conditionScore: e.conditionScore,
        lastInspectionDate: e.lastInspectionDate?.toISOString() ?? null,
        nextInspectionDue: e.nextInspectionDue?.toISOString() ?? null,
        createdAt: e.createdAt.toISOString(),
    };
}
async function refreshConditionScore(equipmentId, companyId) {
    const ctx = await equipment_repository_1.equipmentRepository.getScoreContext(equipmentId, companyId);
    if (!ctx)
        return null;
    const { score } = equipment_engine_1.conditionScoringEngine.compute({
        equipment: ctx,
        inspections: ctx.inspections,
        certifications: ctx.certifications,
        activeLockout: ctx.lockouts[0] ?? null,
    });
    await equipment_repository_1.equipmentRepository.updateEquipment(equipmentId, companyId, { conditionScore: score });
    return score;
}
exports.equipmentService = {
    async register(input) {
        const equipment = await equipment_repository_1.equipmentRepository.createEquipment(input);
        logger_1.logger.info('equipment registered', { equipmentId: equipment.id, companyId: input.companyId });
        return mapEquipment(equipment);
    },
    async recordInspection(input) {
        const equipment = await equipment_repository_1.equipmentRepository.findEquipment(input.equipmentId, input.companyId);
        if (!equipment)
            throw new errors_1.NotFoundError('Equipment not found');
        const activeLockout = await equipment_repository_1.equipmentRepository.findActiveLockout(input.equipmentId);
        if (activeLockout) {
            throw new errors_1.BadRequestError('Cannot inspect locked-out equipment');
        }
        const inspection = await equipment_repository_1.equipmentRepository.createInspection({
            equipmentId: input.equipmentId,
            inspectorId: input.inspectorId,
            templateId: input.templateId,
            status: input.status,
            notes: input.notes,
        });
        const inspectedAt = inspection.createdAt;
        const interval = input.intervalDays ?? env_1.env.defaultInspectionIntervalDays;
        const nextDue = equipment_engine_1.inspectionScheduleEngine.computeNextDue(inspectedAt, interval);
        let status = equipment.status;
        if (input.status === client_1.InspectionStatus.fail)
            status = client_1.EquipmentStatus.out_of_service;
        else if (input.status === client_1.InspectionStatus.conditional)
            status = client_1.EquipmentStatus.maintenance;
        else if (equipment.status === client_1.EquipmentStatus.maintenance || equipment.status === client_1.EquipmentStatus.out_of_service) {
            status = client_1.EquipmentStatus.active;
        }
        await equipment_repository_1.equipmentRepository.updateEquipment(input.equipmentId, input.companyId, {
            lastInspectionDate: inspectedAt,
            nextInspectionDue: nextDue,
            status,
        });
        const score = await refreshConditionScore(input.equipmentId, input.companyId);
        return {
            id: inspection.id,
            equipmentId: inspection.equipmentId,
            inspectorId: inspection.inspectorId,
            templateId: inspection.templateId,
            status: inspection.status,
            notes: inspection.notes,
            createdAt: inspection.createdAt.toISOString(),
            nextInspectionDue: nextDue.toISOString(),
            conditionScore: score,
        };
    },
    async addCertification(input) {
        const equipment = await equipment_repository_1.equipmentRepository.findEquipment(input.equipmentId, input.companyId);
        if (!equipment)
            throw new errors_1.NotFoundError('Equipment not found');
        const cert = await equipment_repository_1.equipmentRepository.createCertification({
            equipmentId: input.equipmentId,
            certificationType: input.certificationType,
            issuedBy: input.issuedBy,
            issueDate: new Date(input.issueDate),
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        });
        const score = await refreshConditionScore(input.equipmentId, input.companyId);
        return {
            id: cert.id,
            equipmentId: cert.equipmentId,
            certificationType: cert.certificationType,
            issuedBy: cert.issuedBy,
            issueDate: cert.issueDate.toISOString(),
            expiryDate: cert.expiryDate?.toISOString() ?? null,
            conditionScore: score,
        };
    },
    async authorizeOperator(input) {
        const equipment = await equipment_repository_1.equipmentRepository.findEquipment(input.equipmentId, input.companyId);
        if (!equipment)
            throw new errors_1.NotFoundError('Equipment not found');
        if (equipment.status === client_1.EquipmentStatus.locked_out) {
            throw new errors_1.BadRequestError('Cannot authorize operators for locked-out equipment');
        }
        const auth = await equipment_repository_1.equipmentRepository.upsertAuthorization({
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            authorizedBy: input.authorizedBy,
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        });
        return {
            id: auth.id,
            equipmentId: auth.equipmentId,
            workerId: auth.workerId,
            authorizedBy: auth.authorizedBy,
            status: auth.status,
            expiryDate: auth.expiryDate?.toISOString() ?? null,
            createdAt: auth.createdAt.toISOString(),
        };
    },
    async lockout(input) {
        const equipment = await equipment_repository_1.equipmentRepository.findEquipment(input.equipmentId, input.companyId);
        if (!equipment)
            throw new errors_1.NotFoundError('Equipment not found');
        try {
            equipment_engine_1.lockoutEngine.canLock(equipment);
        }
        catch (e) {
            throw new errors_1.BadRequestError(e instanceof Error ? e.message : 'Cannot lock equipment');
        }
        const existing = await equipment_repository_1.equipmentRepository.findActiveLockout(input.equipmentId);
        if (existing)
            throw new errors_1.ConflictError('Equipment is already locked out');
        const lockout = await equipment_repository_1.equipmentRepository.createLockout({
            equipmentId: input.equipmentId,
            reason: input.reason,
            lockedBy: input.lockedBy,
        });
        await equipment_repository_1.equipmentRepository.updateEquipment(input.equipmentId, input.companyId, {
            status: client_1.EquipmentStatus.locked_out,
        });
        const score = await refreshConditionScore(input.equipmentId, input.companyId);
        return {
            id: lockout.id,
            equipmentId: lockout.equipmentId,
            reason: lockout.reason,
            lockedBy: lockout.lockedBy,
            lockedAt: lockout.lockedAt.toISOString(),
            active: lockout.active,
            conditionScore: score,
        };
    },
    async unlock(input) {
        const equipment = await equipment_repository_1.equipmentRepository.findEquipment(input.equipmentId, input.companyId);
        if (!equipment)
            throw new errors_1.NotFoundError('Equipment not found');
        const activeLockout = await equipment_repository_1.equipmentRepository.findActiveLockout(input.equipmentId);
        try {
            equipment_engine_1.lockoutEngine.canUnlock(activeLockout);
        }
        catch (e) {
            throw new errors_1.BadRequestError(e instanceof Error ? e.message : 'Equipment is not locked out');
        }
        await equipment_repository_1.equipmentRepository.deactivateLockout(activeLockout.id, input.unlockedBy);
        const ctx = await equipment_repository_1.equipmentRepository.getScoreContext(input.equipmentId, input.companyId);
        const { score } = equipment_engine_1.conditionScoringEngine.compute({
            equipment: ctx,
            inspections: ctx.inspections,
            certifications: ctx.certifications,
            activeLockout: null,
        });
        const status = equipment_engine_1.lockoutEngine.resolveStatusAfterUnlock(score);
        await equipment_repository_1.equipmentRepository.updateEquipment(input.equipmentId, input.companyId, {
            status,
            conditionScore: score,
        });
        return {
            equipmentId: input.equipmentId,
            unlockedBy: input.unlockedBy,
            unlockedAt: new Date().toISOString(),
            status,
            conditionScore: score,
        };
    },
    async getScore(equipmentId, companyId) {
        const ctx = await equipment_repository_1.equipmentRepository.getScoreContext(equipmentId, companyId);
        if (!ctx)
            throw new errors_1.NotFoundError('Equipment not found');
        const activeLockout = ctx.lockouts[0] ?? null;
        const { score, factors } = equipment_engine_1.conditionScoringEngine.compute({
            equipment: ctx,
            inspections: ctx.inspections,
            certifications: ctx.certifications,
            activeLockout,
        });
        if (score !== ctx.conditionScore) {
            await equipment_repository_1.equipmentRepository.updateEquipment(equipmentId, companyId, { conditionScore: score });
        }
        const now = new Date();
        const expiredCertifications = ctx.certifications.filter((c) => c.expiryDate && c.expiryDate.getTime() < now.getTime()).length;
        const activeAuthorizations = ctx.authorizations.filter((a) => (0, equipment_engine_1.isAuthorizationActive)(a, now)).length;
        return {
            equipmentId: ctx.id,
            companyId: ctx.companyId,
            conditionScore: score,
            status: ctx.status,
            factors,
            lastInspectionDate: ctx.lastInspectionDate?.toISOString() ?? null,
            nextInspectionDue: ctx.nextInspectionDue?.toISOString() ?? null,
            activeLockout: Boolean(activeLockout),
            expiredCertifications,
            activeAuthorizations,
        };
    },
};

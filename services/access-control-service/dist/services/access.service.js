"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessService = void 0;
const client_1 = require("@prisma/client");
const safety_clients_1 = require("../clients/safety.clients");
const access_engine_1 = require("../engines/access.engine");
const access_repository_1 = require("../models/access.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mergeRules(stored, inline) {
    return { ...(0, access_engine_1.parseRules)(stored), ...inline };
}
exports.accessService = {
    async validate(input, token) {
        let accessPoint = await access_repository_1.accessRepository.findAccessPoint(input.accessPointId, input.companyId);
        if (!accessPoint && input.zoneRules) {
            accessPoint = await access_repository_1.accessRepository.upsertAccessPoint({
                id: input.accessPointId,
                companyId: input.companyId,
                name: `Gate ${input.accessPointId.slice(0, 8)}`,
                rules: input.zoneRules,
            });
        }
        if (!accessPoint)
            throw new errors_1.NotFoundError('Access point not found');
        const rules = mergeRules(accessPoint.rules, input.zoneRules);
        const lockouts = await access_repository_1.accessRepository.findActiveLockouts(input.companyId, accessPoint.projectId);
        const activeOverride = await access_repository_1.accessRepository.findActiveOverrideForWorker(input.workerId, input.accessPointId);
        if (activeOverride && access_engine_1.overrideEngine.isActive(activeOverride.expiry)) {
            const attempt = await access_repository_1.accessRepository.createAttempt({
                companyId: input.companyId,
                accessPointId: input.accessPointId,
                workerId: input.workerId,
                equipmentId: input.equipmentId,
                result: client_1.AccessResult.granted,
                reason: `Supervisor override active (${activeOverride.overrideType})`,
            });
            return {
                granted: true,
                reason: 'Access granted via active override',
                gates: ['override'],
                attemptId: attempt.id,
            };
        }
        const workerContext = await safety_clients_1.safetyClients.fetchWorkerContext(input.workerId, input.companyId, token, input.workerContext);
        const checks = [
            access_engine_1.emergencyLockoutEngine.isBlocked(lockouts, accessPoint.projectId),
            ...access_engine_1.workerAccessEngine.evaluate(workerContext),
            ...access_engine_1.zoneRuleEngine.evaluate(rules, workerContext),
        ];
        if (input.equipmentId) {
            const equipmentContext = await safety_clients_1.safetyClients.fetchEquipmentContext(input.equipmentId, input.companyId, token, input.equipmentContext);
            checks.push(...access_engine_1.equipmentAccessEngine.evaluate(equipmentContext));
        }
        const decision = access_engine_1.safetyGatingEngine.aggregate(checks);
        const attempt = await access_repository_1.accessRepository.createAttempt({
            companyId: input.companyId,
            accessPointId: input.accessPointId,
            workerId: input.workerId,
            equipmentId: input.equipmentId,
            result: decision.granted ? client_1.AccessResult.granted : client_1.AccessResult.denied,
            reason: decision.reason,
        });
        logger_1.logger.info('access validated', {
            attemptId: attempt.id,
            granted: decision.granted,
            workerId: input.workerId,
            accessPointId: input.accessPointId,
        });
        return {
            granted: decision.granted,
            reason: decision.reason,
            gates: decision.failedGates,
            attemptId: attempt.id,
        };
    },
    async createOverride(input) {
        const attempt = await access_repository_1.accessRepository.findAttempt(input.accessAttemptId, input.companyId);
        if (!attempt)
            throw new errors_1.NotFoundError('Access attempt not found');
        if (attempt.result === client_1.AccessResult.granted) {
            throw new errors_1.BadRequestError('Cannot override a granted attempt');
        }
        const override = await access_repository_1.accessRepository.createOverride({
            accessAttemptId: input.accessAttemptId,
            overrideType: input.overrideType,
            approvedBy: input.approvedBy,
            expiry: input.expiry ? new Date(input.expiry) : undefined,
        });
        const grantedAttempt = await access_repository_1.accessRepository.createAttempt({
            companyId: input.companyId,
            accessPointId: attempt.accessPointId,
            workerId: attempt.workerId,
            equipmentId: attempt.equipmentId ?? undefined,
            result: client_1.AccessResult.granted,
            reason: `Override approved (${input.overrideType})`,
        });
        return {
            id: override.id,
            accessAttemptId: override.accessAttemptId,
            overrideType: override.overrideType,
            approvedBy: override.approvedBy,
            approvedAt: override.approvedAt.toISOString(),
            expiry: override.expiry?.toISOString() ?? null,
            grantedAttemptId: grantedAttempt.id,
        };
    },
    async getWorkerAccess(workerId, companyId) {
        const [attempts, counts] = await Promise.all([
            access_repository_1.accessRepository.listWorkerAttempts(workerId, companyId),
            access_repository_1.accessRepository.countWorkerAttempts(workerId, companyId),
        ]);
        const grantedCount = counts.find((c) => c.result === client_1.AccessResult.granted)?._count.result ?? 0;
        const deniedCount = counts.find((c) => c.result === client_1.AccessResult.denied)?._count.result ?? 0;
        const now = new Date();
        const activeOverrides = attempts.filter((a) => a.overrides.some((o) => access_engine_1.overrideEngine.isActive(o.expiry, now))).length;
        return {
            workerId,
            companyId,
            totalAttempts: grantedCount + deniedCount,
            grantedCount,
            deniedCount,
            activeOverrides,
            recentAttempts: attempts.map((a) => ({
                id: a.id,
                accessPointId: a.accessPointId,
                equipmentId: a.equipmentId,
                result: a.result,
                reason: a.reason,
                timestamp: a.timestamp.toISOString(),
            })),
        };
    },
    async getEquipmentAccess(equipmentId, companyId) {
        const [attempts, counts] = await Promise.all([
            access_repository_1.accessRepository.listEquipmentAttempts(equipmentId, companyId),
            access_repository_1.accessRepository.countEquipmentAttempts(equipmentId, companyId),
        ]);
        const grantedCount = counts.find((c) => c.result === client_1.AccessResult.granted)?._count.result ?? 0;
        const deniedCount = counts.find((c) => c.result === client_1.AccessResult.denied)?._count.result ?? 0;
        return {
            equipmentId,
            companyId,
            totalAttempts: grantedCount + deniedCount,
            grantedCount,
            deniedCount,
            recentAttempts: attempts.map((a) => ({
                id: a.id,
                accessPointId: a.accessPointId,
                workerId: a.workerId,
                result: a.result,
                reason: a.reason,
                timestamp: a.timestamp.toISOString(),
            })),
        };
    },
};

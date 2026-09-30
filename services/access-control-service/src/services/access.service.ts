import { AccessResult, OverrideType } from '@prisma/client';
import { safetyClients } from '../clients/safety.clients';
import {
  emergencyLockoutEngine,
  zoneRuleEngine,
  workerAccessEngine,
  equipmentAccessEngine,
  safetyGatingEngine,
  overrideEngine,
  parseRules,
} from '../engines/access.engine';
import { accessRepository } from '../models/access.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type {
  AccessValidationInput,
  AccessValidationResult,
  WorkerAccessSummary,
  EquipmentAccessSummary,
  ZoneAccessRules,
} from '../types';
import { logger } from '../utils/logger';

function mergeRules(stored: unknown, inline?: ZoneAccessRules): ZoneAccessRules {
  return { ...parseRules(stored), ...inline };
}

export const accessService = {
  async validate(
    input: AccessValidationInput,
    token: string,
  ): Promise<AccessValidationResult> {
    let accessPoint = await accessRepository.findAccessPoint(input.accessPointId, input.companyId);

    if (!accessPoint && input.zoneRules) {
      accessPoint = await accessRepository.upsertAccessPoint({
        id: input.accessPointId,
        companyId: input.companyId,
        name: `Gate ${input.accessPointId.slice(0, 8)}`,
        rules: input.zoneRules,
      });
    }

    if (!accessPoint) throw new NotFoundError('Access point not found');

    const rules = mergeRules(accessPoint.rules, input.zoneRules);
    const lockouts = await accessRepository.findActiveLockouts(
      input.companyId,
      accessPoint.projectId,
    );

    const activeOverride = await accessRepository.findActiveOverrideForWorker(
      input.workerId,
      input.accessPointId,
    );

    if (activeOverride && overrideEngine.isActive(activeOverride.expiry)) {
      const attempt = await accessRepository.createAttempt({
        companyId: input.companyId,
        accessPointId: input.accessPointId,
        workerId: input.workerId,
        equipmentId: input.equipmentId,
        result: AccessResult.granted,
        reason: `Supervisor override active (${activeOverride.overrideType})`,
      });

      return {
        granted: true,
        reason: 'Access granted via active override',
        gates: ['override'],
        attemptId: attempt.id,
      };
    }

    const workerContext = await safetyClients.fetchWorkerContext(
      input.workerId,
      input.companyId,
      token,
      input.workerContext,
    );

    const checks = [
      emergencyLockoutEngine.isBlocked(lockouts, accessPoint.projectId),
      ...workerAccessEngine.evaluate(workerContext),
      ...zoneRuleEngine.evaluate(rules, workerContext),
    ];

    if (input.equipmentId) {
      const equipmentContext = await safetyClients.fetchEquipmentContext(
        input.equipmentId,
        input.companyId,
        token,
        input.equipmentContext,
      );
      checks.push(...equipmentAccessEngine.evaluate(equipmentContext));
    }

    const decision = safetyGatingEngine.aggregate(checks);

    const attempt = await accessRepository.createAttempt({
      companyId: input.companyId,
      accessPointId: input.accessPointId,
      workerId: input.workerId,
      equipmentId: input.equipmentId,
      result: decision.granted ? AccessResult.granted : AccessResult.denied,
      reason: decision.reason,
    });

    logger.info('access validated', {
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

  async createOverride(input: {
    companyId: string;
    accessAttemptId: string;
    overrideType: OverrideType;
    approvedBy: string;
    expiry?: string;
  }) {
    const attempt = await accessRepository.findAttempt(input.accessAttemptId, input.companyId);
    if (!attempt) throw new NotFoundError('Access attempt not found');

    if (attempt.result === AccessResult.granted) {
      throw new BadRequestError('Cannot override a granted attempt');
    }

    const override = await accessRepository.createOverride({
      accessAttemptId: input.accessAttemptId,
      overrideType: input.overrideType,
      approvedBy: input.approvedBy,
      expiry: input.expiry ? new Date(input.expiry) : undefined,
    });

    const grantedAttempt = await accessRepository.createAttempt({
      companyId: input.companyId,
      accessPointId: attempt.accessPointId,
      workerId: attempt.workerId,
      equipmentId: attempt.equipmentId ?? undefined,
      result: AccessResult.granted,
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

  async getWorkerAccess(workerId: string, companyId: string): Promise<WorkerAccessSummary> {
    const [attempts, counts] = await Promise.all([
      accessRepository.listWorkerAttempts(workerId, companyId),
      accessRepository.countWorkerAttempts(workerId, companyId),
    ]);

    const grantedCount = counts.find((c) => c.result === AccessResult.granted)?._count.result ?? 0;
    const deniedCount = counts.find((c) => c.result === AccessResult.denied)?._count.result ?? 0;

    const now = new Date();
    const activeOverrides = attempts.filter((a) =>
      a.overrides.some((o) => overrideEngine.isActive(o.expiry, now)),
    ).length;

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

  async getEquipmentAccess(equipmentId: string, companyId: string): Promise<EquipmentAccessSummary> {
    const [attempts, counts] = await Promise.all([
      accessRepository.listEquipmentAttempts(equipmentId, companyId),
      accessRepository.countEquipmentAttempts(equipmentId, companyId),
    ]);

    const grantedCount = counts.find((c) => c.result === AccessResult.granted)?._count.result ?? 0;
    const deniedCount = counts.find((c) => c.result === AccessResult.denied)?._count.result ?? 0;

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

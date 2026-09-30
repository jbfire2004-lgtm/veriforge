import { StationStatus } from '@prisma/client';
import { env } from '../config/env';
import type { WorkerValidationContext, EquipmentValidationContext } from '../types';

export interface GateCheck {
  passed: boolean;
  reason: string;
  gate: string;
}

export class HeartbeatEngine {
  isStale(lastHeartbeat: Date | null, now = new Date()): boolean {
    if (!lastHeartbeat) return true;
    const ageSec = (now.getTime() - lastHeartbeat.getTime()) / 1000;
    return ageSec > env.heartbeatStaleSeconds;
  }

  resolveStatus(
    lastHeartbeat: Date,
    current: StationStatus,
    emergencyMode: boolean,
  ): StationStatus {
    if (emergencyMode) return StationStatus.emergency;
    if (this.isStale(lastHeartbeat)) return StationStatus.offline;
    if (current === StationStatus.maintenance) return StationStatus.maintenance;
    return StationStatus.online;
  }
}

export class WorkerValidationEngine {
  evaluate(
    worker: WorkerValidationContext,
    requiredJhaIds: string[] = [],
    emergencyMode?: string | null,
  ): GateCheck[] {
    const checks: GateCheck[] = [];

    if (emergencyMode === 'lockdown') {
      checks.push({
        passed: false,
        reason: 'Site lockdown active',
        gate: 'emergency_lockdown',
      });
    }

    if ((worker.activeRestrictions ?? []).length > 0) {
      checks.push({
        passed: false,
        reason: `Active restrictions: ${worker.activeRestrictions!.join(', ')}`,
        gate: 'worker_restriction',
      });
    }

    if (worker.riskLevel?.toLowerCase() === 'critical') {
      checks.push({
        passed: false,
        reason: 'Worker risk level is critical',
        gate: 'worker_risk',
      });
    }

    for (const jhaId of requiredJhaIds) {
      const signed = (worker.signedJhaIds ?? []).includes(jhaId);
      checks.push({
        passed: signed,
        reason: signed ? `JHA ${jhaId} signed` : `Missing signed JHA ${jhaId}`,
        gate: 'jha_validation',
      });
    }

    return checks;
  }
}

export class EquipmentValidationEngine {
  evaluate(equipment: EquipmentValidationContext, emergencyMode?: string | null): GateCheck[] {
    const checks: GateCheck[] = [];

    if (emergencyMode === 'evacuation' && equipment.activeLockout !== true) {
      checks.push({
        passed: true,
        reason: 'Evacuation mode — equipment check deferred',
        gate: 'emergency_evacuation',
      });
      return checks;
    }

    if (equipment.activeLockout) {
      checks.push({
        passed: false,
        reason: 'Equipment is locked out',
        gate: 'equipment_lockout',
      });
    }

    if (equipment.status === 'locked_out' || equipment.status === 'out_of_service') {
      checks.push({
        passed: false,
        reason: `Equipment status: ${equipment.status}`,
        gate: 'equipment_status',
      });
    }

    if ((equipment.expiredCertifications ?? 0) > 0) {
      checks.push({
        passed: false,
        reason: `${equipment.expiredCertifications} expired certification(s)`,
        gate: 'equipment_certification',
      });
    }

    if (equipment.conditionScore != null && equipment.conditionScore < 50) {
      checks.push({
        passed: false,
        reason: `Condition score ${equipment.conditionScore} below threshold`,
        gate: 'equipment_condition',
      });
    }

    return checks;
  }
}

export class SafetyGatingEngine {
  aggregate(checks: GateCheck[]): { granted: boolean; reason: string; failedGates: string[] } {
    const failed = checks.filter((c) => !c.passed);
    if (failed.length === 0) {
      return { granted: true, reason: 'All safety gates passed', failedGates: [] };
    }
    return {
      granted: false,
      reason: failed.map((f) => f.reason).join('; '),
      failedGates: failed.map((f) => f.gate),
    };
  }
}

export const heartbeatEngine = new HeartbeatEngine();
export const workerValidationEngine = new WorkerValidationEngine();
export const equipmentValidationEngine = new EquipmentValidationEngine();
export const safetyGatingEngine = new SafetyGatingEngine();

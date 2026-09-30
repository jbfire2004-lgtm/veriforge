import type {
  ZoneAccessRules,
  WorkerValidationContext,
  EquipmentValidationContext,
} from '../types';

export interface GateCheckResult {
  passed: boolean;
  reason: string;
  gate: string;
}

export class EmergencyLockoutEngine {
  isBlocked(activeLockouts: Array<{ projectId: string | null }>, projectId?: string | null): GateCheckResult {
    const companyWide = activeLockouts.some((l) => !l.projectId);
    const projectWide = projectId
      ? activeLockouts.some((l) => l.projectId === projectId)
      : false;

    if (companyWide || projectWide) {
      return {
        passed: false,
        reason: 'Emergency lockout active',
        gate: 'emergency_lockout',
      };
    }

    return { passed: true, reason: 'No emergency lockout', gate: 'emergency_lockout' };
  }
}

export class ZoneRuleEngine {
  evaluate(rules: ZoneAccessRules, worker: WorkerValidationContext): GateCheckResult[] {
    const checks: GateCheckResult[] = [];

    if (rules.blockedRoles?.length && worker.role) {
      const blocked = rules.blockedRoles.map((r) => r.toLowerCase()).includes(worker.role.toLowerCase());
      checks.push({
        passed: !blocked,
        reason: blocked ? `Role ${worker.role} blocked for zone` : 'Role allowed',
        gate: 'zone_role',
      });
    }

    if (rules.minSafetyScore != null) {
      const score = worker.safetyScore ?? 0;
      checks.push({
        passed: score >= rules.minSafetyScore,
        reason:
          score >= rules.minSafetyScore
            ? 'Safety score sufficient'
            : `Safety score ${score} below minimum ${rules.minSafetyScore}`,
        gate: 'safety_score',
      });
    }

    for (const courseId of rules.requiredTraining ?? []) {
      const has = (worker.completedTraining ?? []).includes(courseId);
      checks.push({
        passed: has,
        reason: has ? `Training ${courseId} complete` : `Missing training ${courseId}`,
        gate: 'required_training',
      });
    }

    for (const code of rules.requiredCompetencies ?? []) {
      const has = (worker.competencies ?? []).includes(code);
      checks.push({
        passed: has,
        reason: has ? `Competency ${code} verified` : `Missing competency ${code}`,
        gate: 'required_competency',
      });
    }

    for (const auth of rules.requiredEquipmentAuthorization ?? []) {
      const has = (worker.equipmentAuthorizations ?? []).includes(auth);
      checks.push({
        passed: has,
        reason: has ? `Equipment auth ${auth} present` : `Missing equipment authorization ${auth}`,
        gate: 'equipment_authorization',
      });
    }

    if (rules.requiredPpe?.length) {
      checks.push({
        passed: true,
        reason: 'PPE attestation required at gate (not verified remotely)',
        gate: 'required_ppe',
      });
    }

    return checks;
  }
}

export class WorkerAccessEngine {
  evaluate(worker: WorkerValidationContext): GateCheckResult[] {
    const checks: GateCheckResult[] = [];

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

    return checks;
  }
}

export class EquipmentAccessEngine {
  evaluate(equipment: EquipmentValidationContext): GateCheckResult[] {
    const checks: GateCheckResult[] = [];

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
  aggregate(checks: GateCheckResult[]): { granted: boolean; reason: string; failedGates: string[] } {
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

export class OverrideEngine {
  isActive(expiry: Date | null, now = new Date()): boolean {
    if (!expiry) return true;
    return expiry.getTime() > now.getTime();
  }
}

export const emergencyLockoutEngine = new EmergencyLockoutEngine();
export const zoneRuleEngine = new ZoneRuleEngine();
export const workerAccessEngine = new WorkerAccessEngine();
export const equipmentAccessEngine = new EquipmentAccessEngine();
export const safetyGatingEngine = new SafetyGatingEngine();
export const overrideEngine = new OverrideEngine();

function parseRules(raw: unknown): ZoneAccessRules {
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  return {
    requiredTraining: Array.isArray(r.requiredTraining) ? (r.requiredTraining as string[]) : undefined,
    requiredPpe: Array.isArray(r.requiredPpe) ? (r.requiredPpe as string[]) : undefined,
    requiredCompetencies: Array.isArray(r.requiredCompetencies)
      ? (r.requiredCompetencies as string[])
      : undefined,
    requiredEquipmentAuthorization: Array.isArray(r.requiredEquipmentAuthorization)
      ? (r.requiredEquipmentAuthorization as string[])
      : undefined,
    minSafetyScore: typeof r.minSafetyScore === 'number' ? r.minSafetyScore : undefined,
    blockedRoles: Array.isArray(r.blockedRoles) ? (r.blockedRoles as string[]) : undefined,
  };
}

export { parseRules };

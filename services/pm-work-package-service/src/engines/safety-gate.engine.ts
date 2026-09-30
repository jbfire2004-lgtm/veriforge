import type { WorkPackageRequirements, SafetyGateContext, SafetyGateResult } from '../types';

export interface GateCheck {
  passed: boolean;
  reason: string;
  gate: string;
}

export class SafetyGateEngine {
  evaluate(
    workPackageId: string,
    version: number,
    requirements: WorkPackageRequirements,
    context: SafetyGateContext,
  ): SafetyGateResult {
    const checks: GateCheck[] = [];

    const assignedWorkers = new Set(context.assignedWorkers ?? []);
    for (const workerId of requirements.requiredWorkers ?? []) {
      checks.push({
        passed: assignedWorkers.has(workerId),
        reason: assignedWorkers.has(workerId)
          ? `Worker ${workerId} assigned`
          : `Required worker ${workerId} not assigned`,
        gate: 'required_workers',
      });
    }

    const availableEquipment = new Set(context.availableEquipment ?? []);
    for (const equip of requirements.requiredEquipment ?? []) {
      checks.push({
        passed: availableEquipment.has(equip),
        reason: availableEquipment.has(equip)
          ? `Equipment ${equip} available`
          : `Required equipment ${equip} not available`,
        gate: 'required_equipment',
      });
    }

    const completedTraining = new Set(context.completedTraining ?? []);
    for (const courseId of requirements.requiredTraining ?? []) {
      checks.push({
        passed: completedTraining.has(courseId),
        reason: completedTraining.has(courseId)
          ? `Training ${courseId} complete`
          : `Missing training ${courseId}`,
        gate: 'required_training',
      });
    }

    const activeJha = new Set(context.activeJhaTypes ?? []);
    for (const jhaType of requirements.requiredJha ?? []) {
      checks.push({
        passed: activeJha.has(jhaType),
        reason: activeJha.has(jhaType)
          ? `JHA type ${jhaType} active`
          : `Missing JHA type ${jhaType}`,
        gate: 'required_jha',
      });
    }

    const completedInspections = new Set(context.completedInspections ?? []);
    for (const inspection of requirements.requiredInspections ?? []) {
      checks.push({
        passed: completedInspections.has(inspection),
        reason: completedInspections.has(inspection)
          ? `Inspection ${inspection} complete`
          : `Missing inspection ${inspection}`,
        gate: 'required_inspections',
      });
    }

    const activePermits = new Set(context.activePermits ?? []);
    for (const permit of requirements.requiredPermits ?? []) {
      checks.push({
        passed: activePermits.has(permit),
        reason: activePermits.has(permit)
          ? `Permit ${permit} active`
          : `Missing permit ${permit}`,
        gate: 'required_permits',
      });
    }

    const failed = checks.filter((c) => !c.passed);

    return {
      passed: failed.length === 0,
      reason:
        failed.length === 0
          ? 'All work package safety requirements met'
          : failed.map((f) => f.reason).join('; '),
      gates: failed.map((f) => f.gate),
      workPackageId,
      version,
    };
  }
}

export const safetyGateEngine = new SafetyGateEngine();

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

export function extractRequirements(pkg: {
  requiredEquipment: unknown;
  requiredWorkers: unknown;
  requiredTraining: unknown;
  requiredJha: unknown;
  requiredInspections: unknown;
  requiredPermits: unknown;
}): WorkPackageRequirements {
  return {
    requiredEquipment: toStringArray(pkg.requiredEquipment),
    requiredWorkers: toStringArray(pkg.requiredWorkers),
    requiredTraining: toStringArray(pkg.requiredTraining),
    requiredJha: toStringArray(pkg.requiredJha),
    requiredInspections: toStringArray(pkg.requiredInspections),
    requiredPermits: toStringArray(pkg.requiredPermits),
  };
}

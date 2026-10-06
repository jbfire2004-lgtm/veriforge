export type SafetyGateInput = {
  emergencyLocked: boolean;
  jhaApproved: boolean;
  trainingComplete: boolean;
  equipmentSafe: boolean;
  zoneAllowed: boolean;
  sifReviewComplete: boolean;
  projectContextAllowed: boolean;
  workerAllowed: boolean;
  capaTaskAllowed?: boolean;
  capaBlockers?: string[];
};

export type SafetyGateResult = {
  allowed: boolean;
  blockers: string[];
  gate:
    | 'task_start'
    | 'schedule'
    | 'worker_assign'
    | 'equipment_assign'
    | 'zone_entry';
};

export class SafetyGatingEngine {
  evaluateTaskStart(input: SafetyGateInput): SafetyGateResult {
    const blockers: string[] = [];
    if (input.emergencyLocked) blockers.push('Project locked during emergency');
    if (!input.jhaApproved) blockers.push('JHA/FLHA not approved for task');
    if (!input.trainingComplete) blockers.push('Required training incomplete');
    if (!input.equipmentSafe)
      blockers.push('Assigned equipment not certified or inspected');
    if (!input.zoneAllowed) blockers.push('Zone access requirements not met');
    if (!input.sifReviewComplete)
      blockers.push('SIF/HECA supervisor review required');
    if (!input.projectContextAllowed)
      blockers.push('Project safety context enforcement failed');
    if (!input.workerAllowed)
      blockers.push('Worker safety profile blocked assignment');
    if (input.capaTaskAllowed === false) {
      blockers.push(
        ...(input.capaBlockers ?? [
          'Unresolved corrective actions block task start',
        ]),
      );
    }
    return {
      allowed: blockers.length === 0,
      blockers,
      gate: 'task_start',
    };
  }

  evaluateSchedule(input: SafetyGateInput): SafetyGateResult {
    const r = this.evaluateTaskStart(input);
    return { ...r, gate: 'schedule' };
  }

  evaluateWorkerAssign(
    input: Pick<
      SafetyGateInput,
      'emergencyLocked' | 'trainingComplete' | 'workerAllowed' | 'zoneAllowed'
    >,
  ): SafetyGateResult {
    const blockers: string[] = [];
    if (input.emergencyLocked) blockers.push('Project locked during emergency');
    if (!input.trainingComplete) blockers.push('Worker training incomplete');
    if (!input.workerAllowed)
      blockers.push('Worker safety enforcement blocked');
    if (!input.zoneAllowed) blockers.push('Zone requirements not met');
    return { allowed: blockers.length === 0, blockers, gate: 'worker_assign' };
  }

  evaluateEquipmentAssign(
    input: Pick<SafetyGateInput, 'emergencyLocked' | 'equipmentSafe'>,
  ): SafetyGateResult {
    const blockers: string[] = [];
    if (input.emergencyLocked) blockers.push('Project locked during emergency');
    if (!input.equipmentSafe)
      blockers.push('Equipment unsafe or non-compliant');
    return {
      allowed: blockers.length === 0,
      blockers,
      gate: 'equipment_assign',
    };
  }
}

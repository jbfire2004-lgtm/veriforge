export type UnifiedEnforcementInput = {
  workerOpen: number;
  workerOverdue: number;
  workerCritical: number;
  equipmentOpen: number;
  projectCriticalOpen: number;
  emergencyActive: boolean;
  activeOverrides: Array<{ ruleType: string; ruleKey: string }>;
};

export type UnifiedEnforcementResult = {
  allowed: boolean;
  blockers: string[];
  waived: string[];
  blocks: {
    workerAccess: boolean;
    equipmentAccess: boolean;
    zoneAccess: boolean;
    taskStart: boolean;
    permitApproval: boolean;
    jhaApproval: boolean;
    pmScheduling: boolean;
  };
};

export class CapaEnforcementEngine {
  evaluate(input: UnifiedEnforcementInput): UnifiedEnforcementResult {
    const blockers: string[] = [];
    const waived: string[] = [];

    const blocks = {
      workerAccess: false,
      equipmentAccess: false,
      zoneAccess: false,
      taskStart: false,
      permitApproval: false,
      jhaApproval: false,
      pmScheduling: false,
    };

    if (input.emergencyActive) {
      blockers.push(
        'Emergency event active — CAPA enforcement suspended for access',
      );
      return { allowed: false, blockers, waived, blocks };
    }

    if (input.workerOverdue > 0) {
      if (this.waived(input, 'worker', 'OVERDUE'))
        waived.push('worker_overdue');
      else {
        blockers.push(
          `${input.workerOverdue} overdue corrective action(s) for worker`,
        );
        blocks.workerAccess = true;
        blocks.zoneAccess = true;
        blocks.taskStart = true;
        blocks.pmScheduling = true;
      }
    }

    if (input.workerCritical > 0) {
      if (this.waived(input, 'worker', 'CRITICAL'))
        waived.push('worker_critical');
      else {
        blockers.push(
          `${input.workerCritical} critical open corrective action(s)`,
        );
        blocks.workerAccess = true;
        blocks.jhaApproval = true;
        blocks.permitApproval = true;
      }
    }

    if (input.equipmentOpen > 0) {
      blockers.push(
        `${input.equipmentOpen} unresolved equipment corrective action(s)`,
      );
      blocks.equipmentAccess = true;
    }

    if (input.projectCriticalOpen > 0) {
      blockers.push(
        `${input.projectCriticalOpen} project-critical corrective actions open`,
      );
      blocks.taskStart = true;
      blocks.pmScheduling = true;
      blocks.permitApproval = true;
    }

    return {
      allowed: blockers.length === 0,
      blockers,
      waived,
      blocks,
    };
  }

  private waived(
    input: UnifiedEnforcementInput,
    type: string,
    key: string,
  ): boolean {
    return input.activeOverrides.some(
      (o) => o.ruleType === type && o.ruleKey === key,
    );
  }
}

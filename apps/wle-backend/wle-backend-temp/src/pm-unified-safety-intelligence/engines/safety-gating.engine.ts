export type IntelSafetyGateInput = {
  workerScore?: number;
  workerOverdueCapa?: number;
  workerCriticalCapa?: number;
  equipmentScore?: number;
  equipmentOpenCapa?: number;
  projectCriticalCapa?: number;
  emergencyActive?: boolean;
  sifHazardOpen?: number;
  activeOverrides?: Array<{ ruleType: string; ruleKey: string }>;
};

export type IntelSafetyGateResult = {
  allowed: boolean;
  blockers: string[];
  requiresSupervisorOverride: boolean;
  requiresSafetyOverride: boolean;
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
  autoCapaSuggestions: string[];
};

export class CailSafetyGatingEngine {
  evaluate(input: IntelSafetyGateInput): IntelSafetyGateResult {
    const blockers: string[] = [];
    const waived: string[] = [];
    const autoCapaSuggestions: string[] = [];
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
      return {
        allowed: true,
        blockers: ['Emergency active — standard CAPA blocks suspended'],
        requiresSupervisorOverride: false,
        requiresSafetyOverride: false,
        waived: ['emergency_suspend'],
        blocks,
        autoCapaSuggestions: ['Post-emergency CAPA review'],
      };
    }

    if (
      (input.workerOverdueCapa ?? 0) > 0 &&
      !this.waived(input, 'worker', 'OVERDUE')
    ) {
      blockers.push(`${input.workerOverdueCapa} overdue worker CAPA`);
      blocks.workerAccess = true;
      blocks.zoneAccess = true;
      blocks.taskStart = true;
      autoCapaSuggestions.push('Resolve overdue worker CAPA before access');
    } else if ((input.workerOverdueCapa ?? 0) > 0) {
      waived.push('worker_overdue');
    }

    if (
      (input.workerCriticalCapa ?? 0) > 0 &&
      !this.waived(input, 'worker', 'CRITICAL')
    ) {
      blockers.push(`${input.workerCriticalCapa} critical worker CAPA`);
      blocks.workerAccess = true;
      blocks.jhaApproval = true;
      blocks.permitApproval = true;
      autoCapaSuggestions.push('Safety verification for critical CAPA');
    }

    if ((input.workerScore ?? 100) < 40) {
      blockers.push(`Worker safety score ${input.workerScore} below threshold`);
      blocks.workerAccess = true;
      blocks.zoneAccess = true;
    }

    if ((input.equipmentOpenCapa ?? 0) > 0) {
      blockers.push(`${input.equipmentOpenCapa} open equipment CAPA`);
      blocks.equipmentAccess = true;
      autoCapaSuggestions.push('Close equipment CAPA or lockout');
    }

    if ((input.equipmentScore ?? 100) < 50) {
      blockers.push(`Equipment safety score ${input.equipmentScore} unsafe`);
      blocks.equipmentAccess = true;
    }

    if ((input.projectCriticalCapa ?? 0) > 0) {
      blockers.push(`${input.projectCriticalCapa} critical project CAPA`);
      blocks.taskStart = true;
      blocks.pmScheduling = true;
      blocks.permitApproval = true;
    }

    if ((input.sifHazardOpen ?? 0) > 0) {
      blockers.push(`${input.sifHazardOpen} open SIF-potential hazard(s)`);
      blocks.jhaApproval = true;
      autoCapaSuggestions.push('Supervisor review for SIF hazards');
    }

    return {
      allowed: blockers.length === 0,
      blockers,
      requiresSupervisorOverride: blocks.jhaApproval || blocks.taskStart,
      requiresSafetyOverride:
        (input.workerCriticalCapa ?? 0) > 0 || (input.sifHazardOpen ?? 0) > 0,
      waived,
      blocks,
      autoCapaSuggestions,
    };
  }

  private waived(
    input: IntelSafetyGateInput,
    type: string,
    key: string,
  ): boolean {
    return (input.activeOverrides ?? []).some(
      (o) => o.ruleType === type && o.ruleKey === key,
    );
  }
}

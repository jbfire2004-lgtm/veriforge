import { PmWorkPackageStatus } from '@prisma/client';

export type WorkPackagePublishInput = {
  status: PmWorkPackageStatus;
  hazardIds: string[];
  controlIds: string[];
  sifPotential: boolean;
  requiredJhaIds: string[];
  requiredPermitTypes: string[];
};

export type WorkPackagePublishResult = {
  canPublish: boolean;
  violations: string[];
  nextStatus: PmWorkPackageStatus;
  autoHazardCount: number;
  autoControlCount: number;
};

export class WorkPackageEngine {
  evaluatePublish(input: WorkPackagePublishInput): WorkPackagePublishResult {
    const violations: string[] = [];
    if (input.status !== 'draft') {
      violations.push('Only draft work packages can be published');
    }
    if (input.sifPotential && input.requiredJhaIds.length === 0) {
      violations.push('SIF-potential work package requires at least one JHA');
    }
    if (
      input.requiredPermitTypes.includes('hot_work') &&
      input.controlIds.length === 0
    ) {
      violations.push('Hot work requires mapped controls');
    }

    return {
      canPublish: violations.length === 0,
      violations,
      nextStatus: 'published',
      autoHazardCount: input.hazardIds.length,
      autoControlCount: input.controlIds.length,
    };
  }

  rollupProgress(taskProgress: number[]): number {
    if (taskProgress.length === 0) return 0;
    const sum = taskProgress.reduce((a, b) => a + b, 0);
    return Math.round((sum / taskProgress.length) * 100) / 100;
  }
}

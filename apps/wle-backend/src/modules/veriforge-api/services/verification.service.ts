import { Injectable, NotFoundException } from '@nestjs/common';
import { VeriForgeStoreService } from './veriforge-store.service';

@Injectable()
export class VerificationService {
  constructor(private readonly store: VeriForgeStoreService) {}

  forgeCheck(input: { targetId: string; checkType: string; userId?: number }) {
    const run = {
      id: `vrf-${Date.now()}`,
      targetId: input.targetId,
      workflowId: input.checkType,
      forgeStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    this.store.verificationRuns.push(run);
    return run;
  }

  forgeStatus(id: string) {
    const run = this.store.verificationRuns.find((item) => item.id === id);
    if (!run) throw new NotFoundException(`Verification run ${id} not found`);
    return run;
  }

  workflowStart(input: { workflowId: string; targetId: string }) {
    return this.forgeCheck({
      checkType: input.workflowId,
      targetId: input.targetId,
    });
  }

  workflowComplete(input: {
    verificationId: string;
    outcome: 'verified' | 'failed';
  }) {
    const run = this.store.verificationRuns.find(
      (item) => item.id === input.verificationId,
    );
    if (!run) {
      throw new NotFoundException(
        `Verification run ${input.verificationId} not found`,
      );
    }
    run.forgeStatus = input.outcome;
    return run;
  }
}

import { PmCorrectiveActionStatus } from '@prisma/client';

export type PublishInput = {
  status: PmCorrectiveActionStatus;
  title: string;
  hasPrimaryAssignee: boolean;
  verificationRequirements: Record<string, unknown>;
};

export type PublishResult = {
  canPublish: boolean;
  violations: string[];
  nextStatus: PmCorrectiveActionStatus;
};

export class CapaPublishEngine {
  evaluate(input: PublishInput): PublishResult {
    const violations: string[] = [];
    if (input.status !== 'draft') {
      violations.push('Only draft corrective actions can be published');
    }
    if (!input.title?.trim()) {
      violations.push('Title required');
    }
    const req = input.verificationRequirements;
    if (!req || Object.keys(req).length === 0) {
      violations.push('Verification requirements must be defined');
    }

    return {
      canPublish: violations.length === 0,
      violations,
      nextStatus: input.hasPrimaryAssignee ? 'assigned' : 'open',
    };
  }
}

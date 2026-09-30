import type { WorkPermitStatus, ApprovalDecision } from '../types';

const TRANSITIONS: Record<WorkPermitStatus, WorkPermitStatus[]> = {
  draft: ['pending_approval', 'closed'],
  pending_approval: ['approved', 'draft', 'closed'],
  approved: ['active', 'suspended', 'expired', 'closed'],
  active: ['suspended', 'closed', 'expired'],
  suspended: ['active', 'closed'],
  closed: [],
  expired: ['closed'],
};

export class ApprovalEngine {
  canTransition(from: WorkPermitStatus, to: WorkPermitStatus): boolean {
    return (TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: WorkPermitStatus, to: WorkPermitStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid permit status transition: ${from} -> ${to}`);
    }
  }

  allowedNext(status: WorkPermitStatus): WorkPermitStatus[] {
    return TRANSITIONS[status] ?? [];
  }

  assertCanRequestApproval(status: WorkPermitStatus): void {
    if (status !== 'draft') {
      throw new Error(`Cannot request approval from status: ${status}`);
    }
  }

  assertCanApprove(status: WorkPermitStatus): void {
    if (status !== 'pending_approval') {
      throw new Error(`Cannot approve permit in status: ${status}`);
    }
  }

  assertCanActivate(status: WorkPermitStatus): void {
    if (status !== 'approved') {
      throw new Error(`Cannot activate permit in status: ${status}`);
    }
  }

  assertCanSuspend(status: WorkPermitStatus): void {
    if (!['approved', 'active'].includes(status)) {
      throw new Error(`Cannot suspend permit in status: ${status}`);
    }
  }

  assertCanClose(status: WorkPermitStatus): void {
    if (status === 'closed') {
      throw new Error('Permit already closed');
    }
  }

  outcomeToStatus(decision: ApprovalDecision): WorkPermitStatus {
    if (decision.outcome === 'rejected') return 'draft';
    return 'approved';
  }

  isExpired(validTo: Date | null | undefined, now = new Date()): boolean {
    if (!validTo) return false;
    return validTo.getTime() < now.getTime();
  }
}

export const approvalEngine = new ApprovalEngine();

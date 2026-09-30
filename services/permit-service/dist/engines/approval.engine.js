"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalEngine = exports.ApprovalEngine = void 0;
const TRANSITIONS = {
    draft: ['pending_approval', 'closed'],
    pending_approval: ['approved', 'draft', 'closed'],
    approved: ['active', 'suspended', 'expired', 'closed'],
    active: ['suspended', 'closed', 'expired'],
    suspended: ['active', 'closed'],
    closed: [],
    expired: ['closed'],
};
class ApprovalEngine {
    canTransition(from, to) {
        return (TRANSITIONS[from] ?? []).includes(to);
    }
    assertTransition(from, to) {
        if (!this.canTransition(from, to)) {
            throw new Error(`Invalid permit status transition: ${from} -> ${to}`);
        }
    }
    allowedNext(status) {
        return TRANSITIONS[status] ?? [];
    }
    assertCanRequestApproval(status) {
        if (status !== 'draft') {
            throw new Error(`Cannot request approval from status: ${status}`);
        }
    }
    assertCanApprove(status) {
        if (status !== 'pending_approval') {
            throw new Error(`Cannot approve permit in status: ${status}`);
        }
    }
    assertCanActivate(status) {
        if (status !== 'approved') {
            throw new Error(`Cannot activate permit in status: ${status}`);
        }
    }
    assertCanSuspend(status) {
        if (!['approved', 'active'].includes(status)) {
            throw new Error(`Cannot suspend permit in status: ${status}`);
        }
    }
    assertCanClose(status) {
        if (status === 'closed') {
            throw new Error('Permit already closed');
        }
    }
    outcomeToStatus(decision) {
        if (decision.outcome === 'rejected')
            return 'draft';
        return 'approved';
    }
    isExpired(validTo, now = new Date()) {
        if (!validTo)
            return false;
        return validTo.getTime() < now.getTime();
    }
}
exports.ApprovalEngine = ApprovalEngine;
exports.approvalEngine = new ApprovalEngine();

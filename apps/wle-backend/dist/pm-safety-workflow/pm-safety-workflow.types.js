"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PM_SAFETY_TRANSITIONS = exports.PM_SAFETY_ACTIONS = exports.PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN = exports.PM_SAFETY_KIND = void 0;
exports.findTransition = findTransition;
exports.transitionActionsFrom = transitionActionsFrom;
exports.PM_SAFETY_KIND = {
    PERMIT_TO_WORK: 'PERMIT_TO_WORK',
    JOB_SAFETY_ANALYSIS: 'JOB_SAFETY_ANALYSIS',
};
exports.PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN = [
    'JOB_SAFETY_ANALYSIS',
    'JHA',
    'FLHA',
    'SIF',
    'HECA',
    'ENERGY_WHEEL',
    'INSPECTION',
];
exports.PM_SAFETY_ACTIONS = [
    'submit',
    'start_review',
    'approve',
    'reject',
    'revise',
    'close',
    'cancel',
];
exports.PM_SAFETY_TRANSITIONS = [
    {
        from: 'DRAFT',
        action: 'submit',
        to: 'SUBMITTED',
        label: 'Submit for review',
    },
    {
        from: 'SUBMITTED',
        action: 'start_review',
        to: 'UNDER_REVIEW',
        label: 'Begin formal review',
    },
    {
        from: 'UNDER_REVIEW',
        action: 'approve',
        to: 'APPROVED',
        label: 'Approve permit / JSA',
    },
    {
        from: 'UNDER_REVIEW',
        action: 'reject',
        to: 'REJECTED',
        label: 'Reject — needs revision',
    },
    {
        from: 'REJECTED',
        action: 'revise',
        to: 'DRAFT',
        label: 'Return to draft',
    },
    {
        from: 'APPROVED',
        action: 'close',
        to: 'CLOSED',
        label: 'Close work / archive',
    },
    {
        from: 'DRAFT',
        action: 'cancel',
        to: 'CANCELLED',
        label: 'Cancel',
    },
    {
        from: 'SUBMITTED',
        action: 'cancel',
        to: 'CANCELLED',
        label: 'Cancel',
    },
    {
        from: 'UNDER_REVIEW',
        action: 'cancel',
        to: 'CANCELLED',
        label: 'Cancel',
    },
    {
        from: 'REJECTED',
        action: 'cancel',
        to: 'CANCELLED',
        label: 'Cancel',
    },
    {
        from: 'APPROVED',
        action: 'cancel',
        to: 'CANCELLED',
        label: 'Cancel',
    },
];
function findTransition(from, action) {
    return exports.PM_SAFETY_TRANSITIONS.find((t) => t.from === from && t.action === action);
}
function transitionActionsFrom(status) {
    return exports.PM_SAFETY_TRANSITIONS.filter((t) => t.from === status).map((t) => t.action);
}
//# sourceMappingURL=pm-safety-workflow.types.js.map
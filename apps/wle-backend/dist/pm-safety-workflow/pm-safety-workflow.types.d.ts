import type { PmSafetyWorkflowKind, PmSafetyWorkflowStatus } from '@prisma/client';
export declare const PM_SAFETY_KIND: {
    readonly PERMIT_TO_WORK: "PERMIT_TO_WORK";
    readonly JOB_SAFETY_ANALYSIS: "JOB_SAFETY_ANALYSIS";
};
export declare const PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN: PmSafetyWorkflowKind[];
export type PmSafetyKind = (typeof PM_SAFETY_KIND)[keyof typeof PM_SAFETY_KIND];
export declare const PM_SAFETY_ACTIONS: readonly ["submit", "start_review", "approve", "reject", "revise", "close", "cancel"];
export type PmSafetyAction = (typeof PM_SAFETY_ACTIONS)[number];
export interface PmSafetyTransitionEdge {
    from: PmSafetyWorkflowStatus;
    action: PmSafetyAction;
    to: PmSafetyWorkflowStatus;
    label: string;
}
export declare const PM_SAFETY_TRANSITIONS: PmSafetyTransitionEdge[];
export declare function findTransition(from: PmSafetyWorkflowStatus, action: PmSafetyAction): PmSafetyTransitionEdge | undefined;
export declare function transitionActionsFrom(status: PmSafetyWorkflowStatus): PmSafetyAction[];

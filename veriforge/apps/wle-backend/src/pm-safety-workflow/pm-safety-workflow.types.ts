import type {
  PmSafetyWorkflowKind,
  PmSafetyWorkflowStatus,
} from '@prisma/client';

/** Workflow kind placeholder — PERMIT_TO_WORK | JOB_SAFETY_ANALYSIS */
export const PM_SAFETY_KIND = {
  PERMIT_TO_WORK: 'PERMIT_TO_WORK',
  JOB_SAFETY_ANALYSIS: 'JOB_SAFETY_ANALYSIS',
} as const;

/** Kinds that require {@link PmSafetyWorkflow.workerSignedAt} before `submit`. */
export const PM_SAFETY_KINDS_REQUIRING_WORKER_SIGN: PmSafetyWorkflowKind[] = [
  'JOB_SAFETY_ANALYSIS',
  'JHA',
  'FLHA',
  'SIF',
  'HECA',
  'ENERGY_WHEEL',
  'INSPECTION',
];

export type PmSafetyKind = (typeof PM_SAFETY_KIND)[keyof typeof PM_SAFETY_KIND];

export const PM_SAFETY_ACTIONS = [
  'submit',
  'start_review',
  'approve',
  'reject',
  'revise',
  'close',
  'cancel',
] as const;

export type PmSafetyAction = (typeof PM_SAFETY_ACTIONS)[number];

export interface PmSafetyTransitionEdge {
  from: PmSafetyWorkflowStatus;
  action: PmSafetyAction;
  to: PmSafetyWorkflowStatus;
  label: string;
}

/** Directed edges — single source of truth for {@link PmSafetyWorkflowService}. */
export const PM_SAFETY_TRANSITIONS: PmSafetyTransitionEdge[] = [
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

export function findTransition(
  from: PmSafetyWorkflowStatus,
  action: PmSafetyAction,
): PmSafetyTransitionEdge | undefined {
  return PM_SAFETY_TRANSITIONS.find(
    (t) => t.from === from && t.action === action,
  );
}

/** Actions valid from {@link status} per {@link PM_SAFETY_TRANSITIONS}. */
export function transitionActionsFrom(
  status: PmSafetyWorkflowStatus,
): PmSafetyAction[] {
  return PM_SAFETY_TRANSITIONS.filter((t) => t.from === status).map(
    (t) => t.action,
  );
}

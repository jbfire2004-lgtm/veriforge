import { UserRole } from '@prisma/client';
import {
  COMPANY_ADMIN_ROLES,
  STAFF_ROLES,
  SUPERVISOR_ROLES,
  TRAINING_INSTRUCTOR_ROLES,
  TRAINING_PROVIDER_ADMIN_ROLES,
} from '../modules/vera-core/roles';

/**
 * Centralized RBAC capability → allowed roles mapping.
 * Controllers should import from here instead of ad-hoc role arrays.
 */
export const RBAC = {
  /** View project compliance dashboards and worker compliance status. */
  viewProjectCompliance: STAFF_ROLES,

  /** Create compliance rules or resolve compliance alerts. */
  manageProjectCompliance: SUPERVISOR_ROLES,

  /** Submit or edit own safety forms (workers + supervisors). */
  submitSafetyForms: [UserRole.WORKER, ...SUPERVISOR_ROLES] as UserRole[],

  /** Approve, reject, or transition safety forms to reviewed states. */
  approveSafetyForms: SUPERVISOR_ROLES,

  /** Issue or update digital training certificates. */
  issueCredentials: TRAINING_INSTRUCTOR_ROLES,

  /** Provider portal admin configuration and sync management. */
  manageProviderApis: TRAINING_PROVIDER_ADMIN_ROLES,

  /** Read credential verification chain (staff, not public). */
  viewCredentialChain: [
    UserRole.WORKER,
    ...SUPERVISOR_ROLES,
    ...TRAINING_INSTRUCTOR_ROLES,
  ] as UserRole[],

  /** Backfill credential ledger (admin only). */
  credentialLedgerBackfill: COMPANY_ADMIN_ROLES,
} as const;

export type RbacCapability = keyof typeof RBAC;

export function rolesFor(capability: RbacCapability): UserRole[] {
  return [...RBAC[capability]];
}

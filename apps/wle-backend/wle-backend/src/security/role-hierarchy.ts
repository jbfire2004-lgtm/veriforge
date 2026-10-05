import { UserRole } from '@prisma/client';
import {
  COMPANY_ADMIN_ROLES,
  CONTRACTOR_ROLES,
  SUPER_ADMIN_ROLES,
  SUPERVISOR_ROLES,
} from '../modules/vera-core/roles';

const CONTRACTOR_PORTAL_ROLES: UserRole[] = [
  UserRole.CONTRACTOR_ADMIN,
  UserRole.CONTRACTOR_USER,
  ...SUPERVISOR_ROLES,
];

/** Ordered broad → narrow; higher index = lower privilege within org staff. */
const STAFF_HIERARCHY: UserRole[][] = [
  SUPER_ADMIN_ROLES,
  COMPANY_ADMIN_ROLES,
  SUPERVISOR_ROLES,
];

/**
 * Returns true when the actor's role satisfies any required role.
 * Higher roles inherit lower ones (e.g. COMPANY_ADMIN satisfies SUPERVISOR).
 * `@Roles(...STAFF_ROLES)` lists are OR'd — exact membership still passes via the first check.
 */
export function roleSatisfiesAny(
  actorRole: UserRole,
  required: UserRole[],
): boolean {
  if (required.includes(actorRole)) return true;

  for (const req of required) {
    for (let level = 0; level < STAFF_HIERARCHY.length; level++) {
      if (!STAFF_HIERARCHY[level].includes(req)) continue;
      for (let higher = 0; higher <= level; higher++) {
        if (STAFF_HIERARCHY[higher].includes(actorRole)) return true;
      }
      break;
    }

    if (
      CONTRACTOR_PORTAL_ROLES.includes(req) &&
      CONTRACTOR_PORTAL_ROLES.includes(actorRole)
    ) {
      return true;
    }
  }

  return false;
}

export function isContractorRole(role: UserRole): boolean {
  return CONTRACTOR_ROLES.includes(role);
}

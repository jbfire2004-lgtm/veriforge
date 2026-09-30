import { ForbiddenError } from '../utils/errors';

/**
 * Tenant isolation helpers — every tenant query must pass orgId.
 */
export function assertOrgId(orgId: string | undefined | null): asserts orgId is string {
  if (!orgId || typeof orgId !== 'string') {
    throw new ForbiddenError('Missing tenant org_id');
  }
}

export function tenantWhere<T extends Record<string, unknown>>(
  orgId: string,
  where: T = {} as T,
): T & { orgId: string } {
  assertOrgId(orgId);
  return { ...where, orgId };
}

/** Ensure a loaded row belongs to the caller's org. */
export function assertRowOrg<T extends { orgId: string }>(
  row: T | null | undefined,
  orgId: string,
  message = 'Resource not found in this organization',
): T {
  assertOrgId(orgId);
  if (!row || row.orgId !== orgId) {
    throw new ForbiddenError(message);
  }
  return row;
}

/** Role assignment privilege escalation rules. */
export function assertCanAssignRole(
  actorRole: string | null | undefined,
  targetRole: string,
): void {
  if (targetRole === 'owner' && actorRole !== 'owner') {
    throw new ForbiddenError('Only an Owner can assign the Owner role');
  }
  if (targetRole === 'admin' && actorRole !== 'owner' && actorRole !== 'admin') {
    throw new ForbiddenError('Insufficient privilege to assign Admin');
  }
  if (actorRole === 'manager' || actorRole === 'user') {
    throw new ForbiddenError('Managers and Users cannot assign roles');
  }
}

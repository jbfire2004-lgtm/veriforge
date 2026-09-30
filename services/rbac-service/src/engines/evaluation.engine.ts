import type { EvaluationInput, EvaluationResult, PermissionRecord } from '../types';

/**
 * Fast in-memory policy evaluation: user permissions vs requested resource+action.
 * Supports exact match on resource and action (case-normalized).
 */
export function evaluatePermission(
  permissions: PermissionRecord[],
  input: EvaluationInput,
): EvaluationResult {
  const resource = input.resource.toLowerCase().trim();
  const action = input.action.toLowerCase().trim();

  if (permissions.length === 0) {
    return {
      allow: false,
      reason: 'User has no permissions assigned for this company',
    };
  }

  for (const perm of permissions) {
    const permResource = perm.resource.toLowerCase().trim();
    const permAction = perm.action.toLowerCase().trim();

    const resourceMatch = permResource === resource || permResource === '*';
    const actionMatch = permAction === action || permAction === '*';

    if (resourceMatch && actionMatch) {
      return {
        allow: true,
        reason: `Allowed by permission "${perm.name}" (${perm.resource}:${perm.action})`,
        matchedPermission: perm.id,
      };
    }
  }

  return {
    allow: false,
    reason: `No permission grants ${action} on ${resource}`,
  };
}

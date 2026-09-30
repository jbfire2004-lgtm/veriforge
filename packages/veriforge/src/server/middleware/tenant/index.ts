import { TenantIsolationError } from "../../utils/errors";
import { isUuid } from "../../utils/validators";

/** Bind every org-scoped query to JWT org_id. Never trust client-supplied org ids. */
export function assertSameOrg(tokenOrgId: string, requestedOrgId: string) {
  if (!isUuid(requestedOrgId) || tokenOrgId !== requestedOrgId) {
    throw new TenantIsolationError();
  }
}

export function tenantWhere(orgId: string) {
  return { orgId } as const;
}

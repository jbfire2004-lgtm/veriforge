/**
 * Canonical permission keys. Runtime catalog:
 * services/veriforge-saas-service/src/rbac/permission-catalog.ts
 */

export const PERMISSIONS = {
  ORG_USERS_MANAGE: "org.users.manage",
  ORG_USERS_VIEW: "org.users.view",
  ORG_ROLES_MANAGE: "org.roles.manage",
  ORG_MODULES_MANAGE: "org.modules.manage",
  ORG_BILLING_MANAGE: "org.billing.manage",
  COMPLIANCE_VIEW: "compliance.view",
  CONTRACTOR_SCORECARDS_VIEW: "contractor.scorecards.view",
  CONTRACTOR_COMPLIANCE_VIEW: "contractor.compliance.view",
  PLATFORM_ADMIN: "platform.admin",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasAny(granted: string[], required: string[]): boolean {
  return required.some((key) => granted.includes(key));
}

export function hasAll(granted: string[], required: string[]): boolean {
  return required.every((key) => granted.includes(key));
}

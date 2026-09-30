import type { DeveloperRole } from '@prisma/client';

/**
 * Developer / platform permission keys (separate auth namespace).
 */
export const DEVELOPER_PERMISSION_KEYS = {
  SYSTEM_FULL_ACCESS: 'system.full_access',
  ORG_IMPERSONATE: 'org.impersonate',
  ORG_VIEW: 'org.view',
  ORG_USERS_VIEW: 'org.users.view',
  MODULES_CREATE: 'modules.create',
  MODULES_EDIT: 'modules.edit',
  FEATURE_FLAGS_MANAGE: 'feature_flags.manage',
  BILLING_VIEW: 'billing.view',
  BILLING_OVERRIDE: 'billing.override',
  LOGS_VIEW: 'logs.view',
  API_KEYS_MANAGE: 'api_keys.manage',
} as const;

export type DeveloperPermissionKey =
  (typeof DEVELOPER_PERMISSION_KEYS)[keyof typeof DEVELOPER_PERMISSION_KEYS];

export const DEVELOPER_PERMISSIONS = DEVELOPER_PERMISSION_KEYS;

export const DEVELOPER_PERMISSION_CATALOG: {
  key: DeveloperPermissionKey;
  name: string;
}[] = [
  { key: DEVELOPER_PERMISSION_KEYS.SYSTEM_FULL_ACCESS, name: 'Full system access' },
  { key: DEVELOPER_PERMISSION_KEYS.ORG_IMPERSONATE, name: 'Impersonate organization' },
  { key: DEVELOPER_PERMISSION_KEYS.ORG_VIEW, name: 'View organizations' },
  { key: DEVELOPER_PERMISSION_KEYS.ORG_USERS_VIEW, name: 'View organization users' },
  { key: DEVELOPER_PERMISSION_KEYS.MODULES_CREATE, name: 'Create modules' },
  { key: DEVELOPER_PERMISSION_KEYS.MODULES_EDIT, name: 'Edit modules' },
  { key: DEVELOPER_PERMISSION_KEYS.FEATURE_FLAGS_MANAGE, name: 'Manage feature flags' },
  { key: DEVELOPER_PERMISSION_KEYS.BILLING_VIEW, name: 'View billing' },
  { key: DEVELOPER_PERMISSION_KEYS.BILLING_OVERRIDE, name: 'Override billing' },
  { key: DEVELOPER_PERMISSION_KEYS.LOGS_VIEW, name: 'View global logs' },
  { key: DEVELOPER_PERMISSION_KEYS.API_KEYS_MANAGE, name: 'Manage API keys' },
];

export const DEVELOPER_ROLE_PERMISSIONS: Record<DeveloperRole, DeveloperPermissionKey[]> = {
  SystemAdmin: [
    DEVELOPER_PERMISSION_KEYS.SYSTEM_FULL_ACCESS,
    DEVELOPER_PERMISSION_KEYS.ORG_IMPERSONATE,
    DEVELOPER_PERMISSION_KEYS.ORG_VIEW,
    DEVELOPER_PERMISSION_KEYS.ORG_USERS_VIEW,
    DEVELOPER_PERMISSION_KEYS.MODULES_CREATE,
    DEVELOPER_PERMISSION_KEYS.MODULES_EDIT,
    DEVELOPER_PERMISSION_KEYS.FEATURE_FLAGS_MANAGE,
    DEVELOPER_PERMISSION_KEYS.BILLING_VIEW,
    DEVELOPER_PERMISSION_KEYS.BILLING_OVERRIDE,
    DEVELOPER_PERMISSION_KEYS.LOGS_VIEW,
    DEVELOPER_PERMISSION_KEYS.API_KEYS_MANAGE,
  ],
  ModuleArchitect: [
    DEVELOPER_PERMISSION_KEYS.MODULES_CREATE,
    DEVELOPER_PERMISSION_KEYS.MODULES_EDIT,
    DEVELOPER_PERMISSION_KEYS.FEATURE_FLAGS_MANAGE,
    DEVELOPER_PERMISSION_KEYS.API_KEYS_MANAGE,
  ],
  SupportEngineer: [
    DEVELOPER_PERMISSION_KEYS.ORG_IMPERSONATE,
    DEVELOPER_PERMISSION_KEYS.ORG_VIEW,
    DEVELOPER_PERMISSION_KEYS.ORG_USERS_VIEW,
    DEVELOPER_PERMISSION_KEYS.LOGS_VIEW,
  ],
  BillingAdmin: [
    DEVELOPER_PERMISSION_KEYS.BILLING_VIEW,
    DEVELOPER_PERMISSION_KEYS.BILLING_OVERRIDE,
    DEVELOPER_PERMISSION_KEYS.ORG_VIEW,
  ],
};

export const DEVELOPER_JWT_AUDIENCE = 'veriforge-developer';
export const DEVELOPER_JWT_NS = 'developer';

/** system.full_access implies any permission check. */
export function developerHasPermission(
  permissions: string[],
  key: string,
): boolean {
  if (permissions.includes(DEVELOPER_PERMISSION_KEYS.SYSTEM_FULL_ACCESS)) {
    return true;
  }
  return permissions.includes(key);
}

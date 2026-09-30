import type { ModuleCode, SystemRoleCode } from '@prisma/client';

/**
 * Canonical VeriForge permission keys.
 * Convention: `<scope>.<resource>.<action>`
 */
export const PERMISSION_KEYS = {
  // Organization (cross-module)
  ORG_USERS_MANAGE: 'org.users.manage',
  ORG_USERS_VIEW: 'org.users.view',
  ORG_ROLES_MANAGE: 'org.roles.manage',
  ORG_MODULES_MANAGE: 'org.modules.manage',
  ORG_BILLING_MANAGE: 'org.billing.manage',
  ORG_PROFILE_UPDATE: 'org.profile.update',
  ORG_TRIAL_EXTEND: 'org.trial.extend',
  ORG_SETTINGS_VIEW: 'org.settings.view',

  // Cross-product shells (VeriHub console)
  COMPLIANCE_VIEW: 'compliance.view',
  PROJECTS_MANAGE: 'projects.manage',

  // Platform
  PLATFORM_ADMIN: 'platform.admin',

  // VeriCore
  VERICORE_AUDIT_VIEW: 'vericore.audit.view',
  VERICORE_AUDIT_EDIT: 'vericore.audit.edit',
  VERICORE_WORKERS_VIEW: 'vericore.workers.view',
  VERICORE_WORKERS_EDIT: 'vericore.workers.edit',
  VERICORE_CREDENTIALS_VIEW: 'vericore.credentials.view',
  VERICORE_CREDENTIALS_EDIT: 'vericore.credentials.edit',
  VERICORE_COMPLIANCE_MANAGE: 'vericore.compliance.manage',

  // VeriPM
  VERIPM_PROJECT_VIEW: 'veripm.project.view',
  VERIPM_PROJECT_EDIT: 'veripm.project.edit',
  VERIPM_TASK_VIEW: 'veripm.task.view',
  VERIPM_TASK_EDIT: 'veripm.task.edit',
  VERIPM_TIMELINE_VIEW: 'veripm.timeline.view',
  VERIPM_TIMELINE_EDIT: 'veripm.timeline.edit',
  VERIPM_SAFETY_MANAGE: 'veripm.safety.manage',

  // VeriHub
  VERIHUB_FILE_VIEW: 'verihub.file.view',
  VERIHUB_FILE_UPLOAD: 'verihub.file.upload',
  VERIHUB_FILE_DELETE: 'verihub.file.delete',
  VERIHUB_COLLAB_VIEW: 'verihub.collab.view',
  VERIHUB_COLLAB_EDIT: 'verihub.collab.edit',
  VERIHUB_CALCULATORS_USE: 'verihub.calculators.use',
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export const PERMISSIONS = PERMISSION_KEYS;

export interface PermissionDef {
  key: PermissionKey;
  name: string;
  module: ModuleCode | 'org' | 'platform';
}

/** Full catalog used by seed + ModulePermissionService. */
export const PERMISSION_CATALOG: PermissionDef[] = [
  { key: PERMISSION_KEYS.ORG_USERS_MANAGE, name: 'Manage organization users', module: 'org' },
  { key: PERMISSION_KEYS.ORG_USERS_VIEW, name: 'View organization users', module: 'org' },
  { key: PERMISSION_KEYS.ORG_ROLES_MANAGE, name: 'Manage organization roles', module: 'org' },
  { key: PERMISSION_KEYS.ORG_MODULES_MANAGE, name: 'Manage organization modules', module: 'org' },
  { key: PERMISSION_KEYS.ORG_BILLING_MANAGE, name: 'Manage organization billing', module: 'org' },
  { key: PERMISSION_KEYS.ORG_PROFILE_UPDATE, name: 'Update organization profile', module: 'org' },
  { key: PERMISSION_KEYS.ORG_TRIAL_EXTEND, name: 'Extend organization trial', module: 'org' },
  { key: PERMISSION_KEYS.ORG_SETTINGS_VIEW, name: 'View organization settings', module: 'org' },
  { key: PERMISSION_KEYS.COMPLIANCE_VIEW, name: 'View compliance center', module: 'org' },
  { key: PERMISSION_KEYS.PROJECTS_MANAGE, name: 'Manage projects', module: 'org' },
  { key: PERMISSION_KEYS.PLATFORM_ADMIN, name: 'Platform administrator', module: 'platform' },

  { key: PERMISSION_KEYS.VERICORE_AUDIT_VIEW, name: 'View VeriCore audits', module: 'vericore' },
  { key: PERMISSION_KEYS.VERICORE_AUDIT_EDIT, name: 'Edit VeriCore audits', module: 'vericore' },
  { key: PERMISSION_KEYS.VERICORE_WORKERS_VIEW, name: 'View workers', module: 'vericore' },
  { key: PERMISSION_KEYS.VERICORE_WORKERS_EDIT, name: 'Edit workers', module: 'vericore' },
  { key: PERMISSION_KEYS.VERICORE_CREDENTIALS_VIEW, name: 'View credentials', module: 'vericore' },
  { key: PERMISSION_KEYS.VERICORE_CREDENTIALS_EDIT, name: 'Edit credentials', module: 'vericore' },
  { key: PERMISSION_KEYS.VERICORE_COMPLIANCE_MANAGE, name: 'Manage compliance workflows', module: 'vericore' },

  { key: PERMISSION_KEYS.VERIPM_PROJECT_VIEW, name: 'View projects', module: 'veripm' },
  { key: PERMISSION_KEYS.VERIPM_PROJECT_EDIT, name: 'Edit projects', module: 'veripm' },
  { key: PERMISSION_KEYS.VERIPM_TASK_VIEW, name: 'View tasks', module: 'veripm' },
  { key: PERMISSION_KEYS.VERIPM_TASK_EDIT, name: 'Edit tasks', module: 'veripm' },
  { key: PERMISSION_KEYS.VERIPM_TIMELINE_VIEW, name: 'View timelines', module: 'veripm' },
  { key: PERMISSION_KEYS.VERIPM_TIMELINE_EDIT, name: 'Edit timelines', module: 'veripm' },
  { key: PERMISSION_KEYS.VERIPM_SAFETY_MANAGE, name: 'Manage VeriPM safety', module: 'veripm' },

  { key: PERMISSION_KEYS.VERIHUB_FILE_VIEW, name: 'View Hub files', module: 'verihub' },
  { key: PERMISSION_KEYS.VERIHUB_FILE_UPLOAD, name: 'Upload Hub files', module: 'verihub' },
  { key: PERMISSION_KEYS.VERIHUB_FILE_DELETE, name: 'Delete Hub files', module: 'verihub' },
  { key: PERMISSION_KEYS.VERIHUB_COLLAB_VIEW, name: 'View Hub collaboration', module: 'verihub' },
  { key: PERMISSION_KEYS.VERIHUB_COLLAB_EDIT, name: 'Edit Hub collaboration', module: 'verihub' },
  { key: PERMISSION_KEYS.VERIHUB_CALCULATORS_USE, name: 'Use Hub calculators', module: 'verihub' },
];

/** Permissions bundled per product module (module_permissions). */
export const MODULE_PERMISSION_BUNDLES: Record<ModuleCode, PermissionKey[]> = {
  vericore: [
    PERMISSION_KEYS.VERICORE_AUDIT_VIEW,
    PERMISSION_KEYS.VERICORE_AUDIT_EDIT,
    PERMISSION_KEYS.VERICORE_WORKERS_VIEW,
    PERMISSION_KEYS.VERICORE_WORKERS_EDIT,
    PERMISSION_KEYS.VERICORE_CREDENTIALS_VIEW,
    PERMISSION_KEYS.VERICORE_CREDENTIALS_EDIT,
    PERMISSION_KEYS.VERICORE_COMPLIANCE_MANAGE,
  ],
  veripm: [
    PERMISSION_KEYS.VERIPM_PROJECT_VIEW,
    PERMISSION_KEYS.VERIPM_PROJECT_EDIT,
    PERMISSION_KEYS.VERIPM_TASK_VIEW,
    PERMISSION_KEYS.VERIPM_TASK_EDIT,
    PERMISSION_KEYS.VERIPM_TIMELINE_VIEW,
    PERMISSION_KEYS.VERIPM_TIMELINE_EDIT,
    PERMISSION_KEYS.VERIPM_SAFETY_MANAGE,
  ],
  verihub: [
    PERMISSION_KEYS.VERIHUB_FILE_VIEW,
    PERMISSION_KEYS.VERIHUB_FILE_UPLOAD,
    PERMISSION_KEYS.VERIHUB_FILE_DELETE,
    PERMISSION_KEYS.VERIHUB_COLLAB_VIEW,
    PERMISSION_KEYS.VERIHUB_COLLAB_EDIT,
    PERMISSION_KEYS.VERIHUB_CALCULATORS_USE,
  ],
};

/**
 * Default role → permission templates (role_permissions).
 * Module keys listed here are the *ceiling*; runtime intersects with org-enabled modules.
 */
export const ROLE_PERMISSION_DEFAULTS: Record<SystemRoleCode, PermissionKey[]> = {
  owner: PERMISSION_CATALOG.map((p) => p.key).filter((k) => k !== PERMISSION_KEYS.PLATFORM_ADMIN),

  admin: PERMISSION_CATALOG.map((p) => p.key).filter(
    (k) => k !== PERMISSION_KEYS.PLATFORM_ADMIN && k !== PERMISSION_KEYS.ORG_TRIAL_EXTEND,
  ),

  manager: [
    PERMISSION_KEYS.ORG_SETTINGS_VIEW,
    PERMISSION_KEYS.ORG_USERS_VIEW,
    PERMISSION_KEYS.COMPLIANCE_VIEW,
    PERMISSION_KEYS.PROJECTS_MANAGE,
    // VeriCore — full operational except compliance.manage optional include
    PERMISSION_KEYS.VERICORE_AUDIT_VIEW,
    PERMISSION_KEYS.VERICORE_AUDIT_EDIT,
    PERMISSION_KEYS.VERICORE_WORKERS_VIEW,
    PERMISSION_KEYS.VERICORE_WORKERS_EDIT,
    PERMISSION_KEYS.VERICORE_CREDENTIALS_VIEW,
    PERMISSION_KEYS.VERICORE_CREDENTIALS_EDIT,
    PERMISSION_KEYS.VERICORE_COMPLIANCE_MANAGE,
    // VeriPM
    PERMISSION_KEYS.VERIPM_PROJECT_VIEW,
    PERMISSION_KEYS.VERIPM_PROJECT_EDIT,
    PERMISSION_KEYS.VERIPM_TASK_VIEW,
    PERMISSION_KEYS.VERIPM_TASK_EDIT,
    PERMISSION_KEYS.VERIPM_TIMELINE_VIEW,
    PERMISSION_KEYS.VERIPM_TIMELINE_EDIT,
    PERMISSION_KEYS.VERIPM_SAFETY_MANAGE,
    // VeriHub — no delete
    PERMISSION_KEYS.VERIHUB_FILE_VIEW,
    PERMISSION_KEYS.VERIHUB_FILE_UPLOAD,
    PERMISSION_KEYS.VERIHUB_COLLAB_VIEW,
    PERMISSION_KEYS.VERIHUB_COLLAB_EDIT,
    PERMISSION_KEYS.VERIHUB_CALCULATORS_USE,
  ],

  user: [
    PERMISSION_KEYS.ORG_SETTINGS_VIEW,
    PERMISSION_KEYS.ORG_USERS_VIEW,
    PERMISSION_KEYS.COMPLIANCE_VIEW,
    PERMISSION_KEYS.VERICORE_AUDIT_VIEW,
    PERMISSION_KEYS.VERICORE_WORKERS_VIEW,
    PERMISSION_KEYS.VERICORE_CREDENTIALS_VIEW,
    PERMISSION_KEYS.VERIPM_PROJECT_VIEW,
    PERMISSION_KEYS.VERIPM_TASK_VIEW,
    PERMISSION_KEYS.VERIPM_TIMELINE_VIEW,
    PERMISSION_KEYS.VERIHUB_FILE_VIEW,
    PERMISSION_KEYS.VERIHUB_COLLAB_VIEW,
    PERMISSION_KEYS.VERIHUB_CALCULATORS_USE,
  ],
};

/** Always effective regardless of module enablement (if present on role). */
export function isOrgOrPlatformPermission(key: string): boolean {
  return key.startsWith('org.') || key.startsWith('platform.');
}

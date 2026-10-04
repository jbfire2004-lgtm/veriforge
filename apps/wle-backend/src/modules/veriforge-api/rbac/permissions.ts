export const VERIFORGE_PERMISSIONS = {
  USER_READ: 'user.read',
  USER_WRITE: 'user.write',
  USER_DELETE: 'user.delete',
  TRAINING_ASSIGN: 'training.assign',
  TRAINING_UPDATE: 'training.update',
  TRAINING_VIEW: 'training.view',
  VERIFICATION_START: 'verification.start',
  VERIFICATION_COMPLETE: 'verification.complete',
  VERIFICATION_VIEW: 'verification.view',
  COMPLIANCE_UPDATE: 'compliance.update',
  COMPLIANCE_VIEW: 'compliance.view',
  AUDIT_VIEW: 'audit.view',
  SETTINGS_UPDATE: 'settings.update',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  AUDIT_WRITE: 'audit.write',
} as const;

export type VeriForgePermission =
  (typeof VERIFORGE_PERMISSIONS)[keyof typeof VERIFORGE_PERMISSIONS];

export type VeriForgeRoleName =
  | 'SuperAdmin'
  | 'Admin'
  | 'SafetyManager'
  | 'Supervisor'
  | 'Worker'
  | 'Auditor';

const ALL_PERMISSIONS: VeriForgePermission[] = Object.values(
  VERIFORGE_PERMISSIONS,
);

export const VERIFORGE_ROLE_PERMISSIONS: Record<
  VeriForgeRoleName,
  VeriForgePermission[]
> = {
  SuperAdmin: ALL_PERMISSIONS,
  Admin: ALL_PERMISSIONS,
  SafetyManager: [
    VERIFORGE_PERMISSIONS.TRAINING_ASSIGN,
    VERIFORGE_PERMISSIONS.TRAINING_UPDATE,
    VERIFORGE_PERMISSIONS.TRAINING_VIEW,
    VERIFORGE_PERMISSIONS.VERIFICATION_START,
    VERIFORGE_PERMISSIONS.VERIFICATION_COMPLETE,
    VERIFORGE_PERMISSIONS.VERIFICATION_VIEW,
    VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE,
    VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW,
    VERIFORGE_PERMISSIONS.AUDIT_VIEW,
    VERIFORGE_PERMISSIONS.AUDIT_WRITE,
  ],
  Supervisor: [
    VERIFORGE_PERMISSIONS.TRAINING_ASSIGN,
    VERIFORGE_PERMISSIONS.TRAINING_VIEW,
    VERIFORGE_PERMISSIONS.VERIFICATION_VIEW,
  ],
  Worker: [
    VERIFORGE_PERMISSIONS.TRAINING_VIEW,
    VERIFORGE_PERMISSIONS.VERIFICATION_START,
    VERIFORGE_PERMISSIONS.VERIFICATION_COMPLETE,
  ],
  Auditor: [
    VERIFORGE_PERMISSIONS.TRAINING_VIEW,
    VERIFORGE_PERMISSIONS.VERIFICATION_VIEW,
    VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW,
    VERIFORGE_PERMISSIONS.AUDIT_VIEW,
  ],
};

export function normalizeVeriForgeRoleName(
  value?: string | null,
): VeriForgeRoleName | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'superadmin') return 'SuperAdmin';
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'safetymanager') return 'SafetyManager';
  if (normalized === 'supervisor') return 'Supervisor';
  if (normalized === 'worker') return 'Worker';
  if (normalized === 'auditor') return 'Auditor';
  return null;
}

import type { UserRole } from '@prisma/client';

/** Authenticated request principal (from JwtStrategy). */
export type SecurityActor = {
  id: number;
  userId?: number;
  email?: string;
  role: UserRole;
  companyId: number | null;
  companyName?: string | null;
  trainingProviderId?: number | null;
  instructorId?: number | null;
};

export const Permission = {
  WORKER_VIEW: 'worker.view',
  WORKER_EDIT: 'worker.edit',
  INSPECTION_VIEW: 'inspection.view',
  INSPECTION_EDIT: 'inspection.edit',
  INSPECTION_SUBMIT: 'inspection.submit',
  TEMPLATE_MANAGE: 'template.manage',
  COMPANY_READINESS_VIEW: 'company.readiness.view',
  PM_ACCESS: 'pm.access',
  CORE_ACCESS: 'core.access',
  ADMIN_ACCESS: 'admin.access',
  CONTRACTOR_PORTAL_ACCESS: 'contractor.portal.access',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

export type TenantResource =
  | { kind: 'company'; companyId: number }
  | { kind: 'worker'; workerId: number }
  | { kind: 'inspection'; inspectionId: string }
  | { kind: 'equipment'; equipmentId: number };

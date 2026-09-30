import { UserRole } from '@prisma/client';

/** Vera platform super-admin (legacy ADMIN maps here). */
export const SUPER_ADMIN_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
];

export const UNION_HALL_ROLES: UserRole[] = [
  UserRole.UNION_HALL_ADMIN,
  ...SUPER_ADMIN_ROLES,
];

export const COMPANY_ADMIN_ROLES: UserRole[] = [
  UserRole.COMPANY_ADMIN,
  ...SUPER_ADMIN_ROLES,
];

export const SUPERVISOR_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
  ...COMPANY_ADMIN_ROLES,
];

export const TRAINING_PROVIDER_ADMIN_ROLES: UserRole[] = [
  UserRole.TRAINING_PROVIDER_ADMIN,
  ...SUPER_ADMIN_ROLES,
];

export const TRAINING_INSTRUCTOR_ROLES: UserRole[] = [
  UserRole.TRAINING_INSTRUCTOR,
  ...TRAINING_PROVIDER_ADMIN_ROLES,
];

/** Instructor-only (excludes provider admin-only routes). */
export const TRAINING_INSTRUCTOR_ONLY_ROLES: UserRole[] = [
  UserRole.TRAINING_INSTRUCTOR,
  ...SUPER_ADMIN_ROLES,
];

export const CONTRACTOR_ROLES: UserRole[] = [
  UserRole.CONTRACTOR_ADMIN,
  UserRole.CONTRACTOR_USER,
];

export const STAFF_ROLES: UserRole[] = [
  ...SUPERVISOR_ROLES,
  UserRole.WORKER,
  ...TRAINING_INSTRUCTOR_ROLES,
];

export function isSuperAdmin(role: UserRole): boolean {
  return SUPER_ADMIN_ROLES.includes(role);
}

export function isUnionHallAdmin(role: UserRole): boolean {
  return UNION_HALL_ROLES.includes(role);
}

export function isCompanyAdmin(role: UserRole): boolean {
  return COMPANY_ADMIN_ROLES.includes(role);
}

export function isSupervisor(role: UserRole): boolean {
  return SUPERVISOR_ROLES.includes(role);
}

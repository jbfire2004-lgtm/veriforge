import { UserRole } from '@prisma/client';

export enum TrainingProviderPermission {
  MANAGE_PROVIDER_PROFILE = 'MANAGE_PROVIDER_PROFILE',
  MANAGE_INSTRUCTORS = 'MANAGE_INSTRUCTORS',
  MANAGE_COURSES = 'MANAGE_COURSES',
  UPLOAD_TRAINING = 'UPLOAD_TRAINING',
  ISSUE_CERTIFICATES = 'ISSUE_CERTIFICATES',
  VIEW_PROVIDER_COMPLIANCE = 'VIEW_PROVIDER_COMPLIANCE',
  VIEW_TRAINING_HISTORY = 'VIEW_TRAINING_HISTORY',
  MANAGE_APPROVAL_STATUS = 'MANAGE_APPROVAL_STATUS',
  REQUEST_APPROVAL = 'REQUEST_APPROVAL',
  DELIVER_TRAINING = 'DELIVER_TRAINING',
  UPLOAD_CLASS_LISTS = 'UPLOAD_CLASS_LISTS',
  UPLOAD_CERTIFICATES = 'UPLOAD_CERTIFICATES',
  SIGN_CERTIFICATES = 'SIGN_CERTIFICATES',
  VIEW_INSTRUCTOR_PROFILE = 'VIEW_INSTRUCTOR_PROFILE',
}

const PROVIDER_ADMIN_PERMISSIONS: TrainingProviderPermission[] = [
  TrainingProviderPermission.MANAGE_PROVIDER_PROFILE,
  TrainingProviderPermission.MANAGE_INSTRUCTORS,
  TrainingProviderPermission.MANAGE_COURSES,
  TrainingProviderPermission.UPLOAD_TRAINING,
  TrainingProviderPermission.ISSUE_CERTIFICATES,
  TrainingProviderPermission.VIEW_PROVIDER_COMPLIANCE,
  TrainingProviderPermission.VIEW_TRAINING_HISTORY,
  TrainingProviderPermission.MANAGE_APPROVAL_STATUS,
  TrainingProviderPermission.REQUEST_APPROVAL,
  TrainingProviderPermission.UPLOAD_CERTIFICATES,
  TrainingProviderPermission.SIGN_CERTIFICATES,
];

const INSTRUCTOR_PERMISSIONS: TrainingProviderPermission[] = [
  TrainingProviderPermission.DELIVER_TRAINING,
  TrainingProviderPermission.UPLOAD_TRAINING,
  TrainingProviderPermission.UPLOAD_CLASS_LISTS,
  TrainingProviderPermission.UPLOAD_CERTIFICATES,
  TrainingProviderPermission.ISSUE_CERTIFICATES,
  TrainingProviderPermission.SIGN_CERTIFICATES,
  TrainingProviderPermission.VIEW_INSTRUCTOR_PROFILE,
  TrainingProviderPermission.VIEW_TRAINING_HISTORY,
];

const PLATFORM_OVERRIDE_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.COMPANY_ADMIN,
];

export function hasTrainingProviderPermission(
  role: UserRole,
  permission: TrainingProviderPermission,
): boolean {
  if (PLATFORM_OVERRIDE_ROLES.includes(role)) return true;
  if (role === UserRole.TRAINING_PROVIDER_ADMIN) {
    return PROVIDER_ADMIN_PERMISSIONS.includes(permission);
  }
  if (role === UserRole.TRAINING_INSTRUCTOR) {
    return INSTRUCTOR_PERMISSIONS.includes(permission);
  }
  return false;
}

export function assertTrainingProviderPermission(
  role: UserRole,
  permission: TrainingProviderPermission,
): void {
  if (!hasTrainingProviderPermission(role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}

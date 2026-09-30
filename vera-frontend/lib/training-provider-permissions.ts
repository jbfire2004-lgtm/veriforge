import { Phase1Role, type Phase1RoleString, isSuperAdmin } from "@/lib/phase1-roles";

export const ProviderPermission = {
  MANAGE_PROVIDER_PROFILE: "MANAGE_PROVIDER_PROFILE",
  MANAGE_INSTRUCTORS: "MANAGE_INSTRUCTORS",
  MANAGE_COURSES: "MANAGE_COURSES",
  UPLOAD_TRAINING: "UPLOAD_TRAINING",
  ISSUE_CERTIFICATES: "ISSUE_CERTIFICATES",
  VIEW_PROVIDER_COMPLIANCE: "VIEW_PROVIDER_COMPLIANCE",
  VIEW_TRAINING_HISTORY: "VIEW_TRAINING_HISTORY",
  MANAGE_APPROVAL_STATUS: "MANAGE_APPROVAL_STATUS",
  REQUEST_APPROVAL: "REQUEST_APPROVAL",
  DELIVER_TRAINING: "DELIVER_TRAINING",
  UPLOAD_CLASS_LISTS: "UPLOAD_CLASS_LISTS",
  UPLOAD_CERTIFICATES: "UPLOAD_CERTIFICATES",
  SIGN_CERTIFICATES: "SIGN_CERTIFICATES",
  VIEW_INSTRUCTOR_PROFILE: "VIEW_INSTRUCTOR_PROFILE",
} as const;

export type ProviderPermissionString =
  (typeof ProviderPermission)[keyof typeof ProviderPermission];

const ADMIN_PERMS: ProviderPermissionString[] = [
  ProviderPermission.MANAGE_PROVIDER_PROFILE,
  ProviderPermission.MANAGE_INSTRUCTORS,
  ProviderPermission.MANAGE_COURSES,
  ProviderPermission.UPLOAD_TRAINING,
  ProviderPermission.ISSUE_CERTIFICATES,
  ProviderPermission.VIEW_PROVIDER_COMPLIANCE,
  ProviderPermission.VIEW_TRAINING_HISTORY,
  ProviderPermission.MANAGE_APPROVAL_STATUS,
  ProviderPermission.REQUEST_APPROVAL,
  ProviderPermission.UPLOAD_CERTIFICATES,
  ProviderPermission.SIGN_CERTIFICATES,
];

const INSTRUCTOR_PERMS: ProviderPermissionString[] = [
  ProviderPermission.DELIVER_TRAINING,
  ProviderPermission.UPLOAD_TRAINING,
  ProviderPermission.UPLOAD_CLASS_LISTS,
  ProviderPermission.UPLOAD_CERTIFICATES,
  ProviderPermission.ISSUE_CERTIFICATES,
  ProviderPermission.SIGN_CERTIFICATES,
  ProviderPermission.VIEW_INSTRUCTOR_PROFILE,
  ProviderPermission.VIEW_TRAINING_HISTORY,
];

export function providerPermissions(role: string | null): ProviderPermissionString[] {
  if (isSuperAdmin(role)) return [...ADMIN_PERMS, ...INSTRUCTOR_PERMS];
  if (role === Phase1Role.TRAINING_PROVIDER_ADMIN) return ADMIN_PERMS;
  if (role === Phase1Role.TRAINING_INSTRUCTOR) return INSTRUCTOR_PERMS;
  return [];
}

export function hasProviderPermission(
  role: string | null,
  permission: ProviderPermissionString
): boolean {
  return providerPermissions(role).includes(permission);
}

export function isTrainingProviderAdmin(role: string | null): boolean {
  return role === Phase1Role.TRAINING_PROVIDER_ADMIN || isSuperAdmin(role);
}

export function isTrainingInstructor(role: string | null): boolean {
  return role === Phase1Role.TRAINING_INSTRUCTOR;
}

export function canAccessProviderAdminPortal(role: string | null): boolean {
  return isTrainingProviderAdmin(role);
}

export function canAccessProviderInstructorPortal(role: string | null): boolean {
  return (
    isTrainingInstructor(role) ||
    isTrainingProviderAdmin(role) ||
    isSuperAdmin(role)
  );
}

export function canAccessProviderPortal(role: string | null): boolean {
  return canAccessProviderInstructorPortal(role);
}

export function defaultProviderPortalPath(role: string | null): string {
  if (isTrainingInstructor(role) && !isTrainingProviderAdmin(role)) {
    return "/provider-portal/instructor";
  }
  return "/provider-portal";
}

import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../types/api";

export function usePermissions() {
  const auth = useAuth();

  return {
    can: auth.can,
    isOwnerOrAdmin: auth.user?.role === "owner" || auth.user?.role === "admin",
    canManageBilling: auth.can(PERMISSIONS.ORG_BILLING_MANAGE),
    canManageUsers: auth.can(PERMISSIONS.ORG_USERS_MANAGE),
    canUpdateOrg: auth.can(PERMISSIONS.ORG_PROFILE_UPDATE),
    role: auth.user?.role,
  };
}

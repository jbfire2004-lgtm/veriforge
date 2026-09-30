import type { ReactNode } from "react";
import {
  VeriForgeAppShell,
  VERIFORGE_UI_PERMISSIONS,
  type VeriForgeNavItem,
  type VeriForgeUiPermission,
} from "@/components/veriforge";
import {
  VERIFORGE_ROUTES,
  type VeriForgeRoutePermissionKey,
} from "@/src/router";

const PERMISSION_MAP: Record<
  VeriForgeRoutePermissionKey,
  VeriForgeUiPermission
> = {
  TRAINING_VIEW: VERIFORGE_UI_PERMISSIONS.TRAINING_VIEW,
  USER_READ: VERIFORGE_UI_PERMISSIONS.USER_READ,
  VERIFICATION_VIEW: VERIFORGE_UI_PERMISSIONS.VERIFICATION_VIEW,
  COMPLIANCE_VIEW: VERIFORGE_UI_PERMISSIONS.COMPLIANCE_VIEW,
  AUDIT_VIEW: VERIFORGE_UI_PERMISSIONS.AUDIT_VIEW,
  NOTIFICATIONS_MANAGE: VERIFORGE_UI_PERMISSIONS.NOTIFICATIONS_MANAGE,
  SETTINGS_UPDATE: VERIFORGE_UI_PERMISSIONS.SETTINGS_UPDATE,
};

/** Nav derived from forged-metal route registry (title, section, icon, critical) */
const navItems: VeriForgeNavItem[] = VERIFORGE_ROUTES.map((route) => ({
  label: route.title,
  href: route.path,
  permission: route.permission
    ? PERMISSION_MAP[route.permission]
    : undefined,
  icon: route.icon,
  critical: route.critical,
  section: route.section,
}));

export default function VeriForgeMainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <VeriForgeAppShell
      title="VERIFORGE CONTROL SURFACE"
      subtitle="Strength. Precision. Industrial reliability."
      navItems={navItems}
    >
      {children}
    </VeriForgeAppShell>
  );
}

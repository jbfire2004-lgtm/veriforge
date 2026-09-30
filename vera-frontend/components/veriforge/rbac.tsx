"use client";

import * as React from "react";

export const VERIFORGE_UI_PERMISSIONS = {
  USER_READ: "user.read",
  USER_WRITE: "user.write",
  USER_DELETE: "user.delete",
  TRAINING_ASSIGN: "training.assign",
  TRAINING_UPDATE: "training.update",
  TRAINING_VIEW: "training.view",
  VERIFICATION_START: "verification.start",
  VERIFICATION_COMPLETE: "verification.complete",
  VERIFICATION_VIEW: "verification.view",
  COMPLIANCE_UPDATE: "compliance.update",
  COMPLIANCE_VIEW: "compliance.view",
  AUDIT_VIEW: "audit.view",
  AUDIT_WRITE: "audit.write",
  SETTINGS_UPDATE: "settings.update",
  NOTIFICATIONS_MANAGE: "notifications.manage",
} as const;

export type VeriForgeUiPermission =
  (typeof VERIFORGE_UI_PERMISSIONS)[keyof typeof VERIFORGE_UI_PERMISSIONS];

export type VeriForgeUiRole =
  | "SuperAdmin"
  | "Admin"
  | "SafetyManager"
  | "Supervisor"
  | "Worker"
  | "Auditor";

const ALL_PERMISSIONS: VeriForgeUiPermission[] = Object.values(VERIFORGE_UI_PERMISSIONS);

export const VERIFORGE_UI_ROLE_MATRIX: Record<VeriForgeUiRole, VeriForgeUiPermission[]> = {
  SuperAdmin: ALL_PERMISSIONS,
  Admin: ALL_PERMISSIONS,
  SafetyManager: [
    VERIFORGE_UI_PERMISSIONS.TRAINING_ASSIGN,
    VERIFORGE_UI_PERMISSIONS.TRAINING_UPDATE,
    VERIFORGE_UI_PERMISSIONS.TRAINING_VIEW,
    VERIFORGE_UI_PERMISSIONS.VERIFICATION_START,
    VERIFORGE_UI_PERMISSIONS.VERIFICATION_COMPLETE,
    VERIFORGE_UI_PERMISSIONS.VERIFICATION_VIEW,
    VERIFORGE_UI_PERMISSIONS.COMPLIANCE_UPDATE,
    VERIFORGE_UI_PERMISSIONS.COMPLIANCE_VIEW,
    VERIFORGE_UI_PERMISSIONS.AUDIT_VIEW,
    VERIFORGE_UI_PERMISSIONS.AUDIT_WRITE,
  ],
  Supervisor: [
    VERIFORGE_UI_PERMISSIONS.TRAINING_ASSIGN,
    VERIFORGE_UI_PERMISSIONS.TRAINING_VIEW,
    VERIFORGE_UI_PERMISSIONS.VERIFICATION_VIEW,
  ],
  Worker: [
    VERIFORGE_UI_PERMISSIONS.TRAINING_VIEW,
    VERIFORGE_UI_PERMISSIONS.VERIFICATION_START,
    VERIFORGE_UI_PERMISSIONS.VERIFICATION_COMPLETE,
  ],
  Auditor: [
    VERIFORGE_UI_PERMISSIONS.TRAINING_VIEW,
    VERIFORGE_UI_PERMISSIONS.VERIFICATION_VIEW,
    VERIFORGE_UI_PERMISSIONS.COMPLIANCE_VIEW,
    VERIFORGE_UI_PERMISSIONS.AUDIT_VIEW,
  ],
};

type VeriForgeRbacContextValue = {
  role: VeriForgeUiRole;
  setRole: (role: VeriForgeUiRole) => void;
  hasPermission: (permission: VeriForgeUiPermission) => boolean;
  roleSwitchEnabled: boolean;
};

const VeriForgeRbacContext = React.createContext<VeriForgeRbacContextValue | null>(null);

const STORAGE_KEY = "veriforge:ui:role";
const SESSION_KEY = "veriforge.tenant.session";
const DEMO_ROLE_SWITCH =
  process.env.NEXT_PUBLIC_VERIFORGE_DEMO_ROLE_SWITCH === "true";

function readSessionRole(): VeriForgeUiRole | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { role?: string };
    if (parsed.role && parsed.role in VERIFORGE_UI_ROLE_MATRIX) {
      return parsed.role as VeriForgeUiRole;
    }
  } catch {
    return null;
  }
  return null;
}

export function VeriForgeRbacProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<VeriForgeUiRole>(() => {
    const locked = readSessionRole();
    if (locked) return locked;
    if (typeof window === "undefined") return "Worker";
    const stored = window.localStorage.getItem(STORAGE_KEY) as VeriForgeUiRole | null;
    return stored && stored in VERIFORGE_UI_ROLE_MATRIX ? stored : "Worker";
  });

  React.useEffect(() => {
    const locked = readSessionRole();
    if (locked) setRoleState(locked);
  }, []);

  const setRole = React.useCallback((nextRole: VeriForgeUiRole) => {
    if (!DEMO_ROLE_SWITCH && readSessionRole()) return;
    setRoleState(nextRole);
    window.localStorage.setItem(STORAGE_KEY, nextRole);
  }, []);

  const hasPermission = React.useCallback(
    (permission: VeriForgeUiPermission) =>
      VERIFORGE_UI_ROLE_MATRIX[role].includes(permission),
    [role],
  );

  return (
    <VeriForgeRbacContext.Provider
      value={{
        role,
        setRole,
        hasPermission,
        roleSwitchEnabled: DEMO_ROLE_SWITCH,
      }}
    >
      {children}
    </VeriForgeRbacContext.Provider>
  );
}

export function useVeriForgeRbac() {
  const ctx = React.useContext(VeriForgeRbacContext);
  if (!ctx) throw new Error("useVeriForgeRbac must be used within VeriForgeRbacProvider");
  return ctx;
}

export function VeriForgeCan({
  permission,
  children,
  fallback = null,
}: {
  permission: VeriForgeUiPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = useVeriForgeRbac();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}


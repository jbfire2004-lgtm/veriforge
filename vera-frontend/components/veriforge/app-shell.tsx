"use client";

import * as React from "react";
import {
  VFAppShell,
  type VFNavItem,
} from "@/src/layouts";
import { VeriForgeLogo } from "./logo";
import { VeriForgeButton } from "./button";
import {
  VeriForgeNotificationCenter,
  VeriForgeNotificationProvider,
  VeriForgeToastStack,
  useVeriForgeNotifications,
} from "./notifications";
import {
  VERIFORGE_UI_PERMISSIONS,
  VeriForgeRbacProvider,
  useVeriForgeRbac,
  type VeriForgeUiPermission,
  type VeriForgeUiRole,
} from "./rbac";
import { VeriForgeAssistantDock } from "./ai-assistant";
import type { VeriForgeNavItem } from "./navigation";

type VeriForgeAppShellProps = {
  title: string;
  subtitle?: string;
  navItems: VeriForgeNavItem[];
  children: React.ReactNode;
};

export function VeriForgeAppShell({
  title,
  subtitle,
  navItems,
  children,
}: VeriForgeAppShellProps) {
  return (
    <VeriForgeRbacProvider>
      <VeriForgeNotificationProvider>
        <VeriForgeAppShellInner title={title} subtitle={subtitle} navItems={navItems}>
          {children}
        </VeriForgeAppShellInner>
      </VeriForgeNotificationProvider>
    </VeriForgeRbacProvider>
  );
}

function VeriForgeAppShellInner({
  title,
  subtitle,
  navItems,
  children,
}: VeriForgeAppShellProps) {
  const { unreadCount } = useVeriForgeNotifications();
  const { role, setRole, hasPermission, roleSwitchEnabled } = useVeriForgeRbac();
  const [centerOpen, setCenterOpen] = React.useState(false);
  const visibleNavItems = React.useMemo(
    () =>
      navItems.filter(
        (item) =>
          !item.permission ||
          hasPermission(item.permission as VeriForgeUiPermission),
      ),
    [hasPermission, navItems],
  );

  const layoutNav: VFNavItem[] = visibleNavItems.map((item) => ({
    label: item.label,
    href: item.href,
    permission: item.permission,
    icon: item.icon,
    critical: item.critical,
    section: item.section,
    active: item.active,
  }));

  return (
    <VFAppShell
      title={title}
      subtitle={subtitle}
      kicker="VeriForge Safety Platform"
      sidebarTitle="Safety modules"
      navItems={layoutNav}
      footerMeta="Industrial safety compliance · Controlled access"
      headerActions={
        <div className="flex items-center gap-2">
          <VeriForgeLogo compact />
          {roleSwitchEnabled ? (
            <select
            value={role}
            onChange={(event) => setRole(event.target.value as VeriForgeUiRole)}
            className="h-9 rounded-[3px] border border-[#5A6169] bg-[#23272C] px-2 text-xs font-medium text-[#F4F6F8] outline-none focus:border-[#1E6FB8] focus:shadow-[0_0_0_2px_rgba(30,111,184,0.28)]"
            aria-label="VeriForge role selector"
          >
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="Admin">Admin</option>
            <option value="SafetyManager">SafetyManager</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Worker">Worker</option>
            <option value="Auditor">Auditor</option>
          </select>
          ) : (
            <span className="border border-[#5A6169] bg-[#23272C] px-2 py-2 text-[10px] uppercase tracking-[0.1em] text-[#F4F6F8]">
              {role}
            </span>
          )}
          <VeriForgeButton variant="ghost" size="sm">
            Shift log
          </VeriForgeButton>
          {hasPermission(VERIFORGE_UI_PERMISSIONS.NOTIFICATIONS_MANAGE) ? (
            <VeriForgeButton
              variant="secondary"
              size="sm"
              onClick={() => setCenterOpen((value) => !value)}
            >
              Alerts ({unreadCount})
            </VeriForgeButton>
          ) : null}
        </div>
      }
    >
      {children}
      <VeriForgeToastStack />
      <VeriForgeAssistantDock />
      {centerOpen && hasPermission(VERIFORGE_UI_PERMISSIONS.NOTIFICATIONS_MANAGE) ? (
        <div className="fixed right-4 top-24 z-[95] hidden w-[420px] md:block">
          <VeriForgeNotificationCenter />
        </div>
      ) : null}
    </VFAppShell>
  );
}

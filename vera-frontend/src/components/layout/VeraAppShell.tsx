"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { breadcrumbsFromPathname } from "./breadcrumbs-from-path";
import { type VeraShellVariant } from "./shell-nav";
import { canAccessPmWorkspace, isAdmin } from "@/lib/phase1-roles";
import { buildAccountMenuLinks } from "@/lib/navigation/account-nav";
import { UserMenu } from "./UserMenu";
import { FieldChrome, FieldModeToggle } from "@/components/field";
import { SyncStatusBar } from "@/components/field/SyncStatusBar";
import {
  ContentContainer,
  Header,
  ModuleHeader,
} from "@/src/components/navigation";

function homeHrefForVariant(variant: VeraShellVariant): string {
  switch (variant) {
    case "admin":
      return "/admin";
    case "core":
      return "/core";
    case "supervisor":
      return "/supervisor";
    case "workspace":
    default:
      return "/dashboard";
  }
}

export interface VeraAppShellProps {
  variant: VeraShellVariant;
  role: string | null;
  userName?: string | null;
  userEmail?: string | null;
  pageHeader?: React.ReactNode;
  children: React.ReactNode;
}

export function VeraAppShell({
  variant,
  role,
  userName,
  userEmail,
  pageHeader,
  children,
}: VeraAppShellProps) {
  const pathname = usePathname() ?? "/";
  const crumbs = React.useMemo(() => breadcrumbsFromPathname(pathname), [pathname]);
  const homeHref = homeHrefForVariant(variant);
  const showAdminShortcut = isAdmin(role) && variant !== "admin";
  const showPmShortcut = canAccessPmWorkspace(role);
  const displayName = userName?.trim() || userEmail?.trim() || "Signed in";

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Header
        role={role}
        homeHref={homeHref}
        trailing={
          <>
            <SyncStatusBar className="hidden md:inline-flex" />
            <FieldModeToggle className="hidden text-[#D5DBE0] hover:bg-[rgba(30,111,184,0.14)] hover:text-[#F4F6F8] sm:inline-flex" />
            <NotificationBell />
            <UserMenu
              name={displayName}
              email={userEmail ?? null}
              role={role}
              menuLinks={buildAccountMenuLinks(role)}
              showPmLink={showPmShortcut}
              showAdminLink={showAdminShortcut}
              chrome="industrial"
            />
          </>
        }
      />

      <ModuleHeader role={role} />

      <div className="border-b border-[#2A2E33]/12 bg-[#F4F6F8] px-vera-4 py-vera-2 sm:px-vera-6">
        <Breadcrumbs items={crumbs} showHome homeHref={homeHref} />
      </div>

      <main className="vera-shell-bg flex-1 overflow-x-hidden">
        <FieldChrome>
          <ContentContainer key={pathname}>
            {pageHeader}
            {children}
          </ContentContainer>
        </FieldChrome>
      </main>
    </div>
  );
}

export { VeraAppShell as AppLayout };

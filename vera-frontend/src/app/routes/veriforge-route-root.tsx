"use client";

import * as React from "react";
import { VFAppShell } from "@/src/layouts";
import {
  VFRouteProvider,
  toVFNavItems,
  VERIFORGE_ROUTES,
} from "@/src/router";

/**
 * Lightweight route root — VFAppShell + route registry nav.
 * Prefer VeriForgeAppShell when RBAC / notifications are required.
 */
export function VeriForgeRouteRoot({
  title = "VERIFORGE CONTROL SURFACE",
  subtitle = "Strength. Precision. Industrial reliability.",
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const navItems = React.useMemo(() => toVFNavItems(VERIFORGE_ROUTES), []);

  return (
    <VFRouteProvider>
      <VFAppShell
        title={title}
        subtitle={subtitle}
        kicker="VeriForge Control Surface"
        sidebarTitle="VeriForge Core"
        navItems={navItems}
        footerMeta="Forged-metal industrial safety control"
      >
        {children}
      </VFAppShell>
    </VFRouteProvider>
  );
}

export default VeriForgeRouteRoot;

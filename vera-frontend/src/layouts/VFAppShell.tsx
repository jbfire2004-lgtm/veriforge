"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS } from "@/src/theme/veriforge-tokens";
import { VFRouteProvider, VFRouteTransition, useVFRoute } from "@/src/router";
import { VFHeader } from "./VFHeader";
import { VFSidebar } from "./VFSidebar";
import { VFContent } from "./VFContent";
import { VFFooter } from "./VFFooter";
import type { VFNavItem } from "./types";
import styles from "./VFAppShell.module.css";

export interface VFAppShellProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  sidebarTitle?: string;
  navItems?: VFNavItem[];
  headerActions?: React.ReactNode;
  footerMeta?: string;
  footerActions?: React.ReactNode;
  /** When false, children render without VFContent wrapper */
  wrapContent?: boolean;
  contentHeading?: string;
  children: React.ReactNode;
  className?: string;
}

function VFAppShellChrome({
  title,
  subtitle,
  kicker,
  sidebarTitle = "Safety modules",
  navItems = [],
  headerActions,
  footerMeta,
  footerActions,
  wrapContent = true,
  contentHeading,
  children,
  className,
}: VFAppShellProps) {
  const { route, critical } = useVFRoute();
  const heading = contentHeading ?? route.title;

  return (
    <div
      className={cn(styles.shell, "veriforge-theme", className)}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.safetyBlue,
          ["--vf-iron-black" as string]: COLORS.ironBlack,
          ["--vf-steel-grey" as string]: COLORS.steelGrey,
          ["--vf-glow" as string]: "none",
        } as React.CSSProperties
      }
      data-vf-section={route.section}
      data-vf-critical={critical ? "true" : "false"}
    >
      <VFHeader
        title={title}
        subtitle={subtitle}
        kicker={kicker}
        navItems={navItems}
        actions={headerActions}
      />

      <div className={styles.body}>
        <VFSidebar title={sidebarTitle} items={navItems} motionState="open" />
        {wrapContent ? (
          <VFContent heading={heading}>
            <VFRouteTransition>{children}</VFRouteTransition>
          </VFContent>
        ) : (
          <VFRouteTransition>{children}</VFRouteTransition>
        )}
      </div>

      <VFFooter
        meta={footerMeta}
        actions={footerActions}
        mobileNavItems={navItems}
      />
    </div>
  );
}

export function VFAppShell(props: VFAppShellProps) {
  return (
    <VFRouteProvider>
      <VFAppShellChrome {...props} />
    </VFRouteProvider>
  );
}

export default VFAppShell;

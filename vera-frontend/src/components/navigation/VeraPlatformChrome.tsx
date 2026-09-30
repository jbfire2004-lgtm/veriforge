"use client";

import { Header } from "./VeraHeader";
import { ModuleHeader } from "./VeraModuleHeader";

export type VeraPlatformChromeProps = {
  role: string | null;
  homeHref?: string;
  headerClassName?: string;
  moduleHeaderClassName?: string;
  trailing?: React.ReactNode;
  moduleQuickActions?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Layers 1–2 of the official Vera layout: global header + module bar.
 * Wrap page content in {@link ContentContainer} and {@link PageLayout}.
 */
export function VeraPlatformChrome({
  role,
  homeHref,
  headerClassName,
  moduleHeaderClassName,
  trailing,
  moduleQuickActions,
  children,
}: VeraPlatformChromeProps) {
  return (
    <>
      <Header
        role={role}
        homeHref={homeHref}
        className={headerClassName}
        trailing={trailing}
      />
      <ModuleHeader
        role={role}
        className={moduleHeaderClassName}
        quickActions={moduleQuickActions}
      />
      {children}
    </>
  );
}

"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  globalModulesForRole,
  resolveActiveGlobalModule,
  globalModuleHomeHref,
} from "@/lib/navigation/vera-nav-config";
import { VeraNavDropdown } from "./VeraNavDropdown";

type Props = {
  role: string | null;
  className?: string;
  variant?: "default" | "header";
};

/** Master switchboard — always shows all global modules. */
export function VeraGlobalNavDropdown({ role, className, variant = "default" }: Props) {
  const pathname = usePathname() ?? "/";
  const modules = useMemo(() => globalModulesForRole(role), [role]);
  const active = useMemo(() => resolveActiveGlobalModule(pathname), [pathname]);

  const current = active ?? modules[0];
  const Icon = current.icon;

  const items = modules.map((mod) => ({
    id: mod.id,
    label: mod.label,
    href: globalModuleHomeHref(mod, role),
    description: `Open ${mod.label}`,
    icon: mod.icon,
    active: mod.id === current.id,
  }));

  return (
    <VeraNavDropdown
      label="Navigate Vera"
      currentLabel={current.label}
      currentIcon={Icon}
      items={items}
      ariaLabel="Switch Vera module"
      menuDataAttr="global-nav"
      className={className}
      variant={variant}
    />
  );
}

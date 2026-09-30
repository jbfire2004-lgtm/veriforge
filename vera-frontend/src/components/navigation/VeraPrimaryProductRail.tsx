"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import {
  globalModuleHomeHref,
  resolveActiveGlobalModule,
  resolvePrimaryProducts,
} from "@/lib/navigation/vera-nav-config";
import { navChrome } from "./nav-chrome";

type Props = {
  role: string | null;
  className?: string;
};

/**
 * Always-visible product switcher: Vera Hub, Vera Core, Vera PM, FieldOS, VeriAgent.
 */
export function VeraPrimaryProductRail({ role, className }: Props) {
  const pathname = usePathname() ?? "/";
  const products = useMemo(() => resolvePrimaryProducts(), []);
  const active = useMemo(() => resolveActiveGlobalModule(pathname), [pathname]);

  return (
    <nav
      className={cn(navChrome.productRail, className)}
      aria-label="Vera products"
    >
      {products.map((mod) => {
        const href = globalModuleHomeHref(mod, role);
        const isActive = active?.id === mod.id;
        return (
          <Link
            key={mod.id}
            href={href}
            className={cn(
              navChrome.productRailLink,
              isActive && navChrome.productRailLinkActive,
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {mod.label}
          </Link>
        );
      })}
    </nav>
  );
}

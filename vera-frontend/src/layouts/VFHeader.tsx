"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useVFRoute } from "@/src/router";
import type { VFNavItem } from "./types";
import styles from "./VFHeader.module.css";

export interface VFHeaderProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  navItems?: VFNavItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function VFHeader({
  title,
  subtitle,
  kicker = "VeriForge",
  navItems = [],
  actions,
  className,
}: VFHeaderProps) {
  const pathname = usePathname();
  const { route, critical } = useVFRoute();
  const displaySubtitle = subtitle ?? route.description;

  return (
    <header
      className={cn(styles.header, className)}
      data-vf-route-critical={critical ? "true" : "false"}
    >
      <div className={styles.brand}>
        <p className={styles.kicker}>{kicker}</p>
        <h1 className={styles.title}>{title}</h1>
        {displaySubtitle ? (
          <p className={styles.subtitle}>{displaySubtitle}</p>
        ) : null}
      </div>

      {navItems.length > 0 ? (
        <nav className={styles.nav} aria-label="Primary">
          {navItems.slice(0, 8).map((item) => {
            const active =
              item.active ??
              (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  styles.navLink,
                  active && styles.navLinkActive,
                  item.critical && styles.navLinkCritical,
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : (
        <div />
      )}

      {actions ? <div className={styles.actions}>{actions}</div> : <div />}
    </header>
  );
}

export default VFHeader;

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import type { VFNavItem } from "./types";
import styles from "./VFFooter.module.css";

export interface VFFooterProps {
  mark?: string;
  meta?: string;
  actions?: React.ReactNode;
  mobileNavItems?: VFNavItem[];
  className?: string;
}

export function VFFooter({
  mark = "VeriForge",
  meta = "Forged-metal industrial safety control",
  actions,
  mobileNavItems = [],
  className,
}: VFFooterProps) {
  const pathname = usePathname();

  return (
    <footer
      className={cn(styles.footer, className)}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
        } as React.CSSProperties
      }
    >
      {mobileNavItems.length > 0 ? (
        <nav className={styles.mobileNav} aria-label="Mobile">
          {mobileNavItems.slice(0, 4).map((item) => {
            const active =
              item.active ??
              (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  styles.mobileLink,
                  active && styles.mobileLinkActive,
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <p className={styles.mark}>{mark}</p>
      <p className={styles.meta}>{meta}</p>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </footer>
  );
}

export default VFFooter;

"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import {
  VERIFORGE_ICONS,
  type VeriForgeIconCategory,
} from "@/src/icons/veriforge-icons";
import { VFMobileCard } from "./VFMobileCard";
import styles from "./VFMobileQuickLink.module.css";

export interface VFMobileQuickLinkProps {
  href: string;
  title: string;
  subtitle: string;
  icon?: VeriForgeIconCategory | React.ReactNode;
  critical?: boolean;
}

export function VFMobileQuickLink({
  href,
  title,
  subtitle,
  icon = "verification",
  critical,
}: VFMobileQuickLinkProps) {
  const IconComp =
    typeof icon === "string" ? VERIFORGE_ICONS[icon] : null;

  return (
    <Link href={href} className={styles.link}>
      <VFMobileCard soft={!critical} critical={critical}>
        <div className={styles.row}>
          <span className={styles.iconBox}>
            {IconComp ? (
              <IconComp size={18} tone={critical ? "active" : "neutral"} />
            ) : (
              icon
            )}
          </span>
          <div className={styles.copy}>
            <p className={styles.title}>{title}</p>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>
      </VFMobileCard>
    </Link>
  );
}

/** Compat: accepts legacy ReactNode icon */
export function MobileQuickLink({
  href,
  title,
  subtitle,
  icon,
  critical,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  critical?: boolean;
}) {
  return (
    <Link href={href} className={styles.link}>
      <VFMobileCard soft={!critical} critical={critical}>
        <div className={styles.row}>
          <span className={cn(styles.iconBox, styles.iconLegacy)}>{icon}</span>
          <div className={styles.copy}>
            <p className={styles.title}>{title}</p>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>
      </VFMobileCard>
    </Link>
  );
}

export default VFMobileQuickLink;

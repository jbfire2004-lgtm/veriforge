"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import {
  VERIFORGE_ICONS,
} from "@/src/icons/veriforge-icons";
import { MOBILE_BOTTOM_TABS } from "./config";
import styles from "./VFMobileNav.module.css";

export type { MobileNavTab } from "./config";
export { VERIFORGE_MOBILE_BASE } from "./config";

export function VFMobileNav({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className={cn(styles.nav, className)}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
        } as React.CSSProperties
      }
      aria-label="Mobile"
    >
      <div className={styles.inner}>
        {MOBILE_BOTTOM_TABS.map((tab) => {
          const active = tab.match
            ? tab.match(pathname)
            : pathname.startsWith(tab.href);
          const Icon = VERIFORGE_ICONS[tab.icon];
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                styles.tab,
                active && styles.active,
                active && veriforgeMotionClasses.primitives.redGlowPulse,
              )}
            >
              <span className={styles.icon}>
                <Icon
                  size={18}
                  tone={active ? "active" : "neutral"}
                />
              </span>
              <span className={styles.label}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default VFMobileNav;

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { EmergencyIcon } from "@/src/icons/veriforge-icons";
import { VeriForgeLogo } from "@/components/veriforge/logo";
import {
  VeriForgeNotificationProvider,
  VeriForgeToastStack,
  useVeriForgeNotifications,
} from "@/components/veriforge/notifications";
import { VeriForgeRbacProvider } from "@/components/veriforge/rbac";
import { VFMobileNav } from "./VFMobileNav";
import { VFMobilePage } from "./VFMobilePage";
import {
  VERIFORGE_MOBILE_BASE,
  SHELL_HIDDEN_PREFIXES,
} from "./config";
import styles from "./VFMobileShell.module.css";

export function VeriForgeMobileShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VeriForgeRbacProvider>
      <VeriForgeNotificationProvider>
        <VeriForgeMobileShellInner>{children}</VeriForgeMobileShellInner>
      </VeriForgeNotificationProvider>
    </VeriForgeRbacProvider>
  );
}

function VeriForgeMobileShellInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const hideChrome = SHELL_HIDDEN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const { unreadCount } = useVeriForgeNotifications();

  if (hideChrome) {
    return (
      <div
        className={cn(
          styles.shell,
          styles.shellFull,
          "veriforge-theme",
          veriforgeMotionClasses.primitives.metallicFade,
        )}
        style={
          {
            ["--vf-forge-red" as string]: COLORS.forgeRed,
            ["--vf-glow" as string]: SHADOWS.metallicShadow,
          } as React.CSSProperties
        }
      >
        <VFMobilePage>
          <div className={cn(styles.main, styles.mainBare)}>{children}</div>
        </VFMobilePage>
        <VeriForgeToastStack />
      </div>
    );
  }

  return (
    <div
      className={cn(
        styles.shell,
        "veriforge-theme",
        veriforgeMotionClasses.primitives.metallicFade,
      )}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
        } as React.CSSProperties
      }
    >
      <header className={styles.topbar}>
        <div className={styles.topbarRow}>
          <VeriForgeLogo compact />
          <div className={styles.brand}>
            <p className={styles.brandTitle}>VeriForge Field</p>
            <p className={styles.brandSub}>Forged-metal operations</p>
          </div>
          <Link
            href={`${VERIFORGE_MOBILE_BASE}/notifications`}
            className={cn(
              styles.alertBtn,
              unreadCount > 0 && styles.alertBtnActive,
              unreadCount > 0 &&
                veriforgeMotionClasses.primitives.redGlowPulse,
            )}
            aria-label="Notifications"
          >
            <EmergencyIcon
              size={18}
              tone={unreadCount > 0 ? "critical" : "neutral"}
            />
            {unreadCount > 0 ? (
              <span className={styles.badge}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Link>
        </div>
      </header>

      <VFMobilePage>
        <main className={styles.main}>{children}</main>
      </VFMobilePage>

      <VFMobileNav />
      <VeriForgeToastStack />
    </div>
  );
}

export default VeriForgeMobileShell;

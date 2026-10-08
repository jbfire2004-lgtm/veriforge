"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFAlertsPanel.module.css";

export type VFDashboardAlert = {
  id: string;
  title: string;
  message: string;
  tone: "critical" | "warning";
};

export interface VFAlertsPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  alerts: VFDashboardAlert[];
}

export function VFAlertsPanel({
  title = "Industrial Alerts",
  alerts,
  className,
  style,
  ...props
}: VFAlertsPanelProps) {
  return (
    <div
      className={cn(
        styles.panel,
        veriforgeMotionClasses.primitives.angularSlide,
        className,
      )}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.list}>
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={cn(
              styles.alert,
              alert.tone === "critical" ? styles.critical : styles.warning,
              alert.tone === "critical" &&
                veriforgeMotionClasses.primitives.redGlowPulse,
            )}
          >
            <span className={styles.mark} aria-hidden />
            <div>
              <p className={styles.alertTitle}>{alert.title}</p>
              <p className={styles.alertMessage}>{alert.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VFAlertsPanel;

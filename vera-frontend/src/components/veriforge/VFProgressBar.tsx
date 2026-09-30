"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { clampPercent, vfTokenVars } from "./utils";
import styles from "./VFProgressBar.module.css";

export interface VFProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  critical?: boolean;
}

export function VFProgressBar({
  label,
  value,
  critical = false,
  className,
  style,
  ...props
}: VFProgressBarProps) {
  const clamped = clampPercent(value);
  return (
    <div
      className={cn(styles.wrap, critical && styles.critical, className)}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        ...style,
      })}
      {...props}
    >
      <div className={styles.meta}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{clamped}%</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn(styles.fill, veriforgeMotionClasses.charts.barRise)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default VFProgressBar;

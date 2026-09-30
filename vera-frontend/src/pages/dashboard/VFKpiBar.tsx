"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFKpiBar.module.css";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export interface VFKpiBarProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  critical?: boolean;
}

export function VFKpiBar({
  label,
  value,
  critical = false,
  className,
  style,
  ...props
}: VFKpiBarProps) {
  const clamped = clamp(value);
  return (
    <div
      className={cn(
        styles.wrap,
        critical && styles.critical,
        critical && veriforgeMotionClasses.primitives.redGlowPulse,
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

export default VFKpiBar;

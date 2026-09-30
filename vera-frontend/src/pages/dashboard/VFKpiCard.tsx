"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFKpiCard.module.css";

export interface VFKpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: string;
  title: string;
  value: string | number;
  delta?: string;
  critical?: boolean;
  children?: React.ReactNode;
}

export function VFKpiCard({
  kicker = "KPI",
  title,
  value,
  delta,
  critical = false,
  className,
  children,
  style,
  ...props
}: VFKpiCardProps) {
  return (
    <div
      data-card
      className={cn(
        styles.card,
        veriforgeMotionClasses.cards.base,
        critical && styles.critical,
        critical && veriforgeMotionClasses.cards.active,
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
      <header className={styles.header}>
        <p className={styles.kicker}>{kicker}</p>
        <h3 className={styles.title}>{title}</h3>
      </header>
      <div className={styles.body}>
        <p className={styles.value}>{value}</p>
        {delta ? (
          <p className={cn(styles.delta, critical && styles.deltaCritical)}>
            {delta}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export default VFKpiCard;

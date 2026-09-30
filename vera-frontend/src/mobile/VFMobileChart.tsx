"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { VFChart, type VFChartBar } from "@/src/components/veriforge/VFChart";
import styles from "./VFMobileChart.module.css";

export interface VFMobileChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  bars?: VFChartBar[];
  linePoints?: number[];
  critical?: boolean;
}

export function VFMobileChart({
  title,
  bars,
  linePoints,
  critical = false,
  className,
  style,
  ...props
}: VFMobileChartProps) {
  return (
    <div
      className={cn(
        styles.wrap,
        veriforgeMotionClasses.primitives.metallicFade,
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
      <h3 className={styles.title}>{title}</h3>
      <VFChart bars={bars} linePoints={linePoints} />
    </div>
  );
}

export default VFMobileChart;

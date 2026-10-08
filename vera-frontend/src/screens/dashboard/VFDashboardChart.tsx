"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { VFChart, type VFChartBar } from "@/src/components/veriforge/VFChart";
import styles from "./VFDashboardChart.module.css";

export interface VFDashboardChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  bars?: VFChartBar[];
  linePoints?: number[];
}

export function VFDashboardChart({
  title,
  bars,
  linePoints,
  className,
  style,
  ...props
}: VFDashboardChartProps) {
  return (
    <div
      className={cn(
        styles.wrap,
        veriforgeMotionClasses.primitives.metallicFade,
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

export default VFDashboardChart;

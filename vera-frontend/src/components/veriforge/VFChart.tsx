"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { clampPercent, vfTokenVars } from "./utils";
import styles from "./VFChart.module.css";

export interface VFChartBar {
  label: string;
  value: number;
}

export interface VFChartProps extends React.HTMLAttributes<HTMLDivElement> {
  bars?: VFChartBar[];
  /** Polyline points as percentages 0–100 for line draw demo */
  linePoints?: number[];
}

export function VFChart({
  bars = [],
  linePoints = [12, 28, 22, 48, 40, 72, 64, 88],
  className,
  style,
  ...props
}: VFChartProps) {
  const path = React.useMemo(() => {
    if (linePoints.length === 0) return "";
    const step = 100 / Math.max(1, linePoints.length - 1);
    return linePoints
      .map((y, i) => {
        const x = i * step;
        const yy = 100 - clampPercent(y);
        return `${i === 0 ? "M" : "L"} ${x} ${yy}`;
      })
      .join(" ");
  }, [linePoints]);

  return (
    <div
      className={cn(styles.chart, className)}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        ...style,
      })}
      {...props}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={path}
          className={cn(styles.line, veriforgeMotionClasses.charts.lineDraw)}
          fill="none"
          stroke="#1E6FB8"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {bars.length > 0 ? (
        <div className={styles.bars}>
          {bars.map((bar) => (
            <div key={bar.label} className={styles.barCol}>
              <div className={styles.barTrack}>
                <div
                  className={cn(styles.barFill, veriforgeMotionClasses.charts.barRise)}
                  style={{ height: `${clampPercent(bar.value)}%` }}
                />
              </div>
              <span className={styles.barLabel}>{bar.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default VFChart;

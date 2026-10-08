"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS } from "@/src/theme/veriforge-tokens";
import styles from "./VFDashboardGrid.module.css";

export interface VFDashboardGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
  showDivider?: boolean;
}

export function VFDashboardGrid({
  columns = 4,
  showDivider = false,
  className,
  children,
  style,
  ...props
}: VFDashboardGridProps) {
  const colsClass =
    columns === 2 ? styles.cols2 : columns === 3 ? styles.cols3 : styles.cols4;

  return (
    <>
      {showDivider ? <hr className={styles.divider} aria-hidden /> : null}
      <div
        className={cn(styles.grid, colsClass, className)}
        style={
          {
            ["--vf-forge-red" as string]: COLORS.forgeRed,
            ["--vf-steel-grey" as string]: COLORS.steelGrey,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export default VFDashboardGrid;

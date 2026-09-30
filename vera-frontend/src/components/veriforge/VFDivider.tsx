"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFDivider.module.css";

export interface VFDividerProps extends React.HTMLAttributes<HTMLHRElement> {
  accent?: boolean;
}

export function VFDivider({
  accent = false,
  className,
  style,
  ...props
}: VFDividerProps) {
  return (
    <hr
      aria-hidden
      className={cn(styles.divider, accent && styles.accent, className)}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        ...style,
      })}
      {...props}
    />
  );
}

export default VFDivider;

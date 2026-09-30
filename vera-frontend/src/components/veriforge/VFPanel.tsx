"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, GEOMETRY, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { vfTokenVars } from "./utils";
import styles from "./VFPanel.module.css";

export interface VFPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  tempered?: boolean;
  /** Panel open (angular slide) vs close (metallic collapse) */
  motionState?: "open" | "close" | "idle";
}

export function VFPanel({
  active = false,
  tempered = false,
  motionState = "open",
  className,
  style,
  children,
  ...props
}: VFPanelProps) {
  return (
    <div
      className={cn(
        styles.panel,
        veriforgeMotionClasses.panels.base,
        motionState === "open" && veriforgeMotionClasses.panels.open,
        motionState === "close" && veriforgeMotionClasses.panels.close,
        active && styles.active,
        active && veriforgeMotionClasses.primitives.redGlowPulse,
        tempered && styles.tempered,
        className,
      )}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-bevel" as string]: GEOMETRY.bevelEdge,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        ...style,
      })}
      {...props}
    >
      {children}
    </div>
  );
}

export default VFPanel;

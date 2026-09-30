"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, GEOMETRY } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { vfTokenVars } from "./utils";
import styles from "./VFButton.module.css";

export type VFButtonVariant =
  | "primary"
  | "secondary"
  | "action"
  | "success"
  | "warning"
  | "critical"
  | "ghost"
  /** @deprecated Use `warning` — red is never used for routine actions */
  | "destructive";

export type VFButtonSize = "sm" | "md" | "lg";

export interface VFButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VFButtonVariant;
  size?: VFButtonSize;
  active?: boolean;
}

const variantClass: Record<VFButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  action: styles.action,
  success: styles.success,
  warning: styles.warning,
  critical: styles.critical,
  ghost: styles.ghost,
  destructive: styles.warning,
};

const sizeClass: Record<VFButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export function VFButton({
  className,
  variant = "primary",
  size = "md",
  active = false,
  type = "button",
  style,
  ...props
}: VFButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        styles.button,
        veriforgeMotionClasses.buttons.base,
        variantClass[variant],
        sizeClass[size],
        active && styles.active,
        className,
      )}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.safetyBlue,
        ["--vf-bevel" as string]: GEOMETRY.bevelEdge,
        ["--vf-glow" as string]: "none",
        ...style,
      })}
      {...props}
    />
  );
}

export default VFButton;

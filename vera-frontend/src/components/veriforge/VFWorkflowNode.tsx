"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { vfTokenVars } from "./utils";
import styles from "./VFWorkflowNode.module.css";

export type VFWorkflowNodeState = "idle" | "activation" | "error";

export interface VFWorkflowNodeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  state?: VFWorkflowNodeState;
}

export function VFWorkflowNode({
  label,
  state = "idle",
  className,
  style,
  ...props
}: VFWorkflowNodeProps) {
  return (
    <div
      className={cn(
        styles.node,
        state === "activation" && veriforgeMotionClasses.workflow.activation,
        state === "error" && veriforgeMotionClasses.workflow.error,
        className,
      )}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        ...style,
      })}
      {...props}
    >
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export function VFWorkflowConnector({ className }: { className?: string }) {
  return (
    <div
      className={cn(styles.connector, veriforgeMotionClasses.workflow.connector, className)}
      aria-hidden
    />
  );
}

export default VFWorkflowNode;

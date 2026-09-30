"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFMobileStatus.module.css";

export type VFMobileStatusTone =
  | "pass"
  | "fail"
  | "pending"
  | "neutral"
  | "critical";

export interface VFMobileStatusProps {
  label: string;
  tone?: VFMobileStatusTone;
  className?: string;
}

const toneClass: Record<VFMobileStatusTone, string> = {
  pass: styles.pass,
  fail: styles.fail,
  pending: styles.pending,
  neutral: styles.neutral,
  critical: styles.critical,
};

export function VFMobileStatus({
  label,
  tone = "neutral",
  className,
}: VFMobileStatusProps) {
  return (
    <span
      className={cn(
        styles.chip,
        toneClass[tone],
        (tone === "fail" || tone === "critical") &&
          veriforgeMotionClasses.primitives.redGlowPulse,
        className,
      )}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
        } as React.CSSProperties
      }
    >
      <span className={styles.dot} aria-hidden />
      {label}
    </span>
  );
}

export function MobileStatusChip(props: VFMobileStatusProps) {
  return <VFMobileStatus {...props} />;
}

export default VFMobileStatus;

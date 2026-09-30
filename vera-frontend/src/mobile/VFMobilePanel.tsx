"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFMobilePanel.module.css";

export interface VFMobilePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: string;
  title?: string;
}

export function VFMobilePanel({
  kicker,
  title,
  className,
  children,
  style,
  ...props
}: VFMobilePanelProps) {
  return (
    <div
      className={cn(
        styles.panel,
        veriforgeMotionClasses.primitives.angularSlide,
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
      {(kicker || title) && (
        <header className={styles.header}>
          {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
          {title ? <h3 className={styles.title}>{title}</h3> : null}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export function MobileMetallicPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <VFMobilePanel className={className}>{children}</VFMobilePanel>;
}

export default VFMobilePanel;

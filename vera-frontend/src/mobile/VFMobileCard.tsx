"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFMobileCard.module.css";

export interface VFMobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  critical?: boolean;
  active?: boolean;
  soft?: boolean;
}

export function VFMobileCard({
  critical = false,
  active = false,
  soft = false,
  className,
  children,
  style,
  ...props
}: VFMobileCardProps) {
  const glow = critical || active;
  return (
    <div
      data-card
      className={cn(
        styles.card,
        soft && styles.soft,
        glow && styles.critical,
        veriforgeMotionClasses.cards.base,
        glow && veriforgeMotionClasses.primitives.redGlowPulse,
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
      {children}
    </div>
  );
}

/** Compat alias used by existing mobile pages */
export function MobileAngularCard(props: VFMobileCardProps) {
  return <VFMobileCard soft={!props.critical && !props.active} {...props} />;
}

export default VFMobileCard;

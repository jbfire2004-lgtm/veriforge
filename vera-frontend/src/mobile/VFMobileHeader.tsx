"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFMobileHeader.module.css";

export interface VFMobileHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  className?: string;
}

export function VFMobileHeader({
  kicker,
  title,
  description,
  className,
}: VFMobileHeaderProps) {
  return (
    <header
      className={cn(
        styles.header,
        veriforgeMotionClasses.primitives.angularSlide,
        className,
      )}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
        } as React.CSSProperties
      }
    >
      <p className={styles.kicker}>{kicker}</p>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.accent} />
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}

export function MobileScreenHeader(props: VFMobileHeaderProps) {
  return <VFMobileHeader {...props} />;
}

export default VFMobileHeader;

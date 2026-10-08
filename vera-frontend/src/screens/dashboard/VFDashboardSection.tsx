"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFDashboardSection.module.css";

export interface VFDashboardSectionProps
  extends React.HTMLAttributes<HTMLElement> {
  kicker?: string;
  title: string;
  description?: string;
}

export function VFDashboardSection({
  kicker,
  title,
  description,
  className,
  children,
  style,
  ...props
}: VFDashboardSectionProps) {
  return (
    <section
      className={cn(
        styles.section,
        veriforgeMotionClasses.primitives.angularSlide,
        className,
      )}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <header className={styles.header}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h2 className={styles.title}>{title}</h2>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

export default VFDashboardSection;

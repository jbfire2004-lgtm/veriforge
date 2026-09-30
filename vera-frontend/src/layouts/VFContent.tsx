"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFContent.module.css";

export interface VFContentProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional Orbitron section heading with red underline */
  heading?: string;
  /** Constrain to max-width industrial column */
  contained?: boolean;
}

export function VFContent({
  heading,
  contained = true,
  className,
  children,
  style,
  ...props
}: VFContentProps) {
  return (
    <main
      className={cn(
        styles.content,
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
      <div className={contained ? styles.inner : undefined}>
        {heading ? <h2 className={styles.sectionTitle}>{heading}</h2> : null}
        {children}
      </div>
    </main>
  );
}

export default VFContent;

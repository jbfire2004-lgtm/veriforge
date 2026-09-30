"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, GEOMETRY, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { vfTokenVars } from "./utils";
import styles from "./VFCard.module.css";

export interface VFCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  active?: boolean;
}

export function VFCard({
  title,
  description,
  active = false,
  className,
  children,
  style,
  ...props
}: VFCardProps) {
  return (
    <div
      data-card
      className={cn(
        styles.card,
        veriforgeMotionClasses.cards.base,
        active && styles.active,
        active && veriforgeMotionClasses.cards.active,
        className,
      )}
      style={vfTokenVars({
        ["--vf-ledger" as string]: "#1A1A1A",
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        clipPath: GEOMETRY.cardBevel,
        ...style,
      })}
      {...props}
    >
      {(title || description) && (
        <header className={styles.header}>
          {title ? <h3 className={styles.title}>{title}</h3> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export default VFCard;

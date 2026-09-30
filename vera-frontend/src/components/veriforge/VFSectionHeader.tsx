"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFSectionHeader.module.css";

export interface VFSectionHeaderProps
  extends React.HTMLAttributes<HTMLElement> {
  kicker?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function VFSectionHeader({
  kicker,
  title,
  description,
  actions,
  className,
  style,
  ...props
}: VFSectionHeaderProps) {
  return (
    <header
      className={cn(styles.header, className)}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ...style,
      })}
      {...props}
    >
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.description}>{description}</p> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}

export default VFSectionHeader;

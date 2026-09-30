"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS } from "@/src/theme/veriforge-tokens";
import { VerificationIcon } from "@/src/icons/veriforge-icons";
import styles from "./VFMobileEmblem.module.css";

export function VFMobileEmblem({ className }: { className?: string }) {
  return (
    <div
      className={cn(styles.emblem, className)}
      style={{ ["--vf-forge-red" as string]: COLORS.forgeRed } as React.CSSProperties}
    >
      <VerificationIcon size={48} tone="contrast" />
      <span className={styles.shine} aria-hidden />
    </div>
  );
}

export function VeriForgeMobileEmblem(props: { className?: string }) {
  return <VFMobileEmblem {...props} />;
}

export default VFMobileEmblem;

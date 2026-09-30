"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import {
  VERIFORGE_MOTION_TIMING,
  veriforgeMotionClasses,
} from "@/src/motion/veriforge-motion";
import { VFButton } from "./VFButton";
import { VFDivider } from "./VFDivider";
import { vfTokenVars } from "./utils";
import styles from "./VFModal.module.css";

export interface VFModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  className?: string;
}

export function VFModal({
  open,
  title,
  description,
  children,
  onClose,
  primaryActionLabel,
  onPrimaryAction,
  className,
}: VFModalProps) {
  const [collapsing, setCollapsing] = React.useState(false);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (open) setCollapsing(false);
  }, [open]);

  const requestClose = React.useEffectEvent(() => {
    setCollapsing(true);
    window.setTimeout(() => {
      setCollapsing(false);
      onCloseRef.current();
    }, VERIFORGE_MOTION_TIMING.heavy);
  });

  React.useEffect(() => {
    if (!open && !collapsing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, collapsing, requestClose]);

  if (!open && !collapsing) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={requestClose}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
      })}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vf-modal-title"
        className={cn(
          styles.dialog,
          veriforgeMotionClasses.modals.base,
          collapsing
            ? veriforgeMotionClasses.modals.collapse
            : veriforgeMotionClasses.modals.dropIn,
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="vf-modal-title" className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </header>
        <VFDivider />
        <div className={styles.body}>{children}</div>
        <VFDivider />
        <footer className={styles.footer}>
          <VFButton variant="ghost" onClick={requestClose}>
            Cancel
          </VFButton>
          {primaryActionLabel ? (
            <VFButton onClick={onPrimaryAction}>{primaryActionLabel}</VFButton>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

export default VFModal;

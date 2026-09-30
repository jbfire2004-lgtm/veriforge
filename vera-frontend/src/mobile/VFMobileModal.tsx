"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import {
  VERIFORGE_MOTION_TIMING,
  veriforgeMotionClasses,
} from "@/src/motion/veriforge-motion";
import { VFButton } from "@/src/components/veriforge/VFButton";
import styles from "./VFMobileModal.module.css";

export interface VFMobileModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
}

export function VFMobileModal({
  open,
  title,
  children,
  onClose,
  primaryLabel,
  onPrimary,
}: VFMobileModalProps) {
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

  if (!open && !collapsing) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={requestClose}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
        } as React.CSSProperties
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          styles.dialog,
          collapsing
            ? veriforgeMotionClasses.modals.collapse
            : veriforgeMotionClasses.primitives.industrialDrop,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.body}>{children}</div>
        <div className={styles.actions}>
          <VFButton variant="ghost" size="sm" onClick={requestClose}>
            Close
          </VFButton>
          {primaryLabel ? (
            <VFButton size="sm" onClick={onPrimary}>
              {primaryLabel}
            </VFButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default VFMobileModal;

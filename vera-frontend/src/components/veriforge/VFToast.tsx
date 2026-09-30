"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFToast.module.css";

export type VFToastTone = "neutral" | "critical" | "success";

export type VFToastItem = {
  id: string;
  title: string;
  message: string;
  tone?: VFToastTone;
  durationMs?: number;
};

export interface VFToastProps {
  toasts: VFToastItem[];
  onDismiss: (id: string) => void;
  placement?: "top-right" | "bottom-right";
  className?: string;
}

export function VFToast({
  toasts,
  onDismiss,
  placement = "top-right",
  className,
}: VFToastProps) {
  React.useEffect(() => {
    const timers = toasts.map((t) => {
      const ms = t.durationMs ?? 4200;
      return window.setTimeout(() => onDismiss(t.id), ms);
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, onDismiss]);

  return (
    <div
      className={cn(
        styles.viewport,
        placement === "top-right" ? styles.topRight : styles.bottomRight,
        className,
      )}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
      })}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            styles.toast,
            (t.tone === "critical" || t.tone === "success") && styles.critical,
          )}
        >
          <div>
            <p className={styles.title}>{t.title}</p>
            <p className={styles.message}>{t.message}</p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}

export function useVFToasts() {
  const [toasts, setToasts] = React.useState<VFToastItem[]>([]);

  const push = (toast: Omit<VFToastItem, "id"> & { id?: string }) => {
    const id =
      toast.id ?? `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, push, dismiss };
}

export default VFToast;

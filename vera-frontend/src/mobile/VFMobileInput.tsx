"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import styles from "./VFMobileInput.module.css";

export interface VFMobileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const VFMobileInput = React.forwardRef<
  HTMLInputElement,
  VFMobileInputProps
>(function VFMobileInput({ label, className, id, style, ...props }, ref) {
  const inputId = id ?? React.useId();
  return (
    <div
      className={styles.field}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
          ...style,
        } as React.CSSProperties
      }
    >
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={cn(styles.input, className)}
        {...props}
      />
    </div>
  );
});

export default VFMobileInput;

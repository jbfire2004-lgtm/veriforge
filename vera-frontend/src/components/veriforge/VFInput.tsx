"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFInput.module.css";

export interface VFInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const VFInput = React.forwardRef<HTMLInputElement, VFInputProps>(
  function VFInput(
    { label, hint, error, className, id, style, ...props },
    ref,
  ) {
    const inputId = id ?? React.useId();
    return (
      <div
        className={styles.field}
        style={vfTokenVars({
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
          ...style,
        })}
      >
        {label ? (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(styles.input, error && styles.error, className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className={cn(styles.hint, styles.hintError)}>{error}</p>
        ) : hint ? (
          <p className={styles.hint}>{hint}</p>
        ) : null}
      </div>
    );
  },
);

export default VFInput;

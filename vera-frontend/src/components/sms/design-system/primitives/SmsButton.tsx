"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { SfButton } from "@/src/components/safety-forms/ui/SfButton";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

export type SmsButtonVariant =
  | "primary"
  | "secondary"
  | "action"
  | "success"
  | "warning"
  | "critical"
  | "ghost"
  | "subtle"
  /** @deprecated Prefer `warning` for caution actions */
  | "destructive";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: SmsButtonVariant;
  size?: "sm" | "md" | "lg";
};

const SUBTLE =
  "bg-[var(--sf-primary-muted)] text-[var(--sf-primary)] hover:bg-[var(--sms-secondary-muted)] hover:text-[var(--sms-secondary)] border-[var(--sf-border)]";

const TOUCH = "min-h-[2.75rem]";

type SfVariant = "primary" | "secondary" | "action" | "success" | "warning" | "critical" | "ghost";

/**
 * SMS button — industrial safety variants via SfButton.
 * Critical red is for alerts only; `destructive` maps to warning amber.
 */
export const SmsButton = forwardRef<HTMLButtonElement, Props>(function SmsButton(
  { variant = "primary", size = "md", className, ...props },
  ref,
) {
  const touchClass = size !== "sm" ? TOUCH : undefined;

  if (variant === "subtle") {
    return (
      <SfButton
        ref={ref}
        variant="ghost"
        size={size}
        className={sfCn(SUBTLE, touchClass, className)}
        {...props}
      />
    );
  }

  const sfVariant: SfVariant =
    variant === "destructive" ? "warning" : (variant as SfVariant);

  return (
    <SfButton
      ref={ref}
      variant={sfVariant}
      size={size}
      className={sfCn(touchClass, className)}
      {...props}
    />
  );
});

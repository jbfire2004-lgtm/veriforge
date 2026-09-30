"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { sfCn } from "../theme/cn";

/**
 * VeraPM / Safety Forms industrial button.
 * Primary = slate · Secondary = graphite · Action = safety blue.
 * `danger` maps to warning amber; use `critical` only for alert dismissals.
 */
type Variant =
  | "primary"
  | "secondary"
  | "action"
  | "success"
  | "warning"
  | "critical"
  | "ghost"
  /** @deprecated Prefer `warning` */
  | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

const VARIANT: Record<Exclude<Variant, "danger">, string> = {
  primary:
    "border-[#1F2328] bg-[#2A2E33] text-[#F4F6F8] hover:bg-[#343940] hover:border-[#2A2E33]",
  secondary:
    "border-[#2A2E33] bg-[#3B3F45] text-[#F4F6F8] hover:bg-[#454A51]",
  action:
    "border-[#174F86] bg-[#1E6FB8] text-[#F4F6F8] hover:bg-[#1A63A6]",
  success:
    "border-[#3D8F58] bg-[#4FAF6F] text-[#0F1A12] hover:bg-[#45A064]",
  warning:
    "border-[#A8842F] bg-[#C89F3D] text-[#1C1A10] hover:bg-[#B89136]",
  critical:
    "border-[#8F2E2E] bg-[#B33A3A] text-[#F4F6F8] hover:bg-[#A33434]",
  ghost:
    "border-[var(--sf-border-strong)] bg-transparent text-[var(--sf-text-muted)] hover:bg-[var(--sf-primary-muted)] hover:text-[var(--sf-text)]",
};

const SIZE = {
  sm: "h-8 min-h-8 px-3 text-xs",
  md: "h-10 min-h-10 px-4 text-sm",
  lg: "h-11 min-h-11 px-5 text-sm",
};

function resolveVariant(variant: Variant): Exclude<Variant, "danger"> {
  return variant === "danger" ? "warning" : variant;
}

export const SfButton = forwardRef<HTMLButtonElement, Props>(function SfButton(
  { variant = "primary", size = "md", className, children, type = "button", ...props },
  ref,
) {
  const resolved = resolveVariant(variant);

  return (
    <button
      ref={ref}
      type={type}
      className={sfCn(
        "inline-flex items-center justify-center gap-2 rounded-[3px] border border-solid font-medium shadow-none",
        "transition-[background-color,border-color,transform] duration-150 ease-out",
        "hover:-translate-y-px active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0",
        VARIANT[resolved],
        SIZE[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

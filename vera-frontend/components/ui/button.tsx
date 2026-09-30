import * as React from "react";
import { cn } from "@/src/lib/utils";
import { buttonTokens } from "@/lib/design-system/tokens/component-tokens";

/**
 * Platform industrial button — Hub · VeriCore · VeriPM.
 *
 * primary   → slate #2A2E33
 * secondary → graphite #3B3F45
 * action    → safety blue #1E6FB8
 * success   → soft green #4FAF6F
 * warning   → muted amber #C89F3D
 * critical  → controlled red #B33A3A (alerts only)
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "action"
    | "success"
    | "warning"
    | "critical"
    | "ghost"
    | "outline"
    /** @deprecated Use `action` */
    | "teal"
    /** @deprecated Use `warning` for actions; `critical` for alerts only */
    | "destructive";
  size?: "sm" | "md" | "lg";
}

function resolveVariant(
  variant: NonNullable<ButtonProps["variant"]>,
): keyof typeof buttonTokens {
  if (variant === "default" || variant === "primary") return "primary";
  if (variant === "teal") return "action";
  if (variant === "destructive") return "warning";
  if (variant === "secondary") return "secondary";
  if (variant === "action") return "action";
  if (variant === "success") return "success";
  if (variant === "warning") return "warning";
  if (variant === "critical") return "critical";
  if (variant === "ghost") return "ghost";
  if (variant === "outline") return "outline";
  return "primary";
}

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 min-h-8 gap-vera-2 px-vera-3 text-xs",
  md: "h-10 min-h-10 gap-vera-2 px-vera-5 text-sm",
  lg: "h-11 min-h-11 gap-vera-3 px-vera-6 text-sm",
};

/** Use on `<Link>` (or `<a>`) so anchors match `Button` visuals without invalid nesting. */
export function buttonStyles({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) {
  const tokenKey = resolveVariant(variant ?? "default");
  return cn(buttonTokens.base, buttonTokens[tokenKey], sizes[size ?? "md"], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", type = "button", ...props },
    ref,
  ) => {
    const tokenKey = resolveVariant(variant);
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          buttonTokens.base,
          buttonTokens[tokenKey],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

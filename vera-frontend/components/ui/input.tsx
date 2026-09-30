import * as React from "react";
import { cn } from "@/src/lib/utils";
import { inputTokens } from "@/lib/design-system/tokens/component-tokens";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full",
        inputTokens.base,
        "aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:shadow-[0_0_0_3px_rgba(179,58,58,0.25)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

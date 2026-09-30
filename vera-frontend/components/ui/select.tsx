import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { inputTokens } from "@/lib/design-system/tokens/component-tokens";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full appearance-none py-vera-2 pl-vera-4 pr-10",
          inputTokens.base,
          "aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:shadow-[0_0_0_3px_rgba(179,58,58,0.25)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
      />
    </div>
  ),
);
Select.displayName = "Select";

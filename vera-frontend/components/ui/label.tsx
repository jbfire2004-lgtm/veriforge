import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** When true, appends an amber asterisk to indicate a required field. */
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "mb-1.5 inline-flex items-center gap-vera-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden className="text-[var(--color-warning,#C89F3D)]">
          *
        </span>
      ) : null}
    </label>
  ),
);
Label.displayName = "Label";

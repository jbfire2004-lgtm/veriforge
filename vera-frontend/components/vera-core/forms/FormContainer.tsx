import * as React from "react";
import { cn } from "@/src/lib/utils";

export type FormContainerProps = React.FormHTMLAttributes<HTMLFormElement> & {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
};

export function FormContainer({
  title,
  description,
  footer,
  className,
  children,
  ...props
}: FormContainerProps) {
  return (
    <form
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <header className="mb-6 space-y-1 border-b border-[var(--border)] pb-4">
          {title ? (
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
          ) : null}
        </header>
      )}
      <div className="space-y-6">{children}</div>
      {footer ? (
        <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
          {footer}
        </footer>
      ) : null}
    </form>
  );
}

import * as React from "react";
import { cn } from "@/src/lib/utils";

export type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4", className)} aria-labelledby={title.replace(/\s+/g, "-")}>
      <div>
        <h3
          id={title.replace(/\s+/g, "-")}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

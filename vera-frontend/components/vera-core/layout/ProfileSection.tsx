import * as React from "react";
import { cn } from "@/src/lib/utils";

export type ProfileSectionProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ProfileSection({
  title,
  description,
  actions,
  children,
  className,
}: ProfileSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

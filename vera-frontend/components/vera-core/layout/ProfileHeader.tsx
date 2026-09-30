import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";

export type ProfileHeaderProps = {
  title: string;
  subtitle?: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  avatar?: React.ReactNode;
};

/** Profile / detail page header with primary actions top-right (§4). */
export function ProfileHeader({
  title,
  subtitle,
  status,
  actions,
  avatar,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-4">
        {avatar ? <div className="shrink-0">{avatar}</div> : null}
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{title}</h1>
          {subtitle ? <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p> : null}
          {status ? <div className="pt-1">{status}</div> : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}



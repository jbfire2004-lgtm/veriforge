"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { cn } from "@/src/lib/utils";

export function BaseFeedCard({
  badge,
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800",
        className
      )}
    >
      <CardHeader className="space-y-1 pb-3">
        {badge ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-vera-teal">
            {badge}
          </span>
        ) : null}
        <h3 className="text-base font-semibold leading-snug">{title}</h3>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-vera-4 pt-0 text-sm">{children}</CardContent>
      {footer ? (
        <div className="border-t border-border/60 px-vera-6 py-vera-3 dark:border-zinc-800">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}

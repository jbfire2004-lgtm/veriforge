"use client";

import { cn } from "@/src/lib/utils";
import { veraType } from "@/lib/vera-core-ui/typography";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function CoreSection({
  title,
  description,
  action,
  children,
  className,
  id,
}: Props) {
  return (
    <section id={id} className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className={veraType.heading}>{title}</h2>
          {description ? <p className={veraType.caption}>{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

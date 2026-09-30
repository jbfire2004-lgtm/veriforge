import * as React from "react";
import { cn } from "@/src/lib/utils";
import { cardTokens } from "@/lib/design-system/tokens/component-tokens";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(cardTokens.base, className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  icon,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { icon?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-vera-2 p-vera-4 sm:p-vera-5",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className={cardTokens.header}>
          <span className={cardTokens.iconTile} aria-hidden>
            {icon}
          </span>
          <div className="min-w-0 flex-1 space-y-1">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-balance text-base font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm font-normal leading-relaxed text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-vera-4 pt-0 sm:p-vera-5 sm:pt-0", className)}
      {...props}
    />
  );
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-vera-2 border-t border-[var(--panel-header-border,var(--border))] p-vera-4 sm:gap-vera-3 sm:p-vera-5",
        className,
      )}
      {...props}
    />
  );
}

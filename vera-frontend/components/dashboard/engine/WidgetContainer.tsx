import * as React from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { buttonStyles } from "@/components/ui/button";
import { vera } from "@/components/vera-core/shared/styles";

export type WidgetContainerProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
  /** Accessible label for the widget region */
  ariaLabel?: string;
};

const toneBorder = {
  default: "",
  success: "border-l-4 border-l-[var(--badge-success-fg)]",
  warning: "border-l-4 border-l-[var(--badge-warning-fg)]",
  danger: "border-l-4 border-l-[var(--badge-danger-fg)]",
  info: "border-l-4 border-l-[var(--color-primary)]",
};

export function WidgetContainer({
  title,
  subtitle,
  icon: Icon,
  tone = "default",
  action,
  children,
  className,
  ariaLabel,
}: WidgetContainerProps) {
  return (
    <section
      className={cn(vera.card, "flex flex-col p-5", toneBorder[tone], className)}
      aria-label={ariaLabel ?? title}
      role="region"
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </header>
      <div className="flex-1">{children}</div>
      {action ? (
        <footer className="mt-4 border-t border-[var(--border)] pt-3">
          <Link href={action.href} className={buttonStyles({ variant: "ghost", size: "sm" })}>
            {action.label}
          </Link>
        </footer>
      ) : null}
    </section>
  );
}

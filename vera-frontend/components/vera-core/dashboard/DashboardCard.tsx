import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";

export type DashboardCardTrend = {
  label: string;
  direction?: "up" | "down" | "neutral";
};

export type DashboardCardProps = {
  title: string;
  description?: string;
  value?: React.ReactNode;
  icon?: LucideIcon;
  trend?: DashboardCardTrend;
  href?: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
  children?: React.ReactNode;
};

const toneBorder = {
  default: "border-[var(--border)]",
  success: "border-l-4 border-l-[var(--badge-success-fg)]",
  warning: "border-l-4 border-l-[var(--badge-warning-fg)]",
  danger: "border-l-4 border-l-[var(--badge-danger-fg)]",
};

function CardBody({
  title,
  description,
  value,
  icon: Icon,
  trend,
  footer,
  children,
  href,
}: DashboardCardProps) {
  return (
    <>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold text-[var(--foreground)]">
            {title}
          </CardTitle>
          {Icon ? (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          ) : null}
        </div>
        {description ? (
          <CardDescription className="text-[var(--muted-foreground)]">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-vera-3">
        {value != null ? (
          <p className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
        ) : null}
        {trend ? (
          <p
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium",
              trend.direction === "up" && "text-[var(--badge-success-fg)]",
              trend.direction === "down" && "text-[var(--badge-danger-fg)]",
              (!trend.direction || trend.direction === "neutral") &&
                "text-[var(--muted-foreground)]"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            ) : trend.direction === "down" ? (
              <ArrowDownRight className="h-4 w-4" aria-hidden />
            ) : null}
            {trend.label}
          </p>
        ) : null}
        {children}
        {footer}
        {href ? (
          <span className={buttonStyles({ variant: "ghost", size: "sm", className: "mt-2 inline-flex" })}>
            View details
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </span>
        ) : null}
      </CardContent>
    </>
  );
}

export function DashboardCard(props: DashboardCardProps) {
  const {
    href,
    onClick,
    tone = "default",
    className,
  } = props;

  const cardClass = cn(
    "rounded-lg border bg-[var(--surface)] shadow-sm",
    toneBorder[tone],
    (href || onClick) && "transition hover:shadow-[var(--shadow-md)]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(cardClass, "block text-left")}>
        <Card className="border-0 bg-transparent shadow-none">
          <CardBody {...props} />
        </Card>
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(cardClass, "w-full text-left")}>
        <Card className="border-0 bg-transparent shadow-none">
          <CardBody {...props} />
        </Card>
      </button>
    );
  }

  return (
    <Card className={cardClass}>
      <CardBody {...props} />
    </Card>
  );
}

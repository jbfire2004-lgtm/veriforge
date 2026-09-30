"use client";

import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { vera } from "../shared/styles";
import { cn } from "@/src/lib/utils";

export type ScanResultAction = {
  label: string;
  href: string;
  variant?: "primary" | "outline";
};

export type ScanResultCardProps = {
  title: string;
  subtitle?: string;
  status?: React.ReactNode;
  icon?: LucideIcon;
  actions?: ScanResultAction[];
  children?: React.ReactNode;
  className?: string;
};

export function ScanResultCard({
  title,
  subtitle,
  status,
  icon: Icon,
  actions,
  children,
  className,
}: ScanResultCardProps) {
  return (
    <article className={cn(vera.card, "p-6", className)}>
      <header className="flex items-start gap-4">
        {Icon ? (
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
        ) : null}
        <section className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
          ) : null}
          {status ? <section className="mt-2">{status}</section> : null}
        </section>
      </header>
      {children ? <section className="mt-4">{children}</section> : null}
      {actions && actions.length > 0 ? (
        <footer className="mt-6 flex flex-wrap gap-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={buttonStyles({
                variant: action.variant === "outline" ? "outline" : "primary",
                size: "sm",
              })}
            >
              {action.label}
            </Link>
          ))}
        </footer>
      ) : null}
    </article>
  );
}

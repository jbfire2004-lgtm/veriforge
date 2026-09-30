import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type QuickActionButtonProps = {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
};

export function QuickActionButton({
  href,
  label,
  description,
  icon: Icon,
  className,
}: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-none",
        "transition-[border-color] duration-150 hover:border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        className
      )}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-[var(--border)] bg-[var(--muted)] text-[var(--color-primary)]">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="font-medium text-[var(--foreground)]">{label}</span>
      {description ? (
        <span className="text-xs text-[var(--muted-foreground)]">{description}</span>
      ) : null}
    </Link>
  );
}



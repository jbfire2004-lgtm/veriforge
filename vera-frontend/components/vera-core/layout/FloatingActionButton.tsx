"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type FloatingActionButtonProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  className?: string;
};

/** Mobile quick action FAB — safety-blue action, matte industrial. */
export function FloatingActionButton({
  href,
  label,
  icon: Icon,
  className,
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-[3px]",
        "border border-[#174F86] bg-[#1E6FB8] text-[#F4F6F8] shadow-none",
        "transition-[background-color,border-color,transform] duration-150",
        "hover:-translate-y-px hover:bg-[#1A63A6] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2",
        "lg:hidden",
        className,
      )}
    >
      <Icon className="h-6 w-6" aria-hidden />
    </Link>
  );
}

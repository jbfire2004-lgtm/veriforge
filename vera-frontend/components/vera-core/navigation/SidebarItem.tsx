"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { vera } from "../shared/styles";

export type SidebarItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
  className,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        vera.sidebarItem,
        vera.focus,
        active && vera.sidebarItemActive,
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </Link>
  );
}

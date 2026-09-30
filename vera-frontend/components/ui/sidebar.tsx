import * as React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export function Sidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-vera-charcoal/10 bg-vera-white shadow-md",
        className
      )}
      {...props}
    />
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-b border-vera-charcoal/10 px-vera-5 py-vera-5",
        className
      )}
      {...props}
    />
  );
}

export function SidebarBrand({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "text-lg font-medium leading-tight tracking-tight text-vera-deep",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-vera-3 py-vera-4", className)} {...props} />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-auto border-t border-vera-charcoal/10 px-vera-4 py-vera-4",
        className
      )}
      {...props}
    />
  );
}

export interface SidebarNavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  /** Dark sidebar (e.g. admin shell). */
  tone?: "light" | "dark";
}

export function SidebarNavItem({
  className,
  href,
  active,
  icon,
  tone = "light",
  children,
  ...props
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-vera-3 rounded-xl px-vera-3 py-vera-3 text-sm font-medium tracking-tight",
        "transition duration-150 ease-out",
        tone === "dark"
          ? active
            ? "bg-vera-teal text-vera-deep shadow-md"
            : "text-zinc-300 hover:translate-x-0.5 hover:bg-white/10 hover:text-vera-white"
          : active
            ? "bg-vera-deep text-vera-white shadow-md"
            : "text-vera-charcoal hover:translate-x-0.5 hover:bg-vera-surface hover:text-vera-deep",
        className
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {icon != null && (
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center text-current transition-transform duration-150 ease-out",
            "[&>svg]:h-5 [&>svg]:w-5",
            !active && "group-hover:scale-110"
          )}
        >
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </Link>
  );
}

export function SidebarNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <nav className={cn("flex flex-col gap-vera-2", className)} {...props} />;
}

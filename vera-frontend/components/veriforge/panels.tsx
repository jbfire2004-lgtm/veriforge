import * as React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import {
  veriforgeTypography,
  VeriForgeFrame,
  VeriForgeSectionHeader,
} from "./theme";
import { vfNav, vfSurface } from "./surfaces";
import { ShieldGridIcon } from "./icons";

export function VeriForgeTopbar({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <VeriForgeFrame
      className={cn(
        "flex items-center justify-between gap-4 border-b border-b-[#1E6FB8]/80 px-5 py-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-[3px] border border-[#5A6169] bg-[#23272C] text-[#1E6FB8]">
          <ShieldGridIcon className="h-4 w-4" />
        </span>
        <div>
          <h1
            className={cn(
              veriforgeTypography.heading,
              "text-lg font-semibold text-[#F4F6F8]",
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-[#A8B0B8]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </VeriForgeFrame>
  );
}

export function VeriForgeSidebar({
  title,
  items,
  className,
}: {
  title: string;
  items: Array<{ label: string; href: string; active?: boolean }>;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "w-72 shrink-0 border-r border-[#5A6169] bg-[#23272C] p-4",
        className,
      )}
    >
      <p
        className={cn(
          veriforgeTypography.heading,
          "mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]",
        )}
      >
        {title}
      </p>
      <nav className="space-y-1.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              vfNav.link,
              item.active ? vfNav.linkActive : vfNav.linkIdle,
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function VeriForgeContentBlock({
  title,
  description,
  children,
  className,
  icon,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <VeriForgeFrame className={cn(vfSurface.panel, "p-5", className)}>
      <VeriForgeSectionHeader
        title={title}
        description={description}
        icon={icon ?? <ShieldGridIcon className="h-4 w-4" />}
        actions={actions}
      />
      {children}
    </VeriForgeFrame>
  );
}

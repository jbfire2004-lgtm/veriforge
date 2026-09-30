"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  buildAccountMenuLinks,
  type AccountMenuEntry,
} from "@/lib/navigation/account-nav";

export interface UserMenuProps {
  name: string;
  email?: string | null;
  /** Full menu; when omitted, built from role if provided. */
  menuLinks?: AccountMenuEntry[];
  role?: string | null;
  /** @deprecated Use menuLinks from buildAccountMenuLinks instead. */
  showAdminLink?: boolean;
  adminHref?: string;
  /** @deprecated Use menuLinks from buildAccountMenuLinks instead. */
  showPmLink?: boolean;
  pmHref?: string;
  signOutHref?: string;
  className?: string;
  /** Industrial = light controls for slate top bar */
  chrome?: "default" | "industrial";
}

export function UserMenu({
  name,
  email,
  menuLinks,
  role = null,
  showAdminLink: _showAdminLink,
  adminHref: _adminHref,
  showPmLink: _showPmLink,
  pmHref: _pmHref,
  signOutHref = "/auth/logout",
  className,
  chrome = "default",
}: UserMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const links = menuLinks ?? buildAccountMenuLinks(role);
  const industrial = chrome === "industrial";

  React.useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = React.useMemo(() => deriveInitials(name, email), [name, email]);

  let lastSection: string | undefined;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "h-10 gap-vera-3 rounded-[3px] pl-vera-2 pr-vera-3",
          industrial
            ? "border border-[#5A6169] bg-[#23272C] text-[#F4F6F8] hover:bg-[rgba(30,111,184,0.14)] hover:text-[#F4F6F8] focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-[#2A2E33]"
            : "text-vera-charcoal hover:bg-vera-surface focus-visible:ring-[#1E6FB8]",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-[3px] text-xs font-medium tracking-tight shadow-none",
            industrial
              ? "border border-[#174F86] bg-[#1E6FB8] text-[#F4F6F8]"
              : "bg-[#2A2E33] text-[#F4F6F8]",
          )}
        >
          {initials}
        </span>
        <span className="hidden min-w-0 max-w-[10rem] flex-col items-start text-left leading-tight sm:flex">
          <span
            className={cn(
              "truncate text-sm font-medium",
              industrial ? "text-[#F4F6F8]" : "text-vera-charcoal",
            )}
          >
            {name}
          </span>
          {email ? (
            <span
              className={cn(
                "truncate text-xs font-normal",
                industrial ? "text-[#8A9199]" : "text-vera-muted",
              )}
            >
              {email}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            industrial ? "text-[#8A9199]" : "text-vera-muted",
            open && "rotate-180",
          )}
        />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[min(70vh,32rem)] w-72 overflow-y-auto rounded-[3px] border border-[#5A6169] bg-[#3B3F45] text-[#F4F6F8] shadow-none"
        >
          <div className="flex items-center gap-vera-3 border-b border-[#5A6169] px-vera-4 py-vera-3">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-[#174F86] bg-[#1E6FB8] text-sm font-medium tracking-tight text-[#F4F6F8] shadow-none"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#F4F6F8]">{name}</p>
              {email ? (
                <p className="truncate text-xs font-normal text-[#8A9199]">{email}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col p-vera-2">
            {links.map((entry) => {
              const showHeading =
                entry.section != null && entry.section !== lastSection;
              if (showHeading) lastSection = entry.section;
              const Icon = entry.icon;
              return (
                <React.Fragment key={`${entry.section ?? ""}-${entry.href}`}>
                  {showHeading ? (
                    <p className="px-vera-3 pb-vera-1 pt-vera-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
                      {entry.section}
                    </p>
                  ) : null}
                  <MenuLink
                    href={entry.href}
                    icon={<Icon className="h-4 w-4" aria-hidden />}
                    description={entry.description}
                    onSelect={() => setOpen(false)}
                    industrial
                  >
                    {entry.label}
                  </MenuLink>
                </React.Fragment>
              );
            })}

            <div className="my-vera-2 h-px bg-[#5A6169]" aria-hidden />

            <MenuLink
              href={signOutHref}
              icon={<LogOut className="h-4 w-4" aria-hidden />}
              onSelect={() => setOpen(false)}
              tone="danger"
              industrial
            >
              Sign out
            </MenuLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  description,
  onSelect,
  tone = "default",
  industrial = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  onSelect: () => void;
  tone?: "default" | "danger";
  industrial?: boolean;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onSelect}
      className={buttonStyles({
        variant: "ghost",
        size: "sm",
        className: cn(
          "h-auto min-h-10 w-full flex-col items-start justify-start gap-0.5 rounded-[3px] px-vera-3 py-vera-2 text-left text-sm font-medium",
          industrial
            ? tone === "danger"
              ? "text-[#C89F3D] hover:bg-[#2A2820] hover:text-[#C89F3D]"
              : "text-[#D5DBE0] hover:bg-[rgba(30,111,184,0.16)] hover:text-[#F4F6F8]"
            : tone === "danger"
              ? "text-[#6B5420] hover:bg-[#F8F1DC] hover:text-[#6B5420]"
              : "text-vera-charcoal hover:bg-vera-surface",
        ),
      })}
    >
      <span className="flex w-full items-center gap-vera-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-current">
          {icon}
        </span>
        {children}
      </span>
      {description ? (
        <span
          className={cn(
            "w-full pl-8 text-xs font-normal",
            industrial ? "text-[#8A9199]" : "text-vera-muted",
          )}
        >
          {description}
        </span>
      ) : null}
    </Link>
  );
}

function deriveInitials(name: string, email?: string | null): string {
  const source = (name && name.trim() !== "Signed in" ? name : email) ?? name;
  const parts = source
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length === 0) return "VE";
  const a = parts[0]!.charAt(0);
  const b = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (a + b).toUpperCase() || "VE";
}

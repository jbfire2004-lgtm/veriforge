"use client";

import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { navChrome } from "./nav-chrome";

export type NavDropdownItem = {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  active?: boolean;
  /** Critical system alert indicator only */
  critical?: boolean;
  /** Draw a thin rule before this item (group spacing) */
  separatorBefore?: boolean;
  /** SMS-style section label rendered above this item */
  groupLabel?: string;
};

type Props = {
  label: string;
  currentLabel: string;
  currentIcon?: LucideIcon;
  items: NavDropdownItem[];
  ariaLabel: string;
  menuDataAttr?: string;
  className?: string;
  variant?: "default" | "header";
  onNavigate?: () => void;
};

type MenuRect = { top: number; left: number; width: number };

export function VeraNavDropdown({
  label,
  currentLabel,
  currentIcon: CurrentIcon,
  items,
  ariaLabel,
  menuDataAttr = "vera-nav-menu",
  className,
  variant = "default",
  onNavigate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const close = useCallback(() => {
    setOpen(false);
    setFocusIndex(-1);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, variant === "header" ? 300 : 280),
      });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (!menuRef.current) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIndex((i) => {
          const next = i < items.length - 1 ? i + 1 : 0;
          itemRefs.current[next]?.focus();
          return next;
        });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIndex((i) => {
          const next = i > 0 ? i - 1 : items.length - 1;
          itemRefs.current[next]?.focus();
          return next;
        });
      }
      if (e.key === "Home") {
        e.preventDefault();
        setFocusIndex(0);
        itemRefs.current[0]?.focus();
      }
      if (e.key === "End") {
        e.preventDefault();
        const last = items.length - 1;
        setFocusIndex(last);
        itemRefs.current[last]?.focus();
      }
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, items.length, close]);

  useEffect(() => {
    if (open) {
      const activeIdx = items.findIndex((i) => i.active);
      const idx = activeIdx >= 0 ? activeIdx : 0;
      setFocusIndex(idx);
      requestAnimationFrame(() => itemRefs.current[idx]?.focus());
    }
  }, [open, items]);

  const isHeader = variant === "header";

  const menu =
    open && menuRect && mounted ? (
      <div
        ref={menuRef}
        data-vera-nav-menu={menuDataAttr}
        role="menu"
        aria-label={ariaLabel}
        className={navChrome.menu}
        style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
      >
        {items.map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <div key={item.id}>
              {item.separatorBefore ? (
                <div className={navChrome.menuSeparator} role="separator" />
              ) : null}
              {item.groupLabel ? (
                <div className={navChrome.menuGroupLabel} aria-hidden>
                  {item.groupLabel}
                </div>
              ) : null}
              <Link
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                role="menuitem"
                href={item.href}
                tabIndex={focusIndex === index ? 0 : -1}
                onClick={() => {
                  close();
                  onNavigate?.();
                }}
                className={cn(
                  navChrome.menuItem,
                  item.active && navChrome.menuItemActive,
                  item.critical && !item.active && navChrome.menuItemCritical,
                )}
              >
                {ItemIcon ? (
                  <ItemIcon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      item.active
                        ? "text-[#1E6FB8]"
                        : item.critical
                          ? "text-[#B33A3A]"
                          : "text-[#8A9199]",
                    )}
                    aria-hidden
                  />
                ) : null}
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm",
                      item.active ? "font-semibold text-[#F4F6F8]" : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                  {item.description && !isHeader ? (
                    <span className="mt-0.5 block text-xs text-[#8A9199]">
                      {item.description}
                    </span>
                  ) : null}
                </span>
                {item.active ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1E6FB8]" aria-hidden />
                ) : item.critical ? (
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B33A3A]"
                    aria-label="Critical alert"
                  />
                ) : null}
              </Link>
            </div>
          );
        })}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {!isHeader ? (
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5A6169]">
          {label}
        </span>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label}: ${currentLabel}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          isHeader
            ? navChrome.triggerDark
            : "flex min-w-[160px] max-w-[240px] items-center gap-2 rounded-[3px] border border-[#5A6169] bg-white px-3 py-2 text-left text-[#2A2E33] shadow-none transition hover:border-[#1E6FB8]/40 hover:bg-[#F4F6F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]",
          open && (isHeader ? navChrome.triggerDarkOpen : "border-[#1E6FB8]"),
        )}
      >
        {CurrentIcon ? (
          <CurrentIcon
            className={cn(
              "h-4 w-4 shrink-0",
              isHeader ? "text-[#1E6FB8]" : "text-[#1E6FB8]",
            )}
            aria-hidden
          />
        ) : null}
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-medium",
            isHeader ? "text-[#F4F6F8]" : "text-[#2A2E33]",
          )}
        >
          {currentLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition",
            isHeader ? "text-[#8A9199]" : "text-[#5A6169]",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

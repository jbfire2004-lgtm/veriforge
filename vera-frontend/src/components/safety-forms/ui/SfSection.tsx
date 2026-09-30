"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { sfCn } from "../theme/cn";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  completed?: boolean;
};

export function SfSection({
  title,
  description,
  icon,
  children,
  defaultOpen = true,
  collapsible = true,
  completed,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="sf-animate-in overflow-hidden rounded-[var(--sf-radius-lg)] border border-[var(--sf-border)] bg-[var(--sf-surface)] shadow-[var(--sf-shadow-sm)]">
      <header
        className={sfCn(
          "flex items-center gap-3 border-b border-[var(--sf-border)] px-5 py-4",
          "bg-[var(--sf-gradient-header)]",
          collapsible && "cursor-pointer select-none",
        )}
        onClick={() => collapsible && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (collapsible && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
      >
        {icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-[var(--sf-radius-md)] bg-[var(--sf-primary-muted)] text-[var(--sf-primary)]">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-[var(--sf-text)]">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-sm text-[var(--sf-text-muted)]">{description}</p>
          ) : null}
        </span>
        {completed ? (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sf-success)] text-white"
            style={{ animation: "sf-check-pop 0.4s ease-out" }}
            aria-label="Section complete"
          >
            ✓
          </span>
        ) : null}
        {collapsible ? (
          <ChevronDown
            className={sfCn(
              "h-5 w-5 text-[var(--sf-text-muted)] transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        ) : null}
      </header>
      <div
        className={sfCn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 px-5 py-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
